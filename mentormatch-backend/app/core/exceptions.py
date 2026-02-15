# FILE: app/core/exceptions.py

from fastapi import Request
from fastapi.responses import JSONResponse

async def global_exception_handler(request: Request, exc: Exception):
    """
    The Circuit Breaker.
    Catches final failures (after retries) and shows the friendly message.
    """
    # Log the messy technical error for the Admin
    print(f"CRITICAL SYSTEM ERROR: {str(exc)}")
    
    # Return the friendly message for the Student
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "message": "Our AI mentor is currently napping. Please try again in 2 minutes."
        }
    )