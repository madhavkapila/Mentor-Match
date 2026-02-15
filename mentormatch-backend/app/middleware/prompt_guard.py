# FILE: app/middleware/prompt_guard.py

from llm_guard.input_scanners import PromptInjection, BanTopics
from fastapi import HTTPException
from app.core.monitor import monitor

# Initialize Scanners ONCE (These load ML models, might take time on startup)
print("Initializing Security Models... (This may take a few seconds)")
injection_scanner = PromptInjection(threshold=0.5) 
topic_scanner = BanTopics(topics=["politics", "crypto", "nsfw", "gambling"], threshold=0.5)

def scan_prompt(user_text: str):
    """
    Scans the prompt using LLM-Guard.
    Raises HTTPException if malicious.
    """
    # 1. Injection Scanner
    sanitized_prompt, results_valid, results_score = injection_scanner.scan(user_text)
    
    if not results_valid:
        monitor.log_security_event("PROMPT_INJECTION", f"Score: {results_score}")
        raise HTTPException(status_code=400, detail="Security alert: Malicious prompt detected.")

    # 2. Topic Scanner
    sanitized_prompt, results_valid, results_score = topic_scanner.scan(user_text)
    
    if not results_valid:
        monitor.log_security_event("BANNED_TOPIC", "User discussed banned topic")
        raise HTTPException(status_code=400, detail="Let's keep the conversation focused on mentorship.")

    return sanitized_prompt