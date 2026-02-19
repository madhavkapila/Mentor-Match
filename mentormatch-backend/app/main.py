# FILE: app/main.py

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

# Core Imports
from app.core.database import engine, Base
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

# Middleware Imports
from app.core.monitor import monitor
from app.middleware.rate_limiter import rate_limit_middleware
from app.middleware.security import sanitize_input_middleware
from app.api.endpoints import chat, admin

# Ensure ALL models are imported so create_all picks them up (including TrafficMetric)
import app.models.chat  # noqa: F401

# 1. Initialize Database Tables
# This looks at all models imported above and creates them in Postgres if missing.
Base.metadata.create_all(bind=engine)

# 1b. Hydrate security monitor from persisted DB data (survives restarts)
monitor.hydrate_from_db()


# Lifespan — flush traffic metrics on shutdown so nothing is lost
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Shutdown: persist any remaining in-memory traffic deltas
    print("[SHUTDOWN] Flushing traffic metrics to DB …")
    monitor.flush_now()


# 2. Initialize App
app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)


# Allow Frontend to talk to Backend (configurable via CORS_ORIGINS env var)
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow POST, GET, OPTIONS
    allow_headers=["*"], # Allow Content-Type, Authorization
)

# 3. GLOBAL EXCEPTION HANDLER (The "Circuit Breaker")
# If anything crashes (DB offline, ChatVat timeout), this catches it.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the real error to the Docker console for you to see
    print(f"CRITICAL ERROR: {str(exc)}")
    
    # Return a friendly JSON to the student/user
    return JSONResponse(
        status_code=503,
        content={
            "status": "error", 
            "message": "System Overloaded (Our AI Mentor is napping). Please try again in 2 minutes."
        }
    )

# 4. MONITORING MIDDLEWARE (Must be First!)
# This tracks latency and request counts for your Admin Dashboard.
@app.middleware("http")
async def monitor_traffic_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    latency = (time.time() - start_time) * 1000
    monitor.log_request(latency)
    return response

# 5. SECURITY MIDDLEWARE (The "Bouncers")
app.middleware("http")(sanitize_input_middleware) # Checks for massive payloads / SQLi patterns
app.middleware("http")(rate_limit_middleware)     # Checks IP rate limits

# 6. REGISTER ROUTES
# Public Chat API -> /api/v1/chat
app.include_router(chat.router, prefix="/api/v1", tags=["Public Chat"])

# Admin Dashboard API -> /api/v1/admin
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Dashboard"])

# 7. HEALTH CHECK
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MentorMatch Gateway"}

# 8. DB CONNECTION TEST
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1")).scalar()
    return {"status": "connected", "result": result}