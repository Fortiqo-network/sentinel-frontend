import { z } from "zod";
import { apiClient } from "./client";
import type { CreditBalance, LedgerEntry, Invoice } from "@/types/billing";

// ── Zod schemas ──────────────────────────────────────────────────────────────

export const CreditBalanceSchema = z.object({
  balancePaise: z.number().int().min(0),
  currency: z.literal("INR"),
  updatedAt: z.string().datetime(),
});

export const LedgerEntrySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["credit", "debit"]),
  amountPaise: z.number().int().min(0),
  description: z.string(),
  agentId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  amountPaise: z.number().int().min(0),
  currency: z.literal("INR"),
  status: z.enum(["paid", "unpaid", "void"]),
  pdfUrl: z.string().url().optional(),
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
  amountPaise: z.number().int(),
  balancePaise: z.number().int(),
  status: z.string(),
});

export type TopUpResult = z.infer<typeof TopUpResultSchema>;

/**
 * Adds credits to the authenticated buyer's wallet.
 * Records a placeholder payment server-side and returns the resulting balance.
 * Replaces the Stripe intent flow until a real payment provider is wired in.
 */
export async function topUp(amountPaise: number): Promise<TopUpResult> {
  const response = await apiClient.post<unknown>("/v1/billing/topup", {
    amountPaise,
    currency: "INR",
  });
  return TopUpResultSchema.parse(response.data);
}
