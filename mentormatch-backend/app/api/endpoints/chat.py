# FILE: app/api/endpoints/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.chat import ChatRequest, MessageResponse, FeedbackCreate
from app.models.chat import ChatSession, ChatMessage, Feedback
from app.services.chatvat import chatvat_service
from app.middleware.prompt_guard import scan_prompt
from app.core.security import verify_turnstile

router = APIRouter()

@router.post("/chat", response_model=MessageResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    # 0. VERIFY HUMAN (Layer 2 Defense)
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

    # 3. SAVE USER MESSAGE
    user_msg = ChatMessage(session_id=session_id, role="user", content=safe_text)
    db.add(user_msg)
    db.commit()

    # 4. GET AI RESPONSE
    # The service now correctly sends {"message": ...}
    ai_text = chatvat_service.ask(safe_text, session_id, db)

    # 5. SAVE AI RESPONSE
    ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg

@router.post("/feedback")
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
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