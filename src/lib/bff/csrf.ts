/**
 * CSRF double-submit-token defense for the state-changing BFF routes.
 *
 * The session lives in a first-party httpOnly `SameSite=Lax` cookie. Lax already
 * blocks the classic cross-site form/`<img>` POST, but not every state-changing
 * vector (e.g. a same-site subdomain, or a future `SameSite=None` need). This adds
 * defense-in-depth: a random token is issued in a **readable** (non-httpOnly)
 * cookie alongside the session; the browser echoes it in the `X-CSRF-Token`
 * header on every unsafe request. A cross-site attacker can neither read the
 * cookie (same-origin policy) nor set a custom header without a CORS preflight the
 * gateway won't grant — so cookie-vs-header equality proves same-origin intent.
 *
 * Shipped **dark**: enforcement is gated on `CSRF_ENFORCED` (default off). While
 * off, the token is still issued and the client still sends it, so flipping the
 * flag later cannot lock out already-loaded sessions — every live client is
 * already compliant. These functions are pure so they can be unit-tested without
 * the edge runtime; `middleware.ts` is the thin adapter.
 */

/** Readable (non-httpOnly) cookie carrying the CSRF token. */
export const CSRF_COOKIE = "sentinel_csrf";

/** Request header the client echoes the token in. */
export const CSRF_HEADER = "x-csrf-token";

const CSRF_TOKEN_BYTES = 32;
const CSRF_MAX_AGE = 1800; // mirrors the session cookie lifetime

/**
 * Whether CSRF failures should be rejected (vs recorded and allowed).
 *
 * Server-only env var — read in middleware and route handlers, never shipped to
 * the browser. Default off so the feature ships dark; the owner flips it to
 * `"true"` in the deployment env once a live session has been observed sending
 * the header, giving a zero-lockout rollout.
 */
export function csrfEnforced(): boolean {
  return process.env.CSRF_ENFORCED === "true";
}

/** Generate a fresh, unpredictable CSRF token (hex-encoded 256-bit value). */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Cookie attributes for the CSRF token — readable by JS, same secure/Lax posture. */
export function csrfCookieOptions(): {
  httpOnly: false;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  const isLocalDev =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_INSECURE_COOKIES === "true";
  return {
    httpOnly: false,
    secure: !isLocalDev,
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_MAX_AGE,
  };
}

/**
 * Set a fresh CSRF token cookie on a response. Called wherever a session is
 * established (login / register / oauth), so the readable token exists the moment
 * the session does — before any authenticated action can be attempted.
 */
export function issueCsrfCookie(res: {
  cookies: { set: (name: string, value: string, options: ReturnType<typeof csrfCookieOptions>) => unknown };
}): void {
  res.cookies.set(CSRF_COOKIE, generateCsrfToken(), csrfCookieOptions());
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Read-only methods never mutate state, so they are exempt from the token check. */
export function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

/**
 * Session-establishing routes are exempt: the caller has no CSRF token yet, and
 * these do not act under an existing authenticated session (a forged login/
 * register/oauth-callback does not ride the victim's cookie), so protecting them
 * would only create a lockout without adding safety.
 */
const EXEMPT_PATHS = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/google",
  "/api/v1/auth/x/start",
  "/api/v1/auth/x/callback",
]);

export function isCsrfExemptPath(pathname: string): boolean {
  return EXEMPT_PATHS.has(pathname);
}

/** Length-safe constant-time string comparison (no early return on mismatch). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export type CsrfDecision =
  | { ok: true }
  | { ok: false; reason: "missing_cookie" | "missing_header" | "mismatch" };

/**
 * Decide whether a request passes the double-submit check. Pure — the caller
 * supplies the method, path, cookie token, and header token, and decides what to
 * do with the verdict (block when {@link csrfEnforced}, else record).
 */
export function evaluateCsrf(opts: {
  method: string;
  pathname: string;
  cookieToken: string | undefined;
  headerToken: string | undefined;
}): CsrfDecision {
  if (isSafeMethod(opts.method)) return { ok: true };
  if (isCsrfExemptPath(opts.pathname)) return { ok: true };
  if (!opts.cookieToken) return { ok: false, reason: "missing_cookie" };
  if (!opts.headerToken) return { ok: false, reason: "missing_header" };
  if (!safeEqual(opts.cookieToken, opts.headerToken)) {
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true };
}
