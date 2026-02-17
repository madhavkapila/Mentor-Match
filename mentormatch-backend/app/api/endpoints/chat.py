# FILE: app/api/endpoints/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse, FeedbackCreate
from app.models.chat import ChatSession, ChatMessage, Feedback
from app.services.chatvat import chatvat_service
from app.middleware.prompt_guard import scan_prompt
from app.core.security import verify_turnstile

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    # 0. VERIFY HUMAN — session-gated (first message only)
    # Turnstile tokens are single-use. Verify on new sessions only;
    # subsequent messages reuse the already-verified session.
    if not request.session_id:
        if not request.turnstile_token:
            raise HTTPException(status_code=400, detail="Turnstile token required for new sessions")
        verify_turnstile(request.turnstile_token)
    
    # 1. SECURITY: Scan the prompt
    safe_text = scan_prompt(request.message)

    # 2. SESSION MANAGEMENT
    if not request.session_id:
        new_session = ChatSession(client_ip="0.0.0.0") 
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        session_id = new_session.id
    else:
        session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        session_id = request.session_id

    # 3. GET AI RESPONSE (before saving user msg, so history query
    #    only sees truly *previous* messages — no duplication)
    ai_text = chatvat_service.ask(safe_text, session_id, db)

    # 4. SAVE BOTH MESSAGES (user + assistant) together
    user_msg = ChatMessage(session_id=session_id, role="user", content=safe_text)
    ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_text)
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    # Passthrough: return ChatVat's plain text message + session tracking
    return ChatResponse(
        session_id=session_id,
        message=ai_text
    )

@router.post("/feedback")
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    # Verify Turnstile if token was provided
    if feedback.turnstile_token:
        verify_turnstile(feedback.turnstile_token)

    new_feedback = Feedback(
        session_id=feedback.session_id,
        user_name=feedback.user_name,
        user_email=feedback.user_email,
        user_phone=feedback.user_phone,
        message=feedback.message,
        rating=feedback.rating,
        is_resolved=False
    )
    db.add(new_feedback)
    db.commit()
    return {"status": "success", "message": "Feedback received"}