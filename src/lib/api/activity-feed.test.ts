import { describe, expect, it } from "vitest";
import { ActivityItemSchema } from "@/lib/api/agents";

describe("activity-feed schema", () => {
  it("parses an activity item", () => {
    const it = ActivityItemSchema.parse({
      agent_slug: "agent-x",
      agent_name: "Agent X",
      seller_handle: "acme",
      trust_score: 82,
      cert_status: "certified",
      at: "2026-07-13T00:00:00Z",
    });
    expect(it.agent_slug).toBe("agent-x");
    expect(it.trust_score).toBe(82);
  });

  it("tolerates null seller/score", () => {
    const it = ActivityItemSchema.parse({
      agent_slug: "a",
      agent_name: "A",
      seller_handle: null,
      trust_score: null,
      cert_status: null,
      at: "2026-07-13T00:00:00Z",
    });
    expect(it.seller_handle).toBeNull();
    expect(it.trust_score).toBeNull();
  });
});
