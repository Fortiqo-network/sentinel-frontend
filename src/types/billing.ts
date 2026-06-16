/**
 * TypeScript types for Sentinel billing and payments.
 * The system speaks in credits only (1 USD = 100 credits). Never paise/rupees/dollars.
 */

/** Current wallet balance for a buyer account, in credits. */
export interface CreditBalance {
  balanceCredits: number;
  updatedAt: string;
}

/** Direction of a ledger entry. */
export type LedgerEntryType = "credit" | "debit";

/** A single wallet ledger record, in credits. */
export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  credits: number;
  description: string;
  /** Set when the entry relates to a specific agent invocation. */
  agentId?: string | null;
  createdAt: string;
}

/** Invoice status lifecycle. */
export type InvoiceStatus = "paid" | "unpaid" | "void";

/** A Sentinel invoice (generated for top-ups), in credits. */
export interface Invoice {
  id: string;
  credits: number;
  status: InvoiceStatus;
  createdAt: string;
}

/** Developer payout record (credits). */
export interface Payout {
  id: string;
  amountCredits: number;
  status: "pending" | "in_transit" | "paid" | "failed";
  scheduledAt: string;
  paidAt?: string;
  stripeTransferId?: string;
}

/** Earnings summary for a developer (credits). */
export interface EarningsSummary {
  totalEarnedCredits: number;
  pendingPayoutCredits: number;
  lastPayoutAt?: string;
  lastPayoutAmountCredits?: number;
}
