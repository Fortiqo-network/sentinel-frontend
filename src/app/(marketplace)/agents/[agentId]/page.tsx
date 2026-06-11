import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TrustBadge } from "@/components/marketplace/TrustBadge";
import { formatDate } from "@/lib/utils/format";
import { getAgentBySlug } from "@/lib/api/agents";
import { UseAgentButton } from "@/components/marketplace/UseAgentButton";
import type { Agent } from "@/types/agent";

// ── Helpers ───────────────────────────────────────────────────────────────────

type CertLevel = "certified_managed" | "certified" | "provisional" | "uncertified";

function deriveCert(agent: Agent): CertLevel {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "uncertified";
}

const CERT_CONFIG: Record<CertLevel, { label: string; cls: string }> = {
  certified_managed: { label: "Certified Managed", cls: "border-teal-500/25 bg-teal-500/10 text-teal-400" },
  certified:         { label: "Certified",         cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  provisional:       { label: "Provisional",       cls: "border-amber-500/25 bg-amber-500/10 text-amber-400" },
  uncertified:       { label: "Uncertified",       cls: "border-sen-border bg-sen-surface-2 text-sen-muted" },
};

function trustColor(score: number): string {
  if (score >= 75) return "#4ADE80";
  if (score >= 50) return "#FBBF24";
  return "#F87171";
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<Metadata> {
  const { agentId } = await params;
  const agent = await getAgentBySlug(agentId);
  if (agent == null) return { title: "Agent not found — Sentinel" };
  return { title: `${agent.name} — Sentinel`, description: agent.description };
}

// ── Score meter ───────────────────────────────────────────────────────────────

function ScoreMeter({ score }: { score: number }): React.JSX.Element {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = trustColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`Trust score ${score}/100`}>
        {/* Track */}
        <circle cx="48" cy="48" r={r} fill="none" style={{ stroke: "rgb(var(--sen-border))" }} strokeWidth="7" />
        {/* Arc */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 48 48)"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Score */}
        <text
          x="48" y="52"
          textAnchor="middle"
          style={{ fontSize: "22px", fontWeight: 700, fill: color, fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace" }}
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-mono text-sen-muted">/ 100</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<React.JSX.Element> {
  const { agentId } = await params;
  const agent = await getAgentBySlug(agentId);
  if (agent == null) notFound();

  const certLevel = deriveCert(agent);
  const cert = CERT_CONFIG[certLevel];
  const trustBadgeCert = certLevel === "uncertified" ? ("uncertified" as const) : certLevel;
  const pricePoints = agent.pricing?.pricePoints;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-sen-muted">
        <Link href="/agents" className="hover:text-sen-text transition-colors">Marketplace</Link>
        <span className="text-sen-border-hi">/</span>
        <span className="font-medium text-sen-text">{agent.name}</span>
      </nav>

      {/* Main card */}
      <div className="rounded-2xl border border-sen-border bg-sen-surface p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Icon + name + badges */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sen-border bg-sen-surface-2 text-3xl"
              aria-hidden="true"
            >
              {agent.icon ?? "🤖"}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-sen-text">{agent.name}</h1>
              <p className="font-mono text-sm text-sen-muted">/{agent.slug}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cert.cls}`}>
                  ◈ {cert.label}
                </span>
                <span className="inline-flex items-center rounded-full border border-sen-border bg-sen-surface-2 px-2.5 py-0.5 text-xs font-medium text-sen-muted">
                  {agent.tier === "managed" ? "Managed · Tier A" : "Routed · Tier B"}
                </span>
                {agent.vertical != null && (
                  <span className="inline-flex items-center rounded-full border border-sen-border bg-sen-surface-2 px-2.5 py-0.5 text-xs font-medium text-sen-muted">
                    {agent.vertical}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Score + dates */}
          <div className="flex items-start gap-6 sm:flex-col sm:items-end shrink-0">
            <ScoreMeter score={agent.trustScore} />
            <dl className="text-right text-xs font-mono text-sen-muted space-y-1">
              {agent.lastVerifiedAt != null && <div>Verified {formatDate(agent.lastVerifiedAt)}</div>}
              {agent.publishedAt != null && <div>Published {formatDate(agent.publishedAt)}</div>}
            </dl>
          </div>
        </div>

        {/* Description */}
        <p className="mt-5 text-sm text-sen-muted leading-relaxed">{agent.description}</p>

        {/* Tags */}
        {agent.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-sen-border bg-sen-surface-2 px-2.5 py-0.5 text-xs font-medium text-sen-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lower grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Verification panel */}
        <section className="lg:col-span-2 rounded-2xl border border-sen-border bg-sen-surface p-6">
          <h2 className="text-base font-semibold text-sen-text">Verification Report</h2>
          <p className="mt-0.5 text-xs text-sen-muted">
            Independently verified via Sentinel&apos;s 4-stage security pipeline.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-sen-border bg-sen-surface-2 px-4 py-4">
            <div>
              <span className="text-sm font-medium text-sen-text">Overall Trust Score</span>
              <p className="mt-0.5 text-xs text-sen-muted">
                Aggregated across static, supply-chain, dynamic, and red-team stages.
              </p>
            </div>
            <TrustBadge score={agent.trustScore} size="md" certLevel={trustBadgeCert} />
          </div>

          {/* Pipeline stages summary */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Static Analysis", icon: "⬡" },
              { label: "Supply Chain",    icon: "⬡" },
              { label: "Dynamic Testing", icon: "⬡" },
              { label: "Red-Team Eval",   icon: "⬡" },
            ].map(({ label, icon }) => (
              <div key={label} className="rounded-lg border border-sen-border bg-sen-bg p-3 text-center">
                <span className="text-base" aria-hidden="true">{icon}</span>
                <p className="mt-1 text-[10px] font-mono text-sen-muted leading-tight">{label}</p>
                <div className="mt-1.5 flex justify-center">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
                    <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing + CTA */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-sen-border bg-sen-surface p-6">
            <h2 className="text-base font-semibold text-sen-text">Pricing</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-sen-text">
                {pricePoints != null ? `${pricePoints}` : "Free"}
              </span>
              {pricePoints != null && (
                <span className="text-sm font-mono text-sen-muted">pts / call</span>
              )}
            </div>
            <p className="mt-1 text-xs text-sen-muted">
              Charged from your Sentinel wallet on success only. No commitment.
            </p>

            <div className="mt-5">
              <UseAgentButton
                developer={agent.developer ?? ""}
                slug={agent.slug}
                priceLabel={pricePoints != null ? `${pricePoints} pts / call` : "Free"}
              />
            </div>

            <Link
              href={`/playground?agent=${agent.slug}`}
              className="mt-2 block w-full rounded-xl border border-sen-border bg-sen-bg py-2.5 text-center text-sm font-medium text-sen-text hover:bg-sen-surface-2 transition-colors"
            >
              Try in Playground
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
