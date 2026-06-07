import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AgentGrid } from "@/components/marketplace/AgentGrid";
import { FEATURED_AGENTS_MOCK } from "@/lib/api/agents";

export const metadata: Metadata = {
  title: "Sentinel — The Verified AI Agent Marketplace",
  description:
    "Browse and deploy AI agents that have been independently verified for security, reliability, and trust. Every agent carries a transparent 0–100 trust score.",
};

// ── Section: Hero ─────────────────────────────────────────────────────────────

function HeroSection(): React.JSX.Element {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-24 text-center text-white sm:py-36"
      aria-labelledby="hero-heading"
    >
      {/* Radial glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent)]"
        aria-hidden="true"
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Pill badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
          Trusted AI Agent Economy — India&apos;s first verified marketplace
        </div>

        <h1
          id="hero-heading"
          className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
        >
          The verified
          <span className="block text-indigo-400">AI agent marketplace</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
          Every agent on Sentinel undergoes a four-stage security pipeline — static
          analysis, supply chain scanning, dynamic testing, and red-team adversarial
          prompting — before it earns a trust score you can rely on.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/agents"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-500 px-6 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Browse Agents
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="/developer"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-600 bg-white/5 px-6 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Publish Your Agent
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-slate-700/60 pt-10">
          {[
            { value: "347", label: "Agents Verified" },
            { value: "84k", label: "Trust Checks / Day" },
            { value: "1,200+", label: "Active Developers" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
                {value}
              </div>
              <div className="mt-1 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Categories ───────────────────────────────────────────────────────

interface Category {
  icon: string;
  name: string;
  description: string;
  tag: string;
  count: number;
}

const CATEGORIES: Category[] = [
  {
    icon: "⚙️",
    name: "Code & Dev Tools",
    description: "PR reviews, test generation, bug detection, refactoring agents.",
    tag: "code",
    count: 84,
  },
  {
    icon: "📊",
    name: "Data & Analytics",
    description: "Synthetic data, ETL pipelines, BI query agents.",
    tag: "data",
    count: 62,
  },
  {
    icon: "🔬",
    name: "Research",
    description: "Literature review, citation extraction, hypothesis generation.",
    tag: "research",
    count: 41,
  },
  {
    icon: "✍️",
    name: "Content",
    description: "SEO writing, copy editing, localisation and translation.",
    tag: "content",
    count: 78,
  },
  {
    icon: "🤖",
    name: "Automation",
    description: "Workflow orchestration, RPA, document processing agents.",
    tag: "automation",
    count: 56,
  },
];

function CategoriesSection(): React.JSX.Element {
  return (
    <section className="bg-slate-50 px-6 py-16" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 id="categories-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-2 text-slate-500">
            Every category is independently audited to the same verification standard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map(({ icon, name, description, tag, count }) => (
            <Link
              key={tag}
              href={`/agents?tag=${tag}`}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden="true">
                {icon}
              </span>
              <div>
                <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                  {name}
                </div>
                <div className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {description}
                </div>
              </div>
              <div className="mt-auto text-xs font-medium text-indigo-600">
                {count} agents →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Trust Score Explainer ────────────────────────────────────────────

interface VerificationStageInfo {
  step: string;
  name: string;
  icon: string;
  colour: string;
  bgColour: string;
  borderColour: string;
  description: string;
  checks: string[];
}

const VERIFICATION_STAGES: VerificationStageInfo[] = [
  {
    step: "01",
    name: "Static Analysis",
    icon: "🔍",
    colour: "text-indigo-700",
    bgColour: "bg-indigo-50",
    borderColour: "border-indigo-200",
    description:
      "Source code is scanned for hard-coded credentials, insecure patterns, and OWASP Top-10 vulnerabilities before the agent is ever run.",
    checks: ["Credential exposure scan", "SAST ruleset (Semgrep)", "License compliance"],
  },
  {
    step: "02",
    name: "Supply Chain",
    icon: "📦",
    colour: "text-violet-700",
    bgColour: "bg-violet-50",
    borderColour: "border-violet-200",
    description:
      "All third-party dependencies are traced to their origin. Typosquatting, abandoned packages, and known CVEs are flagged automatically.",
    checks: ["SBOM generation", "CVE cross-reference (OSV)", "Dependency pinning check"],
  },
  {
    step: "03",
    name: "Dynamic Testing",
    icon: "⚡",
    colour: "text-emerald-700",
    bgColour: "bg-emerald-50",
    borderColour: "border-emerald-200",
    description:
      "Agents are executed in isolated sandboxes with synthetic workloads. Latency, token usage, and output determinism are measured across 500 test cases.",
    checks: ["Sandbox execution (gVisor)", "Latency & P99 benchmarks", "Output consistency"],
  },
  {
    step: "04",
    name: "Red-team",
    icon: "🛡",
    colour: "text-rose-700",
    bgColour: "bg-rose-50",
    borderColour: "border-rose-200",
    description:
      "Adversarial prompts — including prompt injection, jailbreaks, and data exfiltration attempts — are fired at the agent's API endpoints by our red-team suite.",
    checks: ["Prompt injection corpus", "Jailbreak resistance", "PII leakage tests"],
  },
];

function TrustScoreSection(): React.JSX.Element {
  return (
    <section className="px-6 py-16" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
              <path d="M8 1L1.5 4v4.5C1.5 12.1 4.3 15.3 8 16c3.7-.7 6.5-3.9 6.5-7.5V4L8 1Z" />
            </svg>
            How Trust Scores Work
          </div>
          <h2 id="trust-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
            A four-stage verification pipeline,
            <span className="text-indigo-600"> not a checkbox form</span>
          </h2>
          <p className="mt-3 text-slate-500">
            Sentinel&apos;s calibrated 0–100 score aggregates findings across four
            independent stages. Scores update continuously as the agent&apos;s code changes.
          </p>
        </div>

        {/* Stage cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VERIFICATION_STAGES.map(
            ({ step, name, icon, colour, bgColour, borderColour, description, checks }) => (
              <div
                key={step}
                className={`rounded-xl border ${borderColour} ${bgColour} p-6 flex flex-col gap-4`}
              >
                {/* Step number + icon */}
                <div className="flex items-center justify-between">
                  <span className={`text-3xl`} aria-hidden="true">
                    {icon}
                  </span>
                  <span className={`font-mono text-xs font-bold ${colour} opacity-50`}>
                    {step}
                  </span>
                </div>

                <div>
                  <h3 className={`font-semibold ${colour} text-base`}>{name}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>

                {/* Checks list */}
                <ul className="mt-auto space-y-1.5">
                  {checks.map((check) => (
                    <li key={check} className="flex items-center gap-2 text-xs text-slate-600">
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className={`h-3.5 w-3.5 shrink-0 ${colour}`}
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>

        {/* Score legend */}
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Score bands at a glance</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { range: "90–100", label: "Elite", colour: "bg-emerald-500", text: "text-emerald-700" },
              { range: "70–89", label: "High", colour: "bg-green-500", text: "text-green-700" },
              { range: "50–69", label: "Medium", colour: "bg-amber-500", text: "text-amber-700" },
              { range: "0–49", label: "Low", colour: "bg-red-500", text: "text-red-700" },
            ].map(({ range, label, colour, text }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${colour} flex items-center justify-center`}>
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 text-white"
                    aria-hidden="true"
                  >
                    <path d="M8 1L1.5 4v4.5C1.5 12.1 4.3 15.3 8 16c3.7-.7 6.5-3.9 6.5-7.5V4L8 1Z" />
                  </svg>
                </div>
                <div>
                  <div className={`text-xs font-bold ${text}`}>{label}</div>
                  <div className="text-xs text-slate-400 font-mono">{range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section: Featured Agents ──────────────────────────────────────────────────

function FeaturedAgentsSection(): React.JSX.Element {
  return (
    <section className="bg-slate-50 px-6 py-16" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 id="featured-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Featured Agents
            </h2>
            <p className="mt-1 text-slate-500">Top-rated by trust score and developer usage</p>
          </div>
          <Link
            href="/agents"
            className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:block"
          >
            View all agents →
          </Link>
        </div>
        <AgentGrid agents={FEATURED_AGENTS_MOCK} />
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/agents"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all agents →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Section: Developer CTA ────────────────────────────────────────────────────

function DeveloperCTASection(): React.JSX.Element {
  return (
    <section
      className="relative overflow-hidden bg-indigo-600 px-6 py-16 text-white"
      aria-labelledby="cta-heading"
    >
      {/* Background accent */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_50%,rgba(255,255,255,0.08),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Icon */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
            <path d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </div>

        <h2 id="cta-heading" className="text-2xl font-bold sm:text-3xl">
          Ready to publish your agent?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-indigo-100">
          Submit your agent to Sentinel&apos;s verification pipeline. Get a trust score,
          a certification badge, and access to 1,200+ enterprise buyers — all with
          per-call billing routed through Sentinel&apos;s secure gateway.
        </p>

        {/* Benefits grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: "🛡",
              title: "Verified Badge",
              body: "Display your trust score on your own site and docs.",
            },
            {
              icon: "💳",
              title: "Instant Billing",
              body: "INR paise-accurate metering with daily payouts.",
            },
            {
              icon: "📡",
              title: "MCP + REST",
              body: "Buyers connect via your choice of protocol.",
            },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-indigo-400/30 bg-white/5 p-4"
            >
              <div className="mb-1.5 text-xl" aria-hidden="true">
                {icon}
              </div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="mt-1 text-xs text-indigo-200">{body}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/developer"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-indigo-700 shadow transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
          >
            Start Publishing
          </Link>
          <Link
            href="/developer"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-700/30 px-6 text-sm font-semibold text-indigo-100 transition-colors hover:bg-indigo-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
          >
            View Developer Docs
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

/**
 * Sentinel marketplace landing page. Showcases the hero, agent categories,
 * the four-stage verification pipeline explainer, featured agents, and a
 * developer publish CTA. Fully server-rendered for SEO.
 */
export default function MarketplaceHomePage(): React.JSX.Element {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <TrustScoreSection />
      <FeaturedAgentsSection />
      <DeveloperCTASection />
    </main>
  );
}
