import { describe, expect, it } from "vitest";
import { auditExportFilename, auditFilterParams } from "@/lib/api/admin";

describe("auditFilterParams", () => {
  it("maps console filters onto the API's snake_case contract", () => {
    expect(
      auditFilterParams({
        action: "agent.retired",
        entityType: "agent",
        entityId: "a-1",
        actorId: "u-1",
      }),
    ).toEqual({
      action: "agent.retired",
      entity_type: "agent",
      entity_id: "a-1",
      actor_id: "u-1",
    });
  });

  it("omits blank and missing filters rather than sending empty matches", () => {
    expect(auditFilterParams({ action: "", entityType: "agent" })).toEqual({
      action: undefined,
      entity_type: "agent",
      entity_id: undefined,
      actor_id: undefined,
    });
    expect(auditFilterParams()).toEqual({
      action: undefined,
      entity_type: undefined,
      entity_id: undefined,
      actor_id: undefined,
    });
  });
});

describe("auditExportFilename", () => {
  it("stamps the download time in compact UTC", () => {
    expect(auditExportFilename(new Date("2026-07-14T09:30:05.123Z"))).toBe(
      "sentinel-audit-20260714T093005Z.csv",
    );
  });

  it("gives repeated exports distinct, sortable names", () => {
    const first = auditExportFilename(new Date("2026-07-14T09:30:05Z"));
    const second = auditExportFilename(new Date("2026-07-14T09:31:05Z"));
    expect(first).not.toBe(second);
    expect([second, first].sort()).toEqual([first, second]);
  });
});
