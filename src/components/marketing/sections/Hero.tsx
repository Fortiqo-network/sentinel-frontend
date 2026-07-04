"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Tessera } from "@/components/brand/Tessera";
import { MosaicReveal } from "../MosaicReveal";
import { Reveal } from "../ui/Reveal";
import { MagneticButton } from "../ui/MagneticButton";

type Phase = "idle" | "forge" | "fill";

/**
 * Scene 1 — the full-viewport landing. A gold verification light reveals a hidden
 * mosaic of tesserae as it tracks the cursor (and drifts on its own when idle),
 * behind a centred, interactive Tessera: hover or click it to run the proof
 * (the right half pulls away and mirrors, then the seam fills). On scroll the
 * whole composition drifts up and dissolves into the next scene.
 */
export function Hero(): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const [phase, setPhase] = useState<Phase>("idle");
  const busy = useRef(false);

  const prove = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setPhase("forge");
    window.setTimeout(() => setPhase("fill"), 850);
    window.setTimeout(() => {
      setPhase("idle");
      busy.current = false;
    }, 2100);
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center"
    >
      {/* Mosaic the gold verification light reveals as it scans across. */}
      <MosaicReveal className="z-0" />

      {/* Ambient gold wash behind the mark. */}
      <div
        aria-hidden
        className="glow-soft pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex w-full max-w-3xl flex-col items-center"
      >
        {/* Interactive Tessera — the focal mark. */}
        <motion.button
          type="button"
          onClick={prove}
          onPointerEnter={prove}
          aria-label="Prove the counterpart"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-porcelain sentinel-focus"
        >
          <Tessera
            className="h-32 w-32 sm:h-40 sm:w-40"
            seam={phase === "fill" ? "fill" : "scan"}
            rightShift={phase === "forge" ? 18 : 0}
            rightMirror={phase === "forge"}
          />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full glass ring-hairline px-4 py-1.5 font-brand-mono text-[11px] uppercase tracking-[0.18em] text-porcelain/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#E7A03C]" />
          The trust layer for the AI agent economy
        </motion.div>

        <Reveal>
          <h1 className="font-brand text-display font-semibold leading-[0.98] text-porcelain">
            Deploy agents you can{" "}
            <span className="text-aurora">actually trust</span>
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-xl text-base text-porcelain/55 sm:text-lg">
            Sentinel verifies every AI agent through a four-stage security pipeline, scores it
            0–100, and settles credit payouts automatically — so trust is measured, not promised.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton href="/register?role=seller" variant="primary">
              Start building
            </MagneticButton>
            <MagneticButton href="/agents" variant="ghost">
              Explore the marketplace
            </MagneticButton>
          </div>
        </Reveal>
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
