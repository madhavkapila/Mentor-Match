import { create } from "zustand";
import { apiPost } from "./axios";
import type { AuthUser, UserRole } from "@/types/auth";
import type { LoginRequest, LoginResponse } from "@/types/admin";
import { hasMinRole } from "@/types/auth";

// Cookie helpers for middleware.ts (server-side route protection)
function setTokenCookie(token: string) {
  // Decode JWT to get expiry for cookie max-age
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const maxAge = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 86400;
    document.cookie = `mm_token=${token}; path=/; SameSite=Strict; max-age=${maxAge}`;
  } catch {
    document.cookie = `mm_token=${token}; path=/; SameSite=Strict; max-age=86400`;
  }
}

function clearTokenCookie() {
  document.cookie = "mm_token=; path=/; SameSite=Strict; max-age=0";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  checkRole: (minRole: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (googleToken: string) => {
    set({ isLoading: true });
    try {
      const response = await apiPost<LoginRequest, LoginResponse>(
        "/api/v1/admin/auth/login",
        { google_token: googleToken }
      );

      const user: AuthUser = {
        email: response.user.email,
        name: response.user.name,
        picture: response.user.picture,
        role: response.user.role,
      };

      // Persist to localStorage + cookie (cookie enables middleware.ts server-side checks)
      localStorage.setItem("mm_token", response.access_token);
      localStorage.setItem("mm_user", JSON.stringify(user));
      setTokenCookie(response.access_token);

      set({
        user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error("Login failed");
    }
  },

  logout: () => {
    localStorage.removeItem("mm_token");
    localStorage.removeItem("mm_user");
    clearTokenCookie();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("mm_token");
    const userJson = localStorage.getItem("mm_user");

    if (token && userJson) {
      try {
        // Validate JWT expiry client-side
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem("mm_token");
          localStorage.removeItem("mm_user");
          clearTokenCookie();
          return;
        }

        const user: AuthUser = JSON.parse(userJson);
        set({ user, token, isAuthenticated: true });
        // Ensure cookie is in sync with localStorage
        setTokenCookie(token);
      } catch {
        localStorage.removeItem("mm_token");
        localStorage.removeItem("mm_user");
        clearTokenCookie();
      }
    }
  },

  checkRole: (minRole: UserRole) => {
    const { user } = get();
    if (!user) return false;
    return hasMinRole(user.role, minRole);
  },
}));
