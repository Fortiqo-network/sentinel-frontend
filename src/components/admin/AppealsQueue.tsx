"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAppeals, resolveAppeal, type AdminAppealRow } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

const STATUS_FILTERS = ["open", "all", "approved", "rejected"];

function statusVariant(s: string): "success" | "warning" | "destructive" | "info" | "default" {
  if (s === "approved") return "success";
  if (s === "rejected") return "destructive";
  if (s === "reviewing") return "info";
  return "warning"; // open
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

/**
 * Admin verification-appeal queue. A seller appeals a rejected/suspended agent;
 * an admin approves it (which re-runs verification) or declines it. Backed by the
 * admin `/v1/admin/appeals` endpoints.
 */
export function AppealsQueue(): React.JSX.Element {
  const [appeals, setAppeals] = React.useState<AdminAppealRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("open");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setAppeals(await listAppeals(status === "all" ? undefined : status));
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load appeals.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function decide(appeal: AdminAppealRow, approve: boolean): Promise<void> {
    setBusyId(appeal.id);
    setNote(null);
    try {
      const updated = await resolveAppeal(appeal.id, approve);
      setAppeals((prev) =>
        status === "open"
          ? prev.filter((a) => a.id !== appeal.id)
          : prev.map((a) => (a.id === appeal.id ? updated : a)),
      );
      setNote(approve ? "Appeal approved — the agent is being re-verified." : "Appeal declined.");
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-500 dark:text-porcelain/50">
          {appeals.length} appeal{appeals.length === 1 ? "" : "s"} in this view
        </p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:focus:border-gold"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {note && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
          {note}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/50">
            <tr>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Filed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  Loading…
                </td>
              </tr>
            ) : appeals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  No appeals in this view.
                </td>
              </tr>
            ) : (
              appeals.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-porcelain/70">{shortId(a.agent_id)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-porcelain/70">{shortId(a.seller_id)}</td>
                  <td className="max-w-[280px] px-4 py-3 text-slate-600 dark:text-porcelain/70">
                    <span className="line-clamp-2">{a.reason}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-porcelain/50">{fmtDate(a.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {(a.status === "open" || a.status === "reviewing") && (
                        <>
                          <Button size="sm" variant="outline" disabled={busyId === a.id} onClick={() => decide(a, true)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" disabled={busyId === a.id} onClick={() => decide(a, false)}>
                            Decline
                          </Button>
                        </>
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
