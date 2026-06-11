"use client";

import { motion } from "framer-motion";
import { DURATION, EASING, STAGGER } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

interface SplitTextProps {
  /** The line(s) to animate. Each array entry renders on its own row. */
  lines: string[];
  /** Extra classes applied to the wrapping block. */
  className?: string;
  /** Seconds before the first word animates. */
  delay?: number;
  /** Render as a block of words masked from below (default) or a simple fade. */
  as?: "mask" | "fade";
}

/**
 * Animates a heading word-by-word, each word rising out of an overflow mask
 * with a staggered cinematic ease. Splitting on spaces keeps it dependency-free
 * and SSR-safe. Reduced-motion users see the text instantly via the global
 * CSS guard.
 *
 * @example
 * <SplitText lines={["The trust layer", "for AI agents"]} />
 */
export function SplitText({
  lines,
  className,
  delay = 0,
  as = "mask",
}: SplitTextProps): React.JSX.Element {
  let wordIndex = 0;
  return (
    <span className={cn("block", className)}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block overflow-hidden pb-[0.12em]">
          {line.split(" ").map((word) => {
            const index = wordIndex++;
            return (
              <span key={index} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  initial={as === "mask" ? { y: "110%" } : { opacity: 0 }}
                  whileInView={as === "mask" ? { y: "0%" } : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: DURATION.slow,
                    ease: EASING.expo,
                    delay: delay + index * STAGGER.base,
                  }}
                >
                  {word}
                </motion.span>
                {" "}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
