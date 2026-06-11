"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting reactively.
 *
 * Returns `true` when the user has requested reduced motion. Components use
 * this to swap cinematic animation and 3D scenes for static, instant
 * presentation — honouring the OS-level accessibility preference.
 *
 * @example
 * const reduced = useReducedMotion();
 * return reduced ? <StaticHero /> : <AnimatedHero />;
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
