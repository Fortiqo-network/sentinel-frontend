import { type NextRequest, NextResponse } from "next/server";

/**
 * Server-only configuration and helpers for the Backend-For-Frontend (BFF) layer.
 *
 * The browser never talks to the gateway directly. It calls same-origin Next.js
 * route handlers under `/api`, which hold the session JWT in a first-party
 * httpOnly cookie and forward it upstream as a Bearer token. This keeps the
 * cookie first-party (immune to third-party-cookie blocking) and keeps the JWT
 * out of any browser-readable storage.
 */

/**
 * Upstream gateway base URL. Read server-side from the same variable the
 * browser uses for public SSR reads — `NEXT_PUBLIC_*` values are available on
 * the server too, so the BFF needs no extra environment variable.
 */
export const GATEWAY_URL: string =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://sentinel-api.acquirehrsolutions.in";

/** Name of the first-party session cookie this BFF issues and reads. */
export const SESSION_COOKIE = "sentinel_session";

/** Session lifetime in seconds; mirrors the gateway's JWT access-token expiry. */
export const SESSION_MAX_AGE = 1800;

/**
 * Attributes for the first-party session cookie. `secure` is disabled outside
 * production so the cookie survives local http://localhost development.
 */
export function sessionCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

/**
 * Extracts the session JWT from an upstream `Set-Cookie` response. The gateway
 * sets the token as `sentinel_session=<jwt>`; we re-issue it as our own cookie.
 */
export function extractSessionToken(upstream: Response): string | null {
  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get("set-cookie") ?? ""];
  for (const raw of cookies) {
    const match = raw.match(/sentinel_session=([^;]+)/);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Builds a NextResponse mirroring an upstream response's status and JSON body. */
export async function mirrorResponse(upstream: Response): Promise<NextResponse> {
  const body = await upstream.text();
  const res = new NextResponse(body, { status: upstream.status });
  res.headers.set(
    "content-type",
    upstream.headers.get("content-type") ?? "application/json",
  );
  return res;
}

/** Reads the session JWT from the incoming first-party cookie, if present. */
export function sessionToken(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE)?.value;
}
