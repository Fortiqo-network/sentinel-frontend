"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth";
import { getCurrentUser } from "@/lib/api/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Rehydrates the Zustand auth store on every page load by calling
 * GET /v1/auth/me. This ensures the store reflects the current session
 * after browser refreshes, direct URL navigation, or cross-tab sign-out.
 * Renders children immediately so there is no layout shift; loading state
 * in the store can be used by consumers that need to gate on it.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const { setUser, setLoading } = useAuthStore();

  React.useEffect(() => {
    setLoading(true);
    getCurrentUser()
      .then((user) => setUser(user))
      .catch(() => setUser(null));
  }, [setUser, setLoading]);

  return <>{children}</>;
}
