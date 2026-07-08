import { z } from "zod";
import { apiClient } from "./client";
import type { CreditBalance, LedgerEntry, Invoice } from "@/types/billing";

// ── Zod schemas (credits only — 1 USD = 100 credits) ──────────────────────────────────

export const CreditBalanceSchema = z.object({
  balanceCredits: z.number().int().min(0),
  updatedAt: z.string().datetime(),
});

export const LedgerEntrySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["credit", "debit"]),
  credits: z.number().int().min(0),
  description: z.string(),
  agentId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  credits: z.number().int().min(0),
  status: z.enum(["paid", "unpaid", "void"]),
  createdAt: z.string().datetime(),
});

export const LedgerResponseSchema = z.object({
  entries: z.array(LedgerEntrySchema),
  total: z.number().int(),
});

// ── API functions ─────────────────────────────────────────────────────────────

/** Returns the authenticated user's current credit balance. */
export async function getCreditBalance(): Promise<CreditBalance> {
  const response = await apiClient.get<unknown>("/v1/billing/balance");
  return CreditBalanceSchema.parse(response.data);
}

/** Returns the paginated ledger for the authenticated user. */
export async function getLedger(page = 1, pageSize = 20): Promise<{ entries: LedgerEntry[]; total: number }> {
  const response = await apiClient.get<unknown>("/v1/billing/ledger", {
    params: { page, pageSize },
  });
  return LedgerResponseSchema.parse(response.data);
}

/** Returns all invoices for the authenticated user. */
export async function getInvoices(): Promise<Invoice[]> {
  const response = await apiClient.get<unknown>("/v1/billing/invoices");
  return z.array(InvoiceSchema).parse(response.data);
}

export const TopUpResultSchema = z.object({
  paymentId: z.string(),
  credits: z.number().int(),
  balanceCredits: z.number().int(),
  status: z.string(),
});

export type TopUpResult = z.infer<typeof TopUpResultSchema>;

/**
 * Adds credits to the authenticated buyer's wallet.
 * Records a placeholder payment server-side and returns the resulting balance.
 * Replaces the Stripe intent flow until a real payment provider is wired in.
 */
export async function topUp(credits: number): Promise<TopUpResult> {
  const response = await apiClient.post<unknown>("/v1/billing/topup", { credits });
  return TopUpResultSchema.parse(response.data);
}

export const CheckoutSchema = z.object({
  provider: z.enum(["razorpay", "stripe", "mock"]),
  orderId: z.string().nullable().optional(),
  keyId: z.string().nullable().optional(),
  checkoutUrl: z.string().url().nullable().optional(),
  amountCredits: z.number().int(),
});

export type Checkout = z.infer<typeof CheckoutSchema>;

export const MockCaptureSchema = z.object({
  orderId: z.string(),
  status: z.string(),
  credited: z.boolean(),
  balanceCredits: z.number().int(),
});

export type MockCapture = z.infer<typeof MockCaptureSchema>;

/**
 * Create a MOCK top-up order (pre-launch simulator — no real gateway). Returns
 * the same shape as a real checkout (`orderId`), which the mock payment UI then
 * "pays" via {@link captureMockPayment}. Swapped for a real provider later.
 */
export async function createMockOrder(credits: number): Promise<Checkout> {
  const response = await apiClient.post<unknown>("/v1/billing/checkout", {
    credits,
    provider: "mock",
  });
  return CheckoutSchema.parse(response.data);
}

/**
 * Complete a mock payment — the pre-launch stand-in for a provider callback.
 * Credits the wallet exactly-once server-side; safe to retry.
 */
export async function captureMockPayment(
  orderId: string,
  outcome: "success" | "failure" = "success",
): Promise<MockCapture> {
  const response = await apiClient.post<unknown>("/v1/billing/mock/capture", {
    orderId,
    outcome,
  });
  return MockCaptureSchema.parse(response.data);
}

/**
 * Opens a provider-hosted checkout to buy credits. Returns the provider handle:
 * a Stripe-hosted `checkoutUrl` to redirect to, or a Razorpay `orderId` + public
 * `keyId` to initialise Razorpay Checkout. Credits are posted to the wallet only
 * once the provider webhook confirms the payment.
 */
export async function createCheckout(
  credits: number,
  provider: "razorpay" | "stripe",
  successUrl: string,
  cancelUrl: string,
): Promise<Checkout> {
  const response = await apiClient.post<unknown>("/v1/billing/checkout", {
    credits,
    provider,
    successUrl,
    cancelUrl,
  });
  return CheckoutSchema.parse(response.data);
}

export const RedeemResultSchema = z.object({
  credits: z.number().int(),
  balanceCredits: z.number().int(),
  label: z.string(),
});

export type RedeemResult = z.infer<typeof RedeemResultSchema>;

/** Redeems a promo code for wallet credits (single-use per code). */
export async function redeemPromo(code: string): Promise<RedeemResult> {
  const response = await apiClient.post<unknown>("/v1/promo/redeem", { code });
  return RedeemResultSchema.parse(response.data);
}
