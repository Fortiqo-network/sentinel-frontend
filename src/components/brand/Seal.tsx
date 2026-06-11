"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const ARC_A = "M194.84 81.86 A84 84 0 0 1 81.86 194.84";
const ARC_B = "M45.16 158.14 A84 84 0 0 1 158.14 45.16";

interface SealProps {
  /** Sizing / layout classes for the svg. */
  className?: string;
  /** Stroke colour of the open arcs. Defaults to porcelain. */
  stroke?: string;
  /** Colour the core ignites to when the seal closes. Defaults to amber. */
  sealColor?: string;
  /** Draw the arcs in on first view. */
  drawIn?: boolean;
  /** Re-seal (close the ring) on hover/focus. */
  interactive?: boolean;
  /** Seal automatically once it scrolls into view. */
  sealOnView?: boolean;
}

/**
 * The Sentinel "Living Mark" — two open arcs orbiting a core that *seal* into a
 * complete ring with an igniting amber core, visualising verification. The open
 * state slowly orbits; sealing closes the ring and rings a pulse outward.
 *
 * Honours reduced motion (the orbit is disabled via CSS and the draw-in is
 * effectively instant).
 *
 * @example
 * <Seal className="h-40 w-40" sealOnView />
 */
export function Seal({
  className,
  stroke = "#ECEAE3",
  sealColor = "#E7A03C",
  drawIn = true,
  interactive = true,
  sealOnView = false,
}: SealProps): React.JSX.Element {
  const [sealed, setSealed] = useState(false);

  const arc = {
    initial: drawIn ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 },
    shown: { pathLength: 1, opacity: sealed ? 0 : 1 },
  };

  return (
    <motion.svg
      viewBox="0 0 240 240"
      fill="none"
      className={cn("overflow-visible", className)}
      onHoverStart={() => interactive && setSealed(true)}
      onHoverEnd={() => interactive && setSealed(false)}
      onViewportEnter={() => sealOnView && setSealed(true)}
      viewport={{ once: !interactive }}
      aria-hidden
    >
      {/* Verification pulse. */}
      <circle
        cx="120"
        cy="120"
        r="84"
        stroke={sealColor}
        strokeWidth="2"
        style={{ transformOrigin: "120px 120px" }}
        className={sealed ? "[animation:sealPulse_1.6s_cubic-bezier(.2,.6,.3,1)]" : "opacity-0"}
      />

      {/* Open arcs that orbit, then dissolve as the ring closes. */}
      <g className="seal-orbit">
        <motion.path
          d={ARC_A}
          stroke={stroke}
          strokeWidth="32"
          initial={arc.initial}
          whileInView={arc.shown}
          animate={sealed ? { opacity: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.5, 0, 0.2, 1] }}
        />
        <motion.path
          d={ARC_B}
          stroke={stroke}
          strokeWidth="32"
          initial={arc.initial}
          whileInView={arc.shown}
          animate={sealed ? { opacity: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.5, 0, 0.2, 1], delay: 0.15 }}
        />
      </g>

      {/* Completed ring revealed on seal. */}
      <motion.circle
        cx="120"
        cy="120"
        r="84"
        stroke={stroke}
        strokeWidth="32"
        initial={false}
        animate={{ opacity: sealed ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.6, 0, 0.15, 1] }}
      />

      {/* Core — ignites on seal. */}
      <motion.circle
        cx="120"
        cy="120"
        r="16"
        initial={drawIn ? { scale: 0.4, opacity: 0 } : false}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        animate={{ fill: sealed ? sealColor : stroke }}
        transition={{ duration: 0.7, ease: [0.5, 0, 0.2, 1], delay: drawIn ? 1.1 : 0 }}
        style={{ transformOrigin: "120px 120px" }}
      />
    </motion.svg>
  );
}
