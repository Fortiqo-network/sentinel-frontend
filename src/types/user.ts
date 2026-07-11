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
  /** When the one-time seller registration fee was paid; null/undefined = not paid. */
  sellerFeePaidAt?: string | null;
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
  /** True when the account must rotate its password before proceeding (admin-created). */
  mustChangePassword?: boolean;
  /** When the user accepted the Terms & Conditions; null/undefined = never. */
  termsAcceptedAt?: string | null;
  /** Present on login/register responses only: first sign-in of this account. */
  firstLogin?: boolean;
  /** Present on login/register responses only: current terms version accepted. */
  termsUpToDate?: boolean;
}

/** Client-safe session state stored in Zustand (no tokens). */
export interface SessionState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
