import { describe, expect, it } from "vitest";
import { EcosystemStatsSchema } from "@/lib/api/agents";

describe("ecosystem-stats schema", () => {
  it("parses the stats payload", () => {
    const s = EcosystemStatsSchema.parse({
      live_agents: 42,
      verified_agents: 40,
      avg_trust_score: 81.5,
      sellers: 12,
      total_reviews: 130,
      avg_rating: 4.4,
      categories: 8,
    });
    expect(s.live_agents).toBe(42);
    expect(s.avg_trust_score).toBe(81.5);
  });

  it("tolerates null averages (empty marketplace)", () => {
    const s = EcosystemStatsSchema.parse({
      live_agents: 0,
      verified_agents: 0,
      avg_trust_score: null,
      sellers: 0,
      total_reviews: 0,
      avg_rating: null,
      categories: 0,
    });
    expect(s.avg_trust_score).toBeNull();
    expect(s.avg_rating).toBeNull();
  });
});
