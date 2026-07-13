import { describe, expect, it } from "vitest";
import { RelatedAgentsSchema } from "@/lib/api/agents";

const AGENT = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "a1",
  name: "A1",
  description: "An agent.",
  tier: "proxy",
  trustScore: 80,
  tags: [],
};

describe("related-agents schema", () => {
  it("parses both groups", () => {
    const r = RelatedAgentsSchema.parse({
      more_from_developer: [AGENT],
      similar: [{ ...AGENT, id: "550e8400-e29b-41d4-a716-446655440001", slug: "a2" }],
    });
    expect(r.more_from_developer).toHaveLength(1);
    expect(r.similar[0]?.slug).toBe("a2");
  });

  it("parses empty groups", () => {
    const r = RelatedAgentsSchema.parse({ more_from_developer: [], similar: [] });
    expect(r.more_from_developer).toEqual([]);
    expect(r.similar).toEqual([]);
  });
});
