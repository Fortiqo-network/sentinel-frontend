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
      .then((rows) => {
        if (active) setTopAgents(rows);
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : data ? (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Revenue &amp; usage</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Platform revenue"
                value={`${data.platform_revenue_credits.toLocaleString("en-US")} Cr`}
                sub="Cumulative 2% take"
                accent
              />
              <StatCard
                label="GMV"
                value={`${data.gmv_credits.toLocaleString("en-US")} Cr`}
                sub="Gross spent on agent calls"
              />
              <StatCard
                label="Developer earnings"
                value={`${data.developer_earnings_credits.toLocaleString("en-US")} Cr`}
                sub="Net accrued to developers"
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Identity</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total users" value={data.users_total} accent />
              <StatCard label="Developers" value={data.developers} />
              <StatCard label="Buyers" value={data.buyers} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Catalogue</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total agents" value={data.agents_total} />
              <StatCard label="Live agents" value={data.agents_live} accent />
              <StatCard label="Disabled agents" value={data.agents_disabled} sub="Hidden from marketplace" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Endpoint liveness</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Healthy endpoints" value={data.health_active} />
              <StatCard label="Inactive endpoints" value={data.health_inactive} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Agents by lifecycle status</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {statusEntries.length === 0 ? (
                <p className="px-6 py-5 text-sm text-slate-500">No agents yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {statusEntries.map(([status, count]) => (
                      <tr key={status}>
                        <td className="px-6 py-3 font-medium text-slate-700">{titleCase(status)}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-900">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Top agents by engagement</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              {topAgents.length === 0 ? (
                <p className="px-6 py-5 text-sm text-slate-500">No agents yet.</p>
              ) : (
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Trust</th>
                      <th className="px-4 py-3 text-right font-medium">Subscribers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topAgents.map((a, i) => (
                      <tr key={a.id}>
                        <td className="px-4 py-3 tabular-nums text-slate-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{a.name}</div>
                          <div className="text-xs text-slate-400">{a.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{a.owner_email ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{a.status}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                          {a.trust_score != null ? Math.round(a.trust_score * 100) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-900">{a.subscribers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Revenue and usage are live (cumulative, from the billing ledger). Agents above are ranked
            by saved-subscribers; per-agent <span className="font-medium">revenue</span> ranking and
            time-series charts land once the metering rollup carries agent_id.
          </div>
        </>
      ) : null}
    </div>
  );
}
