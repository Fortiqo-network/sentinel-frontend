"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { depositBond, getBond, getEarnings, type Bond, type Earnings } from "@/lib/api/seller";
import { isSentinelApiError } from "@/lib/api/client";

function formatCredits(credits: number): string {
  return `${credits.toLocaleString("en-IN")} Cr`;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

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
        accent ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white",
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

/**
 * Earnings page for sellers. Surfaces payout-eligible balance, payout
 * eligibility and provider, and the active performance bond — all in credits.
 * Write actions (payout request, bond deposit) are intentionally disabled
 * until KYC / provider details are collected by the console.
 */
export default function EarningsPage(): React.JSX.Element {
  const [earnings, setEarnings] = React.useState<Earnings | null>(null);
  const [bond, setBond] = React.useState<Bond | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [earningsError, setEarningsError] = React.useState<string | null>(null);
  const [bondError, setBondError] = React.useState<string | null>(null);
  const [depositAmount, setDepositAmount] = React.useState("");
  const [depositing, setDepositing] = React.useState(false);
  const [depositNote, setDepositNote] = React.useState<string | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    const [earningsResult, bondResult] = await Promise.allSettled([getEarnings(), getBond()]);

    if (earningsResult.status === "fulfilled") {
      setEarnings(earningsResult.value);
      setEarningsError(null);
    } else {
      const reason: unknown = earningsResult.reason;
      setEarningsError(isSentinelApiError(reason) ? reason.message : "Unable to load earnings.");
    }

    if (bondResult.status === "fulfilled") {
      setBond(bondResult.value);
      setBondError(null);
    } else {
      const reason: unknown = bondResult.reason;
      setBondError(isSentinelApiError(reason) ? reason.message : "Unable to load bond.");
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleDeposit(): Promise<void> {
    const credits = Number.parseInt(depositAmount, 10);
    if (!Number.isFinite(credits) || credits <= 0) {
      setDepositNote("Enter a positive credit amount.");
      return;
    }
    setDepositing(true);
    setDepositNote(null);
    try {
      await depositBond(credits);
      setDepositAmount("");
      setDepositNote(`Locked ${credits.toLocaleString("en-US")} Cr from your available balance as a bond.`);
      await load();
    } catch (err) {
      setDepositNote(isSentinelApiError(err) ? err.message : "Bond deposit failed.");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-1 text-slate-600">Payout balance and performance bond for your agents.</p>
        </div>
        <div className="flex flex-col items-stretch gap-1 sm:items-end">
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm whitespace-nowrap"
          >
            Request Payout
          </button>
          <p className="text-xs text-slate-400">
            Payouts require completing KYC / bank details (coming soon).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <>
          {earningsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {earningsError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Available (withdrawable)"
              value={earnings ? formatCredits(earnings.availableCredits) : "—"}
              sub="Settled — ready to withdraw"
              accent
            />
            <SummaryCard
              label="Payable (pending)"
              value={earnings ? formatCredits(earnings.payableCredits) : "—"}
              sub="Accrued from calls; awaiting settlement"
            />
            <SummaryCard
              label="Payout Eligibility"
              value={
                earnings
                  ? earnings.meetsMinimum
                    ? "Eligible for payout"
                    : "Below minimum threshold"
                  : "—"
              }
              sub={earnings?.payoutProvider ? `via ${earnings.payoutProvider}` : "Provider not configured"}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Performance Bond</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Security bond locked against your agents while live.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Credits"
                    className="h-9 w-28 rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => void handleDeposit()}
                    disabled={depositing}
                    className="inline-flex items-center rounded-lg bg-indigo-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:opacity-50 whitespace-nowrap"
                  >
                    {depositing ? "Depositing…" : "Deposit Bond"}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Locks credits from your available balance
                  {earnings ? ` (${earnings.availableCredits.toLocaleString("en-US")} Cr available)` : ""}.
                </p>
                {depositNote && <p className="text-xs text-slate-500">{depositNote}</p>}
              </div>
            </div>

            <div className="px-6 py-5">
              {bondError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bondError}
                </div>
              ) : bond === null ? (
                <p className="text-sm text-slate-500">No performance bond posted.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Status</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {titleCase(bond.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Current</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {formatCredits(bond.currentCredits)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Original</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {formatCredits(bond.originalCredits)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bonds are funded from your available (settled) balance. Cash payouts require completing
            KYC / bank details — that flow is coming soon.
          </div>
        </>
      )}
    </div>
  );
}
