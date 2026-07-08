import { afterEach, describe, expect, it } from "vitest";
import {
  csrfEnforced,
  evaluateCsrf,
  generateCsrfToken,
  isCsrfExemptPath,
  isSafeMethod,
} from "@/lib/bff/csrf";

describe("isSafeMethod", () => {
  it("treats read-only methods as safe (case-insensitive)", () => {
    for (const m of ["GET", "get", "HEAD", "options"]) {
      expect(isSafeMethod(m)).toBe(true);
    }
  });
  it("treats mutating methods as unsafe", () => {
    for (const m of ["POST", "put", "PATCH", "delete"]) {
      expect(isSafeMethod(m)).toBe(false);
    }
  });
});

describe("isCsrfExemptPath", () => {
  it("exempts the session-establishing auth routes", () => {
    for (const p of [
      "/api/v1/auth/login",
      "/api/v1/auth/register",
      "/api/v1/auth/google",
      "/api/v1/auth/x/start",
      "/api/v1/auth/x/callback",
    ]) {
      expect(isCsrfExemptPath(p)).toBe(true);
    }
  });
  it("does not exempt authenticated mutation routes", () => {
    expect(isCsrfExemptPath("/api/v1/auth/logout")).toBe(false);
    expect(isCsrfExemptPath("/api/v1/agents/abc/invoke")).toBe(false);
    expect(isCsrfExemptPath("/api/v1/auth/links/google")).toBe(false);
  });
});

describe("generateCsrfToken", () => {
  it("returns a 64-char hex string (256 bits)", () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });
  it("is unpredictable across calls", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateCsrfToken()));
    expect(tokens.size).toBe(50);
  });
});

describe("evaluateCsrf", () => {
  it("allows safe methods without a token", () => {
    expect(
      evaluateCsrf({
        method: "GET",
        pathname: "/api/v1/agents",
        cookieToken: undefined,
        headerToken: undefined,
      }),
    ).toEqual({ ok: true });
  });

  it("allows exempt paths without a token", () => {
    expect(
      evaluateCsrf({
        method: "POST",
        pathname: "/api/v1/auth/login",
        cookieToken: undefined,
        headerToken: undefined,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects an unsafe request with no cookie", () => {
    expect(
      evaluateCsrf({
        method: "POST",
        pathname: "/api/v1/agents/x/invoke",
        cookieToken: undefined,
        headerToken: "tok",
      }),
    ).toEqual({ ok: false, reason: "missing_cookie" });
  });

  it("rejects an unsafe request with no header", () => {
    expect(
      evaluateCsrf({
        method: "POST",
        pathname: "/api/v1/agents/x/invoke",
        cookieToken: "tok",
        headerToken: undefined,
      }),
    ).toEqual({ ok: false, reason: "missing_header" });
  });

  it("rejects when cookie and header disagree", () => {
    expect(
      evaluateCsrf({
        method: "DELETE",
        pathname: "/api/v1/keys/k1",
        cookieToken: "aaaa",
        headerToken: "bbbb",
      }),
    ).toEqual({ ok: false, reason: "mismatch" });
  });

  it("allows when cookie and header match", () => {
    const t = generateCsrfToken();
    expect(
      evaluateCsrf({
        method: "PATCH",
        pathname: "/api/v1/users/onboarding",
        cookieToken: t,
        headerToken: t,
      }),
    ).toEqual({ ok: true });
  });
});

describe("csrfEnforced", () => {
  const original = process.env.CSRF_ENFORCED;
  afterEach(() => {
    if (original === undefined) delete process.env.CSRF_ENFORCED;
    else process.env.CSRF_ENFORCED = original;
  });

  it("is off unless explicitly enabled", () => {
    delete process.env.CSRF_ENFORCED;
    expect(csrfEnforced()).toBe(false);
    process.env.CSRF_ENFORCED = "false";
    expect(csrfEnforced()).toBe(false);
    process.env.CSRF_ENFORCED = "1";
    expect(csrfEnforced()).toBe(false);
  });

  it("is on only for the exact string 'true'", () => {
    process.env.CSRF_ENFORCED = "true";
    expect(csrfEnforced()).toBe(true);
  });
});
