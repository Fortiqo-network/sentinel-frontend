"use client";

import * as React from "react";
import { getCreditBalance, getInvoices, topUp } from "@/lib/api/billing";
import { isSentinelApiError } from "@/lib/api/client";
import type { Invoice } from "@/types/billing";
import { cn } from "@/lib/utils/cn";

type TopUpPreset = 500 | 1000 | 2000;

const TOP_UP_PRESETS: TopUpPreset[] = [500, 1000, 2000];

function formatPoints(points: number): string {
  return `${points.toLocaleString("en-IN")} points`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const INVOICE_STATUS_STYLES: Record<Invoice["status"], string> = {
  paid: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-amber-100 text-amber-700",
  void: "bg-slate-100 text-slate-500",
};

/**
 * Billing page. Shows the live points balance, a working top-up (recorded by
 * the placeholder payment store until a real provider is wired in), and the
 * buyer's invoice history — all in points.
 */
export default function BillingPage(): React.JSX.Element {
  const [balancePoints, setBalancePoints] = React.useState<number | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [selectedPreset, setSelectedPreset] = React.useState<TopUpPreset | null>(null);
  const [customAmount, setCustomAmount] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = React.useCallback(async () => {
    const [bal, inv] = await Promise.allSettled([getCreditBalance(), getInvoices()]);
    if (bal.status === "fulfilled") setBalancePoints(bal.value.balancePoints);
    if (inv.status === "fulfilled") setInvoices(inv.value);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const effectivePoints: number | null = isCustom
    ? customAmount
      ? Math.round(parseFloat(customAmount))
      : null
    : selectedPreset;

  const isValid = effectivePoints !== null && effectivePoints >= 5 && effectivePoints <= 100000;

  async function handleTopUp(): Promise<void> {
    if (!isValid || effectivePoints === null) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await topUp(effectivePoints);
      setBalancePoints(result.balancePoints);
      setSelectedPreset(null);
      setCustomAmount("");
      setIsCustom(false);
      setFeedback({ kind: "ok", text: `Added ${formatPoints(result.points)} to your wallet.` });
      await refresh();
    } catch (err) {
      const text = isSentinelApiError(err) ? err.displayMessage : "Top-up failed. Please try again.";
      setFeedback({ kind: "error", text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-slate-600">Manage points, top up your wallet, and view invoices.</p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Points Balance</p>
          <p className="mt-1 text-4xl font-bold text-indigo-700">
            {balancePoints === null ? "…" : formatPoints(balancePoints)}
          </p>
          <p className="mt-1 text-xs text-indigo-500">Points available for agent calls</p>
        </div>
        <div className="hidden sm:block">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-200 bg-white flex items-center justify-center">
            <span className="text-xl font-bold text-indigo-600">pts</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Points</h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Select Amount</label>
          <div className="flex flex-wrap gap-3">
            {TOP_UP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className={cn(
                  "rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors",
                  selectedPreset === preset && !isCustom
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50",
                )}
              >
                {formatPoints(preset)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
                setSelectedPreset(null);
              }}
              className={cn(
                "rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors",
                isCustom
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50",
              )}
            >
              Custom
            </button>
          </div>
        </div>

        {isCustom && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Custom Amount (points)</label>
            <input
              type="number"
              min="5"
              max="100000"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter points"
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <p className="mt-1 text-xs text-slate-400">Min 5 — Max 100,000 points</p>
          </div>
        )}

        {effectivePoints !== null && effectivePoints > 0 && (
          <div className="mb-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700">
            You will add <span className="font-semibold text-slate-900">{formatPoints(effectivePoints)}</span>.
          </div>
        )}

        {feedback && (
          <p
            role="status"
            className={cn(
              "mb-4 rounded-md px-3 py-2 text-sm",
              feedback.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="button"
          disabled={!isValid || submitting}
          onClick={() => void handleTopUp()}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding points…" : "Add Points"}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          Top-ups are recorded directly for now; a card/UPI provider will be enabled here later. 1 point = ₹1.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{formatDate(invoice.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-600">Points top-up</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatPoints(invoice.points)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          INVOICE_STATUS_STYLES[invoice.status],
                        )}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
