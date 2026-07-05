"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/StatCard";
import { getAnalytics, getTopAgents, type AdminAnalytics, type TopAgentRow } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Admin analytics — identity, lifecycle, and endpoint-liveness breakdowns sourced
 * from core-api. Revenue and usage aggregates land once the billing reporting
 * endpoint exists; until then this surfaces the counts core-api owns directly.
 */
export default function AdminAnalyticsPage(): React.JSX.Element {
  const [data, setData] = React.useState<AdminAnalytics | null>(null);
  const [topAgents, setTopAgents] = React.useState<TopAgentRow[]>([]);
  const [rankedBy, setRankedBy] = React.useState<"revenue" | "subscribers">("subscribers");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const result = await getAnalytics();
        if (active) setData(result);
      } catch (err) {
        if (active) setError(isSentinelApiError(err) ? err.message : "Unable to load analytics.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    void getTopAgents(10)
      .then((res) => {
        if (active) {
          setTopAgents(res.agents);
          setRankedBy(res.ranked_by);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const statusEntries = data ? Object.entries(data.agents_by_status).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="Analytics" description="Platform-wide identity, catalogue, and liveness metrics." />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-porcelain/10 dark:bg-ink-700" />
          ))}
        </div>
      ) : data ? (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Revenue &amp; usage</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Platform revenue"
                value={`${data.platform_revenue_credits.toLocaleString("en-US")} Cr`}
                sub="Cumulative 3% take"
                accent
              />
              <StatCard
                label="Revenue (30d)"
                value={`${data.revenue_30d_credits.toLocaleString("en-US")} Cr`}
                sub={`${data.charges_30d.toLocaleString("en-US")} calls in last 30 days`}
              />
              <StatCard
                label="GMV"
                value={`${data.gmv_credits.toLocaleString("en-US")} Cr`}
                sub="Gross spent on agent calls"
              />
              <StatCard
                label="Seller earnings"
                value={`${data.seller_earnings_credits.toLocaleString("en-US")} Cr`}
                sub="Net accrued to sellers"
              />
              <StatCard
                label="Credits sold"
                value={`${data.topups_credits.toLocaleString("en-US")} Cr`}
                sub="Total wallet top-ups"
              />
              <StatCard label="Charged calls" value={data.charges_count} sub="Billed agent invocations" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Identity</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total users" value={data.users_total} accent />
              <StatCard label="Sellers" value={data.sellers} />
              <StatCard label="Buyers" value={data.buyers} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Catalogue</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total agents" value={data.agents_total} />
              <StatCard label="Live agents" value={data.agents_live} accent />
              <StatCard label="Disabled agents" value={data.agents_disabled} sub="Hidden from marketplace" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Endpoint liveness</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Healthy endpoints" value={data.health_active} />
              <StatCard label="Inactive endpoints" value={data.health_inactive} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Agents by lifecycle status</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
              {statusEntries.length === 0 ? (
                <p className="px-6 py-5 text-sm text-slate-500 dark:text-porcelain/50">No agents yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
                    {statusEntries.map(([status, count]) => (
                      <tr key={status}>
                        <td className="px-6 py-3 font-medium text-slate-700 dark:text-porcelain/70">{titleCase(status)}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-900 dark:text-porcelain">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">
              Top agents by {rankedBy === "revenue" ? "revenue" : "engagement"}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
              {topAgents.length === 0 ? (
                <p className="px-6 py-5 text-sm text-slate-500 dark:text-porcelain/50">No agents yet.</p>
              ) : (
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      {rankedBy === "revenue" && <th className="px-4 py-3 text-right font-medium">Revenue</th>}
                      {rankedBy === "revenue" && <th className="px-4 py-3 text-right font-medium">Calls</th>}
                      <th className="px-4 py-3 text-right font-medium">Trust</th>
                      <th className="px-4 py-3 text-right font-medium">Subs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
                    {topAgents.map((a, i) => (
                      <tr key={a.id}>
                        <td className="px-4 py-3 tabular-nums text-slate-400 dark:text-porcelain/40">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-porcelain">{a.name}</div>
                          <div className="text-xs text-slate-400 dark:text-porcelain/40">{a.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-porcelain/70">{a.owner_email ?? "—"}</td>
                        {rankedBy === "revenue" && (
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900 dark:text-porcelain">
                            {a.gross_credits.toLocaleString("en-US")} Cr
                          </td>
                        )}
                        {rankedBy === "revenue" && (
                          <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-porcelain/70">{a.charges_count}</td>
                        )}
                        <td className="px-4 py-3 text-right tabular-nums text-slate-900 dark:text-porcelain">
                          {a.trust_score != null ? Math.round(a.trust_score * 100) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-900 dark:text-porcelain">{a.subscribers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-porcelain/40">
              {rankedBy === "revenue"
                ? "Ranked by gross revenue from the billing ledger."
                : "No charges recorded yet — ranked by saved-subscribers until revenue accrues."}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
