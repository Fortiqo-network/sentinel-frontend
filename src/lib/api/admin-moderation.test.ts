import { describe, expect, it } from "vitest";
import { SellerReportRowSchema } from "@/lib/api/admin";

describe("admin seller-report schema", () => {
  it("parses a post report row", () => {
    const row = SellerReportRowSchema.parse({
      id: "r-1",
      subject_type: "post",
      subject_id: "p-1",
      reporter_id: "u-1",
      reason: "spam",
      detail: null,
      status: "open",
      resolution_note: null,
      created_at: "2026-07-06T00:00:00Z",
    });
    expect(row.subject_type).toBe("post");
    expect(row.status).toBe("open");
  });

  it("accepts the reviewing/resolved/dismissed lifecycle and seller/comment subjects", () => {
    for (const status of ["reviewing", "resolved", "dismissed"] as const) {
      for (const subject_type of ["seller", "comment"] as const) {
        const row = SellerReportRowSchema.parse({
          id: "r",
          subject_type,
          subject_id: "s",
          reporter_id: "u",
          reason: "abuse",
          detail: "context",
          status,
          resolution_note: "handled",
          created_at: "2026-07-06T00:00:00Z",
        });
        expect(row.status).toBe(status);
        expect(row.subject_type).toBe(subject_type);
      }
    }
  });
});
