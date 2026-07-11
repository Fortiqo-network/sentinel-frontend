"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TrustScore } from "@/components/ui/trust-score";
import { Avatar } from "@/components/ui/avatar";
import { SellerComposer } from "@/components/seller/SellerComposer";
import {
  listMyAgents,
  getEarnings,
  type SellerAgent,
  type SellerAgentStatus,
} from "@/lib/api/seller";

const STATUS_VARIANT: Record<SellerAgentStatus, "default" | "success" | "warning" | "destructive"> = {
  draft: "default",
  submitted: "warning",
  verifying: "warning",
  verified: "success",
  rejected: "destructive",
  live: "success",
  suspended: "destructive",
  retired: "default",
};

/**
 * Seller portal home. A cinematic header over the seller's headline metrics,
 * quick actions, and an agent card grid linking into each agent's detail page.
 * Earnings degrade gracefully (zero) when billing is unavailable.
 */
export default function SellerPage(): React.JSX.Element {
  const { user } = useAuthStore();
  const [agents, setAgents] = React.useState<SellerAgent[]>([]);
  const [payableCredits, setPayableCredits] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [a, e] = await Promise.allSettled([listMyAgents(), getEarnings()]);
      if (cancelled) return;
      if (a.status === "fulfilled") setAgents(a.value);
      if (e.status === "fulfilled") setPayableCredits(e.value.payableCredits);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = agents.length;
  const liveCount = agents.filter((x) => x.status === "verified" || x.status === "live").length;
  const pending = agents.filter((x) => x.status === "submitted" || x.status === "verifying").length;
  const scored = agents.filter((x) => x.trustScore !== null);
  const avgTrust =
    scored.length > 0 ? Math.round(scored.reduce((s, x) => s + (x.trustScore ?? 0), 0) / scored.length) : null;
  const firstName = (user?.displayName ?? "there").split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Cinematic header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-ink-950 p-6 text-porcelain sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-aurora-radial opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">Seller portal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-porcelain">Welcome back, {firstName}</h1>
            <p className="mt-1 max-w-xl text-sm text-porcelain/55">
              Publish agents, watch them earn trust, and get paid on delivery. You keep 97% — the platform fee is a flat 3%.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/seller/agents/new"
              className="rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90"
            >
              + Publish agent
            </Link>
            <Link
              href="/seller/earnings"
              className="rounded-lg border border-porcelain/20 px-4 py-2.5 text-sm font-medium text-porcelain/80 transition-colors hover:bg-porcelain/10"
            >
              Earnings
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total agents" value={loading ? "…" : String(total)} sub="All statuses" accent="indigo" />
        <StatCard label="Verified / live" value={loading ? "…" : String(liveCount)} sub="In the marketplace" accent="emerald" />
        <StatCard label="Pending verification" value={loading ? "…" : String(pending)} sub="In pipeline" accent="amber" />
        <StatCard
          label="Payable earnings"
          value={loading ? "…" : `${payableCredits.toLocaleString("en-IN")} Cr`}
          sub={avgTrust !== null ? `Avg trust ${avgTrust}/100` : "Eligible for payout"}
          accent="amber"
        />
      </div>

      {/* Feed composer */}
      <SellerComposer />

      {/* Agents grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-porcelain">Your agents</h2>
          {agents.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/seller/agents">Manage all</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-ink-700" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card>
            <EmptyState
              title="No agents yet"
              description="Publish your first agent to start earning. Your first 7 days are free."
              action={<Button asChild><Link href="/seller/agents/new">+ Publish your first agent</Link></Button>}
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/seller/agents/${agent.id}`} className="group">
                <Card className="flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-slate-300 dark:group-hover:border-porcelain/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={agent.slug} name={agent.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-porcelain dark:group-hover:text-gold">{agent.name}</p>
                        <p className="truncate font-mono text-xs text-slate-400 dark:text-porcelain/40">/{agent.slug}</p>
                      </div>
                    </div>
                    {agent.trustScore !== null && <TrustScore score={agent.trustScore} size="sm" />}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {agent.isDeleted && <Badge variant="warning">Archived</Badge>}
                    <Badge variant={STATUS_VARIANT[agent.status]}>{agent.status}</Badge>
                    <Badge variant="info">{agent.tier}</Badge>
                    {agent.vertical && <Badge>{agent.vertical}</Badge>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
