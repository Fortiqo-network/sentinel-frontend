"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listAdminAgents,
  disableAgent,
  enableAgent,
  publishAgent,
  reverifyAgent,
  type AdminAgentRow,
} from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

const STATUS_FILTERS = ["", "live", "verified", "submitted", "verifying", "draft", "rejected", "suspended", "retired"];

function statusVariant(status: string): "success" | "warning" | "destructive" | "info" | "default" {
  if (status === "live" || status === "verified") return "success";
  if (status === "rejected" || status === "suspended") return "destructive";
  if (status === "submitted" || status === "verifying") return "warning";
  if (status === "retired") return "default";
  return "info";
}

function HealthDot({ status }: { status: string }): React.JSX.Element {
  const map: Record<string, { color: string; label: string }> = {
    active: { color: "bg-emerald-500", label: "Active" },
    inactive: { color: "bg-rose-500", label: "Inactive" },
    unknown: { color: "bg-slate-300", label: "Unknown" },
  };
  const cfg = map[status] ?? { color: "bg-slate-300", label: "Unknown" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`h-2 w-2 rounded-full ${cfg.color}`} /> {cfg.label}
    </span>
  );
}

/**
 * Admin agents console — every agent (including disabled and retired), with
 * enable/disable, publish-to-live, search, and a lifecycle status filter. The
 * enable flag is the admin on/off switch independent of lifecycle status.
 */
export default function AdminAgentsPage(): React.JSX.Element {
  const [agents, setAgents] = React.useState<AdminAgentRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminAgents({ q: q.trim() || undefined, status: status || undefined, pageSize: 100 });
      setAgents(result.agents);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load agents.");
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, fn: (id: string) => Promise<{ status: string; enabled: boolean; health_status: string }>): Promise<void> {
    setBusyId(id);
    try {
      const next = await fn(id);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: next.status, enabled: next.enabled, health_status: next.health_status } : a,
        ),
      );
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Agents" description={`${total} agent${total === 1 ? "" : "s"} across the platform.`} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or slug…"
          className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Health</th>
              <th className="px-4 py-3 font-medium">Enabled</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No agents match.
                </td>
              </tr>
            ) : (
              agents.map((a) => (
                <tr key={a.id} className={a.enabled ? "" : "bg-slate-50/60"}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{a.name}</div>
                    <div className="text-xs text-slate-400">{a.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.owner_email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <HealthDot status={a.health_status} />
                  </td>
                  <td className="px-4 py-3">
                    {a.enabled ? (
                      <span className="text-xs font-medium text-emerald-600">Enabled</span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" disabled={busyId === a.id} onClick={() => act(a.id, reverifyAgent)}>
                        Re-verify
                      </Button>
                      {a.status !== "live" && (
                        <Button size="sm" variant="outline" disabled={busyId === a.id} onClick={() => act(a.id, publishAgent)}>
                          Publish
                        </Button>
                      )}
                      {a.enabled ? (
                        <Button size="sm" variant="destructive" disabled={busyId === a.id} onClick={() => act(a.id, disableAgent)}>
                          Disable
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled={busyId === a.id} onClick={() => act(a.id, enableAgent)}>
                          Enable
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
