import { describe, expect, it } from "vitest";
import { NotificationPrefsSchema } from "@/lib/api/notifications";

describe("notification preferences schema", () => {
  it("parses the preferences map", () => {
    const p = NotificationPrefsSchema.parse({
      new_agent: true,
      score_drift: false,
      review_response: true,
    });
    expect(p.score_drift).toBe(false);
    expect(p.new_agent).toBe(true);
  });

  it("rejects a missing field", () => {
    expect(() => NotificationPrefsSchema.parse({ new_agent: true, score_drift: false })).toThrow();
  });
});
