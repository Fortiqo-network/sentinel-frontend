"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PaymentMethod = "razorpay" | "stripe";

interface Invoice {
  id: string;
  date: string;
  amountPaise: number;
  status: "paid" | "pending" | "failed";
  description: string;
}

interface SpendByAgent {
  name: string;
  costPaise: number;
  color: string;
}

type TopUpPreset = 50000 | 100000 | 200000; // paise

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CURRENT_BALANCE_PAISE = 248500;

const MOCK_INVOICES: Invoice[] = [
  { id: "inv_1", date: "2026-06-01", amountPaise: 100000, status: "paid", description: "Credit top-up" },
  { id: "inv_2", date: "2026-05-15", amountPaise: 50000, status: "paid", description: "Credit top-up" },
  { id: "inv_3", date: "2026-05-01", amountPaise: 200000, status: "paid", description: "Credit top-up" },
  { id: "inv_4", date: "2026-04-10", amountPaise: 100000, status: "paid", description: "Credit top-up" },
  { id: "inv_5", date: "2026-03-22", amountPaise: 50000, status: "failed", description: "Credit top-up" },
];

const SPEND_BY_AGENT: SpendByAgent[] = [
  { name: "TaxBot Pro", costPaise: 126000, color: "#6366f1" },
  { name: "Invoice Extractor", costPaise: 41600, color: "#8b5cf6" },
  { name: "GST Reconciler", costPaise: 24800, color: "#a78bfa" },
  { name: "Compliance Checker", costPaise: 14400, color: "#c4b5fd" },
  { name: "Others", costPaise: 8200, color: "#e2e8f0" },
];

const TOP_UP_PRESETS: TopUpPreset[] = [50000, 100000, 200000];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const INVOICE_STATUS_STYLES: Record<Invoice["status"], string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

const INVOICE_STATUS_LABELS: Record<Invoice["status"], string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SpendTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

function SpendTooltip({ active, payload }: SpendTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-700">{item.name}</p>
      <p className="text-sm font-semibold text-slate-900">{formatInr(item.value)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Billing page. Shows current credit balance, a top-up form with preset
 * amounts and Razorpay/Stripe toggle, invoice history, and spend breakdown
 * by agent as a pie chart.
 */
export default function BillingPage(): React.JSX.Element {
  const [selectedPreset, setSelectedPreset] = React.useState<TopUpPreset | null>(null);
  const [customAmount, setCustomAmount] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("razorpay");
  const [isCustom, setIsCustom] = React.useState(false);

  const effectiveAmountPaise: number | null = isCustom
    ? customAmount
      ? Math.round(parseFloat(customAmount) * 100)
      : null
    : selectedPreset;

  const isValid =
    effectiveAmountPaise !== null &&
    effectiveAmountPaise >= 50000 &&
    effectiveAmountPaise <= 10000000;

  function handlePresetClick(preset: TopUpPreset): void {
    setSelectedPreset(preset);
    setIsCustom(false);
    setCustomAmount("");
  }

  function handleCustomClick(): void {
    setIsCustom(true);
    setSelectedPreset(null);
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-slate-600">Manage credits, top-up your account, and view invoices.</p>
      </div>

      {/* Current balance */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Current Balance</p>
          <p className="mt-1 text-4xl font-bold text-indigo-700">{formatInr(CURRENT_BALANCE_PAISE)}</p>
          <p className="mt-1 text-xs text-indigo-500">Credits available for agent invocations</p>
        </div>
        <div className="hidden sm:block">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-200 bg-white flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">₹</span>
          </div>
        </div>
      </div>

      {/* Top-up form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Top Up Credits</h2>

        {/* Amount presets */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Select Amount</label>
          <div className="flex flex-wrap gap-3">
            {TOP_UP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors",
                  selectedPreset === preset && !isCustom
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50",
                )}
              >
                {formatInr(preset)}
              </button>
            ))}
            <button
              type="button"
              onClick={handleCustomClick}
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

        {/* Custom amount input */}
        {isCustom && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Custom Amount (₹)
            </label>
            <input
              type="number"
              min="500"
              max="100000"
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount in ₹"
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <p className="mt-1 text-xs text-slate-400">Min ₹500 — Max ₹1,00,000</p>
          </div>
        )}

        {/* Payment method toggle */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">Payment Method</label>
          <div className="flex rounded-lg border border-slate-200 p-1 w-fit bg-slate-50">
            {(["razorpay", "stripe"] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors capitalize",
                  paymentMethod === method
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {method === "razorpay" ? "Razorpay" : "Stripe"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {paymentMethod === "razorpay"
              ? "UPI, Net Banking, Cards via Razorpay — recommended for Indian accounts"
              : "International cards via Stripe"}
          </p>
        </div>

        {/* Summary and CTA */}
        {effectiveAmountPaise !== null && effectiveAmountPaise > 0 && (
          <div className="mb-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700">
            You will add{" "}
            <span className="font-semibold text-slate-900">{formatInr(effectiveAmountPaise)}</span>{" "}
            credits via{" "}
            <span className="font-semibold">{paymentMethod === "razorpay" ? "Razorpay" : "Stripe"}</span>.
          </div>
        )}

        <button
          type="button"
          disabled={!isValid}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Payment
        </button>
      </div>

      {/* Spend breakdown pie chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Spend Breakdown by Agent</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-52 w-52 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPEND_BY_AGENT}
                  dataKey="costPaise"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {SPEND_BY_AGENT.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SpendTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5 w-full">
            {SPEND_BY_AGENT.map((agent) => {
              const total = SPEND_BY_AGENT.reduce((sum, a) => sum + a.costPaise, 0);
              const pct = ((agent.costPaise / total) * 100).toFixed(1);
              return (
                <div key={agent.name} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: agent.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-slate-700 truncate">{agent.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: agent.color }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-20 text-right flex-shrink-0">
                    {formatInr(agent.costPaise)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_INVOICES.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">{invoice.date}</td>
                  <td className="px-6 py-4 text-slate-600">{invoice.description}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatInr(invoice.amountPaise)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        INVOICE_STATUS_STYLES[invoice.status],
                      )}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {invoice.status === "paid" ? (
                      <a
                        href={`/dashboard/billing/invoices/${invoice.id}`}
                        className="text-indigo-600 hover:text-indigo-500 text-xs font-medium underline"
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
