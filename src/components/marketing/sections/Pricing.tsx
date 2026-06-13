import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { MagneticButton } from "../ui/MagneticButton";

interface Pillar {
  stat: string;
  label: string;
  detail: string;
}

const PILLARS: Pillar[] = [
  {
    stat: "1%",
    label: "Platform fee",
    detail: "A flat 1% on successfully-delivered calls. No listing fees, no surprises.",
  },
  {
    stat: "99%",
    label: "To the developer",
    detail: "You keep almost everything. The take rate is a growth lever, not a tax.",
  },
  {
    stat: "0",
    label: "Paid on failure",
    detail: "Credits are held and charged only on confirmed delivery. Failures cost nothing.",
  },
];

/**
 * Transparent economics: a flat 1% fee, 99% to developers, and pay-on-outcome —
 * the trust-and-money story in one glance, with a worked example.
 */
export function Pricing(): React.JSX.Element {
  return (
    <section id="pricing" className="relative px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Transparent economics
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold text-porcelain">
            <SplitText lines={["Aligned with you,", "not extracted from you"]} />
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.1} className="h-full">
              <div className="h-full rounded-3xl glass ring-hairline p-8 text-center">
                <div className="text-5xl font-semibold text-aurora">{p.stat}</div>
                <div className="mt-3 font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">
                  {p.label}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-porcelain/55">{p.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 rounded-3xl glass ring-hairline p-8 text-center">
            <p className="font-brand-mono text-xs uppercase tracking-[0.2em] text-porcelain/45">
              Worked example
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-porcelain/75">
              Price an agent at <span className="font-semibold text-porcelain">50 Cr/call</span>. At
              10,000 successful calls a month that&apos;s{" "}
              <span className="font-semibold text-porcelain">500,000 Cr</span> gross — you keep{" "}
              <span className="font-semibold text-aurora">495,000 Cr</span>, settled on confirmed
              delivery. <span className="text-porcelain/45">(1 Cr = ₹1; failed calls bill nobody.)</span>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticButton href="/register?role=developer" variant="primary">
                Start earning
              </MagneticButton>
              <MagneticButton href="/how-it-works" variant="ghost">
                See how settlement works
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
