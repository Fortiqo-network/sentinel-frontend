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
 * BFF register: creates the account via the gateway and establishes a
 * first-party session cookie, identically to login.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const upstream = await fetch(`${GATEWAY_URL}/v1/auth/register`, {
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
