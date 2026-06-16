"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import { getAnalytics, enableAllAgents, type AdminAnalytics } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

/**
 * Admin overview — headline platform counts plus quick links into the agents,
 * developers, and users consoles. The bulk "Enable all agents" action lives here
 * since it touches the whole catalogue rather than a single row.
 */
export default function AdminOverviewPage(): React.JSX.Element {
  const [data, setData] = React.useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [enabling, setEnabling] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setData(await getAnalytics());
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load platform overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleEnableAll(): Promise<void> {
    setEnabling(true);
    setNotice(null);
    try {
      const count = await enableAllAgents();
      setNotice(count > 0 ? `Re-enabled ${count} agent${count === 1 ? "" : "s"}.` : "All agents were already enabled.");
      await load();
    } catch (err) {
      setNotice(isSentinelApiError(err) ? err.message : "Could not enable all agents.");
    } finally {
      setEnabling(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Identity, catalogue, and liveness at a glance."
        actions={
          <Button variant="outline" onClick={handleEnableAll} disabled={enabling}>
            {enabling ? "Enabling…" : "Enable all agents"}
          </Button>
        }
      />

      {notice && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={data.users_total} sub={`${data.developers} developers · ${data.buyers} buyers`} accent />
            <StatCard label="Agents live" value={data.agents_live} sub={`${data.agents_total} total`} />
            <StatCard label="Disabled agents" value={data.agents_disabled} sub="Hidden from marketplace" />
            <StatCard label="Endpoints healthy" value={data.health_active} sub={`${data.health_inactive} inactive`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <ConsoleLink href="/admin/agents" title="Agents" desc="Enable, disable, and publish agents." />
            <ConsoleLink href="/admin/developers" title="Developers" desc="Review balances and settle earnings." />
            <ConsoleLink href="/admin/users" title="Users" desc="Browse and oversee platform users." />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ConsoleLink({ href, title, desc }: { href: string; title: string; desc: string }): React.JSX.Element {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
    >
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>
  );
}
