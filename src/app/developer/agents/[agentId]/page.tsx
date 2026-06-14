"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustScore } from "@/components/ui/trust-score";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { AccessControlCard } from "@/components/portal/AccessControlCard";
import { ConfirmDeleteModal } from "@/components/portal/ConfirmDeleteModal";
import {
  getMyAgent,
  payListing,
  retireAgent,
  deleteAgent,
  getAgentMetrics,
  getAgentAudience,
  blockUserId,
  unblockUser,
  type DeveloperAgent,
  type DeveloperAgentStatus,
  type AgentMetrics,
  type AudienceUser,
} from "@/lib/api/developer";
import { cn } from "@/lib/utils/cn";

const STATUS_VARIANT: Record<DeveloperAgentStatus, "default" | "success" | "warning" | "destructive"> = {
  draft: "default",
  submitted: "warning",
  verifying: "warning",
  verified: "success",
  rejected: "destructive",
  live: "success",
  suspended: "destructive",
  retired: "default",
};

const PAGE_SIZE = 8;

function trialLabel(agent: DeveloperAgent): { label: string; tone: "ok" | "trial" | "expired"; showPay: boolean } {
  if (agent.listingPaid) return { label: "Listing fee paid", tone: "ok", showPay: false };
  if (!agent.trialEndsAt) return { label: "Listed", tone: "ok", showPay: false };
  const days = Math.ceil((new Date(agent.trialEndsAt).getTime() - Date.now()) / 86_400_000);
  if (days > 0) return { label: `Free trial — ${days} day${days === 1 ? "" : "s"} left`, tone: "trial", showPay: true };
  return { label: "Trial ended — pay to stay listed", tone: "expired", showPay: true };
}

function formatCredits(n: number): string {
  return `${n.toLocaleString("en-IN")} Cr`;
}

/**
 * Developer agent detail. A cinematic header over the agent's live state, headline
 * metrics, listing status, a paginated audience table with inline access control,
 * and a danger zone to disable the agent.
 */
export default function DeveloperAgentDetailPage(): React.JSX.Element {
  const params = useParams<{ agentId: string }>();
  const router = useRouter();
  const agentId = params.agentId;

  const [agent, setAgent] = React.useState<DeveloperAgent | null>(null);
  const [metrics, setMetrics] = React.useState<AgentMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [disabling, setDisabling] = React.useState(false);

  const [audience, setAudience] = React.useState<AudienceUser[]>([]);
  const [audienceTotal, setAudienceTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [audienceLoading, setAudienceLoading] = React.useState(true);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);

  const loadAudience = React.useCallback(
    async (p: number) => {
      setAudienceLoading(true);
      try {
        const res = await getAgentAudience(agentId, p, PAGE_SIZE);
        setAudience(res.users);
        setAudienceTotal(res.total);
      } catch {
        setAudience([]);
        setAudienceTotal(0);
      } finally {
        setAudienceLoading(false);
      }
    },
    [agentId],
  );

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [agentRes, metricsRes] = await Promise.allSettled([getMyAgent(agentId), getAgentMetrics(agentId)]);
      if (cancelled) return;
      if (agentRes.status === "fulfilled") setAgent(agentRes.value);
      else setNotFound(true);
      if (metricsRes.status === "fulfilled") setMetrics(metricsRes.value);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  React.useEffect(() => {
    void loadAudience(page);
  }, [page, loadAudience]);

  async function handlePay(): Promise<void> {
    setPaying(true);
    try {
      setAgent(await payListing(agentId));
    } finally {
      setPaying(false);
    }
  }

  async function handleDisable(): Promise<void> {
    if (!agent) return;
    setDisabling(true);
    try {
      if (agent.status === "draft" || agent.status === "rejected") await deleteAgent(agentId);
      else await retireAgent(agentId);
      router.push("/developer/agents");
      router.refresh();
    } finally {
      setDisabling(false);
    }
  }

  async function toggleBlock(u: AudienceUser): Promise<void> {
    setRowBusy(u.userId);
    try {
      if (u.blocked) await unblockUser(agentId, u.userId);
      else await blockUserId(agentId, u.userId);
      await loadAudience(page);
    } finally {
      setRowBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !agent) {
    return (
      <Card>
        <EmptyState
          title="Agent not found"
          description="This agent doesn't exist or you don't own it."
          action={<Button asChild><Link href="/developer/agents">Back to my agents</Link></Button>}
        />
      </Card>
    );
  }

  const trial = trialLabel(agent);
  const totalPages = Math.max(1, Math.ceil(audienceTotal / PAGE_SIZE));

  return (
    <div className="space-y-8">
      {/* Cinematic header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-ink-950 p-6 text-porcelain sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-aurora-radial opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={agent.slug} name={agent.name} size="xl" />
            <div>
              <p className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">Developer · Agent</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-porcelain">{agent.name}</h1>
              <p className="font-mono text-sm text-porcelain/45">/{agent.slug}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[agent.status]}>{agent.status}</Badge>
                <Badge variant="info">{agent.tier}</Badge>
                {agent.vertical && <Badge>{agent.vertical}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {agent.trustScore !== null && <TrustScore score={agent.trustScore} size="md" showLabel />}
            <div className="flex flex-col gap-2">
              {agent.status === "live" && (
                <a
                  href={`/agents/${agent.slug}`}
                  className="rounded-lg bg-gold px-4 py-2 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90"
                >
                  View public page
                </a>
              )}
              <Link
                href="/developer/agents"
                className="rounded-lg border border-porcelain/20 px-4 py-2 text-center text-sm font-medium text-porcelain/80 transition-colors hover:bg-porcelain/10"
              >
                All agents
              </Link>
            </div>
          </div>
        </div>
        {agent.description && <p className="relative mt-5 max-w-2xl text-sm leading-relaxed text-porcelain/60">{agent.description}</p>}
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unique users" value={metrics ? metrics.uniqueUsers.toLocaleString("en-IN") : "—"} sub="Engaged this agent" accent="indigo" />
        <StatCard label="Invocations (30d)" value={metrics ? metrics.invocations30d.toLocaleString("en-IN") : "—"} sub="Successful calls" accent="emerald" />
        <StatCard label="Total earnings" value={metrics ? formatCredits(metrics.earningsTotalCredits) : "—"} sub="All-time" accent="amber" />
        <StatCard label="Earnings (30d)" value={metrics ? formatCredits(metrics.earnings30dCredits) : "—"} sub="Last 30 days" accent="amber" />
      </div>
      {metrics && metrics.invocationsTotal === 0 && (
        <p className="-mt-4 text-xs text-slate-400">Invocation &amp; earnings metrics populate as your agent receives calls.</p>
      )}

      {/* Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Listing</CardTitle>
          <CardDescription>First 7 days free; a one-time $10 listing fee keeps the agent listed after the trial.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <Badge variant={trial.tone === "ok" ? "success" : trial.tone === "trial" ? "info" : "warning"}>{trial.label}</Badge>
          {trial.showPay && (
            <Button onClick={handlePay} disabled={paying}>
              {paying ? "Processing…" : "Pay $10 listing fee"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Audience + inline access control */}
      <Card>
        <CardHeader>
          <CardTitle>Audience &amp; access</CardTitle>
          <CardDescription>
            Users who&apos;ve engaged this agent. Block anyone misusing it — blocked users get a 403 and aren&apos;t charged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {audienceLoading ? (
            <p className="py-6 text-sm text-slate-400">Loading audience…</p>
          ) : audience.length === 0 ? (
            <EmptyState title="No users yet" description="When buyers save or call this agent, they'll appear here." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-medium">User</th>
                      <th className="px-3 py-2 font-medium">Since</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {audience.map((u) => (
                      <tr key={u.userId} className={cn("transition-colors hover:bg-slate-50", u.blocked && "bg-rose-50/40")}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.displayName || u.email} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-800">{u.displayName || u.email}</p>
                              <p className="truncate text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-500">
                          {new Date(u.since).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-3">
                          {u.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="success">Active</Badge>}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Button
                            size="sm"
                            variant={u.blocked ? "ghost" : "destructive"}
                            disabled={rowBusy === u.userId}
                            onClick={() => toggleBlock(u)}
                          >
                            {rowBusy === u.userId ? "…" : u.blocked ? "Unblock" : "Block"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{audienceTotal.toLocaleString("en-IN")} user{audienceTotal === 1 ? "" : "s"}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-xs">Page {page} of {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Block by email + blocked list */}
      <AccessControlCard agentId={agent.id} />

      {/* Danger zone */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-700">Danger zone</CardTitle>
          <CardDescription>
            Disable this agent to delist it from the marketplace.{" "}
            {agent.status === "draft" || agent.status === "rejected"
              ? "This draft will be permanently deleted."
              : "The agent is retired (delisted) but its record and history are kept."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDisableOpen(true)}>Disable agent</Button>
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        onConfirm={handleDisable}
        busy={disabling}
        title="Disable this agent?"
        confirmLabel="Disable agent"
        description={
          <p>
            <span className="font-semibold text-slate-800">{agent.name}</span> will be removed from the marketplace
            immediately and can no longer be invoked.
            {agent.status === "draft" || agent.status === "rejected"
              ? " This draft will be permanently deleted."
              : " Its record and history are retained."}
          </p>
        }
      />
    </div>
  );
}
