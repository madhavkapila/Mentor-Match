# FILE: app/schemas/chat.py

from pydantic import BaseModel, UUID4, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# 1. Input: What the user sends to START a chat
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[UUID4] = None # If None, we create a new session
    turnstile_token: str

# 2. Output: A single message
class MessageResponse(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True # Tells Pydantic to read SQLAlchemy models

# 3. Output: The full history
class SessionResponse(BaseModel):
    id: UUID4
    created_at: datetime
    messages: List[MessageResponse]

    class Config:
        from_attributes = True

# 4. Input: Feedback
class FeedbackCreate(BaseModel):
    session_id: Optional[UUID4] = None # Optional because user might give feedback without chatting
    
    # Contact Details
    user_name: str = Field(..., min_length=2, max_length=100)
    user_email: EmailStr
    user_phone: Optional[str] = Field(None, max_length=15)
    
    # The Feedback
    message: str = Field(..., min_length=5, max_length=2000)
    rating: Optional[int] = Field(None, ge=1, le=5) # 1 to 5 stars