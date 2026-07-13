"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fileAppeal, listAppeals, type Appeal } from "@/lib/api/seller";
import { isSentinelApiError } from "@/lib/api/client";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  reviewing: { label: "Under review", cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  rejected: { label: "Declined", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Verification-appeal panel for a rejected or suspended agent. The seller states
 * why the outcome should be reviewed; an admin approves (which re-runs
 * verification) or declines with a note. Renders only when the agent is
 * appealable or already has appeals on record.
 *
 * @example
 * <AppealCard agentId={agent.id} agentStatus={agent.status} />
 */
export function AppealCard({
  agentId,
  agentStatus,
}: {
  agentId: string;
  agentStatus: string;
}): React.JSX.Element | null {
  const appealable = agentStatus === "rejected" || agentStatus === "suspended";
  const [appeals, setAppeals] = React.useState<Appeal[] | null>(null);
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    void listAppeals(agentId)
      .then(setAppeals)
      .catch(() => setAppeals([]));
  }, [agentId]);

  if (!appealable && (appeals === null || appeals.length === 0)) return null;

  const hasOpen = (appeals ?? []).some((a) => a.status === "open" || a.status === "reviewing");

  async function submit(): Promise<void> {
    if (reason.trim().length < 10) {
      setError("Please add at least a sentence explaining the appeal.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const created = await fileAppeal(agentId, reason.trim());
      setAppeals((prev) => [created, ...(prev ?? [])]);
      setReason("");
    } catch (err) {
      setError(isSentinelApiError(err) ? err.displayMessage : "Could not file the appeal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appeal the verification outcome</CardTitle>
        <CardDescription>
          Think this agent was wrongly {agentStatus === "suspended" ? "suspended" : "rejected"}? Ask a
          human to review it — an approved appeal re-runs verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appealable && !hasOpen && (
          <div className="space-y-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why the outcome should be reviewed…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:bg-ink-800 dark:border-porcelain/15 dark:text-porcelain dark:placeholder:text-porcelain/30"
            />
            <Button onClick={() => void submit()} disabled={busy} size="sm">
              {busy ? "Submitting…" : "Submit appeal"}
            </Button>
          </div>
        )}
        {hasOpen && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Your appeal is in the queue — we&apos;ll notify you when it&apos;s reviewed.
          </p>
        )}
        {appeals && appeals.length > 0 && (
          <ul className="divide-y divide-slate-100 dark:divide-porcelain/10">
            {appeals.map((a) => {
              const s = STATUS_STYLE[a.status] ?? {
                label: a.status,
                cls: "bg-slate-100 text-slate-600 dark:bg-ink-700 dark:text-porcelain/70",
              };
              return (
                <li key={a.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 dark:text-porcelain/40">
                      {formatDate(a.createdAt)}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-porcelain/80">{a.reason}</p>
                  {a.adminNote && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-porcelain/50">
                      Reviewer: {a.adminNote}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
