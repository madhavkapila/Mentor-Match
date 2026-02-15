# FILE: app/schemas/admin.py

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import EmailStr

# --- PILLAR 1: TRAFFIC & USAGE ---
class TrafficStats(BaseModel):
    total_requests: int
    active_sessions_24h: int
    requests_per_minute_peak: int
    average_latency_ms: float
    total_tokens_processed: int # Estimate

# --- PILLAR 2: SECURITY (THE IRON DOME) ---
class SecurityStats(BaseModel):
    total_blocks: int
    rate_limit_hits: int        # Layer 1: IP Bouncer blocks
    prompt_injection_attempts: int # Layer 2: LLM Guard blocks
    sqli_attempts: int          # Layer 3: Regex blocks
    banned_topic_hits: int      # Users trying to talk politics/crypto
    blocked_ips_count: int      # IPs currently in the "Jail"

# --- PILLAR 3: SYSTEM HEALTH ---
class SystemHealth(BaseModel):
    cpu_usage_percent: float
    ram_usage_percent: float
    db_connection_status: bool
    chatvat_engine_status: bool # Is the AI Brain responding?
    error_rate_5xx: float       # Percentage of requests failing
    uptime_seconds: int

# --- PILLAR 4: BUSINESS INTELLIGENCE ---
class BusinessStats(BaseModel):
    total_feedback: int
    avg_rating: float
    net_promoter_score: float   # Derived metric
    unresolved_feedback: int

# --- THE MASTER DASHBOARD ---
class SuperAdminDashboard(BaseModel):
    timestamp: datetime
    traffic: TrafficStats
    security: SecurityStats
    system: SystemHealth
    business: BusinessStats
    recent_security_logs: List[str] # "IP 1.2.3.4 blocked for SQLi"

# --- DB MANAGER SCHEMAS ---
class DBQueryRequest(BaseModel):
    query: str # Raw SQL (Read-Only enforced)

class DBQueryResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    execution_time_ms: float