import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";
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
 * Edge middleware: three concerns at one choke point.
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
 *
 * 3. **Pageview beacon** — every page request is reported to sentinel-observ for
 *    the traffic dashboard. Counted here rather than in the browser so that
 *    ad-blockers and disabled JavaScript cannot undercount a developer audience.
 *    Fire-and-forget via `waitUntil`, so it never adds latency to the response
 *    and a failed beacon can never fail a page.
 *
 * The matcher covers every page so concern 3 sees all traffic; concerns 1 and 2
 * are scoped by path inside, to exactly the prefixes they covered before.
 */

const PORTAL_PREFIXES = ["/dashboard", "/seller", "/admin"];

/** True for the protected portal roots. `/sellers` (public directory) is not one. */
function isPortalPath(pathname: string): boolean {
  return PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * `event` is optional purely so unit tests can invoke the middleware directly
 * without constructing a runtime fetch event; Next.js always supplies it.
 */
export function middleware(request: NextRequest, event?: NextFetchEvent): NextResponse {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/api")) {
    return handleApiCsrf(request, session);
  }

  event?.waitUntil(reportPageview(request));

  if (isPortalPath(pathname) && !session) {
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }
  return mintCsrfIfMissing(request, NextResponse.next(), session);
}

/**
 * Report one visit to sentinel-observ.
 *
 * Skips prefetches, which are speculative and would inflate the count well
 * above real traffic. Sends no identifier — path, referrer and the country
 * Vercel already resolved at the edge, nothing else. Silently gives up if the
 * ingest endpoint is not configured or unreachable: analytics must never be
 * able to break page delivery.
 */
async function reportPageview(request: NextRequest): Promise<void> {
  const endpoint = process.env.OBSERV_INGEST_URL;
  const token = process.env.OBSERV_INGEST_TOKEN;
  if (!endpoint || !token) return;
  if (request.method !== "GET") return;
  if (request.headers.get("next-router-prefetch") === "1") return;
  if (request.headers.get("purpose") === "prefetch") return;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Ingest-Token": token },
      body: JSON.stringify({
        path: request.nextUrl.pathname,
        referrer: request.headers.get("referer"),
        country: request.headers.get("x-vercel-ip-country"),
      }),
      signal: AbortSignal.timeout(2_000),
    });
  } catch {
    // Analytics is best-effort by design; a dropped beacon is not an incident.
  }
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
 * Every request except Next's build output and static assets. Excluding those
 * keeps the beacon counting page views rather than image and font fetches, and
 * keeps middleware off the hot path for assets entirely.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|txt|xml)$).*)",
  ],
};
