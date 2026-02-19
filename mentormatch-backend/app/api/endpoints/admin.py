# FILE: app/api/endpoints/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func
import psutil
import os
from datetime import datetime, timedelta
import time
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.core.monitor import monitor
from app.models.chat import ChatSession, ChatMessage, Feedback, AdminUser, SecurityEvent, PageVisit
from app.schemas.admin import (
    SuperAdminDashboard, DBQueryResponse, DBQueryRequest,
    LoginRequest, LoginResponse, FeedbackItem, FeedbackListResponse
)
# Import the hierarchy checks
from app.core.security import (
    require_viewer, require_editor, require_admin, require_super_admin,
    verify_google_token, create_access_token
)
from app.core.config import settings

router = APIRouter()

# ==========================================
# LEVEL 0: PUBLIC (Login)
# ==========================================
@router.post("/auth/login", response_model=LoginResponse)
def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    """Verify Google OAuth token, issue JWT for admin users."""
    # 1. Verify Google token
    google_info = verify_google_token(request.google_token)
    email = google_info.get("email", "").lower()
    name = google_info.get("name", "")
    picture = google_info.get("picture", "")

    # 2. Check if super admin
    if email == settings.SUPER_ADMIN_EMAIL:
        access_token = create_access_token(
            data={"sub": email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return LoginResponse(
            access_token=access_token,
            user={"email": email, "name": name, "picture": picture, "role": "super_admin"}
        )

    # 3. Look up admin user in DB
    user = db.query(AdminUser).filter(AdminUser.email == email).first()
    if not user:
        raise HTTPException(
            status_code=403,
            detail="Not authorized. Your email is not registered as an admin."
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")

    # 4. Update profile info from Google (keep it fresh)
    user.name = name
    user.picture = picture
    db.commit()

    # 5. Issue JWT
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return LoginResponse(
        access_token=access_token,
        user={"email": email, "name": user.name, "picture": user.picture, "role": user.role}
    )

# --- INPUT SCHEMAS ---
class AdminCreate(BaseModel):
    email: EmailStr
    role: str # viewer, editor, admin (Super Admin cannot be created via API)

class FeedbackResolve(BaseModel):
    feedback_id: int
    notes: str = None

# ==========================================
# LEVEL 1: VIEWER (Read-Only Dashboard)
# ==========================================
@router.get("/dashboard", response_model=SuperAdminDashboard)
def get_dashboard(
    db: Session = Depends(get_db), 
    user: AdminUser = Depends(require_viewer) # Anyone Viewer+
):
    # (Same Dashboard Logic as before...)
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory()
    ram = mem.percent
    ram_total_gb = round(mem.total / (1024 ** 3), 2)
    ram_used_gb = round(mem.used / (1024 ** 3), 2)

    # Storage
    disk = psutil.disk_usage('/')
    storage = {
        "total_gb": round(disk.total / (1024 ** 3), 2),
        "used_gb": round(disk.used / (1024 ** 3), 2),
        "free_gb": round(disk.free / (1024 ** 3), 2),
        "used_percent": disk.percent,
    }

    # Load average (1, 5, 15 min)
    load_avg = [round(x, 2) for x in os.getloadavg()]

    # Top 5 processes by CPU
    top_procs = []
    for proc in sorted(
        psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']),
        key=lambda p: p.info.get('cpu_percent') or 0,
        reverse=True,
    )[:5]:
        top_procs.append({
            "pid": proc.info['pid'],
            "name": proc.info['name'] or "unknown",
            "cpu_percent": round(proc.info.get('cpu_percent') or 0, 1),
            "memory_percent": round(proc.info.get('memory_percent') or 0, 1),
        })

    # Network I/O
    net = psutil.net_io_counters()
    net_sent = net.bytes_sent
    net_recv = net.bytes_recv

    # All-time sessions (every chat session ever created)
    total_sessions = db.query(ChatSession).count()

    # Chat queries = user messages sent to ChatVat (port 8000) — persisted in DB
    total_chat_queries = db.query(ChatMessage).filter(ChatMessage.role == "user").count()

    # Real human website visits (persisted in page_visits table)
    total_visits = db.query(PageVisit).count()

    total_fb = db.query(Feedback).count()
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0.0
    unresolved = db.query(Feedback).filter(Feedback.is_resolved == False).count()

    # Security counters from persisted DB table (survives restarts)
    sec_counts = dict(
        db.query(SecurityEvent.event_type, func.count())
        .group_by(SecurityEvent.event_type)
        .all()
    )
    rl = sec_counts.get("RATE_LIMIT", 0)
    pi = sec_counts.get("PROMPT_INJECTION", 0)
    sq = sec_counts.get("SQLI", 0)
    bt = sec_counts.get("BANNED_TOPIC", 0)

    # Recent security logs — prefer DB (persisted) over in-memory
    recent_logs_rows = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.created_at.desc())
        .limit(5)
        .all()
    )
    recent_logs = [
        f"[{r.created_at.strftime('%H:%M:%S') if r.created_at else '??'}] [{r.event_type}] {r.detail or ''}"
        for r in recent_logs_rows
    ]

    return {
        "timestamp": datetime.now(),
        "traffic": {
            "total_requests": total_chat_queries,
            "total_gateway_requests": monitor.total_requests,
            "total_sessions": total_sessions,
            "total_visits": total_visits,
            "requests_per_minute_peak": 0,
            "average_latency_ms": monitor.get_avg_latency(),
            "total_tokens_processed": total_chat_queries * 100
        },
        "security": {
            "total_blocks": rl + pi + sq,
            "rate_limit_hits": rl,
            "prompt_injection_attempts": pi,
            "sqli_attempts": sq,
            "banned_topic_hits": bt,
            "blocked_ips_count": 0
        },
        "system": {
            "cpu_usage_percent": cpu,
            "ram_usage_percent": ram,
            "ram_total_gb": ram_total_gb,
            "ram_used_gb": ram_used_gb,
            "db_connection_status": True,
            "chatvat_engine_status": True,
            "uptime_seconds": monitor.get_uptime(),
            "error_rate_5xx": 0.0,
            "storage": storage,
            "load_average": load_avg,
            "top_processes": top_procs,
            "network_bytes_sent": net_sent,
            "network_bytes_recv": net_recv,
        },
        "business": {
            "total_feedback": total_fb,
            "avg_rating": round(avg_rating, 2),
            "net_promoter_score": 0.0,
            "unresolved_feedback": unresolved
        },
        "recent_security_logs": recent_logs if recent_logs else monitor.security_logs[:5]
    }


@router.get("/traffic-history")
def get_traffic_history(
    hours: int = 24,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_viewer),
):
    """Return hourly website visitor counts for the line graph.

    Returns the last `hours` hours (default 24), one data point per hour.
    Each point: { "hour": "2026-02-20T14:00:00", "visitors": 12 }
    Visitors = new chat sessions created that hour (each = a real person
    who passed Turnstile verification and started chatting).
    """

    cutoff = datetime.utcnow() - timedelta(hours=hours)

    # Visitors per hour = new chat sessions created (best proxy for website visitors,
    # since every session requires Turnstile verification = real human)
    visitor_rows = (
        db.query(
            func.date_trunc('hour', ChatSession.created_at).label("hour"),
            func.count().label("cnt"),
        )
        .filter(ChatSession.created_at >= cutoff)
        .group_by("hour")
        .order_by("hour")
        .all()
    )

    # Build a full hour-by-hour series (fill gaps with 0)
    visitor_map = {r[0].isoformat(): r[1] for r in visitor_rows}

    series = []
    now = datetime.utcnow()
    for i in range(hours, -1, -1):
        h = (now - timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
        key = h.isoformat()
        series.append({
            "hour": key,
            "visitors": visitor_map.get(key, 0),
        })

    return {"hours": hours, "series": series}


# ==========================================
# LEVEL 2: EDITOR (List & Resolve Feedback)
# ==========================================
@router.get("/feedback", response_model=FeedbackListResponse)
def list_feedback(
    page: int = 1,
    page_size: int = 20,
    resolved: Optional[bool] = None,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_editor)
):
    """List feedback items with optional filtering and pagination."""
    query = db.query(Feedback)
    if resolved is not None:
        query = query.filter(Feedback.is_resolved == resolved)
    total = query.count()
    items = (
        query.order_by(Feedback.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return FeedbackListResponse(
        items=[
            FeedbackItem(
                id=f.id,
                user_name=f.user_name,
                user_email=f.user_email,
                user_phone=f.user_phone,
                message=f.message,
                rating=f.rating,
                session_id=str(f.session_id) if f.session_id else None,
                is_resolved=f.is_resolved,
                created_at=f.created_at
            ) for f in items
        ],
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("/feedback/resolve")
def resolve_feedback(
    request: FeedbackResolve, 
    db: Session = Depends(get_db), 
    user: AdminUser = Depends(require_editor) # Editor+
):
    feedback = db.query(Feedback).filter(Feedback.id == request.feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.is_resolved = True
    # We could save 'notes' if we updated the model, for now just marking resolved
    db.commit()
    return {"status": "success", "message": f"Feedback {request.feedback_id} resolved by {user.email}"}

# ==========================================
# LEVEL 3: ADMIN (Manage Users)
# ==========================================
@router.post("/users/add")
def add_new_user(
    new_user: AdminCreate, 
    db: Session = Depends(get_db), 
    user: AdminUser = Depends(require_admin) # Admin+ (Cannot create Super Admin)
):
    if new_user.role == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot create Super Admin via API")

    exists = db.query(AdminUser).filter(AdminUser.email == new_user.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="User already exists")
    
    db_user = AdminUser(email=new_user.email, role=new_user.role)
    db.add(db_user)
    db.commit()
    return {"status": "success", "message": f"Added {new_user.email} as {new_user.role}"}

@router.get("/users/list")
def list_users(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_admin)  # Admin+
):
    """List all admin users."""
    users = db.query(AdminUser).order_by(AdminUser.created_at.desc()).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name or "",
                "role": u.role,
                "is_active": u.is_active,
                "picture": u.picture or "",
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }

@router.post("/users/{user_id}/revoke")
def revoke_user(
    user_id: int,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_admin)  # Admin+
):
    """Deactivate an admin user (set is_active=False)."""
    target = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.email == settings.SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Cannot revoke Super Admin")
    if target.id == getattr(user, "id", None):
        raise HTTPException(status_code=400, detail="Cannot revoke yourself")
    target.is_active = False
    db.commit()
    return {"status": "success", "message": f"Revoked access for {target.email}"}

# ==========================================
# LEVEL 4: SUPER ADMIN (Run SQL)
# ==========================================
@router.post("/db/query", response_model=DBQueryResponse)
def run_admin_query(
    request: DBQueryRequest, 
    db: Session = Depends(get_db), 
    user: AdminUser = Depends(require_super_admin) # SUPER ADMIN ONLY
):
    # Even for you, we check safety, but you have the keys to the castle.
    query_lower = request.query.strip().lower()
    if any(w in query_lower for w in ["insert", "update", "delete", "drop", "alter"]):
        raise HTTPException(status_code=400, detail="ReadOnly Mode: Only SELECT allowed in dashboard.")

    try:
        start = time.time()
        result = db.execute(text(request.query))
        rows = []
        cols = []
        if result.returns_rows:
            rows_raw = result.fetchall()
            cols = list(result.keys())
            rows = [dict(zip(cols, row)) for row in rows_raw]
        duration = (time.time() - start) * 1000
        return {"columns": cols, "rows": rows, "execution_time_ms": round(duration, 2)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))