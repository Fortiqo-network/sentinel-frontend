"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { getLedger } from "@/lib/api/billing";
import type { LedgerEntry } from "@/types/billing";
import { cn } from "@/lib/utils/cn";

interface UsageDataPoint {
  date: string;
  invocations: number;
  spendPaise: number;
}

interface AgentBreakdownRow {
  key: string;
  label: string;
  invocations: number;
  credits: number;
}

interface UsageSummary {
  totalInvocations: number;
  thisMonthInvocations: number;
  totalSpentCredits: number;
  series: UsageDataPoint[];
  breakdown: AgentBreakdownRow[];
}

function isCurrentMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function summarizeDebits(entries: LedgerEntry[]): UsageSummary {
  const debits = entries.filter((e) => e.type === "debit");

  const totalSpentCredits = debits.reduce((sum, e) => sum + e.credits, 0);
  const thisMonthInvocations = debits.filter((e) => isCurrentMonth(e.createdAt)).length;

  const byDay = new Map<string, { invocations: number; credits: number; sortKey: number }>();
  for (const e of debits) {
    const d = new Date(e.createdAt);
    const sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const bucket = byDay.get(label) ?? { invocations: 0, credits: 0, sortKey };
    bucket.invocations += 1;
    bucket.credits += e.credits;
    byDay.set(label, bucket);
  }
  const series: UsageDataPoint[] = [...byDay.entries()]
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([date, b]) => ({ date, invocations: b.invocations, spendPaise: b.credits }));

  const byAgent = new Map<string, AgentBreakdownRow>();
  for (const e of debits) {
    const key = e.agentId ?? e.description;
    const label = e.description || e.agentId || "Unknown";
    const row = byAgent.get(key) ?? { key, label, invocations: 0, credits: 0 };
    row.invocations += 1;
    row.credits += e.credits;
    byAgent.set(key, row);
  }
  const breakdown = [...byAgent.values()].sort((a, b) => b.credits - a.credits);

  return {
    totalInvocations: debits.length,
    thisMonthInvocations,
    totalSpentCredits,
    series,
    breakdown,
  };
}

/**
 * Detailed usage page. Derives per-agent invocation counts and spend over time
 * from the buyer's billing ledger (debit entries). Usage is genuinely empty
 * until agent calls produce debits, so empty states are first-class here.
 */
export default function UsagePage(): React.JSX.Element {
  const [summary, setSummary] = React.useState<UsageSummary | null>(null);
  const [status, setStatus] = React.useState<"loading" | "error" | "ready">("loading");

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getLedger(1, 100)
      .then(({ entries }) => {
        if (cancelled) return;
        setSummary(summarizeDebits(entries));
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasUsage = summary !== null && summary.totalInvocations > 0;

  const stats: { label: string; value: string }[] =
    summary === null
      ? [
          { label: "Total Invocations", value: "—" },
          { label: "This Month", value: "—" },
          { label: "Total Spent", value: "—" },
        ]
      : [
          { label: "Total Invocations", value: summary.totalInvocations.toLocaleString("en-IN") },
          { label: "This Month", value: summary.thisMonthInvocations.toLocaleString("en-IN") },
          {
            label: "Total Spent",
            value: `${summary.totalSpentCredits.toLocaleString("en-IN")} credits`,
          },
        ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usage</h1>
        <p className="mt-1 text-slate-600">Invocation history and spend across all your agents.</p>
      </div>

      {status === "error" ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-rose-600">
              Could not load usage data. Please refresh to try again.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div
                    className={cn(
                      "text-2xl font-bold text-slate-900",
                      status === "loading" && "text-slate-400",
                    )}
                  >
                    {value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invocations Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {status === "loading" ? (
                <div className="flex h-[300px] items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
                  Loading usage…
                </div>
              ) : (
                <UsageChart data={summary?.series ?? []} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Per-Agent Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {status === "loading" ? (
                <p className="text-sm text-slate-400">Loading…</p>
              ) : !hasUsage || summary === null ? (
                <p className="text-sm text-slate-500">
                  No agent usage yet — charges from agent calls will appear here.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {summary.breakdown.map((row) => (
                    <li key={row.key} className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{row.label}</div>
                        <div className="text-xs text-slate-500">
                          {row.invocations.toLocaleString("en-IN")}{" "}
                          {row.invocations === 1 ? "invocation" : "invocations"}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {row.credits.toLocaleString("en-IN")} credits
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
