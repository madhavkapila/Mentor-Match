// Aligned with backend Pydantic schemas: schemas/admin.py
import type { UserRole } from "./auth";

// --- Auth ---
export interface LoginRequest {
  google_token: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    email: string;
    name: string;
    picture: string;
    role: UserRole;
  };
}

// --- Dashboard Stats ---
export interface TrafficStats {
  total_requests: number;
  active_sessions_24h: number;
  requests_per_minute_peak: number;
  average_latency_ms: number;
  total_tokens_processed: number;
}

export interface SecurityStats {
  total_blocks: number;
  rate_limit_hits: number;
  prompt_injection_attempts: number;
  sqli_attempts: number;
  banned_topic_hits: number;
  blocked_ips_count: number;
}

export interface SystemHealth {
  cpu_usage_percent: number;
  ram_usage_percent: number;
  db_connection_status: boolean;
  chatvat_engine_status: boolean;
  error_rate_5xx: number;
  uptime_seconds: number;
}

export interface BusinessStats {
  total_feedback: number;
  avg_rating: number;
  net_promoter_score: number;
  unresolved_feedback: number;
}

export interface SuperAdminDashboard {
  timestamp: string;
  traffic: TrafficStats;
  security: SecurityStats;
  system: SystemHealth;
  business: BusinessStats;
  recent_security_logs: string[];
}

// --- Feedback ---
export interface FeedbackItem {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  message: string;
  rating: number | null;
  session_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  page_size: number;
}

// --- User Management ---
export interface AdminCreate {
  email: string;
  role: "viewer" | "editor" | "admin";
}

export interface AdminUserItem {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  picture: string;
  created_at: string | null;
}

export interface AdminUserListResponse {
  users: AdminUserItem[];
}

// --- DB Console ---
export interface DBQueryRequest {
  query: string;
}

export interface DBQueryResponse {
  columns: string[];
  rows: Record<string, unknown>[];
  execution_time_ms: number;
}
