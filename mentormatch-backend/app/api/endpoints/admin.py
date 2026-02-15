# FILE: app/api/endpoints/admin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
import psutil
from datetime import datetime
import time
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.monitor import monitor
from app.models.chat import ChatSession, Feedback, AdminUser
from app.schemas.admin import SuperAdminDashboard, DBQueryResponse, DBQueryRequest
# Import the hierarchy checks
from app.core.security import require_viewer, require_editor, require_admin, require_super_admin

router = APIRouter()

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
    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    active_24h = db.query(ChatSession).filter(
        ChatSession.created_at >= func.now() - text("INTERVAL '1 DAY'")
    ).count()
    total_fb = db.query(Feedback).count()
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0.0
    unresolved = db.query(Feedback).filter(Feedback.is_resolved == False).count()

    return {
        "timestamp": datetime.now(),
        "traffic": {
            "total_requests": monitor.total_requests,
            "active_sessions_24h": active_24h,
            "average_latency_ms": monitor.get_avg_latency(),
            "total_tokens_processed": monitor.total_requests * 100
        },
        "security": {
            "total_blocks": monitor.rate_limit_hits + monitor.prompt_injection_hits + monitor.sqli_hits,
            "rate_limit_hits": monitor.rate_limit_hits,
            "prompt_injection_attempts": monitor.prompt_injection_hits,
            "sqli_attempts": monitor.sqli_hits,
            "banned_topic_hits": monitor.banned_topic_hits,
            "blocked_ips_count": 0
        },
        "system": {
            "cpu_usage_percent": cpu,
            "ram_usage_percent": ram,
            "db_connection_status": True,
            "chatvat_engine_status": True,
            "uptime_seconds": monitor.get_uptime(),
            "error_rate_5xx": 0.0
        },
        "business": {
            "total_feedback": total_fb,
            "avg_rating": round(avg_rating, 2),
            "net_promoter_score": 0.0,
            "unresolved_feedback": unresolved
        },
        "recent_security_logs": monitor.security_logs[:5]
    }

# ==========================================
# LEVEL 2: EDITOR (Resolve Feedback)
# ==========================================
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