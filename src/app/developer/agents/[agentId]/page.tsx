"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustScore } from "@/components/ui/trust-score";
import { EmptyState } from "@/components/ui/empty-state";
import { AccessControlCard } from "@/components/portal/AccessControlCard";
import { getMyAgent, type DeveloperAgent, type DeveloperAgentStatus } from "@/lib/api/developer";

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

/**
 * Developer agent detail. Shows the owned agent's status and metadata and hosts
 * per-agent access control (block/unblock users who misuse the agent).
 */
export default function DeveloperAgentDetailPage(): React.JSX.Element {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const [agent, setAgent] = React.useState<DeveloperAgent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await getMyAgent(agentId);
        if (!cancelled) setAgent(result);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (loading) {
    return <div className="space-y-4"><div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-50" /><div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-50" /></div>;
  }

  if (notFound || !agent) {
    return (
      <Card>
        <EmptyState
          title="Agent not found"
          description="This agent does not exist or you don't own it."
          action={<Button asChild><Link href="/developer/agents">Back to my agents</Link></Button>}
        />
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Developer · Agent"
        title={agent.name}
        description={agent.description ?? "No description yet."}
        actions={
          <>
            <Button asChild variant="outline"><Link href="/developer/agents">All agents</Link></Button>
            {agent.status === "live" && (
              <Button asChild><Link href={`/agents/${agent.id}`}>View public page</Link></Button>
            )}
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          {agent.trustScore !== null && <TrustScore score={agent.trustScore} size="md" showLabel />}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[agent.status]}>{agent.status}</Badge>
              <Badge variant="info">{agent.tier}</Badge>
              {agent.vertical && <Badge>{agent.vertical}</Badge>}
            </div>
            <p className="text-xs text-slate-400">
              Slug <span className="font-mono text-slate-600">{agent.slug}</span> · ID{" "}
              <span className="font-mono text-slate-600">{agent.id.slice(0, 8)}…</span>
            </p>
            {agent.tags.length > 0 && (
              <p className="text-xs text-slate-500">{agent.tags.join(" · ")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {agent.status === "draft" && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to verify?</CardTitle>
            <CardDescription>Submit this draft into the verification pipeline to earn a trust score and go live.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <AccessControlCard agentId={agent.id} />
    </div>
  );
}
