"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreHistory, type ScoreHistoryPoint } from "@/lib/api/seller";

function toDisplay(score: number | null): number | null {
  return score === null ? null : Math.round(score * 100);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function bandClass(display: number | null): string {
  if (display === null) return "bg-slate-100 text-slate-600 dark:bg-ink-700 dark:text-porcelain/70";
  if (display >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (display >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
}

/**
 * Trust-score history for a seller's agent — how the score moved across
 * verifications (newest first), with the change vs the previous run. Complements
 * the drift alert: the seller sees the trend behind the current number. Renders
 * nothing until at least one verification has been recorded.
 *
 * @example
 * <ScoreHistoryCard agentId={agent.id} />
 */
export function ScoreHistoryCard({ agentId }: { agentId: string }): React.JSX.Element | null {
  const [points, setPoints] = React.useState<ScoreHistoryPoint[] | null>(null);

  React.useEffect(() => {
    void getScoreHistory(agentId)
      .then(setPoints)
      .catch(() => setPoints([]));
  }, [agentId]);

  if (points !== null && points.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trust-score history</CardTitle>
        <CardDescription>How this agent&apos;s trust score moved across verifications.</CardDescription>
      </CardHeader>
      <CardContent>
        {points === null ? (
          <p className="text-sm text-slate-500 dark:text-porcelain/50">Loading…</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-porcelain/10">
            {points.map((p, i) => {
              const display = toDisplay(p.trustScore);
              const prev = toDisplay(points[i + 1]?.trustScore ?? null);
              const delta = display !== null && prev !== null ? display - prev : null;
              return (
                <li key={`${p.recordedAt}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <span className="text-sm text-slate-700 dark:text-porcelain/80">{formatDate(p.recordedAt)}</span>
                    {p.certStatus && (
                      <span className="ml-2 text-xs uppercase tracking-wide text-slate-400 dark:text-porcelain/40">
                        {p.certStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {delta !== null && delta !== 0 && (
                      <span
                        className={
                          delta < 0
                            ? "text-xs font-medium text-red-600 dark:text-red-300"
                            : "text-xs font-medium text-emerald-600 dark:text-emerald-300"
                        }
                      >
                        {delta < 0 ? "▼" : "▲"} {Math.abs(delta)}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${bandClass(display)}`}
                    >
                      {display ?? "—"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
