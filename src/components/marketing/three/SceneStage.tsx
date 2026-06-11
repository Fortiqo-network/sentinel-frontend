"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const HeroCanvas = dynamic(
  () => import("./HeroCanvas").then((mod) => mod.HeroCanvas),
  { ssr: false, loading: () => <StaticBackdrop /> },
);

/**
 * A pure-CSS aurora backdrop shown while the WebGL bundle loads, on reduced
 * motion, and on devices that fail the capability check. Guarantees the hero
 * always has a rich background even with zero JavaScript-3D.
 */
function StaticBackdrop(): React.JSX.Element {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute left-1/2 top-1/3 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-indigo/25 blur-[120px]" />
      <div className="absolute right-1/4 top-1/2 h-[40vh] w-[40vh] rounded-full bg-aurora-cyan/20 blur-[120px]" />
      <div className="absolute left-1/4 bottom-1/4 h-[40vh] w-[40vh] rounded-full bg-aurora-violet/20 blur-[120px]" />
    </div>
  );
}

/**
 * Resolves a render quality tier from device hints — coarse pointer, narrow
 * viewport, or few logical cores all imply a phone or low-power machine that
 * should get the lighter scene (and no postprocessing).
 */
function resolveTier(): "high" | "low" {
  if (typeof window === "undefined") return "low";
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  return coarse || narrow || cores <= 4 ? "low" : "high";
}

/**
 * Client gate for the hero's 3D scene. Decides whether to mount WebGL at all
 * (skipped entirely for reduced-motion users), picks a quality tier, and pauses
 * the render loop via an IntersectionObserver once the hero scrolls out of view
 * so the GPU is freed for the rest of the page.
 *
 * @example
 * <div className="absolute inset-0"><SceneStage /></div>
 */
export function SceneStage(): React.JSX.Element {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<"high" | "low" | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setTier(resolveTier());
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry?.isIntersecting ?? false),
      { rootMargin: "100px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {reduced || tier === null ? <StaticBackdrop /> : <HeroCanvas tier={tier} active={active} />}
    </div>
  );
}
