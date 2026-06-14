"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustScore } from "@/components/ui/trust-score";
import { EmptyState } from "@/components/ui/empty-state";
import { AccessControlCard } from "@/components/portal/AccessControlCard";
import { ConfirmDeleteModal } from "@/components/portal/ConfirmDeleteModal";
import {
  getMyAgent,
  payListing,
  retireAgent,
  deleteAgent,
  type DeveloperAgent,
  type DeveloperAgentStatus,
} from "@/lib/api/developer";

interface TrialInfo {
  label: string;
  tone: "ok" | "trial" | "expired";
  showPay: boolean;
}

function trialInfo(agent: DeveloperAgent): TrialInfo {
  if (agent.listingPaid) return { label: "Listing fee paid", tone: "ok", showPay: false };
  if (!agent.trialEndsAt) return { label: "Listed", tone: "ok", showPay: false };
  const end = new Date(agent.trialEndsAt).getTime();
  const days = Math.ceil((end - Date.now()) / 86_400_000);
  if (days > 0) return { label: `Free trial — ${days} day${days === 1 ? "" : "s"} left`, tone: "trial", showPay: true };
  return { label: "Trial ended — pay to stay listed", tone: "expired", showPay: true };
}

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
  const router = useRouter();
  const agentId = params.agentId;
  const [agent, setAgent] = React.useState<DeveloperAgent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [disabling, setDisabling] = React.useState(false);

  async function handlePay(): Promise<void> {
    setPaying(true);
    try {
      const updated = await payListing(agentId);
      setAgent(updated);
    } finally {
      setPaying(false);
    }
  }

  async function handleDisable(): Promise<void> {
    if (!agent) return;
    setDisabling(true);
    try {
      if (agent.status === "draft" || agent.status === "rejected") {
        await deleteAgent(agentId);
      } else {
        await retireAgent(agentId);
      }
      router.push("/developer/agents");
      router.refresh();
    } finally {
      setDisabling(false);
    }
  }

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

  const trial = trialInfo(agent);

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

      <Card>
        <CardHeader>
          <CardTitle>Listing</CardTitle>
          <CardDescription>Your first 7 days are free; a one-time $10 listing fee keeps the agent listed after the trial.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <Badge
            variant={trial.tone === "ok" ? "success" : trial.tone === "trial" ? "info" : "warning"}
          >
            {trial.label}
          </Badge>
          {trial.showPay && (
            <Button onClick={handlePay} disabled={paying}>
              {paying ? "Processing…" : "Pay $10 listing fee"}
            </Button>
          )}
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

      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-700">Danger zone</CardTitle>
          <CardDescription>
            Disable this agent to delist it from the marketplace. {agent.status === "draft" || agent.status === "rejected"
              ? "This draft will be permanently deleted."
              : "The agent is retired (delisted) but its record and history are kept."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDisableOpen(true)}>
            Disable agent
          </Button>
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
          <>
            <p>
              <span className="font-semibold text-slate-800">{agent.name}</span> will be removed from the
              marketplace immediately and can no longer be invoked.
              {agent.status === "draft" || agent.status === "rejected"
                ? " This draft will be permanently deleted."
                : " Its record and history are retained."}
            </p>
          </>
        }
      />
    </div>
  );
}
