"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { isSentinelApiError } from "@/lib/api/client";
import {
  listMyAgents,
  deleteAgent,
  submitAgent,
  type DeveloperAgent,
  type DeveloperAgentStatus,
} from "@/lib/api/developer";

// ---------------------------------------------------------------------------
// Display grouping
// ---------------------------------------------------------------------------

type FilterGroup = "all" | "draft" | "pending" | "verified" | "other";

const GROUP_OF_STATUS: Record<DeveloperAgentStatus, Exclude<FilterGroup, "all">> = {
  draft: "draft",
  submitted: "pending",
  verifying: "pending",
  verified: "verified",
  live: "verified",
  rejected: "other",
  suspended: "other",
  retired: "other",
};

const STATUS_STYLES: Record<DeveloperAgentStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border border-slate-200",
  submitted: "bg-amber-100 text-amber-700 border border-amber-200",
  verifying: "bg-amber-100 text-amber-700 border border-amber-200",
  verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  live: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
  suspended: "bg-red-100 text-red-700 border border-red-200",
  retired: "bg-slate-100 text-slate-500 border border-slate-200",
};

const TIER_STYLES: Record<DeveloperAgent["tier"], string> = {
  managed: "bg-purple-100 text-purple-700",
  proxy: "bg-blue-100 text-blue-700",
};

const FILTER_OPTIONS: ReadonlyArray<{ value: FilterGroup; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "other", label: "Other" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function errorMessage(err: unknown, fallback: string): string {
  return isSentinelApiError(err) ? err.displayMessage : fallback;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
      {titleCase(status)}
    </span>
  );
}

interface TierBadgeProps {
  tier: DeveloperAgent["tier"];
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
  agent: DeveloperAgent;
  busy: boolean;
  error: string | null;
  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;
}

function AgentActions({
  agent,
  busy,
  error,
  onSubmit,
  onDelete,
}: AgentActionsProps): React.JSX.Element {
  const canDelete = agent.status === "draft" || agent.status === "rejected";
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/developer/agents/${agent.id}`}
          className="rounded px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-200"
        >
          View Details
        </Link>
        {agent.status === "draft" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit(agent.id)}
            className="rounded px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit for verification
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(agent.id)}
            className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        )}
      </div>
      {error !== null && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Agent management list page. Loads the developer's own agents from the gateway
 * and renders them with status badges, trust scores, tier, and inline lifecycle
 * actions (submit a draft for verification, delete a draft or rejected agent).
 */
export default function MyAgentsPage(): React.JSX.Element {
  const [agents, setAgents] = React.useState<DeveloperAgent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [filterGroup, setFilterGroup] = React.useState<FilterGroup>("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionErrors, setActionErrors] = React.useState<Record<string, string>>({});

  const refresh = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listMyAgents();
      setAgents(data);
    } catch (err) {
      setLoadError(errorMessage(err, "Could not load your agents. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const clearActionError = React.useCallback((id: string): void => {
    setActionErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleSubmit = React.useCallback(
    async (id: string): Promise<void> => {
      setBusyId(id);
      clearActionError(id);
      try {
        await submitAgent(id);
        await refresh();
      } catch (err) {
        setActionErrors((prev) => ({
          ...prev,
          [id]: errorMessage(err, "Could not submit this agent for verification."),
        }));
      } finally {
        setBusyId(null);
      }
    },
    [clearActionError, refresh],
  );

  const handleDelete = React.useCallback(
    async (id: string): Promise<void> => {
      if (!window.confirm("Delete this agent? This action cannot be undone.")) return;
      setBusyId(id);
      clearActionError(id);
      try {
        await deleteAgent(id);
        await refresh();
      } catch (err) {
        setActionErrors((prev) => ({
          ...prev,
          [id]: errorMessage(err, "Could not delete this agent."),
        }));
      } finally {
        setBusyId(null);
      }
    },
    [clearActionError, refresh],
  );

  const counts = React.useMemo<Record<FilterGroup, number>>(() => {
    const base: Record<FilterGroup, number> = {
      all: agents.length,
      draft: 0,
      pending: 0,
      verified: 0,
      other: 0,
    };
    for (const agent of agents) {
      base[GROUP_OF_STATUS[agent.status]] += 1;
    }
    return base;
  }, [agents]);

  const filtered = React.useMemo<DeveloperAgent[]>(() => {
    if (filterGroup === "all") return agents;
    return agents.filter((a) => GROUP_OF_STATUS[a.status] === filterGroup);
  }, [agents, filterGroup]);

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
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilterGroup(value)}
            className={cn(
              "rounded-full px-3.5 py-1 text-sm font-medium transition-colors",
              filterGroup === value
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0 text-xs",
                filterGroup === value ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Load error */}
      {loadError !== null && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between gap-4">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

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
                  Slug
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading agents…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    {agents.length === 0
                      ? "You have not created any agents yet."
                      : "No agents matching this filter."}
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
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{agent.slug}</td>
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
                    <td className="px-6 py-4 text-slate-500">{formatCreatedAt(agent.createdAt)}</td>
                    <td className="px-6 py-4">
                      <AgentActions
                        agent={agent}
                        busy={busyId === agent.id}
                        error={actionErrors[agent.id] ?? null}
                        onSubmit={(id) => void handleSubmit(id)}
                        onDelete={(id) => void handleDelete(id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary footer */}
      {!loading && (
        <p className="text-xs text-slate-400">
          Showing {filtered.length} of {agents.length} agents
        </p>
      )}
    </div>
  );
}
