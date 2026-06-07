"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PayoutStatus = "completed" | "pending" | "failed";
type PayoutProvider = "Razorpay" | "Stripe";

interface Payout {
  id: string;
  date: string;
  amountPaise: number;
  status: PayoutStatus;
  provider: PayoutProvider;
  reference: string;
}

interface Bond {
  amountPaise: number;
  lockedUntil: string;
  agentName: string;
  status: "active" | "released";
}

// ---------------------------------------------------------------------------
// Mock data (realistic INR paise amounts)
// ---------------------------------------------------------------------------

const MOCK_PAYOUTS: Payout[] = [
  { id: "po_1", date: "2026-06-01", amountPaise: 1245000, status: "completed", provider: "Razorpay", reference: "RZP_1a2b3c" },
  { id: "po_2", date: "2026-05-01", amountPaise: 980000, status: "completed", provider: "Razorpay", reference: "RZP_4d5e6f" },
  { id: "po_3", date: "2026-04-01", amountPaise: 1560000, status: "completed", provider: "Stripe", reference: "STR_7g8h9i" },
  { id: "po_4", date: "2026-03-01", amountPaise: 720000, status: "completed", provider: "Razorpay", reference: "RZP_0j1k2l" },
  { id: "po_5", date: "2026-02-01", amountPaise: 0, status: "failed", provider: "Stripe", reference: "STR_3m4n5o" },
];

const MOCK_BONDS: Bond[] = [
  { amountPaise: 500000, lockedUntil: "2026-10-10", agentName: "TaxBot Pro", status: "active" },
  { amountPaise: 300000, lockedUntil: "2026-08-22", agentName: "Invoice Extractor", status: "active" },
  { amountPaise: 200000, lockedUntil: "2025-12-31", agentName: "Legacy Analyzer v1", status: "released" },
];

// Summary numbers derived from mock data
const AVAILABLE_BALANCE_PAISE = 325700;
const PENDING_PAYOUT_PAISE = 198200;
const TOTAL_EARNED_PAISE = MOCK_PAYOUTS.filter((p) => p.status === "completed").reduce(
  (sum, p) => sum + p.amountPaise,
  0,
) + AVAILABLE_BALANCE_PAISE;
const BOND_DEPOSITED_PAISE = MOCK_BONDS.filter((b) => b.status === "active").reduce(
  (sum, b) => sum + b.amountPaise,
  0,
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PAYOUT_STATUS_STYLES: Record<PayoutStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function SummaryCard({ label, value, sub, accent }: SummaryCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm",
        accent
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-white",
      )}
    >
      <div className={cn("text-2xl font-bold", accent ? "text-indigo-700" : "text-slate-900")}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

interface PayoutStatusBadgeProps {
  status: PayoutStatus;
}

function PayoutStatusBadge({ status }: PayoutStatusBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PAYOUT_STATUS_STYLES[status],
      )}
    >
      {PAYOUT_STATUS_LABELS[status]}
    </span>
  );
}

interface RequestPayoutModalProps {
  onClose: () => void;
}

function RequestPayoutModal({ onClose }: RequestPayoutModalProps): React.JSX.Element {
  const [amount, setAmount] = React.useState<string>("");
  const minPaise = 50000; // ₹500
  const amountPaise = Math.round(parseFloat(amount || "0") * 100);
  const isValid = amountPaise >= minPaise && amountPaise <= AVAILABLE_BALANCE_PAISE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-slate-900">Request Payout</h2>
        <p className="mt-1 text-sm text-slate-500">
          Available: <span className="font-medium text-slate-700">{formatInr(AVAILABLE_BALANCE_PAISE)}</span>
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount (₹)
            </label>
            <input
              type="number"
              min="500"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <p className="mt-1 text-xs text-slate-400">Minimum payout: ₹500</p>
          </div>

          {amount && !isValid && (
            <p className="text-xs text-red-500">
              {amountPaise < minPaise
                ? "Minimum payout amount is ₹500."
                : "Amount exceeds available balance."}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isValid}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Payout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Earnings page. Shows balance summary, payout history table, bond status,
 * and a "Request Payout" flow with ₹500 minimum validation.
 */
export default function EarningsPage(): React.JSX.Element {
  const [showPayoutModal, setShowPayoutModal] = React.useState(false);

  return (
    <div className="space-y-8">
      {showPayoutModal && <RequestPayoutModal onClose={() => setShowPayoutModal(false)} />}

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-1 text-slate-600">Revenue, payouts, and bond deposits for your agents.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPayoutModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap"
        >
          Request Payout
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Available Balance"
          value={formatInr(AVAILABLE_BALANCE_PAISE)}
          sub="Ready for payout"
          accent
        />
        <SummaryCard
          label="Pending Payout"
          value={formatInr(PENDING_PAYOUT_PAISE)}
          sub="Processing (3–5 days)"
        />
        <SummaryCard
          label="Bond Deposited"
          value={formatInr(BOND_DEPOSITED_PAISE)}
          sub="Locked as security"
        />
        <SummaryCard
          label="Total Earned All-time"
          value={formatInr(TOTAL_EARNED_PAISE)}
          sub="Lifetime revenue"
        />
      </div>

      {/* Payout history */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_PAYOUTS.map((payout) => (
                <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">{payout.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatInr(payout.amountPaise)}</td>
                  <td className="px-6 py-4">
                    <PayoutStatusBadge status={payout.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
                        payout.provider === "Razorpay"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700",
                      )}
                    >
                      {payout.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{payout.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bond status */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Bond Deposits</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Security bonds are locked per agent until the release date. Released bonds are refunded automatically.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Bond Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Locked Until</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_BONDS.map((bond, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{bond.agentName}</td>
                  <td className="px-6 py-4 text-slate-700">{formatInr(bond.amountPaise)}</td>
                  <td className="px-6 py-4 text-slate-600">{bond.lockedUntil}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        bond.status === "active"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {bond.status === "active" ? "Active (Locked)" : "Released"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout minimum notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Minimum payout amount is <strong>₹500</strong>. Payouts are processed via Razorpay or Stripe within
        3–5 business days. Ensure your bank account or UPI is linked in Settings.
      </div>
    </div>
  );
}
