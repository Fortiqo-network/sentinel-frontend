import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { FEATURED_AGENTS_MOCK } from "@/lib/api/agents";

export const metadata: Metadata = {
  title: "Sentinel — The Trust Layer for AI Agents",
  description:
    "Sentinel is the verification, settlement, and portable-reputation layer for the AI agent economy. 4-stage security pipeline, 0–100 trust scores.",
};

// ── Static data ───────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    key: "static",
    label: "Static Analysis",
    detail: "AST scanning, secret detection, dependency CVE audit",
    delay: "0.1s",
  },
  {
    key: "supply",
    label: "Supply Chain",
    detail: "Package provenance, SBOM generation, license check",
    delay: "0.35s",
  },
  {
    key: "dynamic",
    label: "Dynamic Testing",
    detail: "Sandboxed execution, rate-limit probing, output validation",
    delay: "0.60s",
  },
  {
    key: "redteam",
    label: "Red-Team Eval",
    detail: "Prompt injection, jailbreak resistance, adversarial inputs",
    delay: "0.85s",
  },
] as const;

const HOW_IT_WORKS = [
  {
    role: "For Developers",
    step: "01",
    title: "Submit your agent",
    body: "Push a manifest, connect your endpoint. The pipeline runs automatically. You see every finding.",
    icon: "⬡",
  },
  {
    role: "For Developers",
    step: "02",
    title: "Earn a trust score",
    body: "A 0–100 score and public report. Higher scores unlock premium tiers and better discovery.",
    icon: "◎",
  },
  {
    role: "For Buyers",
    step: "03",
    title: "Deploy with evidence",
    body: "Every agent ships with a REST endpoint, MCP config, and CLI command. One line to connect.",
    icon: "⬡",
  },
  {
    role: "For Buyers",
    step: "04",
    title: "Pay only on success",
    body: "Points deduct on delivery. Failures are free. The ledger is yours to audit any time.",
    icon: "◎",
  },
] as const;

const STATS = [
  { value: "500+", label: "Verified Agents" },
  { value: "4-stage", label: "Security Pipeline" },
  { value: "99.9%", label: "Platform Uptime" },
  { value: "0–100", label: "Trust Score Range" },
] as const;

// ── Components ────────────────────────────────────────────────────────────────

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-grid py-24 sm:py-32">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(42,78,124,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Eyebrow */}
        <p
          className="sen-eyebrow mb-6"
          style={{ animation: "scanIn 0.4s ease both", animationDelay: "0s" }}
        >
          Trust Infrastructure · Early Access
        </p>

        {/* Headline */}
        <h1
          className="text-4xl font-bold leading-tight tracking-tight text-sen-text sm:text-5xl lg:text-6xl"
          style={{ animation: "scanIn 0.4s ease both", animationDelay: "0.1s" }}
        >
          No black boxes.
          <br />
          No promises.
          <br />
          <span className="text-sen-gold">Just evidence.</span>
        </h1>

        {/* Subtext */}
        <p
          className="mx-auto mt-6 max-w-xl text-base text-sen-muted sm:text-lg"
          style={{ animation: "scanIn 0.4s ease both", animationDelay: "0.25s" }}
        >
          Every agent on Sentinel passes a four-stage security pipeline before it can be deployed.
          You see exactly what was checked, what passed, and what didn&apos;t.
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          style={{ animation: "scanIn 0.4s ease both", animationDelay: "0.4s" }}
        >
          <Link
            href="/agents"
            className="sen-btn-primary px-7 py-3 text-base"
          >
            Browse Verified Agents
          </Link>
          <Link
            href="/register"
            className="sen-btn-ghost px-7 py-3 text-base"
          >
            Publish Your Agent
          </Link>
        </div>

        {/* Pipeline viz */}
        <div
          className="mt-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          aria-label="Verification pipeline stages"
        >
          {PIPELINE_STAGES.map((stage, i) => (
            <React.Fragment key={stage.key}>
              {/* Stage card */}
              <div
                className="w-full max-w-[180px] rounded-xl border border-sen-border bg-sen-surface p-4 text-left"
                style={{
                  animation: "scanIn 0.45s ease both",
                  animationDelay: stage.delay,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-sen-muted">
                    Stage {i + 1}
                  </span>
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-sen-teal/15 text-sen-teal"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-sen-text">{stage.label}</p>
                <p className="mt-1 text-[11px] text-sen-muted leading-relaxed">{stage.detail}</p>
              </div>

              {/* Arrow connector */}
              {i < PIPELINE_STAGES.length - 1 && (
                <svg
                  className="hidden h-4 w-6 shrink-0 text-sen-border-hi sm:block"
                  fill="none"
                  viewBox="0 0 24 12"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M0 6h20m0 0l-4-4m4 4l-4 4" />
                </svg>
              )}
            </React.Fragment>
          ))}

          {/* Trust Score result */}
          <div
            className="flex w-full max-w-[180px] flex-col items-center justify-center rounded-xl border border-sen-teal/30 bg-sen-teal/5 p-4"
            style={{
              animation: "scanIn 0.45s ease both",
              animationDelay: "1.1s",
            }}
          >
            <span className="text-3xl font-bold font-mono text-sen-teal">91</span>
            <span className="mt-1 text-[10px] font-mono uppercase tracking-widest text-sen-teal/70">
              Trust Score
            </span>
            <span className="mt-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-400">
              Certified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip(): React.JSX.Element {
  return (
    <section className="border-y border-sen-border bg-sen-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-sen-border sm:grid-cols-4 px-4 sm:px-6">
        {STATS.map(({ value, label }) => (
          <div key={label} className="py-8 text-center px-4">
            <p className="text-2xl font-bold font-mono text-sen-text">{value}</p>
            <p className="mt-1 text-xs font-mono uppercase tracking-wider text-sen-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Featured agents ───────────────────────────────────────────────────────────

function FeaturedAgents(): React.JSX.Element {
  const featured = FEATURED_AGENTS_MOCK.slice(0, 3);

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10">
          <p className="sen-eyebrow mb-2">Verified on Sentinel</p>
          <h2 className="text-2xl font-bold text-sen-text sm:text-3xl">
            Agents you can actually trust
          </h2>
          <p className="mt-2 text-sen-muted">
            Each score is earned, not assigned. Click any agent to read its full pipeline report.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/agents"
            className="sen-btn-ghost inline-flex"
          >
            View all verified agents
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

function HowItWorks(): React.JSX.Element {
  return (
    <section className="border-t border-sen-border bg-sen-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="sen-eyebrow mb-2">The Process</p>
          <h2 className="text-2xl font-bold text-sen-text sm:text-3xl">How Sentinel works</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, role, title, body, icon }) => (
            <div key={step} className="rounded-xl border border-sen-border bg-sen-bg p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-2xl" aria-hidden="true">{icon}</span>
                <span className="text-xs font-mono text-sen-muted">{step}</span>
              </div>
              <p className="mb-1 text-xs font-mono uppercase tracking-wider text-sen-gold">{role}</p>
              <h3 className="text-base font-semibold text-sen-text">{title}</h3>
              <p className="mt-2 text-sm text-sen-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Developer CTA ─────────────────────────────────────────────────────────────

function DeveloperCTA(): React.JSX.Element {
  return (
    <section className="border-t border-sen-border py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="sen-eyebrow mb-3">For Developers</p>
        <h2 className="text-2xl font-bold text-sen-text sm:text-4xl">
          Your agents deserve a reputation
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-sen-muted">
          Publish once. Get a trust score, a verified badge, and automatic settlement every time
          a buyer uses your agent. No invoicing, no contracts, no chasing payments.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/register" className="sen-btn-primary px-8 py-3 text-base">
            Start Publishing
          </Link>
          <Link href="/docs" className="sen-btn-ghost px-8 py-3 text-base">
            Read the Docs
          </Link>
        </div>

        {/* Mini explainer */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Submit manifest", detail: "One YAML file describes your agent's endpoints and capabilities." },
            { label: "Pass the pipeline", detail: "4-stage automated scan. Full report published on your agent's page." },
            { label: "Earn on every call", detail: "Points settle instantly on success. Withdraw any time." },
          ].map(({ label, detail }) => (
            <div key={label} className="rounded-xl border border-sen-border bg-sen-surface p-5 text-left">
              <div className="mb-2 h-1.5 w-8 rounded-full bg-sen-gold" aria-hidden="true" />
              <p className="text-sm font-semibold text-sen-text">{label}</p>
              <p className="mt-1.5 text-xs text-sen-muted leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-sen-border bg-sen-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="text-base font-bold tracking-tight text-sen-text">
              Sentinel<span className="text-sen-gold">.</span>
            </span>
            <p className="mt-1 text-xs text-sen-muted">Verified AI Agent Marketplace</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {[
              { href: "/agents", label: "Marketplace" },
              { href: "/pricing", label: "Pricing" },
              { href: "/docs", label: "Docs" },
              { href: "/login", label: "Sign In" },
              { href: "/register", label: "Register" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm text-sen-muted hover:text-sen-text transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-sen-border pt-6">
          <p className="text-xs text-sen-muted">
            &copy; {new Date().getFullYear()} Sentinel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

/**
 * Landing page. Server component — no client JS.
 * Dark ink-navy theme with gold accents and the pipeline verification hero.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsStrip />
        <FeaturedAgents />
        <HowItWorks />
        <DeveloperCTA />
      </main>
      <Footer />
    </>
  );
}
