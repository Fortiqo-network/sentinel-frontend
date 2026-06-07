import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { TrustBadge } from "@/components/marketplace/TrustBadge";
import { formatPaise, formatDate } from "@/lib/utils/format";
import type { AgentDetail, StageResult } from "@/types";

const MOCK_STAGES: StageResult[] = [
  { stage: "static_analysis", label: "Static Analysis", status: "pass", score: 24, maxScore: 25, summary: "No critical vulnerabilities. Semgrep + Bandit scans passed. 1 medium pattern documented.", completedAt: "2026-06-06T10:12:00Z", findingCount: { critical: 0, high: 0, medium: 1, low: 2, info: 5 } },
  { stage: "dependency_scan", label: "Supply Chain", status: "pass", score: 23, maxScore: 25, summary: "47 dependencies scanned via pip-audit. No CVEs. CycloneDX SBOM generated.", completedAt: "2026-06-06T10:14:30Z", findingCount: { critical: 0, high: 0, medium: 0, low: 1, info: 3 } },
  { stage: "dynamic_testing", label: "Dynamic Testing", status: "pass", score: 22, maxScore: 25, summary: "Sandboxed in Firecracker microVM. Resource limits respected. No egress violations.", completedAt: "2026-06-06T10:21:45Z", findingCount: { critical: 0, high: 0, medium: 1, low: 0, info: 2 } },
  { stage: "prompt_injection", label: "Red-team (Prompt Injection)", status: "pass", score: 19, maxScore: 25, summary: "120 adversarial vectors tested. 3 borderline responses logged for developer review.", completedAt: "2026-06-06T10:35:00Z", findingCount: { critical: 0, high: 0, medium: 3, low: 1, info: 0 } },
];

const MOCK_AGENTS: Record<string, AgentDetail> = {
  "code-review-pro": {
    id: "ag_01jv8kz3x", slug: "code-review-pro", name: "Code Review Pro",
    description: "Automated code review for PRs across Python, TypeScript, and Go — security, performance, style.",
    longDescription: "Code Review Pro uses a multi-pass analysis pipeline combining static analysis and LLM reasoning.\n\nSecurity scan covers OWASP Top 10, injection flaws, and secrets in code.\n\nPerformance analysis flags N+1 queries, memory leaks, and complexity issues.",
    trustScore: 88, certStatus: "certified", tier: "verified", status: "live",
    tags: ["code-review", "security", "python", "typescript", "go"],
    vertical: "Engineering",
    pricing: { model: "per_task", pricePerTaskPaise: 250 },
    icon: "🔍",
    owner: { id: "usr_01jv1ab", displayName: "Arjun Mehta", companyName: "Devcraft Labs", isVerifiedDeveloper: true },
    publishedAt: "2026-04-15T09:00:00Z", lastVerifiedAt: "2026-06-06T10:35:00Z",
    buyerCount: 312, invocationCount: 28400,
  },
};

function getMockAgent(slug: string): AgentDetail {
  return MOCK_AGENTS[slug] ?? {
    id: "ag_demo", slug,
    name: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: "A verified AI agent on the Sentinel marketplace.",
    trustScore: 76, certStatus: "certified", tier: "verified", status: "live",
    tags: ["ai", "automation"],
    pricing: { model: "per_task", pricePerTaskPaise: 100 },
    icon: "🤖",
    owner: { id: "usr_demo", displayName: "Demo Developer", isVerifiedDeveloper: true },
    publishedAt: "2026-05-01T00:00:00Z", lastVerifiedAt: "2026-06-01T00:00:00Z",
    buyerCount: 42, invocationCount: 1200,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }): Promise<Metadata> {
  const { agentId } = await params;
  const agent = getMockAgent(agentId);
  return { title: `${agent.name} — Sentinel`, description: agent.description };
}

function ScoreMeter({ score }: { score: number }): React.JSX.Element {
  const colour = score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-400" : "stroke-red-500";
  const r = 36; const circ = 2 * Math.PI * r; const dash = (score / 100) * circ;
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

function StageRow({ stage }: { stage: StageResult }): React.JSX.Element {
  const cfgMap = {
    pass: { icon: "✓", ring: "bg-emerald-500", wrap: "bg-emerald-50 border-emerald-200", label: "text-emerald-700" },
    warn: { icon: "!", ring: "bg-amber-400", wrap: "bg-amber-50 border-amber-200", label: "text-amber-700" },
    fail: { icon: "✗", ring: "bg-red-500", wrap: "bg-red-50 border-red-200", label: "text-red-700" },
    skipped: { icon: "-", ring: "bg-slate-300", wrap: "bg-slate-50 border-slate-200", label: "text-slate-400" },
  } as const;
  const cfg = cfgMap[stage.status];
  const fc = stage.findingCount;
  const total = fc.critical + fc.high + fc.medium + fc.low;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.wrap}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${cfg.ring}`}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold ${cfg.label}`}>{stage.label}</span>
          <span className="text-xs text-slate-400">{stage.score}/{stage.maxScore} pts</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{stage.summary}</p>
        {total > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fc.critical > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{fc.critical} critical</span>}
            {fc.high > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">{fc.high} high</span>}
            {fc.medium > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{fc.medium} medium</span>}
            {fc.low > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{fc.low} low</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }): Promise<React.JSX.Element> {
  const { agentId } = await params;
  const agent = getMockAgent(agentId);

  const certConfig: Record<string, { label: string; cls: string }> = {
    certified_managed: { label: "Certified Managed", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    certified:         { label: "Certified",          cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    conditional:       { label: "Provisional",        cls: "bg-amber-50 text-amber-700 border-amber-200" },
    pending:           { label: "Pending",             cls: "bg-blue-50 text-blue-600 border-blue-200" },
    failed:            { label: "Failed",              cls: "bg-red-50 text-red-700 border-red-200" },
    not_submitted:     { label: "Uncertified",         cls: "bg-slate-50 text-slate-500 border-slate-100" },
  };
  const cert = certConfig[agent.certStatus] ?? certConfig["not_submitted"];
  const trustBadgeCert = agent.certStatus === "certified_managed" ? ("certified_managed" as const) : agent.certStatus === "certified" ? ("certified" as const) : agent.certStatus === "conditional" ? ("provisional" as const) : ("uncertified" as const);

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
              <p className="mt-2 text-sm text-slate-500">
                by <span className="font-medium text-slate-700">{agent.owner.displayName}</span>
                {agent.owner.companyName != null && <span className="text-slate-400"> · {agent.owner.companyName}</span>}
                {agent.owner.isVerifiedDeveloper && <span className="ml-1.5 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">✓ Verified Dev</span>}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-6 sm:flex-col sm:items-end shrink-0">
            <ScoreMeter score={agent.trustScore} />
            <dl className="text-right text-xs text-slate-400 space-y-1">
              {agent.buyerCount != null && <div><dd className="inline font-semibold text-slate-700">{agent.buyerCount.toLocaleString("en-IN")}</dd> buyers</div>}
              {agent.invocationCount != null && <div><dd className="inline font-semibold text-slate-700">{agent.invocationCount.toLocaleString("en-IN")}</dd> invocations</div>}
              {agent.lastVerifiedAt != null && <div>Verified {formatDate(agent.lastVerifiedAt)}</div>}
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
          <h2 className="text-base font-semibold text-slate-900">Verification Report</h2>
          <p className="mt-0.5 text-xs text-slate-400">4-stage independent security pipeline · Sentinel v1 methodology</p>
          <div className="mt-4 space-y-3">{MOCK_STAGES.map((s) => <StageRow key={s.stage} stage={s} />)}</div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Overall Trust Score</span>
            <TrustBadge score={agent.trustScore} size="md" certLevel={trustBadgeCert} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Pricing</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">
                {agent.pricing?.pricePerTaskPaise != null ? formatPaise(agent.pricing.pricePerTaskPaise) : "Free"}
              </span>
              {agent.pricing?.model === "per_task" && <span className="text-sm text-slate-400">/ call</span>}
              {agent.pricing?.model === "subscription" && <span className="text-sm text-slate-400">/ month</span>}
            </div>
            <p className="mt-1 text-xs text-slate-400">Billed from your Sentinel credit wallet (INR). No commitment.</p>
            <button type="button" className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Invoke Now</button>
            <button type="button" className="mt-2 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Try in Playground</button>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Quick Start</h2>
            <pre className="rounded-lg bg-slate-900 p-3 text-[11px] text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre-wrap"><code>{`curl -X POST https://api.sentinel.dev/v1/invoke \\ \n  -H "Authorization: Bearer sk-..." \\ \n  -d '{"agent": "${agent.slug}", "input": {}}'`}</code></pre>
            <p className="mt-2 text-xs text-slate-400">See the <Link href="/docs/sdk" className="text-indigo-500 hover:underline">SDK docs</Link></p>
          </section>
        </div>
      </div>

      {agent.longDescription != null && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">About this agent</h2>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            {agent.longDescription.split("\n\n").map((para, i) => <p key={i}>{para.replace(/\*\*(.*?)\*\*/g, "$1")}</p>)}
          </div>
        </section>
      )}
    </div>
  );
}
