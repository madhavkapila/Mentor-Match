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
  total_gateway_requests: number;
  total_sessions: number;
  unique_visitors: number;
  total_visits: number;
  requests_per_minute_peak: number;
  average_latency_ms: number;
  total_tokens_processed: number;
}

export interface TrafficHistoryPoint {
  hour: string;
  chat_queries: number;
  visits: number;
}

export interface TrafficHistoryResponse {
  hours: number;
  series: TrafficHistoryPoint[];
}

export interface SecurityStats {
  total_blocks: number;
  rate_limit_hits: number;
  prompt_injection_attempts: number;
  sqli_attempts: number;
  banned_topic_hits: number;
  blocked_ips_count: number;
}

export interface StorageInfo {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  used_percent: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
}

export interface SystemHealth {
  cpu_usage_percent: number;
  ram_usage_percent: number;
  ram_total_gb: number;
  ram_used_gb: number;
  db_connection_status: boolean;
  chatvat_engine_status: boolean;
  error_rate_5xx: number;
  uptime_seconds: number;
  storage: StorageInfo;
  load_average: number[];        // [1min, 5min, 15min]
  top_processes: ProcessInfo[];   // Top 5 by CPU
  network_bytes_sent: number;
  network_bytes_recv: number;
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
