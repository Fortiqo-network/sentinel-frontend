import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TrustBadge } from "@/components/marketplace/TrustBadge";
import { formatDate } from "@/lib/utils/format";
import { getAgentBySlug } from "@/lib/api/agents";
import { UseAgentButton } from "@/components/marketplace/UseAgentButton";
import type { Agent } from "@/types/agent";

type CertLevel = "certified_managed" | "certified" | "provisional" | "uncertified";

/** Derive the certification level from the live trust score and tier. */
function deriveCert(agent: Agent): CertLevel {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "uncertified";
}

const CERT_CONFIG: Record<CertLevel, { label: string; cls: string }> = {
  certified_managed: { label: "Certified Managed", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  certified: { label: "Certified", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  provisional: { label: "Provisional", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  uncertified: { label: "Uncertified", cls: "bg-slate-50 text-slate-500 border-slate-100" },
};

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

function ScoreMeter({ score }: { score: number }): React.JSX.Element {
  const colour = score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-400" : "stroke-red-500";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`Trust score ${score}/100`}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" className={colour} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 48 48)" />
        <text x="48" y="52" textAnchor="middle" style={{ fontSize: "22px", fontWeight: 700, fill: "#0f172a" }}>{score}</text>
      </svg>
      <span className="text-xs font-medium text-slate-400">/ 100</span>
    </div>
  );
}

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
  const trustBadgeCert =
    certLevel === "uncertified" ? ("uncertified" as const) : certLevel;
  const pricePoints = agent.pricing?.pricePoints;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/agents" className="hover:text-slate-600 transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{agent.name}</span>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl" aria-hidden="true">{agent.icon ?? "🤖"}</div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900">{agent.name}</h1>
              <p className="font-mono text-sm text-slate-400">/{agent.slug}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cert.cls}`}>🛡 {cert.label}</span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {agent.tier === "managed" ? "Managed (Tier A)" : "Routed (Tier B)"}
                </span>
                {agent.vertical != null && <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">{agent.vertical}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-6 sm:flex-col sm:items-end shrink-0">
            <ScoreMeter score={agent.trustScore} />
            <dl className="text-right text-xs text-slate-400 space-y-1">
              {agent.lastVerifiedAt != null && <div>Verified {formatDate(agent.lastVerifiedAt)}</div>}
              {agent.publishedAt != null && <div>Published {formatDate(agent.publishedAt)}</div>}
            </dl>
          </div>
        </div>
        <p className="mt-5 text-sm text-slate-600 leading-relaxed">{agent.description}</p>
        {agent.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{tag}</span>)}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Verification</h2>
          <p className="mt-0.5 text-xs text-slate-400">Independently verified via Sentinel&apos;s multi-stage security pipeline.</p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
            <div>
              <span className="text-sm font-medium text-slate-700">Overall Trust Score</span>
              <p className="mt-0.5 text-xs text-slate-400">Aggregated across static, supply-chain, dynamic, and red-team stages.</p>
            </div>
            <TrustBadge score={agent.trustScore} size="md" certLevel={trustBadgeCert} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Pricing</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">
                {pricePoints != null ? `${pricePoints} points` : "Free"}
              </span>
              {pricePoints != null && <span className="text-sm text-slate-400">/ call</span>}
            </div>
            <p className="mt-1 text-xs text-slate-400">Billed from your Sentinel credit wallet (INR). No commitment.</p>
            <div className="mt-5">
              <UseAgentButton
                developer={agent.developer ?? ""}
                slug={agent.slug}
                priceLabel={pricePoints != null ? `${pricePoints} points / call` : "Free"}
              />
            </div>
            <Link
              href={`/playground?agent=${agent.slug}`}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Try in Playground
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
