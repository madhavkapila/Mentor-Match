import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// Create centralized Axios instance
// baseURL is empty — all API calls are relative (e.g. "/api/v1/chat")
// In dev, Next.js rewrites proxy /api/* to the backend.
// In prod, Nginx routes /api/* to the backend container.
const api = axios.create({
  baseURL: "",
  timeout: 60000, // 60s — backend has 45s AI timeout + overhead
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle common error states
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const status = error.response?.status;
    const detail =
      error.response?.data?.detail || error.response?.data?.message;

    if (status === 401) {
      // Token expired or invalid — clear auth state
      if (typeof window !== "undefined") {
        localStorage.removeItem("mm_token");
        localStorage.removeItem("mm_user");
        document.cookie = "mm_token=; path=/; SameSite=Strict; max-age=0";
        // Redirect to login if on dashboard route
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/login";
        }
      }
    }

    // Attach parsed detail for consumer hooks to use
    return Promise.reject({
      status,
      detail: detail || error.message || "An unexpected error occurred",
      isRateLimit: status === 429,
      isCircuitOpen: status === 503,
      raw: error,
    });
  }
);

// Type-safe API helpers
export async function apiPost<TReq, TRes>(
  url: string,
  data: TReq,
  config?: AxiosRequestConfig
): Promise<TRes> {
  const response = await api.post<TRes>(url, data, config);
  return response.data;
}

export async function apiGet<TRes>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TRes> {
  const response = await api.get<TRes>(url, config);
  return response.data;
}

export interface ApiError {
  status: number | undefined;
  detail: string;
  isRateLimit: boolean;
  isCircuitOpen: boolean;
  raw: AxiosError;
}

export default api;
