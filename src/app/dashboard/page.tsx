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
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InvocationStatus = "success" | "error" | "timeout";

interface UsageDataPoint {
  date: string;
  costPaise: number;
  calls: number;
}

interface Invocation {
  id: string;
  agentName: string;
  timestamp: string;
  status: InvocationStatus;
  costPaise: number;
}

interface TopAgent {
  name: string;
  calls: number;
  costPaise: number;
}

// ---------------------------------------------------------------------------
// Mock data (realistic INR amounts in paise)
// ---------------------------------------------------------------------------

function generateUsageData(): UsageDataPoint[] {
  const days = 30;
  const today = new Date("2026-06-07");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 2000 : 8000;
    const variance = Math.floor(Math.random() * 6000);
    const calls = isWeekend ? Math.floor(Math.random() * 10) + 2 : Math.floor(Math.random() * 40) + 10;
    return { date: label, costPaise: base + variance, calls };
  });
}

const USAGE_DATA = generateUsageData();

const MOCK_INVOCATIONS: Invocation[] = [
  { id: "inv_1", agentName: "TaxBot Pro", timestamp: "2026-06-07 10:42", status: "success", costPaise: 1500 },
  { id: "inv_2", agentName: "Invoice Extractor", timestamp: "2026-06-07 09:17", status: "success", costPaise: 800 },
  { id: "inv_3", agentName: "Compliance Checker", timestamp: "2026-06-06 18:03", status: "error", costPaise: 0 },
  { id: "inv_4", agentName: "TaxBot Pro", timestamp: "2026-06-06 15:30", status: "success", costPaise: 1500 },
  { id: "inv_5", agentName: "GST Reconciler", timestamp: "2026-06-06 11:55", status: "timeout", costPaise: 200 },
  { id: "inv_6", agentName: "Invoice Extractor", timestamp: "2026-06-05 14:20", status: "success", costPaise: 800 },
];

const TOP_AGENTS: TopAgent[] = [
  { name: "TaxBot Pro", calls: 84, costPaise: 126000 },
  { name: "Invoice Extractor", calls: 52, costPaise: 41600 },
  { name: "GST Reconciler", calls: 31, costPaise: 24800 },
  { name: "Compliance Checker", calls: 18, costPaise: 14400 },
];

const CREDITS_BALANCE_PAISE = 248500;
const USAGE_THIS_MONTH_PAISE = USAGE_DATA.slice(-30).reduce((sum, d) => sum + d.costPaise, 0);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<InvocationStatus, string> = {
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  timeout: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<InvocationStatus, string> = {
  success: "Success",
  error: "Error",
  timeout: "Timeout",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

interface UsageTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function UsageTooltip({ active, payload, label }: UsageTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{formatInr(item.value)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Buyer dashboard home. Shows credits balance, usage this month, line chart
 * of spending over 30 days, recent invocations, and top agents used.
 */
export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Your usage, credits, and active agents at a glance.</p>
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap"
        >
          + Top Up Credits
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Credits Balance"
          value={formatInr(CREDITS_BALANCE_PAISE)}
          sub="Available to spend"
          accent
        />
        <StatCard
          label="Usage This Month"
          value={formatInr(USAGE_THIS_MONTH_PAISE)}
          sub="June 2026"
        />
        <StatCard
          label="Total Invocations"
          value={String(MOCK_INVOCATIONS.length + 1200)}
          sub="All-time"
        />
      </div>

      {/* Usage line chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Spend — Last 30 Days</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={USAGE_DATA} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tickFormatter={(v: number) => `₹${(v / 100).toFixed(0)}`}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip content={<UsageTooltip />} />
              <Line
                type="monotone"
                dataKey="costPaise"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column: recent invocations + top agents */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent invocations */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Invocations</h2>
            <Link href="/dashboard/usage" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_INVOCATIONS.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{inv.agentName}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-mono">{inv.timestamp}</td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STATUS_STYLES[inv.status],
                        )}
                      >
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{formatInr(inv.costPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top agents */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Top Agents Used</h2>
            <p className="text-xs text-slate-400 mt-0.5">This month</p>
          </div>
          <ul className="divide-y divide-slate-50">
            {TOP_AGENTS.map((agent, idx) => {
              const maxCalls = TOP_AGENTS[0]?.calls ?? 1;
              const pct = Math.round((agent.calls / maxCalls) * 100);
              return (
                <li key={agent.name} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 w-4">{idx + 1}</span>
                      <span className="text-sm font-medium text-slate-800">{agent.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{agent.calls} calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-16 text-right">{formatInr(agent.costPaise)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
