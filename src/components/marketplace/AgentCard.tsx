import * as React from "react";
import Link from "next/link";
import { TrustBadge } from "./TrustBadge";
import { SubscribeButton } from "./SubscribeButton";
import { cn } from "@/lib/utils/cn";
import type { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  className?: string;
  /** "dark" renders on the cinematic ink surface; "light" on a white card. */
  variant?: "light" | "dark";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(agent: Agent): string {
  const credits = agent.pricing?.priceCredits;
  return credits == null ? "Free" : `${credits} Cr / call`;
}

// ── Tier badge ────────────────────────────────────────────────────────────────

interface TierBadgeProps {
  tier: Agent["tier"];
  dark?: boolean;
}

function TierBadge({ tier, dark }: TierBadgeProps): React.JSX.Element {
  const config: Record<Agent["tier"], { label: string; light: string; dark: string }> = {
    verified: {
      label: "Routed",
      light: "bg-slate-100 text-slate-600 border-slate-200",
      dark:  "bg-ink-700 text-porcelain/60 border-porcelain/10",
    },
    managed: {
      label: "Managed",
      light: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dark:  "bg-sentinel-900/50 text-sentinel-300 border-sentinel-700/50",
    },
    registry: {
      label: "Routed",
      light: "bg-slate-100 text-slate-600 border-slate-200",
      dark:  "bg-ink-700 text-porcelain/60 border-porcelain/10",
    },
    proxy: {
      label: "Routed",
      light: "bg-slate-100 text-slate-600 border-slate-200",
      dark:  "bg-ink-700 text-porcelain/60 border-porcelain/10",
    },
  };

  const { label, light: lightCls, dark: darkCls } = config[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        dark ? darkCls : lightCls,
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
  dark?: boolean;
}

function CertBadge({ status, dark }: CertBadgeProps): React.JSX.Element {
  const config: Record<CertStatus, { label: string; icon: string; light: string; dark: string }> = {
    certified_managed: {
      label: "Certified Managed",
      icon:  "🛡",
      light: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dark:  "bg-sentinel-900/40 text-sentinel-300 border-sentinel-700/30",
    },
    certified: {
      label: "Certified",
      icon:  "🛡",
      light: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dark:  "bg-emerald-900/30 text-emerald-400 border-emerald-700/30",
    },
    provisional: {
      label: "Provisional",
      icon:  "🛡",
      light: "bg-amber-50 text-amber-700 border-amber-200",
      dark:  "bg-amber-900/30 text-amber-400 border-amber-700/30",
    },
    uncertified: {
      label: "Uncertified",
      icon:  "🛡",
      light: "bg-slate-50 text-slate-500 border-slate-200",
      dark:  "bg-ink-700 text-porcelain/40 border-porcelain/10",
    },
  };

  const { label, icon, light: lightCls, dark: darkCls } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        dark ? darkCls : lightCls,
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
 * score badge (colour-coded), tier badge, cert status shield, tags, and
 * formatted credit pricing. Links to the agent detail page.
 *
 * Trust score colouring: emerald ≥ 75, amber ≥ 50, red < 50.
 *
 * @example
 * <AgentCard agent={agent} />
 * <AgentCard agent={agent} variant="dark" />
 */
export function AgentCard({
  agent,
  className,
  variant = "light",
}: AgentCardProps): React.JSX.Element {
  const certStatus = deriveCertStatus(agent);
  const priceLabel = formatPrice(agent);
  const dark = variant === "dark";

  return (
    <article
      className={cn(
        "flex flex-col p-5 transition-all",
        dark
          ? "glass ring-hairline rounded-2xl hover:bg-ink-800/60"
          : "sentinel-card hover:shadow-md hover:border-slate-300",
        className,
      )}
    >
      {/* Header row: icon + name + trust badge */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
            dark ? "bg-ink-700" : "bg-indigo-50",
          )}
          aria-hidden="true"
        >
          {agent.icon ?? "🤖"}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/agents/${agent.slug}`}
            className={cn(
              "block truncate font-semibold transition-colors",
              dark
                ? "text-porcelain hover:text-gold"
                : "text-slate-900 hover:text-indigo-600",
            )}
          >
            {agent.name}
          </Link>
          <p
            className={cn(
              "mt-0.5 truncate font-mono text-xs",
              dark ? "text-graphite" : "text-slate-400",
            )}
          >
            /{agent.slug}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={agent.tier} dark={dark} />
            <CertBadge status={certStatus} dark={dark} />
          </div>
        </div>

        <TrustBadge score={agent.trustScore} size="sm" />
      </div>

      {/* Description */}
      <p
        className={cn(
          "mt-3 flex-1 text-sm leading-relaxed line-clamp-3",
          dark ? "text-porcelain/60" : "text-slate-600",
        )}
      >
        {agent.description}
      </p>

      {/* Tags */}
      {agent.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Agent tags">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                dark ? "bg-ink-700 text-porcelain/70" : "bg-slate-100 text-slate-600",
              )}
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 4 && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                dark ? "bg-ink-700 text-porcelain/40" : "bg-slate-100 text-slate-400",
              )}
            >
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: price + CTA */}
      <div
        className={cn(
          "mt-4 flex items-center justify-between border-t pt-4",
          dark ? "border-porcelain/10" : "border-slate-100",
        )}
      >
        <span
          className={cn(
            "text-sm font-semibold",
            dark ? "text-porcelain" : "text-slate-900",
          )}
        >
          {priceLabel}
        </span>
        <div className="flex items-center gap-2">
        <SubscribeButton agentId={agent.id} compact dark={dark} />
        <Link
          href={`/agents/${agent.slug}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            dark
              ? "border-gold/20 bg-ink-700 text-gold hover:bg-ink-600"
              : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
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
      </div>
    </article>
  );
}
