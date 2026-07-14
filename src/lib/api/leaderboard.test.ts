import { describe, expect, it } from "vitest";
import { LeaderboardSchema } from "@/lib/api/agents";

const AGENT = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "a1",
  name: "A1",
  description: "An agent.",
  tier: "proxy",
  trustScore: 80,
  tags: [],
};

describe("leaderboard schema", () => {
  it("parses the three ranked lists", () => {
    const b = LeaderboardSchema.parse({
      top_rated: [AGENT],
      most_trusted: [AGENT],
      most_reviewed: [],
    });
    expect(b.top_rated).toHaveLength(1);
    expect(b.most_reviewed).toEqual([]);
  });

  it("parses all-empty boards", () => {
    const b = LeaderboardSchema.parse({ top_rated: [], most_trusted: [], most_reviewed: [] });
    expect(b.top_rated).toEqual([]);
  });
});
