import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TrustBadge } from "@/components/marketplace/TrustBadge";
import { AgentAvatar } from "@/components/marketplace/AgentAvatar";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { formatDate } from "@/lib/utils/format";
import { getAgent, getAgentBySlug, getAgentReport } from "@/lib/api/agents";
import { UseAgentButton } from "@/components/marketplace/UseAgentButton";
import { SubscribeButton } from "@/components/marketplace/SubscribeButton";
import { ReportAgentButton } from "@/components/marketplace/ReportAgentButton";
import { TrustReportPanel } from "@/components/marketplace/TrustReportPanel";
import { AgentReviews } from "@/components/marketplace/AgentReviews";
import type { Agent } from "@/types/agent";

type CertLevel = "certified_managed" | "certified" | "provisional" | "uncertified";

function deriveCert(agent: Agent): CertLevel {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "uncertified";
}

const CERT_CONFIG: Record<CertLevel, { label: string; cls: string }> = {
  certified_managed: {
    label: "Certified Managed",
    cls: "bg-sentinel-900/40 text-sentinel-300 border-sentinel-700/30",
  },
  certified: {
    label: "Certified",
    cls: "bg-emerald-900/30 text-emerald-400 border-emerald-700/30",
  },
  provisional: {
    label: "Provisional",
    cls: "bg-amber-900/30 text-amber-400 border-amber-700/30",
  },
  uncertified: {
    label: "Uncertified",
    cls: "bg-ink-700 text-porcelain/40 border-porcelain/10",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<Metadata> {
  const { agentId } = await params;
  const agent = (await getAgentBySlug(agentId)) ?? (await getAgent(agentId));
  if (agent == null) return { title: "Agent not found — Sentinel" };
  const trust = `Trust score ${agent.trustScore}/100`;
  return {
    title: `${agent.name} — Verified AI Agent (${trust})`,
    description: `${agent.description} ${trust}, independently verified by Sentinel. Hire it with pay-on-outcome billing — trust you can verify, for buyers and sellers alike.`,
    alternates: { canonical: `/agents/${agentId}` },
    openGraph: {
      type: "website",
      title: `${agent.name} — Verified AI Agent | Sentinel`,
      description: `${agent.description} ${trust}, independently verified. Pay only on outcomes.`,
      url: `/agents/${agentId}`,
    },
  };
}

function ScoreMeter({ score }: { score: number }): React.JSX.Element {
  const colour =
    score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-400" : "stroke-red-500";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        role="img"
        aria-label={`Trust score ${score}/100`}
      >
        {/* Track ring */}
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(236,234,227,0.10)" strokeWidth="8" />
        {/* Score arc */}
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          className={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 48 48)"
        />
        {/* Score number */}
        <text
          x="48"
          y="52"
          textAnchor="middle"
          style={{ fontSize: "22px", fontWeight: 700, fill: "#ECEAE3" }}
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-medium text-porcelain/40">/ 100</span>
    </div>
  );
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<React.JSX.Element> {
  const { agentId } = await params;
  const agent = (await getAgentBySlug(agentId)) ?? (await getAgent(agentId));
  if (agent == null) notFound();

  const report = await getAgentReport(agent.slug);
  const certLevel = deriveCert(agent);
  const cert = CERT_CONFIG[certLevel];
  const trustBadgeCert = certLevel === "uncertified" ? ("uncertified" as const) : certLevel;
  const priceCredits = agent.pricing?.priceCredits;

  // Standard integration URLs derived from the agent identity + the public gateway.
  const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://sentinel-api.fortiqo.xyz";
  const dev = agent.seller ?? "";
  const metadataUrl = agent.metadataUrl ?? (dev ? `${GATEWAY}/v1/agents/${dev}/${agent.slug}/metadata` : undefined);
  const restUrl = dev ? `${GATEWAY}/v1/agents/${dev}/${agent.slug}/use` : undefined;
  const isMcp = agent.protocol === "mcp";
  const sseUrl = agent.supportsSse ? `${GATEWAY}/v1/agents/${agent.id}/chat` : undefined;
  const mcpUrl = `${GATEWAY}/mcp/a/${agent.id}`;
  const a2aUrl = `${GATEWAY}/.well-known/agents/${agent.id}/agent-card.json`;
  const externalLinks: Array<{ label: string; href: string }> = [
    ...(agent.repoUrl ? [{ label: "Source / GitHub", href: agent.repoUrl }] : []),
    ...(agent.homepageUrl ? [{ label: "Homepage", href: agent.homepageUrl }] : []),
    ...(agent.docsUrl ? [{ label: "Documentation", href: agent.docsUrl }] : []),
    ...(agent.endpointUrl ? [{ label: "Seller endpoint", href: agent.endpointUrl }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-brand-mono text-xs uppercase tracking-[0.15em]">
        <Link
          href="/agents"
          className="text-porcelain/40 transition-colors hover:text-porcelain/70"
        >
          Marketplace
        </Link>
        <span className="text-porcelain/25">/</span>
        <span className="text-gold">{agent.name}</span>
      </nav>

      {/* Agent header card */}
      <div className="glass ring-hairline rounded-2xl p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Icon + name + badges */}
          <div className="flex flex-1 min-w-0 items-start gap-4">
            <AgentAvatar name={agent.name} iconUrl={agent.icon} className="h-16 w-16" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-porcelain">{agent.name}</h1>
              <p className="font-mono text-sm text-graphite">/{agent.slug}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cert.cls}`}
                >
                  🛡 {cert.label}
                </span>
                <span className="inline-flex items-center rounded-full border border-porcelain/10 bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-porcelain/60">
                  {agent.tier === "managed" ? "Managed (Tier A)" : "Routed (Tier B)"}
                </span>
                {agent.vertical != null && (
                  <span className="inline-flex items-center rounded-full border border-porcelain/10 bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-porcelain/50">
                    {agent.vertical}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Score meter + dates */}
          <div className="flex items-start gap-6 sm:flex-col sm:items-end shrink-0">
            <ScoreMeter score={agent.trustScore} />
            <dl className="space-y-1 text-right font-brand-mono text-xs text-porcelain/35">
              {agent.lastVerifiedAt != null && (
                <div>Verified {formatDate(agent.lastVerifiedAt)}</div>
              )}
              {agent.publishedAt != null && (
                <div>Published {formatDate(agent.publishedAt)}</div>
              )}
            </dl>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-porcelain/60">{agent.description}</p>

        {agent.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-porcelain/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Live status: endpoint health / discontinued */}
        <div className="mt-3">
          {agent.isDiscontinued ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-porcelain/40">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Discontinued
            </span>
          ) : agent.health?.status === "inactive" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Inactive — endpoint not responding
            </span>
          ) : agent.health?.status === "active" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
            </span>
          ) : null}
        </div>
      </div>

      {/* Lower grid: verification + pricing */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Verification */}
        <section className="glass ring-hairline rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-porcelain">Verification</h2>
          <p className="mt-0.5 text-xs text-porcelain/40">
            Independently verified via Sentinel&apos;s multi-stage security pipeline.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-700/50 px-4 py-4 ring-hairline">
            <div>
              <span className="text-sm font-medium text-porcelain/80">Overall Trust Score</span>
              <p className="mt-0.5 text-xs text-porcelain/40">
                Aggregated across static, supply-chain, dynamic, and red-team stages.
              </p>
            </div>
            <TrustBadge score={agent.trustScore} size="md" certLevel={trustBadgeCert} />
          </div>
          <div className="mt-4">
            <TrustReportPanel
              agentName={agent.name}
              trustScore={agent.trustScore}
              certLabel={cert.label}
              lastVerifiedAt={agent.lastVerifiedAt}
              report={report}
            />
          </div>
        </section>

        {/* Pricing */}
        <div className="space-y-4">
          <section className="glass ring-hairline rounded-2xl p-6">
            <h2 className="text-base font-semibold text-porcelain">Pricing</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-porcelain">
                {priceCredits != null ? `${priceCredits} Cr` : "Free"}
              </span>
              {priceCredits != null && (
                <span className="text-sm text-porcelain/40">/ call</span>
              )}
            </div>
            <p className="mt-1 text-xs text-porcelain/40">
              Billed from your Sentinel credit wallet (1 USD = 100 credits). No commitment.
            </p>
            <div className="mt-5">
              <UseAgentButton
                seller={agent.seller ?? ""}
                slug={agent.slug}
                priceLabel={priceCredits != null ? `${priceCredits} Cr / call` : "Free"}
                isMcp={isMcp}
              />
            </div>
            <Link
              href={`/playground?agent=${agent.slug}`}
              className="mt-2 block w-full rounded-xl border border-porcelain/15 bg-ink-700 py-2.5 text-center text-sm font-medium text-porcelain/70 transition-colors hover:bg-ink-600 hover:text-porcelain"
            >
              Try in Playground
            </Link>
            <SubscribeButton agentId={agent.id} />
            <div className="pt-1">
              <ReportAgentButton agentId={agent.id} />
            </div>
          </section>
        </div>
      </div>

      {/* Reviews & ratings */}
      <section className="mt-6 glass ring-hairline rounded-2xl p-6">
        <AgentReviews agentId={agent.id} />
      </section>

      {/* Seller & integration */}
      <section className="mt-6 glass ring-hairline rounded-2xl p-6">
        <h2 className="text-base font-semibold text-porcelain">Seller &amp; integration</h2>
        <p className="mt-0.5 text-xs text-porcelain/40">
          Identity, source, and the endpoints to call this agent from your own code.
        </p>

        {/* Identity + external links */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-porcelain/40">Seller</dt>
              <dd className="text-porcelain/80">
                {agent.seller ? (
                  <Link href={`/sellers/${agent.seller}`} className="text-gold hover:underline">
                    @{agent.seller}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-porcelain/40">Agent ID</dt>
              <dd className="font-brand-mono text-xs text-porcelain/60">{agent.id}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-porcelain/40">Tier</dt>
              <dd className="text-porcelain/80">
                {agent.tier === "managed" ? "Managed (Tier A)" : "Routed (Tier B)"}
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <div className="font-brand-mono text-[11px] uppercase tracking-wider text-porcelain/35">
              Links
            </div>
            {externalLinks.length > 0 || metadataUrl ? (
              <ul className="space-y-1.5 text-sm">
                {externalLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
                {metadataUrl && (
                  <li>
                    <a
                      href={metadataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      Metadata card ↗
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-porcelain/40">No external links published.</p>
            )}
          </div>
        </div>

        {/* Call it from your own code */}
        <div className="mt-5 space-y-4">
          <p className="text-xs text-porcelain/50">
            Authenticate with your Sentinel API key (create one in{" "}
            <Link href="/dashboard/api-keys" className="text-gold hover:underline">
              Dashboard → API keys
            </Link>
            ). Calls are billed to your wallet only on success.
          </p>
          {restUrl && (
            <CodeSnippet
              label={isMcp ? "curl — call an MCP tool" : "curl — pay-and-use"}
              wrap
              code={
                isMcp
                  ? `curl -X POST ${restUrl} \\\n  -H "X-API-Key: $SENTINEL_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"tool": "<tool_name>", "arguments": { }}'`
                  : `curl -X POST ${restUrl} \\\n  -H "X-API-Key: $SENTINEL_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": { }}'`
              }
            />
          )}
          {isMcp && (
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-300/90">
              This is an <strong>MCP agent</strong> — pass a <code>tool</code> name and its{" "}
              <code>arguments</code>. Discover the exact tool names from the MCP endpoint&apos;s{" "}
              <code>tools/list</code> (they are namespaced, e.g. <code>agentname_action</code>).
            </p>
          )}
          {sseUrl && (
            <CodeSnippet label="SSE stream (live response)" code={`POST ${sseUrl}\nAccept: text/event-stream`} />
          )}
          <CodeSnippet label="MCP (Streamable HTTP)" code={mcpUrl} />
          <CodeSnippet label="A2A agent card" code={a2aUrl} />
          {metadataUrl && <CodeSnippet label="Metadata" code={`GET ${metadataUrl}`} />}
        </div>
      </section>
    </div>
  );
}
