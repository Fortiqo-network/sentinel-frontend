import { type NextRequest, NextResponse } from "next/server";
import { GATEWAY_URL, SESSION_COOKIE, sessionToken } from "@/lib/bff/gateway";

/** Best-effort upstream logout — failure here is fine; clearing the cookie ends the session. */
async function upstreamLogout(token: string | undefined): Promise<void> {
  if (!token) return;
  try {
    await fetch(`${GATEWAY_URL}/v1/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    // Intentionally ignored.
  }
}

/**
 * BFF logout (POST): used by the in-app client (fetch). Clears the first-party
 * session cookie and returns JSON.
 */
export async function POST(request: NextRequest): Promise<Response> {
  await upstreamLogout(sessionToken(request));
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

/**
 * BFF logout (GET): used by plain "Sign Out" anchor links. Clears the session
 * cookie and redirects home, so a link click logs the user out and lands them
 * on the marketing page.
 */
export async function GET(request: NextRequest): Promise<Response> {
  await upstreamLogout(sessionToken(request));
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
