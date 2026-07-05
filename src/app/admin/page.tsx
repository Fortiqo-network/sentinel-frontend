"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import {
  getAnalytics,
  enableAllAgents,
  getPlatformSettings,
  updatePlatformSettings,
  getDiagnostics,
  type AdminAnalytics,
  type AdminDiagnostics,
} from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

/**
 * Admin overview — headline platform counts plus quick links into the agents,
 * sellers, and users consoles. The bulk "Enable all agents" action lives here
 * since it touches the whole catalogue rather than a single row.
 */
export default function AdminOverviewPage(): React.JSX.Element {
  const [data, setData] = React.useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [enabling, setEnabling] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [allowHttp, setAllowHttp] = React.useState<boolean | null>(null);
  const [savingHttp, setSavingHttp] = React.useState(false);
  const [diag, setDiag] = React.useState<AdminDiagnostics | null>(null);

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
    void getPlatformSettings()
      .then((s) => setAllowHttp(s.allow_http_agents))
      .catch(() => undefined);
    void getDiagnostics()
      .then(setDiag)
      .catch(() => undefined);
  }, [load]);

  async function toggleAllowHttp(): Promise<void> {
    if (allowHttp === null) return;
    const next = !allowHttp;
    setSavingHttp(true);
    try {
      const result = await updatePlatformSettings({ allow_http_agents: next });
      setAllowHttp(result.allow_http_agents);
    } catch (err) {
      setNotice(isSentinelApiError(err) ? err.message : "Could not update setting.");
    } finally {
      setSavingHttp(false);
    }
  }

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
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-gold/30 dark:bg-gold/15 dark:text-gold">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-porcelain/10 dark:bg-ink-700" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={data.users_total} sub={`${data.sellers} sellers · ${data.buyers} buyers`} accent />
            <StatCard label="Agents live" value={data.agents_live} sub={`${data.agents_total} total`} />
            <StatCard label="Disabled agents" value={data.agents_disabled} sub="Hidden from marketplace" />
            <StatCard label="Endpoints healthy" value={data.health_active} sub={`${data.health_inactive} inactive`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <ConsoleLink href="/admin/agents" title="Agents" desc="Enable, disable, and publish agents." />
            <ConsoleLink href="/admin/sellers" title="Sellers" desc="Review balances and settle earnings." />
            <ConsoleLink href="/admin/users" title="Users" desc="Browse and oversee platform users." />
          </div>

          {diag && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-porcelain">Verification pipeline</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-porcelain/50">
                For agents to reach <span className="font-medium">verified/live</span>, verify must be
                reachable and the event-signature config must match.
              </p>
              <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <DiagRow label="Verify service reachable" ok={diag.verify_reachable} />
                <DiagRow label="Billing service reachable" ok={diag.billing_reachable} />
                <DiagRow
                  label="Event signing (Ed25519)"
                  ok={diag.ed25519_required}
                  okText="Required"
                  badText="Off"
                  neutral
                />
                <DiagRow
                  label="Event signing (HMAC)"
                  ok={diag.hmac_required}
                  okText="Required"
                  badText="Off"
                  neutral
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-ink-700 dark:text-porcelain/70">
                  {diag.agents_verifying} verifying
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-ink-700 dark:text-porcelain/70">
                  {diag.agents_submitted} submitted
                </span>
                <span
                  className={
                    "rounded-full px-2.5 py-1 " +
                    (diag.agents_stuck > 0
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300")
                  }
                >
                  {diag.agents_stuck} stuck
                </span>
              </div>
              {!diag.verify_reachable && (
                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300">
                  Verify is unreachable — agents will sit in verifying. Confirm the verify service and
                  its Celery worker are running.
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-porcelain">Platform settings</h2>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-porcelain">Allow http:// agent endpoints</div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-porcelain/50">
                  When on, non-TLS (http) endpoints pass verification, ownership, and health checks.
                  Private/loopback addresses are always blocked. Turn off to require https for all new agents.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowHttp === true}
                disabled={allowHttp === null || savingHttp}
                onClick={toggleAllowHttp}
                className={
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 " +
                  (allowHttp ? "bg-indigo-500 dark:bg-gold" : "bg-slate-300 dark:bg-porcelain/20")
                }
              >
                <span
                  className={
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform dark:bg-ink-800 " +
                    (allowHttp ? "translate-x-5" : "translate-x-0.5")
                  }
                />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function DiagRow({
  label,
  ok,
  okText = "OK",
  badText = "Unreachable",
  neutral = false,
}: {
  label: string;
  ok: boolean;
  okText?: string;
  badText?: string;
  neutral?: boolean;
}): React.JSX.Element {
  const dot = ok ? "bg-emerald-500" : neutral ? "bg-slate-300 dark:bg-porcelain/30" : "bg-rose-500";
  const text = ok
    ? "text-emerald-600 dark:text-emerald-400"
    : neutral
      ? "text-slate-400 dark:text-porcelain/40"
      : "text-rose-600 dark:text-rose-400";
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-600 dark:text-porcelain/70">{label}</span>
      <span className={"inline-flex items-center gap-1.5 text-xs font-medium " + text}>
        <span className={"h-2 w-2 rounded-full " + dot} />
        {ok ? okText : badText}
      </span>
    </div>
  );
}

function ConsoleLink({ href, title, desc }: { href: string; title: string; desc: string }): React.JSX.Element {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-porcelain/10 dark:bg-ink-800 dark:hover:border-gold/30 dark:hover:bg-gold/15"
    >
      <div className="text-base font-semibold text-slate-900 dark:text-porcelain">{title}</div>
      <p className="mt-1 text-sm text-slate-500 dark:text-porcelain/50">{desc}</p>
    </Link>
  );
}
