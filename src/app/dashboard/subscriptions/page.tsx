"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TrustScore } from "@/components/ui/trust-score";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "@/components/ui/star";
import { cn } from "@/lib/utils/cn";
import { listSubscriptions, unsubscribe } from "@/lib/api/subscriptions";
import type { Agent } from "@/types/agent";

/**
 * Buyer "My Agents": the agents the buyer has subscribed to (starred), shown as
 * cards for direct access without browsing the marketplace. Unsubscribing
 * removes the agent from the list.
 */
export default function SubscriptionsPage(): React.JSX.Element {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [removing, setRemoving] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listSubscriptions();
      if (!cancelled) {
        setAgents(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(id: string): Promise<void> {
    setRemoving(id);
    try {
      await unsubscribe(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Buyer"
        title="My Agents"
        description="Agents you've saved for quick access. Star agents in the marketplace to add them here."
        actions={
          <Button asChild variant="outline">
            <Link href="/agents">Browse marketplace</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <EmptyState
            title="No saved agents yet"
            description="Find agents in the marketplace and tap the star to pin them here for one-click access."
            action={
              <Button asChild>
                <Link href="/agents">Explore agents</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar src={agent.icon} name={agent.name} size="md" />
                  <div className="min-w-0">
                    <Link href={`/agents/${agent.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600">
                      {agent.name}
                    </Link>
                    {agent.seller && <p className="truncate text-xs text-slate-400">by {agent.seller}</p>}
                  </div>
                </div>
                <TrustScore score={agent.trustScore} size="sm" />
              </div>
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">{agent.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {agent.vertical && <Badge variant="info">{agent.vertical}</Badge>}
                {agent.pricing?.priceCredits != null && (
                  <Badge>{agent.pricing.priceCredits.toLocaleString("en-IN")} Cr / call</Badge>
                )}
                {agent.isDiscontinued ? (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Discontinued
                  </span>
                ) : agent.health?.status === "inactive" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-500">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Inactive
                  </span>
                ) : agent.health?.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/agents/${agent.id}`}>Open</Link>
                </Button>
                <button
                  type="button"
                  disabled={removing === agent.id}
                  onClick={() => handleRemove(agent.id)}
                  title="Starred — click to remove"
                  aria-label="Remove from My Agents"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-400 transition-colors hover:bg-amber-100 disabled:opacity-50",
                  )}
                >
                  <StarIcon filled />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
