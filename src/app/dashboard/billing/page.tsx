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
  paid:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  unpaid: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  void:   "bg-sen-surface-2 text-sen-muted border border-sen-border",
};

/**
 * Billing page. Shows the live points balance, a working top-up form,
 * and invoice history — all in points.
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

  React.useEffect(() => { void refresh(); }, [refresh]);

  const effectivePoints: number | null = isCustom
    ? customAmount ? Math.round(parseFloat(customAmount)) : null
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
        <p className="sen-eyebrow mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-bold text-sen-text">Billing</h1>
        <p className="mt-1 text-sen-muted">Manage points, top up your wallet, and view invoices.</p>
      </div>

      {/* Balance hero */}
      <div className="rounded-xl border border-sen-gold/30 bg-sen-gold/5 p-6 flex items-center justify-between">
        <div>
          <p className="sen-eyebrow text-sen-gold mb-1">Points Balance</p>
          <p className="text-4xl font-bold font-mono text-sen-gold">
            {balancePoints === null ? "…" : formatPoints(balancePoints)}
          </p>
          <p className="mt-1 text-xs text-sen-muted">Available for agent calls · 1 point = ₹1</p>
        </div>
        <div className="hidden sm:flex h-16 w-16 rounded-full border-2 border-sen-gold/30 bg-sen-surface items-center justify-center">
          <span className="text-sm font-bold font-mono text-sen-gold">pts</span>
        </div>
      </div>

      {/* Add points */}
      <div className="rounded-xl border border-sen-border bg-sen-surface p-6">
        <h2 className="text-base font-semibold text-sen-text mb-4">Add Points</h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-sen-text">Select Amount</label>
          <div className="flex flex-wrap gap-3">
            {TOP_UP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { setSelectedPreset(preset); setIsCustom(false); setCustomAmount(""); }}
                className={cn(
                  "rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors",
                  selectedPreset === preset && !isCustom
                    ? "border-sen-gold bg-sen-gold text-white"
                    : "border-sen-border bg-sen-surface text-sen-text hover:border-sen-border-hi hover:bg-sen-surface-2",
                )}
              >
                {formatPoints(preset)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setIsCustom(true); setSelectedPreset(null); }}
              className={cn(
                "rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors",
                isCustom
                  ? "border-sen-gold bg-sen-gold text-white"
                  : "border-sen-border bg-sen-surface text-sen-text hover:border-sen-border-hi hover:bg-sen-surface-2",
              )}
            >
              Custom
            </button>
          </div>
        </div>

        {isCustom && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-sen-text">Custom Amount (points)</label>
            <input
              type="number"
              min="5"
              max="100000"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter points"
              className="w-full max-w-xs rounded-lg border border-sen-border bg-sen-surface px-3 py-2 text-sm text-sen-text placeholder:text-sen-muted focus:border-sen-gold focus:outline-none focus:ring-1 focus:ring-sen-gold/20"
            />
            <p className="mt-1 text-xs text-sen-muted">Min 5 — Max 100,000 points</p>
          </div>
        )}

        {effectivePoints !== null && effectivePoints > 0 && (
          <div className="mb-4 rounded-lg border border-sen-border bg-sen-surface-2 px-4 py-3 text-sm text-sen-text">
            You will add{" "}
            <span className="font-semibold text-sen-gold font-mono">{formatPoints(effectivePoints)}</span>.
          </div>
        )}

        {feedback && (
          <p
            role="status"
            className={cn(
              "mb-4 rounded-md px-3 py-2 text-sm",
              feedback.kind === "ok"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400",
            )}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="button"
          disabled={!isValid || submitting}
          onClick={() => void handleTopUp()}
          className="sen-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding points…" : "Add Points"}
        </button>
        <p className="mt-2 text-xs text-sen-muted">
          Top-ups recorded directly; a card/UPI provider will be added here later.
        </p>
      </div>

      {/* Invoice history */}
      <div className="rounded-xl border border-sen-border bg-sen-surface overflow-hidden">
        <div className="border-b border-sen-border px-6 py-4">
          <h2 className="text-base font-semibold text-sen-text">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-sen-muted">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sen-border bg-sen-surface-2">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sen-border">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-sen-surface-2 transition-colors">
                    <td className="px-6 py-4 text-sen-muted font-mono text-xs">{formatDate(invoice.createdAt)}</td>
                    <td className="px-6 py-4 text-sen-text">Points top-up</td>
                    <td className="px-6 py-4 font-medium text-sen-text font-mono">{formatPoints(invoice.points)}</td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", INVOICE_STATUS_STYLES[invoice.status])}>
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
