"use client";

import { ShieldCheck, Gauge, Wallet } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { TiltCard } from "../ui/TiltCard";
import { DURATION, EASING, REVEAL_VIEWPORT, STAGGER } from "@/lib/design/motion";
import { motion } from "framer-motion";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    eyebrow: "Security",
    title: "Four-stage verification",
    description:
      "Static analysis, dependency scanning, sandboxed behaviour testing, and prompt-injection probing — before any agent goes live.",
  },
  {
    icon: Gauge,
    eyebrow: "Trust",
    title: "Calibrated 0–100 scores",
    description:
      "A single, continuously-updated trust score per agent. No black boxes — every number is backed by evidence you can inspect.",
  },
  {
    icon: Wallet,
    eyebrow: "Settlement",
    title: "Automatic credit payouts",
    description:
      "Buyers top up credits (1 Cr = ₹1); Sentinel meters every call and settles developer payouts automatically on confirmation.",
  },
];

/**
 * Scene 3 — the three pillars of the platform as 3D tilt cards that rise into
 * view and respond to the cursor with depth and a tracking glow.
 */
export function Features(): React.JSX.Element {
  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              Why Sentinel
            </span>
          </Reveal>
          <h2 className="mx-auto mt-4 max-w-3xl text-display-sm font-semibold text-porcelain">
            <SplitText lines={["Three layers of trust,", "one platform"]} />
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: DURATION.base, ease: EASING.expo, delay: i * STAGGER.loose }}
            >
              <TiltCard className="h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/30 to-gold/20 ring-hairline">
                  <feature.icon className="h-6 w-6 text-gold" />
                </div>
                <div className="font-brand-mono text-xs uppercase tracking-[0.2em] text-graphite">
                  {feature.eyebrow}
                </div>
                <h3 className="mt-2 text-xl font-semibold text-porcelain">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-porcelain/55">{feature.description}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
