import { type NextRequest, NextResponse } from "next/server";
import { GATEWAY_URL, SESSION_COOKIE, sessionToken } from "@/lib/bff/gateway";

/**
 * BFF logout: best-effort upstream logout, then clears the first-party
 * session cookie regardless of the upstream outcome.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const token = sessionToken(request);
  if (token) {
    try {
      await fetch(`${GATEWAY_URL}/v1/auth/logout`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // Clearing the local cookie below is what actually ends the session.
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
