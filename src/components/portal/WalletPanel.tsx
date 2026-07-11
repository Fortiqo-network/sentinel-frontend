"use client";

import * as React from "react";
import {
  getCreditBalance,
  getInvoices,
  createCheckout,
  createMockOrder,
  captureMockPayment,
  redeemPromo,
} from "@/lib/api/billing";
import { isSentinelApiError } from "@/lib/api/client";
import { openRazorpayCheckout } from "@/lib/payments/razorpay";
import type { Invoice } from "@/types/billing";
import { cn } from "@/lib/utils/cn";
import { CREDITS_PER_USD } from "@/lib/site";

type TopUpPreset = 5 | 10 | 20;

const TOP_UP_PRESETS: TopUpPreset[] = [5, 10, 20];

type Provider = "stripe" | "razorpay" | "mock";

// The mock provider is a pre-launch simulator (backed by billing's mock_payments_enabled).
// Hidden unless NEXT_PUBLIC_MOCK_PAYMENTS === "true"; remove it once a real provider is live.
const MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === "true";

const PROVIDERS: { id: Provider; label: string; hint: string }[] = [
  { id: "stripe", label: "Card (Stripe)", hint: "Visa, Mastercard, and more — hosted by Stripe" },
  { id: "razorpay", label: "UPI / Card (Razorpay)", hint: "UPI, cards, netbanking — hosted by Razorpay" },
  ...(MOCK_ENABLED
    ? [
        {
          id: "mock" as const,
          label: "Test payment (mock)",
          hint: "Simulated payment — no real charge; for pre-launch testing",
        },
      ]
    : []),
];

function formatCredits(credits: number): string {
  return `${credits.toLocaleString("en-IN")} Cr`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const INVOICE_STATUS_STYLES: Record<Invoice["status"], string> = {
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  void: "bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-porcelain/50",
};

export interface WalletPanelProps {
  /** Page heading, e.g. "Billing" (buyer) or "Wallet" (seller). */
  title: string;
  /** One-line description under the heading. */
  description: string;
  /** Absolute path the provider checkout returns to, e.g. "/seller/wallet". */
  returnPath: string;
  /** Optional extra card rendered between the balance and Add Credits (e.g. the seller registration fee). */
  extra?: React.ReactNode;
}

/**
 * Shared wallet panel: live credits balance, add-funds (Stripe / Razorpay /
 * mock), promo-code redemption, and invoice history — all in credits. Used by
 * the buyer Billing page and the seller Wallet page so both portals share one
 * money surface.
 */
export function WalletPanel({ title, description, returnPath, extra }: WalletPanelProps): React.JSX.Element {
  const [balanceCredits, setBalanceCredits] = React.useState<number | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [selectedPreset, setSelectedPreset] = React.useState<TopUpPreset | null>(null);
  const [customAmount, setCustomAmount] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [provider, setProvider] = React.useState<Provider>("stripe");
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [promoCode, setPromoCode] = React.useState("");
  const [redeeming, setRedeeming] = React.useState(false);
  const [promoFeedback, setPromoFeedback] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [mockOrder, setMockOrder] = React.useState<{ orderId: string; credits: number } | null>(null);
  const [mockPaying, setMockPaying] = React.useState(false);

  const refresh = React.useCallback(async () => {
    const [bal, inv] = await Promise.allSettled([getCreditBalance(), getInvoices()]);
    if (bal.status === "fulfilled") setBalanceCredits(bal.value.balanceCredits);
    if (inv.status === "fulfilled") setInvoices(inv.value);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (checkout === "success") {
      setFeedback({ kind: "ok", text: "Payment received. Credits will appear in your wallet shortly." });
      let tries = 0;
      const timer = setInterval(() => {
        void refresh();
        if (++tries >= 6) clearInterval(timer);
      }, 2500);
      return () => clearInterval(timer);
    }
    if (checkout === "cancel") {
      setFeedback({ kind: "error", text: "Checkout cancelled — no credits were added." });
    }
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

  async function handleMockPay(outcome: "success" | "failure"): Promise<void> {
    if (!mockOrder) return;
    setMockPaying(true);
    try {
      const result = await captureMockPayment(mockOrder.orderId, outcome);
      if (result.credited) {
        setBalanceCredits(result.balanceCredits);
        setFeedback({ kind: "ok", text: `Added ${formatCredits(mockOrder.credits)} to your wallet.` });
      } else {
        setFeedback({ kind: "error", text: "Mock payment was not completed — no credits added." });
      }
      setMockOrder(null);
      await refresh();
    } catch (err) {
      const text = isSentinelApiError(err) ? err.displayMessage : "Mock payment failed.";
      setFeedback({ kind: "error", text });
    } finally {
      setMockPaying(false);
    }
  }

  async function handleCheckout(): Promise<void> {
    if (!isValid || effectiveCredits === null) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      if (provider === "mock") {
        // Pre-launch simulator: create an order, then present the mock pay UI.
        const order = await createMockOrder(effectiveCredits);
        if (!order.orderId) throw new Error("Mock order missing.");
        setMockOrder({ orderId: order.orderId, credits: order.amountCredits });
        return;
      }
      const base = `${window.location.origin}${returnPath}`;
      const checkout = await createCheckout(
        effectiveCredits,
        provider,
        `${base}?checkout=success`,
        `${base}?checkout=cancel`,
      );
      if (checkout.provider === "stripe") {
        if (!checkout.checkoutUrl) throw new Error("Checkout URL missing.");
        window.location.href = checkout.checkoutUrl;
        return;
      }
      if (!checkout.orderId || !checkout.keyId) throw new Error("Razorpay order missing.");
      await openRazorpayCheckout({
        keyId: checkout.keyId,
        orderId: checkout.orderId,
        amountUnits: checkout.amountCredits * 100,
        onSuccess: () => {
          setFeedback({ kind: "ok", text: "Payment received. Credits will appear shortly." });
          let tries = 0;
          const timer = setInterval(() => {
            void refresh();
            if (++tries >= 6) clearInterval(timer);
          }, 2500);
        },
        onDismiss: () => setSubmitting(false),
      });
    } catch (err) {
      const text = isSentinelApiError(err) ? err.displayMessage : "Could not start checkout. Please try again.";
      setFeedback({ kind: "error", text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-porcelain">{title}</h1>
        <p className="mt-1 text-slate-600 dark:text-porcelain/70">{description}</p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm flex items-center justify-between dark:border-gold/30 dark:bg-gold/15">
        <div>
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide dark:text-gold">Credits Balance</p>
          <p className="mt-1 text-4xl font-bold text-indigo-700 dark:text-gold">
            {balanceCredits === null ? "…" : formatCredits(balanceCredits)}
          </p>
          <p className="mt-1 text-xs text-indigo-500 dark:text-gold/70">Credits available for agent calls</p>
        </div>
        <div className="hidden sm:block">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-200 bg-white flex items-center justify-center dark:border-gold/30 dark:bg-ink-800">
            <span className="text-xl font-bold text-indigo-600 dark:text-gold">Cr</span>
          </div>
        </div>
      </div>

      {extra}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <h2 className="text-base font-semibold text-slate-900 mb-4 dark:text-porcelain">Add Credits</h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-porcelain/70">Select Amount</label>
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
                    ? "border-indigo-500 bg-indigo-600 text-white dark:border-gold dark:bg-gold dark:text-ink-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-porcelain/10 dark:bg-ink-800 dark:text-porcelain/70 dark:hover:border-gold/30 dark:hover:bg-gold/15",
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
                  ? "border-indigo-500 bg-indigo-600 text-white dark:border-gold dark:bg-gold dark:text-ink-950"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-porcelain/10 dark:bg-ink-800 dark:text-porcelain/70 dark:hover:border-gold/30 dark:hover:bg-gold/15",
              )}
            >
              Custom
            </button>
          </div>
        </div>

        {isCustom && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-porcelain/70">Custom amount (USD)</label>
            <input
              type="number"
              min="1"
              max="5000"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter USD amount"
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:bg-ink-800 dark:border-porcelain/15 dark:text-porcelain dark:placeholder:text-porcelain/30"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-porcelain/40">Min $1 — Max $5,000 · 1 USD = 100 credits</p>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-porcelain/70">Payment method</label>
          <div className="flex flex-wrap gap-3">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-left transition-colors",
                  provider === p.id
                    ? "border-indigo-500 bg-indigo-50 dark:border-gold dark:bg-gold/15"
                    : "border-slate-200 bg-white hover:border-indigo-300 dark:border-porcelain/10 dark:bg-ink-800 dark:hover:border-gold/30",
                )}
              >
                <span className="block text-sm font-semibold text-slate-800 dark:text-porcelain">{p.label}</span>
                <span className="block text-xs text-slate-400 dark:text-porcelain/40">{p.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {effectiveCredits !== null && effectiveCredits > 0 && (
          <div className="mb-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-ink-900 dark:border-porcelain/10 dark:text-porcelain/70">
            You will add <span className="font-semibold text-slate-900 dark:text-porcelain">{formatCredits(effectiveCredits)}</span>
            {effectiveUsd !== null && <span className="text-slate-400 dark:text-porcelain/40"> (${effectiveUsd})</span>}.
          </div>
        )}

        {feedback && (
          <p
            role="status"
            className={cn(
              "mb-4 rounded-md px-3 py-2 text-sm",
              feedback.kind === "ok" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
            )}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="button"
          disabled={!isValid || submitting}
          onClick={() => void handleCheckout()}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gold dark:text-ink-950 dark:hover:bg-gold/90"
        >
          {submitting ? "Opening checkout…" : "Buy Credits"}
        </button>
        <p className="mt-2 text-xs text-slate-400 dark:text-porcelain/40">
          You&apos;ll complete payment on the provider&apos;s secure hosted page; credits land in your wallet once
          the payment is confirmed. 1 USD = 100 credits.{" "}
          <span className="font-medium text-slate-500 dark:text-porcelain/50">Credits are non-refundable once added</span> — you&apos;re
          only charged on successful calls.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <h2 className="text-base font-semibold text-slate-900 mb-1 dark:text-porcelain">Redeem a promo code</h2>
        <p className="mb-3 text-xs text-slate-400 dark:text-porcelain/40">Have a code? Redeem it for wallet credits (one use per code).</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="e.g. WELCOME10"
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:bg-ink-800 dark:border-porcelain/15 dark:text-porcelain dark:placeholder:text-porcelain/30"
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
              promoFeedback.kind === "ok" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
            )}
          >
            {promoFeedback.text}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-porcelain/10 dark:bg-ink-800">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-porcelain/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-porcelain">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400 dark:text-porcelain/40">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-porcelain/10 dark:bg-ink-900">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-porcelain/10">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-ink-700">
                    <td className="px-6 py-4 text-slate-700 dark:text-porcelain/70">{formatDate(invoice.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-porcelain/70">Credits top-up</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-porcelain">{formatCredits(invoice.credits)}</td>
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

      {mockOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Complete mock payment"
        >
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-porcelain/10 dark:bg-ink-800">
            <span className="mb-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              Test payment
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-porcelain">Complete your payment</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-porcelain/70">
              This is a simulated payment — no real charge. You&apos;re adding{" "}
              <span className="font-semibold text-slate-900 dark:text-porcelain">{formatCredits(mockOrder.credits)}</span>.
            </p>
            <p className="mt-1 break-all text-xs text-slate-400 dark:text-porcelain/40">Order {mockOrder.orderId}</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={mockPaying}
                onClick={() => void handleMockPay("success")}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gold dark:text-ink-950 dark:hover:bg-gold/90"
              >
                {mockPaying ? "Processing…" : "Pay now"}
              </button>
              <button
                type="button"
                disabled={mockPaying}
                onClick={() => void handleMockPay("failure")}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-porcelain/15 dark:text-porcelain/70 dark:hover:bg-ink-700"
              >
                Simulate failure
              </button>
            </div>
            <button
              type="button"
              disabled={mockPaying}
              onClick={() => setMockOrder(null)}
              className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:text-porcelain/40 dark:hover:text-porcelain/70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
