/**
 * TypeScript types for Sentinel user accounts and sessions.
 * Authorization enforcement happens on the gateway — role checks here
 * are cosmetic UI gating only.
 */

/** Primary role assigned at registration. */
export type UserRole = "buyer" | "seller" | "admin";

/** Authenticated user profile as returned by GET /v1/auth/me. */
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  company?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  createdAt: string;
  emailVerified: boolean;
}

/** Client-safe session state stored in Zustand (no tokens). */
export interface SessionState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
