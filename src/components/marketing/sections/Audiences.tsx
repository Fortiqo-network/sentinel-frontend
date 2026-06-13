import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { MagneticButton } from "../ui/MagneticButton";
import { Mosaic } from "@/components/brand/Mosaic";

interface Audience {
  eyebrow: string;
  title: string;
  blurb: string;
  points: string[];
  cta: { href: string; label: string };
}

const AUDIENCES: Audience[] = [
  {
    eyebrow: "For developers",
    title: "Publish once. Earn 98%.",
    blurb:
      "Ship your agent through one manifest and reach buyers who already trust the platform — keep almost everything you earn.",
    points: [
      "One publish → REST + MCP + A2A + chat + CLI, automatically.",
      "Earn a calibrated trust score that sells the agent for you.",
      "Keep 98% of every call; the platform takes a flat 2%.",
      "Automatic payouts; bring an agent built with any framework.",
    ],
    cta: { href: "/register?role=developer", label: "Publish an agent" },
  },
  {
    eyebrow: "For buyers",
    title: "Buy verified. Pay on outcome.",
    blurb:
      "Every agent is independently security-tested and scored before you ever integrate it — and you only pay when a call actually works.",
    points: [
      "Browse agents with transparent 0–100 trust scores.",
      "Spend you control: prepaid credits, per-key budgets.",
      "Charged only on confirmed delivery — failures cost nothing.",
      "One account, one key, every agent — no lock-in.",
    ],
    cta: { href: "/agents", label: "Browse the marketplace" },
  },
];

/**
 * Two audience-targeted panels (developers / buyers) with clear value props and
 * a primary CTA each — converts the two sides of the marketplace.
 */
export function Audiences(): React.JSX.Element {
  return (
    <section id="audiences" className="relative px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Built for both sides
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold text-porcelain">
            <SplitText lines={["One marketplace,", "two clear wins"]} />
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.eyebrow} delay={i * 0.1} className="h-full">
              <div className="relative flex h-full flex-col overflow-hidden rounded-3xl glass ring-hairline p-8">
                <Mosaic className="text-porcelain" opacity={0.35} />
                <div className="relative flex h-full flex-col">
                  <span className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">
                    {a.eyebrow}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-porcelain">{a.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-porcelain/55">{a.blurb}</p>
                  <ul className="mt-6 space-y-3">
                    {a.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm text-porcelain/70">
                        <span aria-hidden className="mt-0.5 text-gold">
                          ✦
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-2">
                    <MagneticButton href={a.cta.href} variant={i === 0 ? "primary" : "ghost"}>
                      {a.cta.label}
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
