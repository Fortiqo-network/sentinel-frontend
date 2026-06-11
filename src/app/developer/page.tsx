"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  listMyAgents,
  getEarnings,
  type DeveloperAgent,
  type DeveloperAgentStatus,
} from "@/lib/api/developer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<DeveloperAgentStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-amber-100 text-amber-700",
  verifying: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  live: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
  retired: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<DeveloperAgentStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  verifying: "Verifying",
  verified: "Verified",
  rejected: "Rejected",
  live: "Live",
  suspended: "Suspended",
  retired: "Retired",
};

const TIER_LABELS: Record<DeveloperAgent["tier"], string> = {
  managed: "Managed",
  proxy: "Proxy",
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
  status: DeveloperAgentStatus;
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Developer dashboard home. Loads the authenticated developer's agents and
 * payout-eligible earnings from the gateway, then derives headline metrics
 * (total/verified/pending counts, average trust score, payable points) and
 * renders the agent list. Earnings can fail for non-developer accounts; that
 * failure is tolerated and treated as zero payable points so the page still
 * renders the agent data.
 */
export default function DeveloperPage(): React.JSX.Element {
  const [agents, setAgents] = React.useState<DeveloperAgent[]>([]);
  const [payablePoints, setPayablePoints] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      const [agentsResult, earningsResult] = await Promise.allSettled([
        listMyAgents(),
        getEarnings(),
      ]);

      if (cancelled) return;

      if (agentsResult.status === "fulfilled") {
        setAgents(agentsResult.value);
      }
      if (earningsResult.status === "fulfilled") {
        setPayablePoints(earningsResult.value.payablePoints);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCount = agents.length;
  const verifiedLiveCount = agents.filter(
    (a) => a.status === "verified" || a.status === "live",
  ).length;
  const pendingCount = agents.filter(
    (a) => a.status === "submitted" || a.status === "verifying",
  ).length;

  const scoredAgents = agents.filter((a) => a.trustScore !== null);
  const avgTrust =
    scoredAgents.length > 0
      ? String(
          Math.round(
            scoredAgents.reduce((sum, a) => sum + (a.trustScore ?? 0), 0) /
              scoredAgents.length,
          ),
        )
      : "—";

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Developer Portal</h1>
        <p className="mt-1 text-slate-600">Publish agents, track verification, and manage payouts.</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Agents" value={loading ? "…" : String(totalCount)} sub="All agents" />
        <StatCard
          label="Verified / Live"
          value={loading ? "…" : String(verifiedLiveCount)}
          sub="In the marketplace"
        />
        <StatCard
          label="Pending Verification"
          value={loading ? "…" : String(pendingCount)}
          sub="In pipeline"
        />
        <StatCard
          label="Avg Trust Score"
          value={loading ? "…" : avgTrust !== "—" ? `${avgTrust}/100` : "—"}
          sub="Across scored agents"
        />
        <StatCard
          label="Payable Earnings"
          value={loading ? "…" : `${payablePoints.toLocaleString("en-IN")} points`}
          sub="Eligible for payout"
        />
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

      {/* Agents table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Your Agents</h2>
          <Link href="/developer/agents" className="text-sm text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading your agents…</div>
        ) : agents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No agents yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Publish your first agent to start earning.
            </p>
            <Link
              href="/developer/agents/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              + Publish New Agent
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Trust Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      <Link href={`/developer/agents/${agent.id}`} className="hover:text-indigo-600">
                        {agent.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{TIER_LABELS[agent.tier]}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={agent.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {agent.trustScore !== null ? (
                        `${agent.trustScore}/100`
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
