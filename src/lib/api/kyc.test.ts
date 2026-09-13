import { describe, expect, it } from "vitest";
import { KycStatusSchema, KycSubmissionSchema } from "@/lib/api/seller";
import { AdminKycRowSchema } from "@/lib/api/admin";

describe("seller KYC schemas", () => {
  it("parses the gateway's camelCase status with masked bank details", () => {
    const s = KycStatusSchema.parse({
      status: "submitted",
      emailVerified: true,
      submittedAt: "2026-09-13T10:00:00Z",
      reviewedAt: null,
      reviewNote: null,
      details: { legal_name: "Balraj", payout_provider: "razorpay", bank_account_last4: "9012", bank_ifsc: "HDFC0001234" },
    });
    expect(s.status).toBe("submitted");
    expect(s.details?.bank_account_last4).toBe("9012");
    expect("bank_account_number" in (s.details ?? {})).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(() => KycStatusSchema.parse({ status: "maybe", emailVerified: true })).toThrow();
  });

  it("requires accepted terms to be literally true on a submission", () => {
    const base = { legal_name: "Balraj", country: "IN", payout_provider: "razorpay" as const, upi_id: "b@upi" };
    expect(() => KycSubmissionSchema.parse({ ...base, accepted_terms: false })).toThrow();
    expect(KycSubmissionSchema.parse({ ...base, accepted_terms: true }).upi_id).toBe("b@upi");
  });
});

describe("admin KYC row schema", () => {
  it("parses a queue row with a billing payout profile", () => {
    const r = AdminKycRowSchema.parse({
      user_id: "u1",
      email: "s@example.com",
      display_name: null,
      kyc_status: "verified",
      email_verified: true,
      submitted_at: "2026-09-13T10:00:00Z",
      reviewed_at: "2026-09-13T11:00:00Z",
      review_note: "ok",
      details: { legal_name: "Balraj", bank_account_last4: "9012" },
      payout_profile: { provider: "razorpay", fund_account_id: "fa_1", stripe_account_id: null, kyc_verified: true },
    });
    expect(r.payout_profile?.kyc_verified).toBe(true);
    expect(r.details?.bank_account_last4).toBe("9012");
  });

  it("accepts a row without a payout profile and rejects a bad provider", () => {
    const base = { user_id: "u1", email: "s@example.com", kyc_status: "submitted", email_verified: true };
    expect(AdminKycRowSchema.parse(base).payout_profile).toBeUndefined();
    expect(() =>
      AdminKycRowSchema.parse({ ...base, payout_profile: { provider: "paypal", kyc_verified: false } }),
    ).toThrow();
  });
});
