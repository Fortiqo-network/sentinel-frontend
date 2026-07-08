import { type NextRequest, NextResponse } from "next/server";
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  csrfCookieOptions,
  csrfEnforced,
  evaluateCsrf,
  generateCsrfToken,
} from "@/lib/bff/csrf";
import { SESSION_COOKIE } from "@/lib/bff/gateway";

/**
 * Edge middleware: two concerns at one choke point.
 *
 * 1. **Portal guard** (`/dashboard`, `/seller`, `/admin`) — a coarse presence
 *    check that a first-party session cookie exists before serving the protected
 *    app shell; missing → 307 redirect to `/login`. Real JWT verification and
 *    role enforcement still happen in the BFF route handlers and the gateway.
 *
 * 2. **CSRF double-submit check** (`/api/*`) — on unsafe methods, the `sentinel_csrf`
 *    cookie must equal the `X-CSRF-Token` header (see `lib/bff/csrf.ts`). Rejected
 *    with 403 only when `CSRF_ENFORCED` is set; otherwise recorded via a response
 *    header and allowed (dark rollout). Either way the token cookie is minted for
 *    any session that lacks one, so the flip can never lock out a live client.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/api")) {
    return handleApiCsrf(request, session);
  }

  // Protected portal pages: require a session, else send to login.
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }
  return mintCsrfIfMissing(request, NextResponse.next(), session);
}

/** Enforce (or, dark, record) the CSRF check on a `/api/*` request. */
function handleApiCsrf(request: NextRequest, session: string | undefined): NextResponse {
  const decision = evaluateCsrf({
    method: request.method,
    pathname: request.nextUrl.pathname,
    cookieToken: request.cookies.get(CSRF_COOKIE)?.value,
    headerToken: request.headers.get(CSRF_HEADER) ?? undefined,
  });

  if (!decision.ok && csrfEnforced()) {
    return NextResponse.json(
      {
        error: "csrf_failed",
        message: "CSRF validation failed. Please refresh the page and try again.",
        statusCode: 403,
      },
      { status: 403 },
    );
  }

  const res = NextResponse.next();
  if (!decision.ok) {
    // Observability while dark: surfaces would-be blocks without failing them.
    res.headers.set("x-csrf-dark", decision.reason);
  }
  return mintCsrfIfMissing(request, res, session);
}

/** Attach a fresh CSRF cookie when a session exists but no token is present yet. */
function mintCsrfIfMissing(
  request: NextRequest,
  res: NextResponse,
  session: string | undefined,
): NextResponse {
  if (session && !request.cookies.get(CSRF_COOKIE)?.value) {
    res.cookies.set(CSRF_COOKIE, generateCsrfToken(), csrfCookieOptions());
  }
  return res;
}

/**
 * Match the protected portal roots and all BFF (`/api`) routes. The negative
 * lookahead after `seller` excludes the public `/sellers` directory while still
 * matching the singular `/seller` portal. `/_next`, static assets, and public
 * marketing/auth pages are intentionally not matched.
 */
export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/seller/:path*",
    "/seller",
    "/admin/:path*",
    "/admin",
  ],
};
