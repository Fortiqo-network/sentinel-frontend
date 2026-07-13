"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listAbuseReports,
  resolveAbuseReport,
  suspendAgent,
  unsuspendAgent,
  type AbuseReportRow,
} from "@/lib/api/admin";
import { SellerReportsQueue } from "@/components/admin/SellerReportsQueue";
import { AppealsQueue } from "@/components/admin/AppealsQueue";
import { ReviewReportsQueue } from "@/components/admin/ReviewReportsQueue";
import { cn } from "@/lib/utils/cn";
import { isSentinelApiError } from "@/lib/api/client";

type ModerationTab = "agents" | "community" | "appeals" | "reviews";

const STATUS_FILTERS = ["open", "all", "resolved", "dismissed"];

function statusVariant(s: string): "success" | "warning" | "destructive" | "info" | "default" {
  if (s === "resolved") return "success";
  if (s === "dismissed") return "default";
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
 * Admin moderation console — the abuse-report queue. Each report can be resolved
 * or dismissed, and the reported agent can be suspended (kill-switch) or
 * restored. Backed by the admin abuse-report + suspend/unsuspend endpoints.
 */
export default function AdminModerationPage(): React.JSX.Element {
  const [reports, setReports] = React.useState<AbuseReportRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("open");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<ModerationTab>("agents");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAbuseReports({ status: status === "all" ? "all" : status, pageSize: 100 });
      setReports(result.reports);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function decide(report: AbuseReportRow, action: "resolve" | "dismiss"): Promise<void> {
    setBusyId(report.id);
    setNote(null);
    try {
      const updated = await resolveAbuseReport(report.id, action);
      setReports((prev) =>
        status === "open"
          ? prev.filter((r) => r.id !== report.id)
          : prev.map((r) => (r.id === report.id ? updated : r)),
      );
      setNote(`Report ${action === "resolve" ? "resolved" : "dismissed"}.`);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function agentAction(report: AbuseReportRow, kind: "suspend" | "unsuspend"): Promise<void> {
    setBusyId(report.id);
    setNote(null);
    try {
      const state =
        kind === "suspend"
          ? await suspendAgent(report.agent_id, `Abuse report: ${report.reason}`)
          : await unsuspendAgent(report.agent_id);
      setNote(`Agent ${shortId(report.agent_id)} is now ${state.status}.`);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Moderation"
        description="Review agent, seller, and content reports and take action."
      />

      <div className="flex gap-1 border-b border-slate-200 dark:border-porcelain/10">
        {(["agents", "community", "reviews", "appeals"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "border-indigo-500 text-slate-900 dark:border-gold dark:text-porcelain"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-porcelain/50 dark:hover:text-porcelain",
            )}
          >
            {t === "agents"
              ? "Agent reports"
              : t === "community"
                ? "Seller & content"
                : t === "reviews"
                  ? "Review reports"
                  : "Appeals"}
          </button>
        ))}
      </div>

      {tab === "community" && <SellerReportsQueue />}
      {tab === "reviews" && <ReviewReportsQueue />}
      {tab === "appeals" && <AppealsQueue />}

      {tab === "agents" && (
        <>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-500 dark:text-porcelain/50">
          {total} {status === "open" ? "open " : ""}report{total === 1 ? "" : "s"}
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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">{note}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/50">
            <tr>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">Reported</th>
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
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  No reports in this view.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-porcelain/70">{shortId(r.agent_id)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{r.reason}</Badge>
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-slate-600 dark:text-porcelain/70">
                    <span className="line-clamp-2">{r.details ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-porcelain/50">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="destructive" disabled={busyId === r.id} onClick={() => agentAction(r, "suspend")}>
                        Suspend agent
                      </Button>
                      <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => agentAction(r, "unsuspend")}>
                        Unsuspend
                      </Button>
                      {r.status === "open" && (
                        <>
                          <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => decide(r, "resolve")}>
                            Resolve
                          </Button>
                          <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => decide(r, "dismiss")}>
                            Dismiss
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
        </>
      )}
    </div>
  );
}
