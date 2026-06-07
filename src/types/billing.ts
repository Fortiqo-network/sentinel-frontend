/**
 * TypeScript types for Sentinel billing and payments.
 * Amounts are always in INR paise (100 paise = ₹1) to avoid floating-point issues.
 */

/** Current credit balance for a buyer account. */
export interface CreditBalance {
  balancePaise: number;
  currency: "INR";
  updatedAt: string;
}

/** Direction of a ledger entry. */
export type LedgerEntryType = "credit" | "debit";

/** A single double-entry ledger record. */
export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amountPaise: number;
  description: string;
  /** Set when the entry relates to a specific agent invocation. */
  agentId?: string;
  createdAt: string;
}

/** Invoice status lifecycle. */
export type InvoiceStatus = "paid" | "unpaid" | "void";

/** A Sentinel invoice (generated for top-ups and subscriptions). */
export interface Invoice {
  id: string;
  amountPaise: number;
  currency: "INR";
  status: InvoiceStatus;
  /** Pre-signed URL to the PDF invoice. */
  pdfUrl?: string;
  createdAt: string;
}

/** Developer payout record. */
export interface Payout {
  id: string;
  amountPaise: number;
  currency: "INR";
  status: "pending" | "in_transit" | "paid" | "failed";
  scheduledAt: string;
  paidAt?: string;
  stripeTransferId?: string;
}

/** Earnings summary for a developer. */
export interface EarningsSummary {
  totalEarnedPaise: number;
  pendingPayoutPaise: number;
  lastPayoutAt?: string;
  lastPayoutAmountPaise?: number;
}
