"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentStatus = "draft" | "pending_verification" | "verified" | "suspended";
type AgentTier = "free" | "standard" | "premium" | "enterprise";

interface Agent {
  id: string;
  name: string;
  version: string;
  status: AgentStatus;
  trustScore: number | null;
  tier: AgentTier;
  publishedAt: string | null;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_AGENTS: Agent[] = [
  {
    id: "ag_1",
    name: "TaxBot Pro",
    version: "1.2.0",
    status: "verified",
    trustScore: 91,
    tier: "premium",
    publishedAt: "2026-04-10",
  },
  {
    id: "ag_2",
    name: "Compliance Checker",
    version: "0.9.1",
    status: "pending_verification",
    trustScore: null,
    tier: "standard",
    publishedAt: null,
  },
  {
    id: "ag_3",
    name: "Invoice Extractor",
    version: "2.0.0",
    status: "verified",
    trustScore: 87,
    tier: "standard",
    publishedAt: "2026-02-22",
  },
  {
    id: "ag_4",
    name: "GST Reconciler",
    version: "1.0.0",
    status: "draft",
    trustScore: null,
    tier: "free",
    publishedAt: null,
  },
  {
    id: "ag_5",
    name: "Credit Risk Scorer",
    version: "3.1.0",
    status: "suspended",
    trustScore: 44,
    tier: "enterprise",
    publishedAt: "2026-01-05",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<AgentStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border border-slate-200",
  pending_verification: "bg-amber-100 text-amber-700 border border-amber-200",
  verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  suspended: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  draft: "Draft",
  pending_verification: "Pending",
  verified: "Verified",
  suspended: "Suspended",
};

const TIER_STYLES: Record<AgentTier, string> = {
  free: "bg-slate-100 text-slate-600",
  standard: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
  enterprise: "bg-indigo-100 text-indigo-700",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

interface TierBadgeProps {
  tier: AgentTier;
}

function TierBadge({ tier }: TierBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        TIER_STYLES[tier],
      )}
    >
      {tier}
    </span>
  );
}

interface AgentActionsProps {
  agent: Agent;
}

function AgentActions({ agent }: AgentActionsProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/developer/agents/${agent.id}`}
        className="rounded px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-200"
      >
        View Details
      </Link>
      {(agent.status === "verified" || agent.status === "suspended") && (
        <button
          type="button"
          className="rounded px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors border border-amber-200"
        >
          Re-verify
        </button>
      )}
      {agent.status !== "draft" && agent.status !== "suspended" && (
        <button
          type="button"
          className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
        >
          Deprecate
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Agent management list page. Shows all agents owned by the developer with
 * status badges, trust scores, tier, and inline action buttons.
 */
export default function MyAgentsPage(): React.JSX.Element {
  const [filterStatus, setFilterStatus] = React.useState<AgentStatus | "all">("all");

  const filtered =
    filterStatus === "all" ? MOCK_AGENTS : MOCK_AGENTS.filter((a) => a.status === filterStatus);

  const statusCounts: Record<AgentStatus | "all", number> = {
    all: MOCK_AGENTS.length,
    draft: MOCK_AGENTS.filter((a) => a.status === "draft").length,
    pending_verification: MOCK_AGENTS.filter((a) => a.status === "pending_verification").length,
    verified: MOCK_AGENTS.filter((a) => a.status === "verified").length,
    suspended: MOCK_AGENTS.filter((a) => a.status === "suspended").length,
  };

  const filterOptions: Array<{ value: AgentStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "verified", label: "Verified" },
    { value: "pending_verification", label: "Pending" },
    { value: "draft", label: "Draft" },
    { value: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Agents</h1>
          <p className="mt-1 text-slate-600">
            Manage agents you have published or submitted for verification.
          </p>
        </div>
        <Link
          href="/developer/agents/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap"
        >
          + Publish New Agent
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilterStatus(value)}
            className={cn(
              "rounded-full px-3.5 py-1 text-sm font-medium transition-colors",
              filterStatus === value
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0 text-xs",
                filterStatus === value ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {statusCounts[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Agents table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Agent Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trust Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    No agents matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link
                        href={`/developer/agents/${agent.id}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {agent.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{agent.version}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={agent.status} />
                    </td>
                    <td className="px-6 py-4">
                      {agent.trustScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                agent.trustScore >= 80
                                  ? "bg-emerald-500"
                                  : agent.trustScore >= 60
                                  ? "bg-amber-500"
                                  : "bg-red-500",
                              )}
                              style={{ width: `${agent.trustScore}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-700">{agent.trustScore}/100</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <TierBadge tier={agent.tier} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {agent.publishedAt ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <AgentActions agent={agent} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary footer */}
      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {MOCK_AGENTS.length} agents
      </p>
    </div>
  );
}
