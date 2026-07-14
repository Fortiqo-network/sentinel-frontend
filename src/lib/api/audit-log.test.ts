import { describe, expect, it } from "vitest";
import { AdminAuditRowSchema } from "@/lib/api/admin";

describe("admin audit-log schema", () => {
  it("parses a full audit row with actor and details", () => {
    const row = AdminAuditRowSchema.parse({
      id: "e-1",
      action: "agent.retired",
      entity_type: "agent",
      entity_id: "a-1",
      actor_id: "u-1",
      actor_email: "admin@example.com",
      details: { reason: "policy" },
      created_at: "2026-07-14T00:00:00Z",
    });
    expect(row.action).toBe("agent.retired");
    expect(row.actor_email).toBe("admin@example.com");
    expect(row.details).toEqual({ reason: "policy" });
  });

  it("accepts a system event with null actor / entity / details", () => {
    const row = AdminAuditRowSchema.parse({
      id: "e-2",
      action: "user.blocked",
      entity_type: "user",
      entity_id: null,
      actor_id: null,
      actor_email: null,
      details: null,
      created_at: "2026-07-14T00:01:00Z",
    });
    expect(row.actor_id).toBeNull();
    expect(row.details).toBeNull();
  });

  it("tolerates omitted optional fields", () => {
    const row = AdminAuditRowSchema.parse({
      id: "e-3",
      action: "review.hidden",
      entity_type: "review",
      created_at: "2026-07-14T00:02:00Z",
    });
    expect(row.entity_id).toBeUndefined();
    expect(row.action).toBe("review.hidden");
  });
});
