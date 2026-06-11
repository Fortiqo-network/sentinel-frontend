"use client";

import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { DURATION, EASING, REVEAL_VIEWPORT, STAGGER } from "@/lib/design/motion";

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
      "Reads the agent's code and manifest for unsafe patterns, leaked secrets, and over-broad permissions before it ever runs.",
  },
  {
    index: "02",
    title: "Dependency scan",
    description:
      "Audits every dependency against known-vulnerability databases and licence risk, flagging supply-chain exposure.",
  },
  {
    index: "03",
    title: "Dynamic behaviour",
    description:
      "Runs the agent in a sandbox against real tasks to observe what it actually does — not just what it claims to do.",
  },
  {
    index: "04",
    title: "Injection resistance",
    description:
      "Probes the agent with prompt-injection and jailbreak attacks to measure how firmly it holds its guardrails under pressure.",
  },
];

/**
 * Scene 2 — explains the platform through its core mechanic: the four-stage
 * verification pipeline every agent must pass. A rail draws itself across the
 * stages as the section enters, and each stage card rises in sequence.
 */
export function Pipeline(): React.JSX.Element {
  return (
    <section id="how-it-works" className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-aurora-cyan">
              How verification works
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold text-white">
            <SplitText lines={["Every agent earns", "its trust score"]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-5 text-base text-white/55">
              Trust isn&apos;t self-reported. Each agent runs a gauntlet of four independent
              checks; the result is a single calibrated 0–100 score buyers can act on.
            </p>
          </Reveal>
        </div>

        <div className="relative">
          {/* The animated rail connecting the stages. */}
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: DURATION.cinematic, ease: EASING.expo }}
            className="absolute left-0 top-6 hidden h-px w-full origin-left bg-gradient-to-r from-aurora-indigo via-aurora-violet to-aurora-cyan lg:block"
          />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: DURATION.base, ease: EASING.expo, delay: i * STAGGER.loose }}
                className="relative"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full glass ring-hairline font-mono text-sm text-aurora-cyan">
                  {stage.index}
                </div>
                <h3 className="text-lg font-semibold text-white">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{stage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
