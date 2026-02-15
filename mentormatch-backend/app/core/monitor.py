# FILE: app/core/monitor.py

import time
import psutil
from dataclasses import dataclass, field
from typing import List

@dataclass
class SystemMonitor:
    # Security Counters
    rate_limit_hits: int = 0
    prompt_injection_hits: int = 0
    sqli_hits: int = 0
    banned_topic_hits: int = 0
    
    # Traffic Counters
    total_requests: int = 0
    total_latency_ms: float = 0
    start_time: float = field(default_factory=time.time)
    
    # Logs
    security_logs: list = field(default_factory=list)

    def log_security_event(self, event_type: str, detail: str):
        """Adds a log entry and rotates old ones (Keep last 50)"""
        timestamp = time.strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] [{event_type}] {detail}"
        self.security_logs.insert(0, log_entry)
        self.security_logs = self.security_logs[:50]
        
        # Increment specific counters
        if event_type == "RATE_LIMIT": self.rate_limit_hits += 1
        if event_type == "PROMPT_INJECTION": self.prompt_injection_hits += 1
        if event_type == "SQLI": self.sqli_hits += 1
        if event_type == "BANNED_TOPIC": self.banned_topic_hits += 1

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