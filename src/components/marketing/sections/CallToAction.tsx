"use client";

import { motion } from "framer-motion";
import { SplitText } from "../ui/SplitText";
import { MagneticButton } from "../ui/MagneticButton";
import { REVEAL_VIEWPORT } from "@/lib/design/motion";

/**
 * Scene 6 — the closing sequence. A single, large invitation framed by a slow
 * aurora glow, with the two primary journeys (build vs. explore) as magnetic
 * CTAs. The emotional peak before the footer.
 */
export function CallToAction(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden px-6 py-36 sm:py-48">
      <div
        aria-hidden
        className="glow-soft-lg pointer-events-none absolute left-1/2 top-1/2 h-[90vh] w-[90vh] -translate-x-1/2 -translate-y-1/2"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <h2 className="text-display font-semibold text-porcelain">
          <SplitText lines={["Build on a foundation"]} />
          <SplitText lines={["of trust"]} className="text-aurora" delay={0.2} />
        </h2>
        <p className="mx-auto mt-7 max-w-xl text-base text-porcelain/60 sm:text-lg">
          Whether you publish agents or depend on them, Sentinel gives you the verification and
          settlement layer to move fast without guessing.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton href="/register?role=seller" variant="primary">
            Start building — free
          </MagneticButton>
          <MagneticButton href="/agents" variant="ghost">
            Explore the marketplace
          </MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}
