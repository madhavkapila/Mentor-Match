# FILE: app/services/chatvat.py

import requests
import time
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.chat import ChatMessage
from app.core.monitor import monitor

class ChatVatService:
    def ask(self, user_message: str, session_id: str, db: Session) -> str:
        """
        Orchestrates the 'Context Injection' while respecting the 'message' schema.
        """
        # 1. Fetch History (Last 6 Messages)
        history_text = ""
        if session_id:
            previous_msgs = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at.desc()).limit(6).all()
            
            for msg in reversed(previous_msgs):
                role_label = "User" if msg.role == "user" else "Assistant"
                history_text += f"{role_label}: {msg.content}\n"

        # 2. Construct the Payload Content
        # We inject memory into the 'message' string itself.
        final_payload_content = f"""
        ### SYSTEM INSTRUCTIONS
        You are the "Capstone Compass," an intelligent Academic Matchmaker at Thapar Institute (TIET).
        
        ### 🧠 MODE SELECTION (CRITICAL)
        1. **CHAT MODE:** If the user input is a greeting (e.g., "Hello"), a question about you, or general small talk -> Reply warmly and professionally as an academic assistant. Ask them to share their project idea. **DO NOT** use the strict format below for greetings.
        2. **MATCH MODE:** If the user describes a project, research area, or technical topic -> YOU MUST use the **STRICT OUTPUT FORMAT** below.
        
        ### 🔍 MATCH MODE GUIDELINES
        1. **DECONSTRUCT:** Extract technical keywords (e.g., "1.58 bit LLM" -> NLP, Model Compression, Quantization, Deep Learning).
        2. **MATCH:** Search [Context] for faculty with matching "Research Interests" or "Publications".
        3. **INFER:** If "Specialization" is not explicitly listed, **INFER IT** from their paper titles (e.g., A paper on "Image Retrieval" implies "Computer Vision").
        4. **RANK:** Select the Top 5 **DISTINCT** mentors. Do not list the same person twice.
        
        ### 📝 STRICT OUTPUT FORMAT (For Match Mode ONLY)
        **🔍 Project Analysis:**
        [1 sentence analysis of the technical domains]
        
        **🏆 Recommended Mentors:**
        
        **1. Dr. [Name]** ([Department])
           - **🧠 Specialization:** [Inferred or Listed Fields]
           - **✨ Why them?:** [Explicit link between their specific paper/research and the student's idea]
           - **📄 Key Evidence:** [Cite the exact paper title or project]
           - **📧 Contact:** [Email OR "Check Faculty Profile"]
        
        (Repeat for Top 5)
        
        **💡 Pro Tip:**
        [One specific, actionable tip on how to approach these professors based on their work]
        
        ### ⚠️ CONSTRAINTS
        - **Context Only:** Stick strictly to the provided database.
        - **No Repetition:** Do not summarize at the end. Just list the 5 mentors.

        ### CONTEXT FROM DATABASE:
        {history_text}
        
        ### USER INPUT:
        {user_message}
        """

        # 3. Send to ChatVat with RETRY LOGIC
        url = f"{settings.CHATVAT_ENGINE_URL}/chat"
        payload = {"message": final_payload_content}

        try:
            # ATTEMPT 1
            response = requests.post(url, json=payload, timeout=45)
            response.raise_for_status()
            return response.json().get("message", "Error: Empty response from AI")

        except requests.exceptions.RequestException as e:
            # SOTA REQUIREMENT: Retry once internally
            monitor.log_security_event("SYSTEM_WARNING", f"ChatVat glitch. Retrying... ({str(e)})")
            time.sleep(0.5) # Brief cool-down
            
            try:
                # ATTEMPT 2
                response = requests.post(url, json=payload, timeout=45)
                response.raise_for_status()
                return response.json().get("message", "Error: Empty response from AI")
            
            except requests.exceptions.RequestException as final_error:
                # FINAL FAIL: Log and explode
                monitor.log_security_event("SYSTEM_ERROR", f"ChatVat Died after Retry: {str(final_error)}")
                raise final_error # Triggers global_exception_handler

chatvat_service = ChatVatService()