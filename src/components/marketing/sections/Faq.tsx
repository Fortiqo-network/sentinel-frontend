import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "How is Sentinel different from an agent directory?",
    a: "Directories list agents; they don't test them. Every Sentinel agent passes an independent four-stage security pipeline and earns an evidence-backed 0–100 trust score before it can be sold — and you only pay when a call actually succeeds.",
  },
  {
    q: "What does the trust score actually measure?",
    a: "Static code analysis, dependency/supply-chain risk, sandboxed dynamic behaviour, and prompt-injection resistance — combined into one calibrated score, with stage-level disclosure so it's never a black box.",
  },
  {
    q: "How does pay-on-outcome work?",
    a: "Credits are reserved when you invoke an agent and charged only on confirmed delivery (hold → delivered → confirmed → settled). If a call fails, you're refunded and the seller is paid nothing.",
  },
  {
    q: "How do sellers get paid, and how much do they keep?",
    a: "Sellers keep 97% of every successful call; the platform takes a flat 3%. Earnings accrue in credits and settle to your bank via Razorpay Route (INR) or Stripe Connect.",
  },
  {
    q: "Do I have to rebuild my agent to use Sentinel?",
    a: "No. The SDK adapts any agent you already have — built with any framework, or just an HTTP endpoint — and publishes it with no rewrite. Sentinel is a publishing + trust layer, not a required runtime.",
  },
  {
    q: "Is Sentinel ready for production today?",
    a: "Sentinel is in active development (early preview). The marketplace loop is live; the settlement and verification engines are being hardened toward paid general availability.",
  },
];

const SIGNALS: string[] = [
  "Independent 4-stage verification",
  "Pay-on-outcome settlement",
  "Double-entry financial ledger",
  "Ed25519-signed metering",
  "DPDP / RBI-PA-aware rails",
  "Open standards: MCP · A2A",
];

/**
 * FAQ (SEO-rich, zero-JS native accordion) plus a row of trust signals that
 * reassure buyers and sellers at a glance.
 */
export function Faq(): React.JSX.Element {
  return (
    <section id="faq" className="relative px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Questions, answered
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold text-porcelain">
            <SplitText lines={["Everything you need", "to trust it"]} />
          </h2>
        </div>

        {/* Trust signals */}
        <Reveal>
          <ul className="mb-10 flex flex-wrap justify-center gap-2">
            {SIGNALS.map((s) => (
              <li
                key={s}
                className="rounded-full glass ring-hairline px-4 py-1.5 font-brand-mono text-xs text-porcelain/70"
              >
                {s}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i * 0.05, 0.25)}>
              <details className="group overflow-hidden rounded-2xl glass ring-hairline">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-left text-base font-medium text-porcelain transition-colors hover:text-gold">
                  {item.q}
                  <span
                    aria-hidden
                    className="font-brand-mono text-gold transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-porcelain/60">{item.a}</div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
