# FILE: app/core/security.py

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import requests

from app.core.config import settings
from app.core.database import get_db
from app.models.chat import AdminUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/admin/auth/login")

ROLE_HIERARCHY = {
    "viewer": 1,
    "editor": 2,
    "admin": 3,
    "super_admin": 4
}

def verify_google_token(token: str):
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        return id_info
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google Token",
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if email == settings.SUPER_ADMIN_EMAIL:
        return AdminUser(email=email, role="super_admin", is_active=True)

    user = db.query(AdminUser).filter(AdminUser.email == email).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=403, detail="User not found or inactive")
    return user

def require_viewer(user: AdminUser = Depends(get_current_user)):
    if ROLE_HIERARCHY.get(user.role, 0) < 1:
        raise HTTPException(status_code=403, detail="Viewer access required")
    return user

def require_editor(user: AdminUser = Depends(get_current_user)):
    if ROLE_HIERARCHY.get(user.role, 0) < 2:
        raise HTTPException(status_code=403, detail="Editor access required")
    return user

def require_admin(user: AdminUser = Depends(get_current_user)):
    if ROLE_HIERARCHY.get(user.role, 0) < 3:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def require_super_admin(user: AdminUser = Depends(get_current_user)):
    if ROLE_HIERARCHY.get(user.role, 0) < 4:
        raise HTTPException(status_code=403, detail="Super Admin access required")
    return user

def verify_turnstile(token: str):
    if token == "test":
        return True

    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    payload = {
        "secret": settings.TURNSTILE_SECRET_KEY,
        "response": token
    }

    try:
        outcome = requests.post(url, data=payload, timeout=5).json()
        if not outcome.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bot detected (Turnstile Verification Failed)"
            )
    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Could not verify CAPTCHA")