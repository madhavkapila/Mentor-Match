# FILE: app/middleware/security.py

import re
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.monitor import monitor

SQLI_PATTERNS = [
    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)",
    r"(--|;|\/\*|\*\/)",
    r"('(\s)*(OR|AND)(\s)*')",
]

MAX_BODY_SIZE = 10_000

# Admin routes are exempt from SQLi scanning (the SQL Console MUST send SQL keywords)
# Chat & Feedback are also exempt — LLM-Guard handles prompt security for those.
# The regex patterns block common English words ("select", "create", "update") in natural chat.
SQLI_EXEMPT_PREFIXES = ("/api/v1/admin", "/api/v1/chat", "/api/v1/feedback")

async def sanitize_input_middleware(request: Request, call_next):
    path = request.url.path
    if request.method in ["POST", "PUT"] and not any(path.startswith(p) for p in SQLI_EXEMPT_PREFIXES):
        body = await request.body()

        if len(body) > MAX_BODY_SIZE:
            monitor.log_security_event("SQLI", f"Oversized payload from {request.client.host}")
            return JSONResponse(
                status_code=413,
                content={"detail": "Payload too large"}
            )

        body_str = body.decode("utf-8", errors="ignore")
        for pattern in SQLI_PATTERNS:
            if re.search(pattern, body_str, re.IGNORECASE):
                monitor.log_security_event("SQLI", f"Pattern matched from {request.client.host}")
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Potentially dangerous input detected"}
                )

    response = await call_next(request)
    return response