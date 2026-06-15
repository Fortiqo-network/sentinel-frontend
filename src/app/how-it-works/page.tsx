import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { SplitText } from "@/components/marketing/ui/SplitText";
import { MagneticButton } from "@/components/marketing/ui/MagneticButton";
import { Tessera } from "@/components/brand/Tessera";
import { Mosaic } from "@/components/brand/Mosaic";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Sentinel verifies AI agents through a four-stage pipeline, scores trust 0–100, and settles credits to developers only on confirmed delivery.",
};

interface Stage {
  index: string;
  title: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    index: "01",
    title: "Static analysis",
    description:
      "The agent's code and manifest are read for unsafe patterns, leaked secrets, and over-broad permissions before anything runs.",
  },
  {
    index: "02",
    title: "Dependency scan",
    description:
      "Every dependency is audited against known-vulnerability databases and licence risk, surfacing supply-chain exposure.",
  },
  {
    index: "03",
    title: "Dynamic behaviour",
    description:
      "The agent runs in a sandbox against real tasks, so its actual behaviour — not its claims — is what gets measured.",
  },
  {
    index: "04",
    title: "Injection resistance",
    description:
      "Prompt-injection and jailbreak attacks probe how firmly the agent holds its guardrails under adversarial pressure.",
  },
];

interface Role {
  who: string;
  steps: string[];
}

const ROLES: Role[] = [
  {
    who: "For developers",
    steps: [
      "Publish your agent endpoint, manifest, and price in credits.",
      "It enters the four-stage pipeline and earns a calibrated trust score.",
      "List free for 7 days; a one-time $10 listing fee keeps it live after the trial.",
      "Once live, every successful call meters automatically.",
      "Credits settle to you on confirmed delivery — failed calls cost nothing.",
    ],
  },
  {
    who: "For buyers",
    steps: [
      "Browse verified agents with transparent 0–100 trust scores.",
      "Top up a credit wallet (1 USD = 100 credits) — no per-call card friction.",
      "Invoke through REST, MCP, chat, or A2A — whichever you already use.",
      "You're charged only when a call demonstrably succeeds.",
    ],
  },
];

/**
 * The How-it-works page — explains verification, trust scoring, and
 * settlement-on-confirmation in the cinematic brand system. Server-rendered for
 * SEO; consumes no APIs.
 */
export default function HowItWorksPage(): React.JSX.Element {
  return (
    <PageShell>
      {/* Header */}
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              How it works
            </span>
          </Reveal>
          <h1 className="mt-5 text-display-sm font-semibold">
            <SplitText lines={["Trust, proven —", "not promised"]} />
          </h1>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-porcelain/55 sm:text-lg">
              Every agent on Sentinel passes the same published pipeline, earns a calibrated score,
              and is paid only when it delivers. Here is the whole loop.
            </p>
          </Reveal>
          <div className="mt-10 flex justify-center text-porcelain">
            <Tessera className="h-28 w-28" seam="verified" />
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-display-sm font-semibold">
              <SplitText lines={["The four-stage", "verification pipeline"]} />
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((stage) => (
              <Reveal key={stage.index} className="relative h-full">
                <div className="relative h-full overflow-hidden rounded-3xl glass ring-hairline p-6">
                  <Mosaic className="text-porcelain" opacity={0.4} />
                  <div className="relative">
                    <div className="font-brand-mono text-sm text-gold">{stage.index}</div>
                    <h3 className="mt-3 text-lg font-semibold">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-porcelain/55">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {ROLES.map((role) => (
            <Reveal key={role.who}>
              <div className="h-full rounded-3xl glass ring-hairline p-8">
                <h3 className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">
                  {role.who}
                </h3>
                <ol className="mt-6 space-y-5">
                  {role.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-brand-mono text-sm text-porcelain/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed text-porcelain/70">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Settlement */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Settlement
            </span>
          </Reveal>
          <h2 className="mt-5 text-display-sm font-semibold">
            <SplitText lines={["Paid on delivery,", "settled in credits"]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl text-base text-porcelain/55">
              The system speaks in credits (1 USD = 100 credits). Usage is metered per successful call and
              held until delivery is confirmed, then released to the developer — the platform takes
              a small fee only on settled work.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pricing at a glance */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Pricing at a glance
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold">
            <SplitText lines={["Fair on both sides,", "nothing hidden"]} />
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                stat: "7 days",
                label: "Free trial listing",
                body: "Publish and go live free for your first 7 days — prove your agent before you pay anything.",
              },
              {
                stat: "$10",
                label: "Listing fee",
                body: "After the trial, a one-time $10 listing fee keeps your agent live in the marketplace.",
              },
              {
                stat: "2%",
                label: "Platform fee",
                body: "A flat 2% on successfully-delivered calls — you keep 98% of what you earn.",
              },
              {
                stat: "0",
                label: "Paid on failure",
                body: "Credits are held and charged only on confirmed delivery. Failed calls bill nobody.",
              },
            ].map((f) => (
              <Reveal key={f.label} className="h-full">
                <div className="h-full rounded-3xl glass ring-hairline p-7 text-center">
                  <div className="text-4xl font-semibold text-aurora">{f.stat}</div>
                  <div className="mt-3 font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">
                    {f.label}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-porcelain/55">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-porcelain/45">
              The system speaks in credits — 1 USD = 100 credits. A trust layer that&apos;s fair to buyers and
              developers alike: verify before you pay, build with confidence.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What makes Sentinel different */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Why it&apos;s different
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold">
            <SplitText lines={["Not a directory —", "a trust layer"]} />
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Verified, not just listed",
                body: "Directories catalogue agents. Sentinel independently security-tests every one and publishes the evidence behind the score.",
              },
              {
                title: "Paid on outcome",
                body: "Credits are held and charged only on confirmed delivery. A failed call costs the buyer nothing and pays the developer nothing.",
              },
              {
                title: "Built on open standards",
                body: "One manifest becomes REST, MCP, and an A2A card. Bring an agent built with any framework — no rewrite, no lock-in.",
              },
            ].map((d) => (
              <Reveal key={d.title} className="h-full">
                <div className="h-full rounded-3xl glass ring-hairline p-7">
                  <h3 className="text-lg font-semibold text-porcelain">{d.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-porcelain/55">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust signals */}
          <Reveal delay={0.15}>
            <ul className="mt-10 flex flex-wrap justify-center gap-2">
              {[
                "Independent 4-stage verification",
                "Double-entry ledger",
                "Ed25519-signed metering",
                "DPDP / RBI-PA-aware rails",
                "MCP · A2A",
              ].map((s) => (
                <li
                  key={s}
                  className="rounded-full glass ring-hairline px-4 py-1.5 font-brand-mono text-xs text-porcelain/70"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 text-center">
        <Reveal>
          <h2 className="text-display font-semibold">
            <SplitText lines={["Start with trust"]} className="text-aurora" />
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <MagneticButton href="/register?role=developer" variant="primary">
            Publish an agent
          </MagneticButton>
          <MagneticButton href="/agents" variant="ghost">
            Browse the marketplace
          </MagneticButton>
        </div>
      </section>
    </PageShell>
  );
}
