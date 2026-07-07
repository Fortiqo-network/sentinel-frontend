import { type NextRequest, NextResponse } from "next/server";
import {
  TWITTER_AUTHORIZE_URL,
  TWITTER_SCOPE,
  X_STATE_COOKIE,
  X_VERIFIER_COOKIE,
  createPkce,
  randomState,
  tempCookieOptions,
  twitterClientId,
  twitterRedirectUri,
} from "@/lib/bff/twitter";

/**
 * BFF X sign-in start: mints a CSRF `state` + PKCE pair (stored in short-lived
 * httpOnly cookies) and redirects the browser to X's authorize screen. X sends
 * the user back to `/api/v1/auth/x/callback` with an authorization code.
 */
export function GET(request: NextRequest): Response {
  const clientId = twitterClientId();
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=twitter_unconfigured", request.url),
    );
  }

  const { verifier, challenge } = createPkce();
  const state = randomState();

  const authorize = new URL(TWITTER_AUTHORIZE_URL);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", twitterRedirectUri());
  authorize.searchParams.set("scope", TWITTER_SCOPE);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authorize.toString());
  res.cookies.set(X_STATE_COOKIE, state, tempCookieOptions());
  res.cookies.set(X_VERIFIER_COOKIE, verifier, tempCookieOptions());
  return res;
}
