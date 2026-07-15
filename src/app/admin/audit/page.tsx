"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  auditExportFilename,
  exportAuditEventsCsv,
  listAuditEvents,
  type AdminAuditRow,
} from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

const PAGE_SIZE = 50;

/**
 * Admin audit-log view: browse the append-only trail of security- and
 * lifecycle-sensitive actions (who did what, to which entity, when), with
 * action/entity filters and pagination. Read-only — the log is immutable.
 */
export default function AdminAuditPage(): React.JSX.Element {
  const [rows, setRows] = React.useState<AdminAuditRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [action, setAction] = React.useState("");
  const [entityType, setEntityType] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAuditEvents({
        action: action.trim() || undefined,
        entityType: entityType.trim() || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(result.events);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load the audit log.");
    } finally {
      setLoading(false);
    }
  }, [action, entityType, page]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function onFilterChange(setter: (v: string) => void, value: string): void {
    setPage(1);
    setter(value);
  }

  const onExport = React.useCallback(async () => {
    setExporting(true);
    try {
      const csv = await exportAuditEventsCsv({
        action: action.trim() || undefined,
        entityType: entityType.trim() || undefined,
      });
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = auditExportFilename(new Date());
      link.click();
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError(
        isSentinelApiError(err) ? err.message : "Unable to export the audit log.",
      );
    } finally {
      setExporting(false);
    }
  }, [action, entityType]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Audit log"
        description={`${total} recorded action${total === 1 ? "" : "s"} — who did what, to which entity, when.`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={action}
          onChange={(e) => onFilterChange(setAction, e.target.value)}
          placeholder="Filter by action, e.g. agent.retired"
          className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:placeholder:text-porcelain/30 dark:focus:border-gold"
        />
        <input
          type="search"
          value={entityType}
          onChange={(e) => onFilterChange(setEntityType, e.target.value)}
          placeholder="Filter by entity type, e.g. agent"
          className="h-9 w-56 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:placeholder:text-porcelain/30 dark:focus:border-gold"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={exporting || total === 0}
          onClick={() => void onExport()}
          title="Download the filtered audit trail as CSV"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/50">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  No audit events match.
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-porcelain/50">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-porcelain">{e.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-porcelain/60">
                    {e.entity_type}
                    {e.entity_id ? (
                      <span className="text-slate-400 dark:text-porcelain/40">:{e.entity_id}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-porcelain/60">
                    {e.actor_email || e.actor_id || (
                      <span className="text-slate-300 dark:text-porcelain/30">system</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-porcelain/50">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
