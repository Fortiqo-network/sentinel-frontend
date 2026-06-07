"use client";

import { create } from "zustand";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
}

/**
 * Zustand store for client-side auth state. This store holds a mirror of
 * the server session for UI gating (show/hide nav items, etc.).
 *
 * IMPORTANT: This is cosmetic only. The gateway enforces authorization.
 * No tokens are stored here. Session validity is determined by the presence
 * of the httpOnly cookie managed by the BFF.
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser(user) {
    set({ user, isAuthenticated: user !== null, isLoading: false });
  },

  setLoading(loading) {
    set({ isLoading: loading });
  },

  clearSession() {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
