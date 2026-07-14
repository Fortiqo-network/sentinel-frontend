import { z } from "zod";
import { apiClient } from "./client";
import type { User } from "@/types/user";

// ── Zod schemas ──────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.enum(["buyer", "seller", "admin", "super_admin"]),
  roles: z.array(z.enum(["buyer", "seller", "admin", "super_admin"])).optional(),
  sellerFeePaidAt: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  emailVerified: z.boolean(),
  mfaEnabled: z.boolean().optional().default(false),
  mfaMethod: z.enum(["totp", "email"]).nullable().optional(),
  needsOnboarding: z.boolean().optional().default(false),
  mustChangePassword: z.boolean().optional().default(false),
  termsAcceptedAt: z.string().nullable().optional(),
  firstLogin: z.boolean().optional(),
  termsUpToDate: z.boolean().optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  role: z.enum(["buyer", "seller"]),
});

export const GoogleLoginRequestSchema = z.object({
  credential: z.string().min(1, "Missing Google credential"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type GoogleLoginRequest = z.infer<typeof GoogleLoginRequestSchema>;

// ── API functions ─────────────────────────────────────────────────────────────

/** A 2FA challenge returned by login when the account has a second factor. */
export const TwoFactorChallengeSchema = z.object({
  mfaRequired: z.literal(true),
  pendingToken: z.string(),
  mfaMethod: z.enum(["totp", "email"]).nullable().optional(),
});

export type TwoFactorChallenge = z.infer<typeof TwoFactorChallengeSchema>;
export type LoginResult = User | TwoFactorChallenge;

/** Type guard: did login return a 2FA challenge instead of a session? */
export function isTwoFactorChallenge(result: LoginResult): result is TwoFactorChallenge {
  return (result as TwoFactorChallenge).mfaRequired === true;
}

/**
 * Authenticates a user via the BFF login endpoint.
 * The BFF performs the token exchange and sets httpOnly cookies.
 * Returns the authenticated user, or a 2FA challenge to complete via
 * {@link verifyTwoFactor} when the account has a second factor enabled.
 */
export async function login(credentials: LoginRequest): Promise<LoginResult> {
  const response = await apiClient.post<unknown>("/v1/auth/login", credentials);
  const challenge = TwoFactorChallengeSchema.safeParse(response.data);
  if (challenge.success) return challenge.data;
  return UserSchema.parse(response.data);
}

/**
 * Completes a 2FA login challenge by exchanging the pending token and a code
 * (TOTP or emailed) for a session. On success the BFF sets the session cookie.
 */
export async function verifyTwoFactor(pendingToken: string, code: string): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/login/2fa", {
    pendingToken,
    code,
  });
  return UserSchema.parse(response.data);
}

// ── Two-factor enrolment (authenticated self-service) ─────────────────────────

export const MfaStatusSchema = z.object({
  mfa_enabled: z.boolean(),
  mfa_method: z.enum(["totp", "email"]).nullable(),
});
export type MfaStatus = z.infer<typeof MfaStatusSchema>;

export const TotpSetupSchema = z.object({
  secret: z.string(),
  otpauth_uri: z.string(),
  qr_data_uri: z.string(),
});
export type TotpSetup = z.infer<typeof TotpSetupSchema>;

/** Current 2FA status for the signed-in user. */
export async function getMfaStatus(): Promise<MfaStatus> {
  const response = await apiClient.get<unknown>("/v1/auth/mfa");
  return MfaStatusSchema.parse(response.data);
}

/** Begin TOTP enrolment — returns the secret, otpauth URI, and a QR data URI. */
export async function setupTotp(): Promise<TotpSetup> {
  const response = await apiClient.post<unknown>("/v1/auth/mfa/totp/setup");
  return TotpSetupSchema.parse(response.data);
}

/** Confirm the authenticator by echoing a code, activating TOTP 2FA. */
export async function enableTotp(code: string): Promise<MfaStatus> {
  const response = await apiClient.post<unknown>("/v1/auth/mfa/totp/enable", { code });
  return MfaStatusSchema.parse(response.data);
}

/** Turn on the emailed-code second factor (requires a verified email). */
export async function enableEmailMfa(): Promise<MfaStatus> {
  const response = await apiClient.post<unknown>("/v1/auth/mfa/email/enable");
  return MfaStatusSchema.parse(response.data);
}

/** Disable 2FA. Requires the account password for password accounts. */
export async function disableMfa(password?: string): Promise<MfaStatus> {
  const response = await apiClient.post<unknown>("/v1/auth/mfa/disable", { password });
  return MfaStatusSchema.parse(response.data);
}

/**
 * Registers a new account via the gateway auth endpoint.
 * On success the BFF establishes a session, same as login.
 */
export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/register", data);
  return UserSchema.parse(response.data);
}

/**
 * Authenticates via a Google ID token (from Google Identity Services).
 * The BFF verifies it upstream and establishes a session, same as login;
 * a first-time Google user has an account created automatically.
 */
export async function loginWithGoogle(credential: string): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/google", { credential });
  return UserSchema.parse(response.data);
}

/** Onboarding answers submitted on the first sign-in. */
export interface OnboardingPayload {
  role: "buyer" | "seller";
  primaryUse?: string;
  referralSource?: string;
  organization?: string;
  interests?: string[];
  /** Why the user is signing up / what they hope to achieve. */
  signinReason?: string;
  /** Must be true — Terms & Conditions acceptance is required to enter. */
  acceptTerms: boolean;
}

/**
 * Completes post-signup onboarding (role choice + basic questions) and returns
 * the updated user (with `needsOnboarding` now false).
 */
export async function completeOnboarding(payload: OnboardingPayload): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/onboarding", payload);
  return UserSchema.parse(response.data);
}

/** Self-service password change (or first password for OAuth-only accounts). */
export interface ChangePasswordPayload {
  /** Current password; omit for OAuth-only accounts setting their first. */
  currentPassword?: string;
  newPassword: string;
}

/**
 * Changes (or sets) the account password and returns the updated user with
 * `mustChangePassword` cleared. A wrong current password rejects with a 400
 * whose message should be shown verbatim.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/change-password", payload);
  return UserSchema.parse(response.data);
}

/**
 * Enables selling on the current account (adds the `seller` role, additively).
 *
 * This is a one-way upgrade: the account keeps its buyer role and wallet and
 * gains the ability to list and earn. There is deliberately no inverse — a
 * seller cannot be downgraded back to buyer-only. Returns the updated user
 * (whose `role` is now `"seller"`, so the caller should route to the seller
 * portal and refresh the session).
 */
export async function becomeSeller(): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/become-seller");
  return UserSchema.parse(response.data);
}

export const PayRegistrationResponseSchema = z.object({
  registrationPaid: z.boolean().optional(),
  registration_paid: z.boolean().optional(),
  paid_at: z.string().nullable().optional(),
  fee_usd: z.number().optional(),
  balance_credits: z.number().nullable().optional(),
});

export interface PayRegistrationResult {
  paid: boolean;
  feeUsd: number;
  balanceCredits: number | null;
}

/**
 * Pays the one-time $10 seller registration fee from the wallet.
 *
 * Pay once — list unlimited agents. Idempotent server-side; throws a
 * SentinelApiError with statusCode 402 when the wallet can't cover it
 * (the UI should point the seller at the add-funds flow).
 */
export async function payRegistration(): Promise<PayRegistrationResult> {
  const response = await apiClient.post<unknown>("/v1/auth/pay-registration");
  const data = PayRegistrationResponseSchema.parse(response.data);
  return {
    paid: (data.registrationPaid ?? data.registration_paid) === true,
    feeUsd: data.fee_usd ?? 10,
    balanceCredits: data.balance_credits ?? null,
  };
}

/**
 * Clears the httpOnly session cookie via the BFF logout endpoint.
 * Redirects the browser to /login after the server responds.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/v1/auth/logout");
}

export const UpdateProfileRequestSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().max(1000).optional(),
  company: z.string().max(128).optional(),
  linkedinUrl: z.string().max(512).optional(),
  githubUrl: z.string().max(512).optional(),
  websiteUrl: z.string().max(512).optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/**
 * Updates the authenticated user's editable profile (display name, avatar).
 * The avatar value is either an image URL or a `preset:<id>` reference.
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.patch<unknown>("/v1/auth/me", data);
  return UserSchema.parse(response.data);
}

/**
 * Returns the currently authenticated user's profile, or null if not logged in.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<unknown>("/v1/auth/me");
    return UserSchema.parse(response.data);
  } catch {
    return null;
  }
}

/**
 * Requests a password-reset email for the given address.
 * Always resolves — never reveals whether the email is registered.
 */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/v1/auth/forgot-password", { email });
}

/**
 * Completes a password reset using the token from the reset email.
 * Throws a SentinelApiError on invalid / expired token.
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post("/v1/auth/reset-password", { token, new_password: newPassword });
}

/**
 * Confirms an email address using the token from the verification email.
 * Throws a SentinelApiError on invalid / expired token.
 */
export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post("/v1/auth/verify-email", { token });
}

/**
 * Requests a fresh verification email for the authenticated user.
 * No-op server-side when the address is already verified.
 */
export async function resendVerification(): Promise<void> {
  await apiClient.post("/v1/auth/send-verification");
}
