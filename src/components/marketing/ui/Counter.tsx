"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CounterProps {
  /** The final value to count up to. */
  value: number;
  /** Optional prefix (e.g. "₹" is forbidden — points only). */
  prefix?: string;
  /** Optional suffix (e.g. "+", "%"). */
  suffix?: string;
  /** Decimal places to render. Defaults to 0. */
  decimals?: number;
  className?: string;
}

/**
 * Counts up to {@link CounterProps.value} once it scrolls into view, driven by
 * a spring for an organic settle. Locale-formats the running value so large
 * numbers stay readable. Reduced-motion users jump straight to the final value.
 *
 * @example
 * <Counter value={500} suffix="+" />
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: CounterProps): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 18, mass: 1 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      if (ref.current) ref.current.textContent = `${prefix}${formatter.format(value)}${suffix}`;
      return;
    }

    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${prefix}${formatter.format(latest)}${suffix}`;
    });
    return unsubscribe;
  }, [spring, prefix, suffix, decimals, value]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}0${suffix}`}
    </span>
  );
}
