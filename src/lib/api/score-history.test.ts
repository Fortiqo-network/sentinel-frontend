import { describe, expect, it } from "vitest";
import { ScoreHistoryEntrySchema, ScoreHistoryResponseSchema } from "@/lib/api/seller";

describe("score-history schema", () => {
  it("parses snake_case entries from the gateway", () => {
    const parsed = ScoreHistoryResponseSchema.parse({
      history: [
        { trust_score: 0.72, cert_status: "certified", recorded_at: "2026-07-13T00:00:00Z" },
        { trust_score: 0.8, cert_status: "certified", recorded_at: "2026-07-10T00:00:00Z" },
      ],
    });
    expect(parsed.history).toHaveLength(2);
    expect(parsed.history[0]?.trust_score).toBe(0.72);
  });

  it("defaults history to [] when omitted", () => {
    expect(ScoreHistoryResponseSchema.parse({}).history).toEqual([]);
  });

  it("tolerates a null score (a rejection with no score)", () => {
    const entry = ScoreHistoryEntrySchema.parse({
      trust_score: null,
      cert_status: "uncertified",
      recorded_at: "2026-07-13T00:00:00Z",
    });
    expect(entry.trust_score).toBeNull();
  });
});
