"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
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

type AgentStatus = "draft" | "pending_verification" | "verified" | "suspended";

interface Agent {
  id: string;
  name: string;
  version: string;
  status: AgentStatus;
  trustScore: number | null;
  updatedAt: string;
}

interface EarningsDataPoint {
  date: string;
  amountPaise: number;
}

interface VerificationEvent {
  id: string;
  agentName: string;
  event: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Mock data (realistic INR amounts in paise)
// ---------------------------------------------------------------------------

const MOCK_AGENTS: Agent[] = [
  { id: "ag_1", name: "TaxBot Pro", version: "1.2.0", status: "verified", trustScore: 91, updatedAt: "2026-06-01" },
  { id: "ag_2", name: "Compliance Checker", version: "0.9.1", status: "pending_verification", trustScore: null, updatedAt: "2026-06-05" },
  { id: "ag_3", name: "Invoice Extractor", version: "2.0.0", status: "verified", trustScore: 87, updatedAt: "2026-05-28" },
  { id: "ag_4", name: "GST Reconciler", version: "1.0.0", status: "draft", trustScore: null, updatedAt: "2026-06-06" },
];

function generateEarningsData(): EarningsDataPoint[] {
  const days = 30;
  const today = new Date("2026-06-07");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    // Weekdays earn more; random realistic INR paise values
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 80000 : 250000;
    const variance = Math.floor(Math.random() * 150000);
    return { date: label, amountPaise: base + variance };
  });
}

const EARNINGS_DATA = generateEarningsData();

const VERIFICATION_EVENTS: VerificationEvent[] = [
  { id: "e1", agentName: "Compliance Checker", event: "Submitted for verification", timestamp: "2026-06-05 14:32" },
  { id: "e2", agentName: "TaxBot Pro", event: "Trust score updated to 91", timestamp: "2026-06-03 09:15" },
  { id: "e3", agentName: "Invoice Extractor", event: "Re-verification passed", timestamp: "2026-05-28 16:44" },
  { id: "e4", agentName: "GST Reconciler", event: "Draft saved", timestamp: "2026-06-06 11:08" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<AgentStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_verification: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  draft: "Draft",
  pending_verification: "Pending Verification",
  verified: "Verified",
  suspended: "Suspended",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

interface StatusBadgeProps {
  status: AgentStatus;
}

function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

interface EarningsTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function EarningsTooltip({ active, payload, label }: EarningsTooltipProps): React.JSX.Element | null {
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
 * Developer dashboard home. Shows key metrics, earnings chart, recent agents,
 * verification activity, and quick-action buttons.
 */
export default function DeveloperPage(): React.JSX.Element {
  const publishedCount = MOCK_AGENTS.filter((a) => a.status === "verified").length;
  const pendingCount = MOCK_AGENTS.filter((a) => a.status === "pending_verification").length;
  const earningsThisMonth = EARNINGS_DATA.slice(-7).reduce((sum, d) => sum + d.amountPaise, 0);
  const scoredAgents = MOCK_AGENTS.filter((a) => a.trustScore !== null);
  const avgTrust =
    scoredAgents.length > 0
      ? (scoredAgents.reduce((sum, a) => sum + (a.trustScore ?? 0), 0) / scoredAgents.length).toFixed(1)
      : "—";

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Developer Portal</h1>
        <p className="mt-1 text-slate-600">Publish agents, track verification, and manage payouts.</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Agents" value={String(publishedCount)} sub="Verified & live" />
        <StatCard label="Earnings This Month" value={formatInr(earningsThisMonth)} sub="Last 7 days" />
        <StatCard label="Pending Verification" value={String(pendingCount)} sub="In pipeline" />
        <StatCard label="Avg Trust Score" value={avgTrust !== "—" ? `${avgTrust}/100` : "—"} sub="Across published agents" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/developer/agents/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          + Publish New Agent
        </Link>
        <Link
          href="/developer/earnings"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          View Earnings
        </Link>
        <Link
          href="/developer/bonds"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          Manage Bonds
        </Link>
      </div>

      {/* Earnings bar chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Earnings — Last 30 Days</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={EARNINGS_DATA}
              margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              barSize={10}
            >
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
                width={52}
              />
              <Tooltip content={<EarningsTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="amountPaise" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column: recent agents + verification feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent agents table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Agents</h2>
            <Link href="/developer/agents" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Trust Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_AGENTS.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      <Link href={`/developer/agents/${agent.id}`} className="hover:text-indigo-600">
                        {agent.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{agent.version}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={agent.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {agent.trustScore !== null ? `${agent.trustScore}/100` : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification activity feed */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Verification Activity</h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {VERIFICATION_EVENTS.map((ev) => (
              <li key={ev.id} className="px-6 py-4">
                <p className="text-sm font-medium text-slate-800">{ev.agentName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ev.event}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ev.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
