import { describe, expect, it } from "vitest";
import { ReviewItemSchema } from "@/lib/api/reviews";

describe("review seller-response schema", () => {
  it("parses a review that carries a seller response", () => {
    const r = ReviewItemSchema.parse({
      id: "r-1",
      rating: 4,
      body: "Worked well.",
      reviewer_name: "Buyer",
      seller_response: "Thanks — glad it helped!",
      seller_responded_at: "2026-07-13T00:00:00Z",
      created_at: "2026-07-12T00:00:00Z",
      updated_at: "2026-07-12T00:00:00Z",
    });
    expect(r.seller_response).toBe("Thanks — glad it helped!");
  });

  it("tolerates a review with no seller response", () => {
    const r = ReviewItemSchema.parse({
      id: "r-2",
      rating: 5,
      body: null,
      reviewer_name: null,
      created_at: "2026-07-12T00:00:00Z",
      updated_at: "2026-07-12T00:00:00Z",
    });
    expect(r.seller_response ?? null).toBeNull();
  });
});
