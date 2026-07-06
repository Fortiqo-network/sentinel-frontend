import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSellerPosts, getSellerProfile } from "@/lib/api/sellers-public";
import { isSentinelApiError } from "@/lib/api/client";
import { Avatar } from "@/components/ui/avatar";
import { SellerFeed } from "@/components/seller/SellerFeed";
import { cn } from "@/lib/utils/cn";
import type { PublicAgentSummary, SellerFeed as SellerFeedData } from "@/lib/api/sellers-public";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const dev = await getSellerProfile(handle);
    const name = dev.displayName ?? "Seller";
    return {
      title: `${name} — Sentinel Seller`,
      description: dev.bio ?? `View ${name}'s agents and profile on Sentinel.`,
    };
  } catch {
    return { title: "Seller — Sentinel" };
  }
}

function formatJoinYear(iso: string): string {
  return new Date(iso).getFullYear().toString();
}

function TierPill({ tier }: { tier: string }): React.JSX.Element {
  const label = tier === "managed" ? "Managed" : "Routed";
  const cls =
    tier === "managed"
      ? "bg-sentinel-900/50 text-sentinel-300 border-sentinel-700/50"
      : "bg-ink-700 text-porcelain/60 border-porcelain/10";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
}

function AgentCard({ agent }: { agent: PublicAgentSummary }): React.JSX.Element {
  const score = agent.trustScore ?? 0;
  const scoreColor =
    score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400";

  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="glass ring-hairline group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:bg-ink-800/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-porcelain transition-colors group-hover:text-gold">
            {agent.name}
          </p>
          <p className="mt-0.5 font-mono text-xs text-graphite">/{agent.slug}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={cn("text-sm font-bold tabular-nums", scoreColor)}>
            {score}
            <span className="text-xs font-normal text-porcelain/40"> / 100</span>
          </span>
          <TierPill tier={agent.tier} />
        </div>
      </div>

      {agent.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-porcelain/60">
          {agent.description}
        </p>
      )}

      {agent.ratingCount > 0 && agent.ratingAvg != null && (
        <p className="inline-flex items-center gap-1 text-xs text-amber-400">
          <span aria-hidden="true">★</span>
          <span className="tabular-nums">{agent.ratingAvg.toFixed(1)}</span>
          <span className="text-porcelain/40">({agent.ratingCount})</span>
        </p>
      )}

      {agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-porcelain/70"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 4 && (
            <span className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-porcelain/40">
              +{agent.tags.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-porcelain/10 bg-ink-700 px-3 py-1.5 text-sm text-porcelain/70 transition-colors hover:border-gold/30 hover:text-gold"
    >
      {icon}
      {label}
    </a>
  );
}

/**
 * Public shareable seller profile page.
 * Renders on the cinematic ink surface — no auth required.
 *
 * @example
 * /sellers/550e8400-e29b-41d4-a716-446655440000
 */
export default async function SellerProfilePage({ params }: Props): Promise<React.JSX.Element> {
  const { handle } = await params;

  let dev;
  try {
    dev = await getSellerProfile(handle);
  } catch (err: unknown) {
    if (isSentinelApiError(err) && err.statusCode === 404) notFound();
    notFound();
  }

  let feed: SellerFeedData = { items: [], total: 0 };
  try {
    feed = await getSellerPosts(handle);
  } catch {
    feed = { items: [], total: 0 };
  }

  const name = dev.displayName ?? "Anonymous Seller";

  return (
    <div className="min-h-screen bg-void text-porcelain">
      {/* Aurora gradient accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-30"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, #6366f1 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/agents"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-porcelain/50 transition-colors hover:text-porcelain"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9.78 11.78a.75.75 0 0 1-1.06 0L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 1.06L7.06 8l2.72 2.72a.75.75 0 0 1 0 1.06Z"
              clipRule="evenodd"
            />
          </svg>
          Marketplace
        </Link>

        {/* Hero: avatar + name + meta */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="shrink-0">
            <Avatar src={dev.avatarUrl} name={name} size="xl" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-porcelain sm:text-4xl">
              {name}
            </h1>

            {(dev.company || dev.organization) && (
              <p className="mt-1 text-base text-porcelain/60">
                {dev.company ?? dev.organization}
                {dev.githubHandle && (
                  <span className="ml-2 font-mono text-sm text-porcelain/40">@{dev.githubHandle}</span>
                )}
              </p>
            )}

            {dev.bio && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-porcelain/70">
                {dev.bio}
              </p>
            )}

            <p className="mt-3 text-xs text-porcelain/40">
              Member since {formatJoinYear(dev.createdAt)}
            </p>

            {/* Social links */}
            {(dev.linkedinUrl || dev.githubUrl || dev.websiteUrl) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {dev.linkedinUrl && (
                  <SocialLink
                    href={dev.linkedinUrl}
                    label="LinkedIn"
                    icon={
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    }
                  />
                )}
                {dev.githubUrl && (
                  <SocialLink
                    href={dev.githubUrl}
                    label="GitHub"
                    icon={
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    }
                  />
                )}
                {dev.websiteUrl && (
                  <SocialLink
                    href={dev.websiteUrl}
                    label="Website"
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                        <circle cx={12} cy={12} r={10} />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-porcelain/10" />

        {/* Agents section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-porcelain">
              Agents
              {dev.agents.length > 0 && (
                <span className="ml-2 rounded-full bg-ink-700 px-2.5 py-0.5 text-sm font-medium text-porcelain/50">
                  {dev.agents.length}
                </span>
              )}
            </h2>
            <Link
              href="/agents"
              className="text-sm text-porcelain/50 transition-colors hover:text-porcelain"
            >
              Browse all →
            </Link>
          </div>

          {dev.agents.length === 0 ? (
            <div className="glass ring-hairline rounded-2xl px-8 py-16 text-center">
              <p className="text-porcelain/40">No live agents yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {dev.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="my-12 border-t border-porcelain/10" />

        {/* Social feed section */}
        <section>
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-porcelain">Posts</h2>
            {feed.total > 0 && (
              <span className="rounded-full bg-ink-700 px-2.5 py-0.5 text-sm font-medium text-porcelain/50">
                {feed.total}
              </span>
            )}
          </div>
          <SellerFeed posts={feed.items} total={feed.total} />
        </section>
      </div>
    </div>
  );
}
