import * as React from "react";
import Link from "next/link";
import { TrustBadge } from "./TrustBadge";
import { cn } from "@/lib/utils/cn";
import type { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(agent: Agent): string {
  const credits = agent.pricing?.priceCredits;
  return credits == null ? "Free" : `${credits} Cr / call`;
}

// ── Tier badge ────────────────────────────────────────────────────────────────

interface TierBadgeProps {
  tier: Agent["tier"];
}

function TierBadge({ tier }: TierBadgeProps): React.JSX.Element {
  const config: Record<Agent["tier"], { label: string; className: string }> = {
    verified: {
      label: "Routed",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    managed: {
      label: "Managed",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    registry: {
      label: "Routed",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    proxy: {
      label: "Routed",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
  };

  const { label, className } = config[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

// ── Cert status badge ─────────────────────────────────────────────────────────

type CertStatus = "certified_managed" | "certified" | "provisional" | "uncertified";

function deriveCertStatus(agent: Agent): CertStatus {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "uncertified";
}

interface CertBadgeProps {
  status: CertStatus;
}

function CertBadge({ status }: CertBadgeProps): React.JSX.Element {
  const config: Record<CertStatus, { label: string; icon: string; className: string }> = {
    certified_managed: {
      label: "Certified Managed",
      icon: "🛡",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    certified: {
      label: "Certified",
      icon: "🛡",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    provisional: {
      label: "Provisional",
      icon: "🛡",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    uncertified: {
      label: "Uncertified",
      icon: "🛡",
      className: "bg-slate-50 text-slate-500 border-slate-200",
    },
  };

  const { label, icon, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

/**
 * Marketplace agent card. Shows agent icon, name, slug, description, trust
 * score badge (colour-coded), tier badge, cert status shield, tags as chips,
 * and formatted INR pricing. Links to the agent detail page.
 *
 * Trust score colouring: emerald ≥ 75, amber ≥ 50, red < 50.
 *
 * @example
 * <AgentCard agent={agent} />
 */
export function AgentCard({ agent, className }: AgentCardProps): React.JSX.Element {
  const certStatus = deriveCertStatus(agent);
  const priceLabel = formatPrice(agent);

  return (
    <article
      className={cn(
        "sentinel-card flex flex-col p-5 transition-all hover:shadow-md hover:border-slate-300",
        className,
      )}
    >
      {/* Header row: icon + name + trust badge */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl"
          aria-hidden="true"
        >
          {agent.icon ?? "🤖"}
        </div>

        {/* Name + slug + badges */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/agents/${agent.slug}`}
            className="block truncate font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
          >
            {agent.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-slate-400 font-mono">
            /{agent.slug}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={agent.tier} />
            <CertBadge status={certStatus} />
          </div>
        </div>

        {/* Trust score */}
        <TrustBadge score={agent.trustScore} size="sm" />
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 text-sm text-slate-600 leading-relaxed line-clamp-3">
        {agent.description}
      </p>

      {/* Tags */}
      {agent.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Agent tags">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: price + CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <span className="text-sm font-semibold text-slate-900">{priceLabel}</span>
        </div>
        <Link
          href={`/agents/${agent.slug}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
          )}
        >
          View Agent
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
