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

# --- SUB-MODELS ---
class StorageInfo(BaseModel):
    total_gb: float
    used_gb: float
    free_gb: float
    used_percent: float

class ProcessInfo(BaseModel):
    pid: int
    name: str
    cpu_percent: float
    memory_percent: float

# --- PILLAR 3: SYSTEM HEALTH ---
class SystemHealth(BaseModel):
    cpu_usage_percent: float
    ram_usage_percent: float
    ram_total_gb: float
    ram_used_gb: float
    db_connection_status: bool
    chatvat_engine_status: bool # Is the AI Brain responding?
    error_rate_5xx: float       # Percentage of requests failing
    uptime_seconds: int
    storage: StorageInfo
    load_average: List[float]          # 1, 5, 15 min
    top_processes: List[ProcessInfo]    # Top 5 by CPU
    network_bytes_sent: int
    network_bytes_recv: int

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

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    google_token: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]  # {email, name, picture, role}

# --- FEEDBACK LIST ---
class FeedbackItem(BaseModel):
    id: int
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    message: str
    rating: Optional[int] = None
    session_id: Optional[str] = None
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackListResponse(BaseModel):
    items: List[FeedbackItem]
    total: int
    page: int
    page_size: int

# --- DB MANAGER SCHEMAS ---
class DBQueryRequest(BaseModel):
    query: str # Raw SQL (Read-Only enforced)

class DBQueryResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    execution_time_ms: float