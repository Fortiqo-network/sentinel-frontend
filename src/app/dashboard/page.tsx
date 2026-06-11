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
import { useTheme } from "@/components/ThemeProvider";

function formatPoints(points: number): string {
  return `${points.toLocaleString("en-IN")} points`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface BalancePoint {
  date: string;
  balancePoints: number;
}

function buildBalanceSeries(entries: LedgerEntry[]): BalancePoint[] {
  const ordered = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  let running = 0;
  return ordered.map((e) => {
    running += e.type === "credit" ? e.points : -e.points;
    return {
      date: new Date(e.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      balancePoints: running,
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
        "rounded-xl border p-5",
        accent
          ? "border-sen-gold/30 bg-sen-gold/5"
          : "border-sen-border bg-sen-surface",
      )}
    >
      <div className={cn("text-2xl font-bold font-mono", accent ? "text-sen-gold" : "text-sen-text")}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-sen-muted">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-sen-muted/70">{sub}</div>}
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
    <div className="rounded-lg border border-sen-border bg-sen-surface px-3 py-2 shadow-lg">
      <p className="text-xs text-sen-muted">{label}</p>
      <p className="text-sm font-semibold text-sen-text font-mono">{formatPoints(item.value)}</p>
    </div>
  );
}

/**
 * Buyer dashboard home. Every figure is live: points balance and ledger come
 * from the billing service, featured agents from the marketplace.
 */
export default function DashboardPage(): React.JSX.Element {
  const { theme } = useTheme();
  const chartColors = {
    accent: theme === "dark" ? "#8B5CF6" : "#7C3AED",
    grid:   theme === "dark" ? "#44403C" : "#E7E5E4",
    muted:  theme === "dark" ? "#A8A29E" : "#78716C",
  };

  const [balancePoints, setBalancePoints] = React.useState(0);
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
      if (bal.status === "fulfilled") setBalancePoints(bal.value.balancePoints);
      if (led.status === "fulfilled") setEntries(led.value.entries);
      if (ag.status === "fulfilled") setAgents(ag.value.agents);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const totalAddedPoints = entries.filter((e) => e.type === "credit").reduce((sum, e) => sum + e.points, 0);
  const series = buildBalanceSeries(entries);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="sen-eyebrow mb-1">Buyer Portal</p>
          <h1 className="text-2xl font-bold text-sen-text">Dashboard</h1>
          <p className="mt-1 text-sen-muted">Your points, activity, and verified agents at a glance.</p>
        </div>
        <Link
          href="/dashboard/billing"
          className="sen-btn-primary whitespace-nowrap"
        >
          + Add Points
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Points Balance"
          value={loading ? "…" : formatPoints(balancePoints)}
          sub="Available to spend"
          accent
        />
        <StatCard label="Total Added" value={loading ? "…" : formatPoints(totalAddedPoints)} sub="All-time top-ups" />
        <StatCard label="Transactions" value={loading ? "…" : String(entries.length)} sub="Ledger entries" />
      </div>

      {/* Balance chart */}
      <div className="rounded-xl border border-sen-border bg-sen-surface p-6">
        <h2 className="mb-4 text-base font-semibold text-sen-text">Balance Over Time</h2>
        <div className="h-56">
          {series.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-sen-muted">No wallet activity yet</p>
              <p className="mt-1 text-xs text-sen-muted/60">Add points to get started.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartColors.muted }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(v: number) => `${v}`}
                  tick={{ fontSize: 10, fill: chartColors.muted }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<BalanceTooltip />} />
                <Line type="monotone" dataKey="balancePoints" stroke={chartColors.accent} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: chartColors.accent }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-sen-border bg-sen-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-sen-border px-6 py-4">
            <h2 className="text-base font-semibold text-sen-text">Recent Activity</h2>
            <Link href="/dashboard/billing" className="text-sm text-sen-gold hover:text-violet-400">View all</Link>
          </div>
          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-sen-muted">
              {loading ? "Loading…" : "No transactions yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sen-border bg-sen-surface-2">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sen-muted">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-sen-muted">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sen-border">
                  {entries.slice(0, 8).map((e) => (
                    <tr key={e.id} className="hover:bg-sen-surface-2 transition-colors">
                      <td className="px-6 py-3 font-medium text-sen-text">{e.description}</td>
                      <td className="px-6 py-3 text-xs text-sen-muted font-mono">{formatDateTime(e.createdAt)}</td>
                      <td className="px-6 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          e.type === "credit"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-sen-surface-2 text-sen-muted",
                        )}>
                          {e.type === "credit" ? "Credit" : "Debit"}
                        </span>
                      </td>
                      <td className={cn("px-6 py-3 text-right font-medium font-mono", e.type === "credit" ? "text-emerald-400" : "text-sen-muted")}>
                        {e.type === "credit" ? "+" : "−"}{e.points.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top agents */}
        <div className="rounded-xl border border-sen-border bg-sen-surface">
          <div className="border-b border-sen-border px-6 py-4">
            <h2 className="text-base font-semibold text-sen-text">Top Verified Agents</h2>
            <p className="text-xs text-sen-muted mt-0.5">Highest trust scores</p>
          </div>
          {agents.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-sen-muted">
              {loading ? "Loading…" : "No agents yet."}
            </div>
          ) : (
            <ul className="divide-y divide-sen-border">
              {agents.map((agent, idx) => (
                <li key={agent.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-sen-muted w-4">{idx + 1}</span>
                      <Link href={`/agents/${agent.slug}`} className="text-sm font-medium text-sen-text truncate hover:text-sen-gold transition-colors">
                        {agent.name}
                      </Link>
                    </div>
                    <span className="text-xs font-mono text-sen-muted">{agent.trustScore}/100</span>
                  </div>
                  <div className="h-1 rounded-full bg-sen-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sen-gold"
                      style={{ width: `${agent.trustScore}%` }}
                    />
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
