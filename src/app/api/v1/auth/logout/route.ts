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
 *
 * A cross-site request (e.g. an attacker page's `<img src=".../logout">`) is
 * refused so it cannot force-clear the victim's session (session DoS): the
 * browser-set, unforgeable `Sec-Fetch-Site` header must not be `cross-site`. A
 * same-origin sign-out link is unaffected.
 */
export async function GET(request: NextRequest): Promise<Response> {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  await upstreamLogout(sessionToken(request));
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
