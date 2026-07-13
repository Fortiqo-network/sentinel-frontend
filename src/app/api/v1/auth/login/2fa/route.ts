import { type NextRequest } from "next/server";
import { issueCsrfCookie } from "@/lib/bff/csrf";
import {
  GATEWAY_URL,
  SESSION_COOKIE,
  extractSessionToken,
  mirrorResponse,
  sessionCookieOptions,
} from "@/lib/bff/gateway";

/**
 * BFF two-factor exchange: forwards the pending token + code to the gateway and,
 * on success, converts the gateway's session cookie into a first-party httpOnly
 * cookie — completing the login that /v1/auth/login held back for 2FA.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const upstream = await fetch(`${GATEWAY_URL}/v1/auth/login/2fa`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });

  const res = await mirrorResponse(upstream);
  if (upstream.ok) {
    const token = extractSessionToken(upstream);
    if (token) {
      res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
      issueCsrfCookie(res);
    }
  }
  return res;
}
