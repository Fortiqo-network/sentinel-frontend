"use client";

import { motion } from "framer-motion";
import { Counter } from "../ui/Counter";
import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { DURATION, EASING, REVEAL_VIEWPORT, STAGGER } from "@/lib/design/motion";

/**
 * Live platform figures resolved server-side from the gateway and passed into
 * the stats scene. `verifiedAgents` and `avgTrustScore` are real; the rest are
 * fixed platform facts (pipeline depth, score scale).
 */
export interface LiveStats {
  verifiedAgents: number;
  avgTrustScore: number;
}

/**
 * Scene 5 — the numbers. Counters spring up to their value as the band enters
 * the viewport. The agent count and average trust score are read live from the
 * marketplace; the verification depth and score range are platform constants.
 *
 * @example
 * <Stats stats={{ verifiedAgents: 42, avgTrustScore: 86 }} />
 */
export function Stats({ stats }: { stats: LiveStats }): React.JSX.Element {
  const items = [
    { node: <Counter value={stats.verifiedAgents} suffix="+" />, label: "Agents verified", live: true },
    { node: <Counter value={stats.avgTrustScore} />, label: "Average trust score", live: true },
    { node: <Counter value={4} />, label: "Verification stages", live: false },
    { node: <span>0–100</span>, label: "Calibrated trust scale", live: false },
  ];

  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2.5rem] glass ring-hairline grain relative px-8 py-16 sm:px-14">
          <div
            aria-hidden
            className="absolute -left-1/4 top-0 h-[140%] w-1/2 rotate-12 bg-aurora-indigo/10 blur-[120px]"
          />
          <div className="relative">
            <div className="mb-14 max-w-xl">
              <Reveal>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-aurora-cyan">
                  Live platform signal
                </span>
              </Reveal>
              <h2 className="mt-4 text-display-sm font-semibold text-white">
                <SplitText lines={["Trust, measured", "in real numbers"]} />
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: DURATION.base, ease: EASING.expo, delay: i * STAGGER.base }}
                >
                  <div className="font-mono text-4xl font-semibold text-white sm:text-5xl">
                    {item.node}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/55">
                    {item.live && (
                      <span className="h-1.5 w-1.5 rounded-full bg-aurora-cyan shadow-[0_0_8px_#22d3ee]" />
                    )}
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
