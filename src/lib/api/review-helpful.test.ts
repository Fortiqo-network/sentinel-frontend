import { describe, expect, it } from "vitest";
import { ReviewItemSchema } from "@/lib/api/reviews";

describe("review helpful_count", () => {
  it("parses a review with a helpful_count", () => {
    const r = ReviewItemSchema.parse({
      id: "r-1",
      rating: 5,
      body: "Great",
      reviewer_name: "Buyer",
      helpful_count: 7,
      created_at: "2026-07-13T00:00:00Z",
      updated_at: "2026-07-13T00:00:00Z",
    });
    expect(r.helpful_count).toBe(7);
  });

  it("tolerates a review with no helpful_count", () => {
    const r = ReviewItemSchema.parse({
      id: "r-2",
      rating: 4,
      body: null,
      reviewer_name: null,
      created_at: "2026-07-13T00:00:00Z",
      updated_at: "2026-07-13T00:00:00Z",
    });
    expect(r.helpful_count ?? 0).toBe(0);
  });
});
