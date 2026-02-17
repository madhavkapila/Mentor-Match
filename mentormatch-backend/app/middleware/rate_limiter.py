# FILE: app/middleware/rate_limiter.py

from fastapi import Request
from fastapi.responses import JSONResponse
from time import time
from collections import defaultdict
from app.core.monitor import monitor

# A simple in-memory store: IP -> [timestamp1, timestamp2, ...]
request_history = defaultdict(list)

LIMIT = 10          # Max requests
WINDOW_SECONDS = 60 # Per minute

# Paths exempt from rate limiting (admin dashboard polling, health checks)
EXEMPT_PREFIXES = ("/health", "/db-test", "/api/v1/admin")

async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for admin & health routes
    path = request.url.path
    if any(path.startswith(prefix) for prefix in EXEMPT_PREFIXES):
        return await call_next(request)

    client_ip = request.client.host
    now = time()
    
    # 1. Clean up old requests (older than 60s)
    # This is RAM-only, cleaning logic happens here
    request_history[client_ip] = [t for t in request_history[client_ip] if now - t < WINDOW_SECONDS]
    
    # 2. Check Limit
    if len(request_history[client_ip]) >= LIMIT:
        monitor.log_security_event("RATE_LIMIT", f"IP {client_ip} blocked", client_ip=client_ip)
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please slow down."}
        )
    
    # 3. Add current request
    request_history[client_ip].append(now)
    
    response = await call_next(request)
    return response