# FILE: app/models/chat.py

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    # 1. The ID (UUID is safer than 1, 2, 3...)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 2. Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    client_ip = Column(String, nullable=True)  # To track usage by IP
    
    # 3. Relationships
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="session", uselist=False)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"))
    
    # 4. The Content
    role = Column(String)  # "user" or "assistant"
    content = Column(Text) # The actual text
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. User Identity (So you can contact them back)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_phone = Column(String, nullable=True) # Optional
    
    # 2. The Content
    message = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True) # 1-5 Stars (Optional)
    
    # 3. Context (Optional link to a chat session)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=True)
    
    # 4. Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_resolved = Column(Boolean, default=False) # For Admin to mark as "Done"

    session = relationship("ChatSession", back_populates="feedback")

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    
    # Roles: 
    # 'super_admin' (Can do everything including DB queries)
    # 'admin' (Can do everything super_admin can, except DB queries)
    # 'editor' (Can resolve feedback)
    # 'viewer' (Can only see dashboard)
    role = Column(String, default="viewer", nullable=False)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SecurityEvent(Base):
    """Persisted security events — survives container restarts."""
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)  # RATE_LIMIT, SQLI, PROMPT_INJECTION, BANNED_TOPIC
    detail = Column(Text, nullable=True)
    client_ip = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)