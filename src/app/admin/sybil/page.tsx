"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { getSybilClusters, type SybilCluster } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

function reasonLabel(reason: SybilCluster["reason"]): string {
  return reason === "shared_ip" ? "Shared signup IP" : "Email alias";
}

/**
 * Admin Sybil / multi-account console — surfaces clusters of accounts likely
 * controlled by one actor (shared signup IP or canonical email) for review.
 */
export default function AdminSybilPage(): React.JSX.Element {
  const [clusters, setClusters] = React.useState<SybilCluster[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getSybilClusters()
      .then((r) => active && setClusters(r.clusters))
      .catch((err) =>
        active && setError(isSentinelApiError(err) ? err.message : "Unable to load clusters."),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Multi-account detection"
        description={`${clusters.length} suspected cluster${clusters.length === 1 ? "" : "s"} flagged for review.`}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400 dark:text-porcelain/40">Loading…</div>
      ) : clusters.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-porcelain/10 dark:bg-ink-800 dark:text-porcelain/40">
          No suspicious account clusters detected.
        </div>
      ) : (
        <div className="space-y-4">
          {clusters.map((c) => (
            <div key={`${c.reason}-${c.key}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-porcelain/10 dark:bg-ink-900">
                <div className="flex items-center gap-2">
                  <Badge variant={c.reason === "shared_ip" ? "destructive" : "warning"}>
                    {reasonLabel(c.reason)}
                  </Badge>
                  <span className="font-mono text-xs text-slate-500 dark:text-porcelain/50">{c.key}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-porcelain/50">{c.size} accounts</span>
              </div>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-porcelain/40">
                  <tr>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Signup IP</th>
                    <th className="px-4 py-2 font-medium">Active</th>
                    <th className="px-4 py-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
                  {c.accounts.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2 text-slate-700 dark:text-porcelain/70">{a.email}</td>
                      <td className="px-4 py-2 text-slate-500 dark:text-porcelain/50">{a.display_name ?? "—"}</td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-500 dark:text-porcelain/50">{a.signup_ip ?? "—"}</td>
                      <td className="px-4 py-2">
                        {a.is_active ? (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">active</span>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-porcelain/40">blocked</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400 dark:text-porcelain/40">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
