# FILE: app/core/monitor.py

import time
import psutil
import threading
from dataclasses import dataclass, field

# Lazy DB imports — resolved at call-time to avoid circular imports
_SessionLocal = None

def _get_session():
    """Lazy-load a DB session to avoid import-time circular dependency."""
    global _SessionLocal
    if _SessionLocal is None:
        from app.core.database import SessionLocal
        _SessionLocal = SessionLocal
    return _SessionLocal()


@dataclass
class SystemMonitor:
    # Security Counters (in-memory cache — hydrated from DB at startup)
    rate_limit_hits: int = 0
    prompt_injection_hits: int = 0
    sqli_hits: int = 0
    banned_topic_hits: int = 0
    
    # Traffic Counters
    total_requests: int = 0
    total_latency_ms: float = 0
    start_time: float = field(default_factory=time.time)
    
    # Logs (in-memory ring buffer — last 50)
    security_logs: list = field(default_factory=list)
    
    # Lock for thread-safe counter updates
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def hydrate_from_db(self):
        """Load persisted security counters from the database on startup."""
        try:
            from sqlalchemy import text
            db = _get_session()
            rows = db.execute(
                text("SELECT event_type, COUNT(*) as cnt FROM security_events GROUP BY event_type")
            ).fetchall()
            for row in rows:
                event_type, cnt = row[0], row[1]
                if event_type == "RATE_LIMIT": self.rate_limit_hits = cnt
                elif event_type == "PROMPT_INJECTION": self.prompt_injection_hits = cnt
                elif event_type == "SQLI": self.sqli_hits = cnt
                elif event_type == "BANNED_TOPIC": self.banned_topic_hits = cnt
            # Also load last 50 logs
            log_rows = db.execute(
                text("SELECT event_type, detail, created_at FROM security_events ORDER BY created_at DESC LIMIT 50")
            ).fetchall()
            self.security_logs = [
                f"[{r[2].strftime('%H:%M:%S') if r[2] else '??:??:??'}] [{r[0]}] {r[1] or ''}"
                for r in log_rows
            ]
            db.close()
            print(f"[MONITOR] Hydrated from DB: rate_limit={self.rate_limit_hits}, "
                  f"injection={self.prompt_injection_hits}, sqli={self.sqli_hits}, "
                  f"banned={self.banned_topic_hits}")
        except Exception as e:
            # Table may not exist yet on first boot — that's fine
            print(f"[MONITOR] DB hydration skipped (table may not exist yet): {e}")

    def log_security_event(self, event_type: str, detail: str, client_ip: str = None):
        """Log a security event — persists to DB and updates in-memory counters."""
        with self._lock:
            # 1. In-memory log (fast reads for dashboard)
            timestamp = time.strftime("%H:%M:%S")
            log_entry = f"[{timestamp}] [{event_type}] {detail}"
            self.security_logs.insert(0, log_entry)
            self.security_logs = self.security_logs[:50]
            
            # 2. Increment in-memory counters
            if event_type == "RATE_LIMIT": self.rate_limit_hits += 1
            elif event_type == "PROMPT_INJECTION": self.prompt_injection_hits += 1
            elif event_type == "SQLI": self.sqli_hits += 1
            elif event_type == "BANNED_TOPIC": self.banned_topic_hits += 1

        # 3. Persist to DB (fire-and-forget in a thread to not block middleware)
        def _persist():
            try:
                from app.models.chat import SecurityEvent
                db = _get_session()
                evt = SecurityEvent(event_type=event_type, detail=detail, client_ip=client_ip)
                db.add(evt)
                db.commit()
                db.close()
            except Exception as e:
                print(f"[MONITOR] Failed to persist security event: {e}")

        threading.Thread(target=_persist, daemon=True).start()

    def log_request(self, latency_ms: float):
        """Called by middleware for every valid request."""
        self.total_requests += 1
        self.total_latency_ms += latency_ms

    def get_uptime(self):
        return int(time.time() - self.start_time)

    def get_avg_latency(self):
        return round(self.total_latency_ms / self.total_requests, 2) if self.total_requests > 0 else 0

# Global Singleton Instance
monitor = SystemMonitor()