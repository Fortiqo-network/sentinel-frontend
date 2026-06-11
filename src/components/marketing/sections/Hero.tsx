"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SceneStage } from "../three/SceneStage";
import { SplitText } from "../ui/SplitText";
import { MagneticButton } from "../ui/MagneticButton";

/**
 * Scene 1 — the full-viewport landing. A live WebGL neural field sits behind
 * the headline; on scroll the copy drifts up and dissolves as the next scene
 * arrives, giving the page a cinematic hand-off rather than a hard cut.
 */
export function Hero(): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <motion.div style={{ scale: sceneScale }} className="absolute inset-0">
        <SceneStage />
      </motion.div>

      {/* Vignette so the headline always stays legible over the scene. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent,rgba(4,5,10,0.55)_75%,rgba(4,5,10,0.95))]"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full glass ring-hairline px-4 py-1.5 text-xs font-medium text-white/80"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora-cyan opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora-cyan" />
          </span>
          The trust layer for the AI agent economy
        </motion.div>

        <h1 className="text-display font-semibold text-white">
          <SplitText lines={["Deploy agents", "you can"]} />
          <SplitText lines={["actually trust"]} className="text-aurora" delay={0.25} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-7 max-w-xl text-base text-white/60 sm:text-lg"
        >
          Sentinel verifies every AI agent through a four-stage security pipeline, scores it
          0–100, and settles payouts automatically — so trust is measured, not promised.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
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
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <span className="h-2 w-1 animate-scroll-hint rounded-full bg-white/60" />
        </div>
      </motion.div>
    </section>
  );
}
