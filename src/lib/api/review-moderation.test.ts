import { describe, expect, it } from "vitest";
import { ReviewReportRowSchema } from "@/lib/api/admin";

describe("review-report schema", () => {
  it("parses a review report row", () => {
    const r = ReviewReportRowSchema.parse({
      id: "rr-1",
      review_id: "rv-1",
      agent_id: "ag-1",
      reporter_id: "us-1",
      reason: "spam",
      details: null,
      status: "open",
      review_body: "Buy my other thing",
      review_hidden: false,
      created_at: "2026-07-13T00:00:00Z",
    });
    expect(r.status).toBe("open");
    expect(r.review_hidden).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(() =>
      ReviewReportRowSchema.parse({
        id: "rr-1",
        review_id: "rv-1",
        agent_id: "ag-1",
        reporter_id: "us-1",
        reason: "spam",
        details: null,
        status: "weird",
        review_body: null,
        review_hidden: true,
        created_at: "t",
      }),
    ).toThrow();
  });
});
