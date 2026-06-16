"use client";

import * as React from "react";
import { getCreditBalance, getInvoices, topUp, redeemPromo } from "@/lib/api/billing";
import { isSentinelApiError } from "@/lib/api/client";
import type { Invoice } from "@/types/billing";
import { cn } from "@/lib/utils/cn";
import { CREDITS_PER_USD } from "@/lib/site";

type TopUpPreset = 5 | 10 | 20;

const TOP_UP_PRESETS: TopUpPreset[] = [5, 10, 20];

function formatCredits(credits: number): string {
  return `${credits.toLocaleString("en-IN")} Cr`;
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
 * Billing page. Shows the live credits balance, a working top-up (recorded by
 * the placeholder payment store until a real provider is wired in), and the
 * buyer's invoice history — all in credits.
 */
export default function BillingPage(): React.JSX.Element {
  const [balanceCredits, setBalanceCredits] = React.useState<number | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [selectedPreset, setSelectedPreset] = React.useState<TopUpPreset | null>(null);
  const [customAmount, setCustomAmount] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [promoCode, setPromoCode] = React.useState("");
  const [redeeming, setRedeeming] = React.useState(false);
  const [promoFeedback, setPromoFeedback] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = React.useCallback(async () => {
    const [bal, inv] = await Promise.allSettled([getCreditBalance(), getInvoices()]);
    if (bal.status === "fulfilled") setBalanceCredits(bal.value.balanceCredits);
    if (inv.status === "fulfilled") setInvoices(inv.value);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const effectiveUsd: number | null = isCustom
    ? customAmount
      ? parseFloat(customAmount)
      : null
    : selectedPreset;

  const effectiveCredits: number | null =
    effectiveUsd !== null && !Number.isNaN(effectiveUsd)
      ? Math.round(effectiveUsd * CREDITS_PER_USD)
      : null;

  const isValid = effectiveUsd !== null && effectiveUsd >= 1 && effectiveUsd <= 5000;

  async function handleRedeem(): Promise<void> {
    const code = promoCode.trim();
    if (!code) return;
    setRedeeming(true);
    setPromoFeedback(null);
    try {
      const result = await redeemPromo(code);
      setBalanceCredits(result.balanceCredits);
      setPromoCode("");
      setPromoFeedback({ kind: "ok", text: `${result.label}: added ${formatCredits(result.credits)}.` });
      await refresh();
    } catch (err) {
      const text = isSentinelApiError(err) ? err.displayMessage : "Could not redeem that code.";
      setPromoFeedback({ kind: "error", text });
    } finally {
      setRedeeming(false);
    }
  }

  async function handleTopUp(): Promise<void> {
    if (!isValid || effectiveCredits === null) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await topUp(effectiveCredits);
      setBalanceCredits(result.balanceCredits);
      setSelectedPreset(null);
      setCustomAmount("");
      setIsCustom(false);
      setFeedback({ kind: "ok", text: `Added ${formatCredits(result.credits)} to your wallet.` });
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
        <p className="mt-1 text-slate-600">Manage credits, top up your wallet, and view invoices.</p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Credits Balance</p>
          <p className="mt-1 text-4xl font-bold text-indigo-700">
            {balanceCredits === null ? "…" : formatCredits(balanceCredits)}
          </p>
          <p className="mt-1 text-xs text-indigo-500">Credits available for agent calls</p>
        </div>
        <div className="hidden sm:block">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-200 bg-white flex items-center justify-center">
            <span className="text-xl font-bold text-indigo-600">Cr</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Credits</h2>

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
                ${preset}
                <span className="ml-1.5 text-xs font-normal opacity-70">
                  {formatCredits(preset * CREDITS_PER_USD)}
                </span>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Custom amount (USD)</label>
            <input
              type="number"
              min="1"
              max="5000"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter USD amount"
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <p className="mt-1 text-xs text-slate-400">Min $1 — Max $5,000 · 1 USD = 100 credits</p>
          </div>
        )}

        {effectiveCredits !== null && effectiveCredits > 0 && (
          <div className="mb-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700">
            You will add <span className="font-semibold text-slate-900">{formatCredits(effectiveCredits)}</span>
            {effectiveUsd !== null && <span className="text-slate-400"> (${effectiveUsd})</span>}.
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
          {submitting ? "Adding credits…" : "Add Credits"}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          Top-ups are recorded directly for now; a card/UPI provider will be enabled here later. 1 USD = 100 credits.{" "}
          <span className="font-medium text-slate-500">Credits are non-refundable once added</span> — you&apos;re
          only charged on successful calls.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Redeem a promo code</h2>
        <p className="mb-3 text-xs text-slate-400">Have a code? Redeem it for wallet credits (one use per code).</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="e.g. WELCOME10"
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <button
            type="button"
            disabled={!promoCode.trim() || redeeming}
            onClick={() => void handleRedeem()}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redeeming ? "Redeeming…" : "Redeem"}
          </button>
        </div>
        {promoFeedback && (
          <p
            role="status"
            className={cn(
              "mt-3 rounded-md px-3 py-2 text-sm",
              promoFeedback.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            {promoFeedback.text}
          </p>
        )}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{formatDate(invoice.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-600">Credits top-up</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCredits(invoice.credits)}</td>
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
