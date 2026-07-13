import { describe, expect, it } from "vitest";
import { AppealSchema } from "@/lib/api/seller";
import { AdminAppealRowSchema } from "@/lib/api/admin";

describe("appeal schemas", () => {
  it("parses a seller appeal (snake_case)", () => {
    const a = AppealSchema.parse({
      id: "ap-1",
      status: "open",
      reason: "It was wrongly rejected.",
      admin_note: null,
      created_at: "2026-07-13T00:00:00Z",
      resolved_at: null,
    });
    expect(a.status).toBe("open");
    expect(a.reason).toContain("wrongly");
  });

  it("parses an admin appeal row", () => {
    const a = AdminAppealRowSchema.parse({
      id: "ap-1",
      agent_id: "ag-1",
      seller_id: "se-1",
      reason: "r",
      status: "approved",
      admin_note: "Re-verifying.",
      created_at: "2026-07-13T00:00:00Z",
      resolved_at: "2026-07-13T01:00:00Z",
    });
    expect(a.status).toBe("approved");
  });

  it("rejects an unknown admin appeal status", () => {
    expect(() =>
      AdminAppealRowSchema.parse({
        id: "ap-1",
        agent_id: "ag-1",
        seller_id: "se-1",
        reason: "r",
        status: "weird",
        admin_note: null,
        created_at: "t",
        resolved_at: null,
      }),
    ).toThrow();
  });
});
