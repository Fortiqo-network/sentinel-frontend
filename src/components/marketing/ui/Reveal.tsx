"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { DURATION, EASING, REVEAL_VIEWPORT } from "@/lib/design/motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Entry direction the element travels from. Defaults to `up`. */
  direction?: Direction;
  /** Seconds to delay the reveal, for sequencing sibling blocks. */
  delay?: number;
  /** Travel distance in pixels. Defaults to 28. */
  distance?: number;
}

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Reveals its children with a soft fade-and-travel as they scroll into view,
 * once. Honours reduced motion automatically through the global CSS guard
 * (the transform still applies but the transition collapses to instant).
 *
 * @example
 * <Reveal direction="up" delay={0.1}>
 *   <h2>Section heading</h2>
 * </Reveal>
 */
export function Reveal({
  direction = "up",
  delay = 0,
  distance = 28,
  children,
  ...rest
}: RevealProps): React.JSX.Element {
  const offset = OFFSETS[direction];
  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x * distance, y: offset.y * distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: DURATION.base, ease: EASING.expo, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
