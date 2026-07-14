"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASING } from "@/lib/design/motion";

/**
 * Installs Lenis inertial smooth-scroll for the marketing experience and wires
 * it to GSAP's ScrollTrigger so scrub animations stay frame-perfect with the
 * eased scroll position.
 *
 * Disabled entirely when the user prefers reduced motion — the page then
 * scrolls with native behaviour and no rAF loop runs. Cleans up the Lenis
 * instance and GSAP ticker callback on unmount so navigating into the app
 * (which uses native scroll) leaves no lingering listeners.
 *
 * @example
 * <SmoothScroll><HomeExperience /></SmoothScroll>
 */
export function SmoothScroll({ children }: { children: ReactNode }): React.JSX.Element {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", () => ScrollTrigger.update());

    const onTick = (time: number): void => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

/** The cubic-bezier easing the smooth scroll is tuned to, exported for parity in JS animations. */
export const SCROLL_EASING = EASING.expo;
