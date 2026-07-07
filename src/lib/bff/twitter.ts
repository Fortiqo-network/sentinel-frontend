import { randomBytes, createHash } from "crypto";

/**
 * Server-only helpers for the X (Twitter) OAuth 2.0 Authorization Code + PKCE
 * flow. The browser never sees the client secret; the BFF starts the flow
 * (state + PKCE, both kept in short-lived httpOnly cookies) and, on the callback,
 * hands the authorization code to the gateway which performs the confidential
 * token exchange downstream.
 */

/** X authorize endpoint the user's browser is redirected to. */
export const TWITTER_AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize";

/** Scopes required to read the signed-in user's basic profile. */
export const TWITTER_SCOPE = "users.read tweet.read";

/** Short-lived cookies carrying the CSRF state and PKCE verifier across the redirect. */
export const X_STATE_COOKIE = "x_oauth_state";
export const X_VERIFIER_COOKIE = "x_oauth_verifier";

/** The public OAuth client ID, or undefined when X sign-in is not configured. */
export function twitterClientId(): string | undefined {
  return process.env.TWITTER_CLIENT_ID;
}

/**
 * The exact redirect URI registered on the X app. Must match character-for-character
 * both here (authorize request) and downstream (token exchange), or X returns
 * `redirect_uri mismatch`.
 */
export function twitterRedirectUri(): string {
  return (
    process.env.TWITTER_REDIRECT_URI ??
    "http://127.0.0.1:3000/api/v1/auth/x/callback"
  );
}

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

/** Generates a PKCE `(verifier, S256 challenge)` pair. */
export function createPkce(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

/** Generates an opaque CSRF `state` value. */
export function randomState(): string {
  return base64url(randomBytes(16));
}

/**
 * Attributes for the temporary state/verifier cookies. `sameSite: "lax"` is
 * required so the cookies survive X's top-level redirect back to the callback.
 * `secure` fails safe: on only outside explicit local-dev signals.
 */
export function tempCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  const isLocalDev =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_INSECURE_COOKIES === "true";
  return {
    httpOnly: true,
    secure: !isLocalDev,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  };
}
