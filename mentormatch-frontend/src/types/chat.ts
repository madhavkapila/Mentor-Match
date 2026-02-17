// Aligned with backend Pydantic schemas: schemas/chat.py

export interface ChatRequest {
  message: string;
  session_id: string | null;
  turnstile_token?: string; // Only required on first message (session-gated)
}

export interface MessageResponse {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Backend returns session_id + plain text message (passthrough from ChatVat)
export interface ChatResponse {
  session_id: string;
  message: string; // Plain string — matches ChatVat's native { "message": "..." } format
}

export interface FeedbackCreate {
  session_id?: string | null;
  user_name: string;
  user_email: string;
  user_phone?: string;
  message: string;
  rating?: number | null;
}

// Local UI state for a chat message (extends with UI-specific fields)
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  isStreaming?: boolean;
}
