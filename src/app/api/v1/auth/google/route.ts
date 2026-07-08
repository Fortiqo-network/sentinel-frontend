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
 * BFF Google sign-in: forwards the Google ID token to the gateway and, on
 * success, converts the gateway's session cookie into a first-party httpOnly
 * cookie on this origin — identical to the email/password login route.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const upstream = await fetch(`${GATEWAY_URL}/v1/auth/google`, {
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
