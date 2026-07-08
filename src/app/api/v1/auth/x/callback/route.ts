import { type NextRequest, NextResponse } from "next/server";
import { issueCsrfCookie } from "@/lib/bff/csrf";
import {
  GATEWAY_URL,
  SESSION_COOKIE,
  extractSessionToken,
  sessionCookieOptions,
} from "@/lib/bff/gateway";
import {
  X_STATE_COOKIE,
  X_VERIFIER_COOKIE,
  twitterRedirectUri,
} from "@/lib/bff/twitter";
import { portalHome } from "@/lib/utils/portal";

/**
 * BFF X sign-in callback: validates the CSRF `state`, forwards the authorization
 * code + PKCE verifier to the gateway (which performs the confidential token
 * exchange and profile lookup downstream), then converts the returned session
 * into a first-party httpOnly cookie and redirects to the user's portal.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieState = request.cookies.get(X_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(X_VERIFIER_COOKIE)?.value;

  const fail = (reason: string): Response => {
    const res = NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));
    res.cookies.delete(X_STATE_COOKIE);
    res.cookies.delete(X_VERIFIER_COOKIE);
    return res;
  };

  if (oauthError) return fail("twitter_denied");
  if (!code || !state || !cookieState || !verifier || state !== cookieState) {
    return fail("twitter_state");
  }

  const upstream = await fetch(`${GATEWAY_URL}/v1/auth/x/callback`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code,
      codeVerifier: verifier,
      redirectUri: twitterRedirectUri(),
    }),
    cache: "no-store",
  });

  if (!upstream.ok) return fail("twitter_failed");

  const token = extractSessionToken(upstream);
  let destination = "/dashboard";
  try {
    const user = (await upstream.json()) as { role?: string | null; needsOnboarding?: boolean };
    destination = user.needsOnboarding ? "/onboarding" : portalHome(user.role);
  } catch {
    destination = "/dashboard";
  }

  const res = NextResponse.redirect(new URL(destination, request.url));
  if (token) {
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    issueCsrfCookie(res);
  }
  res.cookies.delete(X_STATE_COOKIE);
  res.cookies.delete(X_VERIFIER_COOKIE);
  return res;
}
