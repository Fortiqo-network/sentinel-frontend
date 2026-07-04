import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/bff/gateway";

/**
 * Edge middleware: server-side route guard for the authenticated portals.
 *
 * This is a coarse presence check only — it verifies that a first-party session
 * cookie exists before serving `/dashboard/*`, `/seller/*`, and `/admin/*`.
 * The BFF route handlers and the upstream gateway still perform real JWT
 * verification and role enforcement; this guard just prevents unauthenticated
 * requests from ever reaching the protected app shell (previously these paths
 * were only guarded client-side / in-layout).
 *
 * On a missing cookie the request is redirected (307) to the login page. No
 * intended-destination query param is attached because the login page does not
 * currently consume one.
 */
export function middleware(request: NextRequest): NextResponse {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl, 307);
}

/**
 * Match only the protected portal roots and their sub-paths. The negative
 * lookahead after `seller` excludes the public `/sellers` directory while
 * still matching the singular `/seller` portal. `/api`, `/_next`, static
 * assets, and all public/marketing/auth pages are intentionally not matched.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/seller/:path*",
    "/seller",
    "/admin/:path*",
    "/admin",
  ],
};
