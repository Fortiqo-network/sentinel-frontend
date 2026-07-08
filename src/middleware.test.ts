import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";
import { middleware } from "@/middleware";

const ORIGINAL_ENFORCED = process.env.CSRF_ENFORCED;

afterEach(() => {
  if (ORIGINAL_ENFORCED === undefined) delete process.env.CSRF_ENFORCED;
  else process.env.CSRF_ENFORCED = ORIGINAL_ENFORCED;
});

function req(
  path: string,
  { method = "GET", cookies = {}, headers = {} }: {
    method?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  const h: Record<string, string> = { ...headers };
  if (cookieHeader) h.cookie = cookieHeader;
  return new NextRequest(new URL(`http://localhost${path}`), { method, headers: h });
}

describe("middleware — portal guard", () => {
  it("redirects an unauthenticated portal request to /login", () => {
    const res = middleware(req("/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("allows an authenticated portal request and mints a CSRF cookie", () => {
    const res = middleware(req("/dashboard", { cookies: { sentinel_session: "jwt" } }));
    expect(res.status).toBe(200);
    expect(res.cookies.get("sentinel_csrf")?.value).toMatch(/^[0-9a-f]{64}$/);
  });

  it("does not re-mint a CSRF cookie that already exists", () => {
    const res = middleware(
      req("/dashboard", { cookies: { sentinel_session: "jwt", sentinel_csrf: "existing" } }),
    );
    expect(res.cookies.get("sentinel_csrf")).toBeUndefined();
  });
});

describe("middleware — CSRF on /api (dark, default)", () => {
  it("allows an unsafe request with no token but records the would-be block", () => {
    delete process.env.CSRF_ENFORCED;
    const res = middleware(
      req("/api/v1/agents/x/invoke", { method: "POST", cookies: { sentinel_session: "jwt" } }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("x-csrf-dark")).toBe("missing_cookie");
    // still mints the cookie so the eventual flip won't lock out this client
    expect(res.cookies.get("sentinel_csrf")?.value).toMatch(/^[0-9a-f]{64}$/);
  });

  it("allows a matching token with no dark marker", () => {
    delete process.env.CSRF_ENFORCED;
    const res = middleware(
      req("/api/v1/keys/k1", {
        method: "DELETE",
        cookies: { sentinel_session: "jwt", sentinel_csrf: "tok" },
        headers: { "x-csrf-token": "tok" },
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("x-csrf-dark")).toBeNull();
  });

  it("allows all safe methods", () => {
    delete process.env.CSRF_ENFORCED;
    const res = middleware(req("/api/v1/agents", { method: "GET" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-csrf-dark")).toBeNull();
  });
});

describe("middleware — CSRF on /api (enforced)", () => {
  it("blocks an unsafe request with no token", () => {
    process.env.CSRF_ENFORCED = "true";
    const res = middleware(
      req("/api/v1/agents/x/invoke", { method: "POST", cookies: { sentinel_session: "jwt" } }),
    );
    expect(res.status).toBe(403);
  });

  it("blocks an unsafe request whose header mismatches the cookie", () => {
    process.env.CSRF_ENFORCED = "true";
    const res = middleware(
      req("/api/v1/keys/k1", {
        method: "DELETE",
        cookies: { sentinel_session: "jwt", sentinel_csrf: "aaaa" },
        headers: { "x-csrf-token": "bbbb" },
      }),
    );
    expect(res.status).toBe(403);
  });

  it("allows a matching token", () => {
    process.env.CSRF_ENFORCED = "true";
    const res = middleware(
      req("/api/v1/keys/k1", {
        method: "DELETE",
        cookies: { sentinel_session: "jwt", sentinel_csrf: "tok" },
        headers: { "x-csrf-token": "tok" },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("exempts the session-establishing auth routes even when enforced", () => {
    process.env.CSRF_ENFORCED = "true";
    const res = middleware(req("/api/v1/auth/login", { method: "POST" }));
    expect(res.status).toBe(200);
  });
});
