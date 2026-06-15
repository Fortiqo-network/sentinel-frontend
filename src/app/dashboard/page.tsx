"use client";

import * as React from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCreditBalance, getLedger } from "@/lib/api/billing";
import { listAgents } from "@/lib/api/agents";
import type { LedgerEntry } from "@/types/billing";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils/cn";

function formatCredits(credits: number): string {
  return `${credits.toLocaleString("en-IN")} Cr`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface BalancePoint {
  date: string;
  balanceCredits: number;
}

/** Build a running-balance series (in credits) from ledger entries (oldest → newest). */
function buildBalanceSeries(entries: LedgerEntry[]): BalancePoint[] {
  const ordered = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  let running = 0;
  return ordered.map((e) => {
    running += e.type === "credit" ? e.credits : -e.credits;
    return {
      date: new Date(e.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      balanceCredits: running,
    };
  });
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function StatCard({ label, value, sub, accent }: StatCardProps): React.JSX.Element {
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

interface BalanceTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function BalanceTooltip({ active, payload, label }: BalanceTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{formatCredits(item.value)}</p>
    </div>
  );
}

/**
 * Buyer dashboard home. Every figure is live: the credit balance and ledger
 * come from the billing service, and the featured agents from the marketplace.
 */
export default function DashboardPage(): React.JSX.Element {
  const [balanceCredits, setBalanceCredits] = React.useState(0);
  const [entries, setEntries] = React.useState<LedgerEntry[]>([]);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    void Promise.allSettled([
      getCreditBalance(),
      getLedger(1, 100),
      listAgents({ sort: "trust_desc", pageSize: 5, page: 1 }),
    ]).then(([bal, led, ag]) => {
      if (!active) return;
      if (bal.status === "fulfilled") setBalanceCredits(bal.value.balanceCredits);
      if (led.status === "fulfilled") setEntries(led.value.entries);
      if (ag.status === "fulfilled") setAgents(ag.value.agents);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const totalAddedCredits = entries
    .filter((e) => e.type === "credit")
    .reduce((sum, e) => sum + e.credits, 0);
  const totalSpentCredits = entries
    .filter((e) => e.type === "debit")
    .reduce((sum, e) => sum + e.credits, 0);
  const invocations = entries.filter((e) => e.type === "debit").length;
  const series = buildBalanceSeries(entries);

  return (
    <div className="space-y-8">
      {/* Cinematic wallet header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-ink-950 p-6 text-porcelain sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-aurora-radial opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">Your wallet</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-porcelain">
              {loading ? "…" : formatCredits(balanceCredits)}
            </h1>
            <p className="mt-1 text-sm text-porcelain/55">
              Credits available to spend · 1 USD = 100 credits. Top-ups are non-refundable; you&apos;re only charged on
              successful calls.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90 whitespace-nowrap"
          >
            + Add credits
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credits balance" value={loading ? "…" : formatCredits(balanceCredits)} sub="Available to spend" accent />
        <StatCard label="Total spent" value={loading ? "…" : formatCredits(totalSpentCredits)} sub="On agent calls" />
        <StatCard label="Invocations" value={loading ? "…" : invocations.toLocaleString("en-IN")} sub="Successful calls" />
        <StatCard label="Total added" value={loading ? "…" : formatCredits(totalAddedCredits)} sub="All-time top-ups" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Balance Over Time</h2>
        <div className="h-56">
          {series.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500">No wallet activity yet</p>
              <p className="mt-1 text-xs text-slate-400">Add credits to get started.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(v: number) => `${v}`}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<BalanceTooltip />} />
                <Line type="monotone" dataKey="balanceCredits" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <Link href="/dashboard/billing" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              {loading ? "Loading…" : "No transactions yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {entries.slice(0, 8).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-900">{e.description}</td>
                      <td className="px-6 py-3 text-xs text-slate-500 font-mono">{formatDateTime(e.createdAt)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            e.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {e.type === "credit" ? "Credit" : "Debit"}
                        </span>
                      </td>
                      <td className={cn("px-6 py-3 text-right font-medium", e.type === "credit" ? "text-emerald-600" : "text-slate-700")}>
                        {e.type === "credit" ? "+" : "−"}
                        {e.credits.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Top Verified Agents</h2>
            <p className="text-xs text-slate-400 mt-0.5">Highest trust scores</p>
          </div>
          {agents.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              {loading ? "Loading…" : "No agents yet."}
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {agents.map((agent, idx) => (
                <li key={agent.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-slate-400 w-4">{idx + 1}</span>
                      <Link href={`/agents/${agent.slug}`} className="text-sm font-medium text-slate-800 truncate hover:text-indigo-600">
                        {agent.name}
                      </Link>
                    </div>
                    <span className="text-xs text-slate-500">{agent.trustScore}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${agent.trustScore}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
