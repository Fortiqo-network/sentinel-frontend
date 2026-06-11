import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

// ── Trust ring SVG ────────────────────────────────────────────────────────────

interface TrustRingProps {
  score: number;
  icon?: string;
}

function trustColor(score: number): string {
  if (score >= 75) return "#4ADE80";
  if (score >= 50) return "#FBBF24";
  return "#F87171";
}

function TrustRing({ score, icon }: TrustRingProps): React.JSX.Element {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = trustColor(score);

  return (
    <div className="relative h-12 w-12 shrink-0" role="img" aria-label={`Trust score ${score}/100`}>
      <svg width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0" aria-hidden="true">
        {/* Track */}
        <circle cx="24" cy="24" r={r} fill="none" style={{ stroke: "rgb(var(--sen-border))" }} strokeWidth="2.5" />
        {/* Progress arc */}
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 24 24)"
          style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg leading-none select-none" aria-hidden="true">
        {icon ?? "🤖"}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(agent: Agent): string {
  const points = agent.pricing?.pricePoints;
  return points == null ? "Free" : `${points} pts / call`;
}

type CertStatus = "certified_managed" | "certified" | "provisional" | "uncertified";

function deriveCertStatus(agent: Agent): CertStatus {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "uncertified";
}

// ── Tier badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: Agent["tier"] }): React.JSX.Element {
  const config: Record<Agent["tier"], { label: string; className: string }> = {
    verified: {
      label: "Routed",
      className: "border-sen-border bg-sen-surface-2 text-sen-muted",
    },
    managed: {
      label: "Managed",
      className: "border-sen-gold/30 bg-sen-gold/8 text-sen-gold",
    },
    registry: {
      label: "Routed",
      className: "border-sen-border bg-sen-surface-2 text-sen-muted",
    },
    proxy: {
      label: "Routed",
      className: "border-sen-border bg-sen-surface-2 text-sen-muted",
    },
  };

  const { label, className } = config[tier];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

// ── Cert badge ────────────────────────────────────────────────────────────────

function CertBadge({ status }: { status: CertStatus }): React.JSX.Element {
  const config: Record<CertStatus, { label: string; className: string }> = {
    certified_managed: {
      label: "Certified Managed",
      className: "border-teal-500/25 bg-teal-500/8 text-teal-400",
    },
    certified: {
      label: "Certified",
      className: "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
    },
    provisional: {
      label: "Provisional",
      className: "border-amber-500/25 bg-amber-500/8 text-amber-400",
    },
    uncertified: {
      label: "Uncertified",
      className: "border-sen-border bg-sen-surface-2 text-sen-muted",
    },
  };

  const { label, className } = config[status];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

/**
 * Marketplace agent card with SVG trust-arc ring signature element.
 * The ring traces the trust score (0–100%) in teal/gold/red by band.
 *
 * @example
 * <AgentCard agent={agent} />
 */
export function AgentCard({ agent, className }: AgentCardProps): React.JSX.Element {
  const certStatus = deriveCertStatus(agent);
  const priceLabel = formatPrice(agent);
  const scoreColor = trustColor(agent.trustScore);

  return (
    <article
      className={cn(
        "sentinel-card flex flex-col p-5 transition-all hover:border-sen-border-hi hover:bg-sen-surface-2",
        className,
      )}
    >
      {/* Header: trust ring + name + score */}
      <div className="flex items-start gap-3">
        <TrustRing score={agent.trustScore} icon={agent.icon} />

        {/* Name + slug + badges */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/agents/${agent.slug}`}
            className="block truncate font-semibold text-sen-text hover:text-sen-gold transition-colors"
          >
            {agent.name}
          </Link>
          <p className="mt-0.5 truncate text-xs font-mono text-sen-muted">
            /{agent.slug}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={agent.tier} />
            <CertBadge status={certStatus} />
          </div>
        </div>

        {/* Score number */}
        <div className="shrink-0 text-right">
          <span
            className="text-lg font-bold font-mono leading-none"
            style={{ color: scoreColor }}
            aria-hidden="true"
          >
            {agent.trustScore}
          </span>
          <p className="text-[10px] font-mono text-sen-muted leading-tight">/100</p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 text-sm text-sen-muted leading-relaxed line-clamp-3">
        {agent.description}
      </p>

      {/* Tags */}
      {agent.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Agent tags">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-sen-border bg-sen-surface-2 px-2.5 py-0.5 text-xs font-medium text-sen-muted"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 4 && (
            <span className="rounded-full border border-sen-border px-2.5 py-0.5 text-xs text-sen-muted">
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: price + CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-sen-border pt-4">
        <span className="text-sm font-semibold text-sen-text font-mono">{priceLabel}</span>
        <Link
          href={`/agents/${agent.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-sen-gold/30 bg-sen-gold/8 px-3 py-1.5 text-xs font-medium text-sen-gold transition-colors hover:bg-sen-gold/15"
        >
          View Agent
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
