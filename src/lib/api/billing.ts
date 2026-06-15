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
