"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listReviewReports, resolveReviewReport, type ReviewReportRow } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

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
 * Admin review-report queue. A user reports a review; an admin hides it
 * (removes it from the public list + rating), unhides it, or dismisses the
 * report. Backed by the admin `/v1/admin/review-reports` endpoints.
 */
export function ReviewReportsQueue(): React.JSX.Element {
  const [reports, setReports] = React.useState<ReviewReportRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("open");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setReports(await listReviewReports(status === "all" ? undefined : status));
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load review reports.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function act(report: ReviewReportRow, action: "hide" | "unhide" | "dismiss"): Promise<void> {
    setBusyId(report.id);
    setNote(null);
    try {
      const updated = await resolveReviewReport(report.id, action);
      setReports((prev) =>
        status === "open"
          ? prev.filter((r) => r.id !== report.id)
          : prev.map((r) => (r.id === report.id ? updated : r)),
      );
      setNote(
        action === "hide"
          ? "Review hidden."
          : action === "unhide"
            ? "Review restored."
            : "Report dismissed.",
      );
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
          {reports.length} report{reports.length === 1 ? "" : "s"} in this view
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
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/50">
            <tr>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Reported</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  Loading…
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  No review reports in this view.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <Badge variant="info">{r.reason}</Badge>
                    {r.review_hidden && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-porcelain/40">(hidden)</span>
                    )}
                  </td>
                  <td className="max-w-[320px] px-4 py-3 text-slate-600 dark:text-porcelain/70">
                    <span className="line-clamp-2">{r.review_body ?? "—"}</span>
                    <span className="ml-1 font-mono text-xs text-slate-400 dark:text-porcelain/40">
                      {shortId(r.review_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-porcelain/50">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {r.review_hidden ? (
                        <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => act(r, "unhide")}>
                          Unhide
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" disabled={busyId === r.id} onClick={() => act(r, "hide")}>
                          Hide review
                        </Button>
                      )}
                      {r.status === "open" && (
                        <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => act(r, "dismiss")}>
                          Dismiss
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
