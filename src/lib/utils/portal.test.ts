import { describe, expect, it } from "vitest";
import { isAdminRole, portalHome, portalLabel, postAuthDestination } from "@/lib/utils/portal";
import { UserSchema } from "@/lib/api/auth";

describe("isAdminRole", () => {
  it("treats admin and super_admin as admin-tier", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("super_admin")).toBe(true);
  });

  it("rejects non-admin roles and nullish input", () => {
    expect(isAdminRole("seller")).toBe(false);
    expect(isAdminRole("buyer")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});

describe("portal routing for super_admin", () => {
  it("routes super_admin to the admin console", () => {
    expect(portalHome("super_admin")).toBe("/admin");
    expect(portalLabel("super_admin")).toBe("Admin Console");
  });

  it("sends a completed super_admin straight to /admin (no onboarding wizard)", () => {
    expect(
      postAuthDestination({ role: "super_admin", termsAcceptedAt: "2026-01-01T00:00:00Z" }),
    ).toBe("/admin");
  });
});

describe("auth UserSchema", () => {
  const base = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "root@example.com",
    createdAt: "2026-07-14T00:00:00Z",
    emailVerified: true,
  };

  it("accepts the super_admin role (a real core-api role)", () => {
    const parsed = UserSchema.parse({ ...base, role: "super_admin", roles: ["super_admin"] });
    expect(parsed.role).toBe("super_admin");
  });

  it("still accepts the ordinary roles", () => {
    expect(UserSchema.parse({ ...base, role: "buyer" }).role).toBe("buyer");
    expect(UserSchema.parse({ ...base, role: "admin" }).role).toBe("admin");
  });
});
