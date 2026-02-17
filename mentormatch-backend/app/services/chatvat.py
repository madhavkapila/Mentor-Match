# FILE: app/services/chatvat.py

import requests
import time
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.chat import ChatMessage
from app.core.monitor import monitor

class ChatVatService:
    # ── Token budget for conversation history ──
    # Rough estimate: 1 token ≈ 4 characters.  We hard-cap the
    # combined history string at ~500 tokens to preserve conversational
    # context while protecting the Groq free-tier quota.  Only the 3
    # most-recent messages are fetched; if they still exceed the budget
    # we truncate from the oldest end.
    MAX_HISTORY_MESSAGES = 3
    MAX_HISTORY_CHARS = 2000        # ≈ 500 tokens

    @staticmethod
    def _trim_history(history_text: str, max_chars: int) -> str:
        """Trim history from the *start* (oldest messages) to fit budget."""
        if len(history_text) <= max_chars:
            return history_text
        # Keep the newest portion that fits
        trimmed = history_text[-max_chars:]
        # Avoid cutting mid-line — find the first newline
        nl = trimmed.find("\n")
        if nl != -1:
            trimmed = trimmed[nl + 1:]
        return f"[...earlier context trimmed...]\n{trimmed}"

    def ask(self, user_message: str, session_id: str, db: Session) -> str:
        """
        Orchestrates the 'Context Injection' while respecting the 'message' schema.
        """
        # 1. Fetch History (Last 3 Messages, token-trimmed)
        history_text = ""
        if session_id:
            previous_msgs = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at.desc()).limit(self.MAX_HISTORY_MESSAGES).all()
            
            for msg in reversed(previous_msgs):
                role_label = "User" if msg.role == "user" else "Assistant"
                history_text += f"{role_label}: {msg.content}\n"

            # Enforce token budget
            history_text = self._trim_history(history_text, self.MAX_HISTORY_CHARS)

        # 2. Construct the Payload Content
        # Only include history block when there's actual prior context.
        if history_text.strip():
            final_payload_content = (
                f"### CONVERSATION HISTORY:\n{history_text}\n"
                f"### CURRENT QUESTION:\n{user_message}"
            )
        else:
            # First message — send only the user query, no wrapper noise
            final_payload_content = user_message

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