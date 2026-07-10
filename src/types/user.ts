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
  /**
   * The portal role — the highest-capability role the account holds, resolved
   * by the gateway. Drives which portal the user lands in. Roles are additive,
   * so a seller's `role` is `"seller"` even though they retain buyer access.
   */
  role: UserRole;
  /** Every role the account holds (additive). Use for capability checks. */
  roles?: UserRole[];
  avatarUrl?: string | null;
  bio?: string | null;
  company?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  createdAt: string;
  emailVerified: boolean;
  /** True until the user has chosen a role and finished onboarding. */
  needsOnboarding?: boolean;
}

/** Client-safe session state stored in Zustand (no tokens). */
export interface SessionState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
