"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Tessera } from "@/components/brand/Tessera";
import { Constellation } from "../Constellation";
import { SplitText } from "../ui/SplitText";
import { MagneticButton } from "../ui/MagneticButton";

/**
 * Scene 1 — the full-viewport landing, anchored by the Living Mark. The open
 * seal orbits quietly above the headline (and seals on hover); on scroll the
 * whole composition drifts up and dissolves into the next scene.
 */
export function Hero(): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const sealScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Drifting constellation backdrop. */}
      <Constellation className="z-0 text-porcelain" />

      {/* Ambient gold wash behind the mark. */}
      <div
        aria-hidden
        className="glow-soft pointer-events-none absolute left-1/2 top-[38%] h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <motion.div style={{ scale: sealScale }} className="mb-10 text-porcelain">
          <Tessera className="h-36 w-36 sm:h-44 sm:w-44" seam="scan" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full glass ring-hairline px-4 py-1.5 font-brand-mono text-[11px] uppercase tracking-[0.18em] text-porcelain/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#E7A03C]" />
          The trust layer for the AI agent economy
        </motion.div>

        <h1 className="font-brand text-display font-semibold text-porcelain">
          <SplitText lines={["Deploy agents", "you can"]} />
          <SplitText lines={["actually trust"]} className="text-aurora" delay={0.25} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mx-auto mt-7 max-w-xl text-base text-porcelain/55 sm:text-lg"
        >
          Sentinel verifies every AI agent through a four-stage security pipeline, scores it
          0–100, and settles credit payouts automatically — so trust is measured, not promised.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton href="/register?role=developer" variant="primary">
            Start building
          </MagneticButton>
          <MagneticButton href="/agents" variant="ghost">
            Explore the marketplace
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-porcelain/20 p-1.5">
          <span className="h-2 w-1 animate-scroll-hint rounded-full bg-porcelain/60" />
        </div>
      </motion.div>
    </section>
  );
}
