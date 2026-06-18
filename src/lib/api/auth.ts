import { z } from "zod";
import { apiClient } from "./client";
import type { User } from "@/types/user";

// ── Zod schemas ──────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.enum(["buyer", "developer", "admin"]),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  emailVerified: z.boolean(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  role: z.enum(["buyer", "developer"]),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Authenticates a user via the BFF login endpoint.
 * The BFF performs the OIDC token exchange and sets httpOnly cookies.
 * Returns the authenticated user's profile.
 */
export async function login(credentials: LoginRequest): Promise<User> {
  const response = await apiClient.post<unknown>("/v1/auth/login", credentials);
  return UserSchema.parse(response.data);
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
