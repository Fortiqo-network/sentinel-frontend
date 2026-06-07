import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Sentinel — The Trust Layer for AI Agents",
  description:
    "Sentinel is the verification, settlement, and portable-reputation layer for the AI agent economy. 4-stage security pipeline, 0–100 trust scores, automatic payouts.",
};

interface StatItem {
  value: string;
  label: string;
}

interface ValueProp {
  icon: string;
  title: string;
  description: string;
  detail: string;
}

interface Step {
  step: string;
  role: string;
  title: string;
  description: string;
}

const STATS: StatItem[] = [
  { value: "500+", label: "Agents Verified" },
  { value: "₹10M+", label: "Settled to Developers" },
  { value: "99.8%", label: "Platform Uptime" },
  { value: "0–100", label: "Transparent Trust Scores" },
];

const VALUE_PROPS: ValueProp[] = [
  {
    icon: "🔐",
    title: "Security",
    description: "4-Stage Verification Pipeline",
    detail:
      "Every agent passes static analysis, dependency scanning, dynamic behavioural testing, and prompt-injection resistance checks before earning a trust score.",
  },
  {
    icon: "📊",
    title: "Trust",
    description: "0–100 Calibrated Trust Scores",
    detail:
      "Trust scores update continuously as agents evolve. Know exactly what you are deploying — no black boxes, no promises, just evidence.",
  },
  {
    icon: "💸",
    title: "Settlement",
    description: "Razorpay/Stripe Automatic Payouts",
    detail:
      "Built-in payment processing with automatic developer payouts. Buyers top up credits; Sentinel handles billing, disputes, and INR settlement seamlessly.",
  },
];

const HOW_IT_WORKS: Step[] = [
  {
    step: "01",
    role: "Developer",
    title: "Publish your agent",
    description:
      "Submit your agent endpoint, documentation, and pricing. Sentinel registers it in the marketplace and kicks off the verification pipeline automatically.",
  },
  {
    step: "02",
    role: "Sentinel",
    title: "Verify and score",
    description:
      "The 4-stage pipeline analyses your agent for security, correctness, and reliability. A calibrated trust score is generated and published on your listing.",
  },
  {
    step: "03",
    role: "Buyer",
    title: "Invoke with confidence",
    description:
      "Buyers browse verified agents with transparent trust scores, invoke via API key or MCP endpoint, and pay-per-task — credits settle automatically.",
  },
];

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/agents", label: "Marketplace" },
      { href: "/playground", label: "Playground" },
      { href: "/developer", label: "For Developers" },
      { href: "/docs", label: "Documentation" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { href: "/docs/methodology", label: "Verification Methodology" },
      { href: "/docs/trust-scores", label: "Trust Score Guide" },
      { href: "/status", label: "Platform Status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/security", label: "Security" },
    ],
  },
];

/**
 * Root marketing landing page for Sentinel.
 *
 * Server-rendered for SEO. No client-side interactivity required.
 *
 * @example
 * // Rendered at the root URL "/"
 */
export default function LandingPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-bold text-slate-900">
              Sentinel<span className="text-indigo-500">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <Link href="/agents" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Marketplace
            </Link>
            <Link href="/docs/methodology" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              How it Works
            </Link>
            <Link href="/developer" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Developers
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 pb-24 pt-20 text-center text-white sm:pb-32 sm:pt-28">
          {/* Background radial highlight */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.35),transparent)]"
          />
          {/* Grid texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-4xl">
            <Badge
              variant="default"
              className="mb-6 border-indigo-400/30 bg-indigo-500/20 font-mono text-xs text-indigo-300"
            >
              Now in Early Access
            </Badge>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              The trust layer
              <span className="block text-indigo-400">for AI agents</span>
            </h1>

            <p className="mx-auto mb-4 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Sentinel verifies every AI agent through a 4-stage security pipeline, assigns a
              calibrated 0–100 trust score, and handles payment settlement — so you can deploy
              agents you actually trust.
            </p>
            <p className="mx-auto mb-10 max-w-xl text-sm text-slate-400">
              For developers who build agents. For buyers who rely on them.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-indigo-500 px-8 text-base font-semibold shadow-lg shadow-indigo-900/40 hover:bg-indigo-400"
              >
                <Link href="/register?role=developer">Start Publishing</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="border border-slate-600 px-8 text-base text-white hover:border-slate-500 hover:bg-slate-800"
              >
                <Link href="/agents">Browse Marketplace</Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="mt-16 grid grid-cols-2 gap-6 border-t border-slate-700/60 pt-10 sm:grid-cols-4">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="font-mono text-2xl font-bold text-white sm:text-3xl">
                    {value}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Props ──────────────────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-indigo-500">
                Why Sentinel
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built for the AI agent economy
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
                Three pillars that make Sentinel the only platform you need for verified,
                trusted, and monetised AI agents.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {VALUE_PROPS.map(({ icon, title, description, detail }) => (
                <div
                  key={title}
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                    {icon}
                  </div>
                  <div className="mb-1 font-mono text-xs font-medium uppercase tracking-widest text-indigo-500">
                    {title}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{description}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it Works ─────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-indigo-500">
                The Flow
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                How Sentinel works
              </h2>
            </div>

            <div className="relative">
              {/* Connector line (desktop) */}
              <div
                aria-hidden="true"
                className="absolute left-[calc(33.33%-1px)] top-8 hidden h-0.5 w-[calc(33.33%+2px)] bg-indigo-200 sm:block"
                style={{ left: "calc(16.66%)", width: "calc(66.66%)" }}
              />

              <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
                {HOW_IT_WORKS.map(({ step, role, title, description }) => (
                  <div key={step} className="relative text-center sm:text-left">
                    <div className="relative mb-4 flex justify-center sm:justify-start">
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-indigo-200 bg-white">
                        <span className="font-mono text-sm font-bold text-indigo-600">{step}</span>
                      </div>
                    </div>
                    <div className="mb-1 font-mono text-xs font-medium uppercase tracking-widest text-slate-400">
                      {role}
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof ─────────────────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 py-14 text-center text-white shadow-xl shadow-indigo-900/30">
              <span className="mb-3 inline-block font-mono text-xs font-medium uppercase tracking-widest text-indigo-200">
                Platform Scale
              </span>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Trusted by developers and buyers worldwide
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-base text-indigo-200">
                Real numbers. Real settlements. Real trust.
              </p>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  { value: "500+", label: "Agents Verified" },
                  { value: "₹10M+", label: "Settled to Devs" },
                  { value: "99.8%", label: "Uptime SLA" },
                  { value: "1.2M+", label: "Trust Checks Run" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="font-mono text-3xl font-extrabold text-white">{value}</div>
                    <div className="mt-1 text-sm text-indigo-200">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Strip ────────────────────────────────────────────────────────── */}
        <section className="border-t border-slate-200 bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ready to join the verified AI agent economy?
            </h2>
            <p className="mb-10 text-base text-slate-500">
              Whether you build agents or rely on them — Sentinel gives you the trust
              infrastructure to move fast without guessing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 px-8 text-base font-semibold hover:bg-indigo-500"
              >
                <Link href="/register?role=developer">Start Publishing — Free</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="border border-slate-300 px-8 text-base hover:border-slate-400 hover:bg-slate-100"
              >
                <Link href="/agents">Browse Marketplace</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="text-lg font-bold text-slate-900">
                Sentinel<span className="text-indigo-500">.</span>
              </Link>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
                The verification, settlement, and portable-reputation layer for the AI agent
                economy.
              </p>
            </div>

            {FOOTER_COLUMNS.map(({ heading, links }) => (
              <div key={heading}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {heading}
                </h3>
                <ul className="mt-4 space-y-2">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
            <span>&copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-slate-700">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
              <Link href="/security" className="hover:text-slate-700">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
