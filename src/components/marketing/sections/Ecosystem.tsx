"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { REVEAL_VIEWPORT } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

interface Node {
  id: string;
  label: string;
  blurb: string;
  /** Position as viewport percentages within the square stage. */
  x: number;
  y: number;
}

const HUB = { x: 50, y: 50 };

const NODES: Node[] = [
  { id: "developers", label: "Developers", blurb: "Publish agents and earn credits per call.", x: 16, y: 22 },
  { id: "buyers", label: "Buyers", blurb: "Discover verified agents and invoke with confidence.", x: 84, y: 24 },
  { id: "verification", label: "Verification", blurb: "The four-stage pipeline that scores every agent.", x: 12, y: 70 },
  { id: "settlement", label: "Settlement", blurb: "Metered usage settles to developers automatically.", x: 88, y: 72 },
  { id: "reputation", label: "Reputation", blurb: "Portable trust scores that follow an agent everywhere.", x: 50, y: 90 },
];

/**
 * Scene 4 — the marketplace as a living network. Every participant orbits the
 * Sentinel hub; synapse lines pulse with flowing energy and brighten when a
 * node is hovered, surfacing a short description of its role.
 */
export function Ecosystem(): React.JSX.Element {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-aurora-cyan">
              The ecosystem
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold text-white">
            <SplitText lines={["One network,", "every participant"]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-5 text-base text-white/55">
              Developers, buyers, and the trust machinery between them all connect through a single
              settlement and reputation fabric.
            </p>
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-full max-w-2xl"
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {NODES.map((node) => {
              const lit = active === node.id;
              return (
                <line
                  key={node.id}
                  x1={HUB.x}
                  y1={HUB.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={lit ? "#22d3ee" : "#6366f1"}
                  strokeWidth={lit ? 0.5 : 0.25}
                  strokeOpacity={lit ? 0.9 : 0.35}
                  strokeDasharray="1.5 2.5"
                  style={{ animation: "dashFlow 2.5s linear infinite" }}
                />
              );
            })}
          </svg>

          {/* Central hub. */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full glass ring-hairline">
              <span className="absolute inset-0 animate-glow-pulse rounded-full bg-aurora-indigo/30 blur-xl" />
              <span className="relative text-sm font-semibold text-white">Sentinel</span>
            </div>
          </div>

          {NODES.map((node) => (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(node.id)}
              onBlur={() => setActive(null)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 sentinel-focus"
            >
              <span
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl px-4 py-3 text-center transition-all duration-300",
                  active === node.id ? "glass ring-hairline scale-105" : "scale-100",
                )}
              >
                <span className="relative flex h-3 w-3">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-60",
                      active === node.id ? "animate-ping bg-aurora-cyan" : "bg-aurora-indigo",
                    )}
                  />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-aurora-cyan" />
                </span>
                <span className="text-sm font-medium text-white">{node.label}</span>
                <span
                  className={cn(
                    "max-w-[9rem] text-xs leading-snug text-white/55 transition-opacity duration-300",
                    active === node.id ? "opacity-100" : "opacity-0",
                  )}
                >
                  {node.blurb}
                </span>
              </span>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
