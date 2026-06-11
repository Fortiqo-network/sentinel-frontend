"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";
import { SplitText } from "../ui/SplitText";
import { Tessera } from "@/components/brand/Tessera";
import { REVEAL_VIEWPORT } from "@/lib/design/motion";
import { cn } from "@/lib/utils/cn";

interface Node {
  id: string;
  label: string;
  blurb: string;
}

const NODES: Node[] = [
  { id: "developers", label: "Developers", blurb: "Publish agents and earn credits per call." },
  { id: "buyers", label: "Buyers", blurb: "Discover verified agents and invoke with confidence." },
  { id: "settlement", label: "Settlement", blurb: "Metered usage settles to developers automatically." },
  { id: "reputation", label: "Reputation", blurb: "Portable trust scores that follow an agent everywhere." },
  { id: "verification", label: "Verification", blurb: "The four-stage pipeline that scores every agent." },
];

const CENTER = 50;
const ORBIT = 37;

/** Position a node on the orbit circle, first node at the top, going clockwise. */
function place(index: number, total: number): { x: number; y: number } {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return { x: CENTER + ORBIT * Math.cos(angle), y: CENTER + ORBIT * Math.sin(angle) };
}

/**
 * Scene 4 — the marketplace as an orbital system. Every participant orbits the
 * Sentinel hub (the Tessera) on faint rings; connectors light amber and the
 * node's role surfaces on hover. Replaces the earlier flat cross layout.
 */
export function Ecosystem(): React.JSX.Element {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <Reveal>
            <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
              The ecosystem
            </span>
          </Reveal>
          <h2 className="mt-4 text-display-sm font-semibold text-porcelain">
            <SplitText lines={["One system,", "every participant"]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-5 text-base text-porcelain/55">
              Developers, buyers, and the trust machinery between them all orbit a single
              settlement and reputation core.
            </p>
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-full max-w-2xl"
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
            {/* Orbit rings. */}
            <circle cx={CENTER} cy={CENTER} r={ORBIT} fill="none" stroke="#ECEAE3" strokeOpacity="0.08" strokeWidth="0.2" />
            <circle cx={CENTER} cy={CENTER} r={ORBIT * 0.62} fill="none" stroke="#ECEAE3" strokeOpacity="0.06" strokeWidth="0.2" strokeDasharray="0.6 1.2" />

            {/* Connectors from hub to each node. */}
            {NODES.map((node, i) => {
              const p = place(i, NODES.length);
              const lit = active === node.id;
              return (
                <line
                  key={node.id}
                  x1={CENTER}
                  y1={CENTER}
                  x2={p.x}
                  y2={p.y}
                  stroke={lit ? "#E7A03C" : "#ECEAE3"}
                  strokeOpacity={lit ? 0.8 : 0.12}
                  strokeWidth={lit ? 0.4 : 0.2}
                  strokeDasharray="1 1.4"
                  style={{ animation: lit ? "dashFlow 2s linear infinite" : undefined }}
                />
              );
            })}
          </svg>

          {/* Central hub — the Tessera. */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full glass ring-hairline">
              <span className="glow-soft absolute -inset-6 rounded-full" />
              <Tessera className="relative h-14 w-14 text-porcelain" seam="scan" />
            </div>
          </div>

          {/* Orbiting nodes. */}
          {NODES.map((node, i) => {
            const p = place(i, NODES.length);
            const isActive = active === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onMouseEnter={() => setActive(node.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(node.id)}
                onBlur={() => setActive(null)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 sentinel-focus"
              >
                <span
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl px-4 py-3 text-center transition-all duration-300",
                    isActive ? "glass ring-hairline scale-105" : "scale-100",
                  )}
                >
                  <span className="relative flex h-3 w-3">
                    {isActive && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                    )}
                    <span
                      className={cn(
                        "relative inline-flex h-3 w-3 rounded-full transition-colors",
                        isActive ? "bg-gold shadow-[0_0_10px_#E7A03C]" : "bg-porcelain/40",
                      )}
                    />
                  </span>
                  <span className="text-sm font-medium text-porcelain">{node.label}</span>
                  <span
                    className={cn(
                      "max-w-[9rem] text-xs leading-snug text-porcelain/55 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {node.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
