"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  /** Visual weight. `primary` is the aurora-filled CTA; `ghost` is a hairline pill. */
  variant?: "primary" | "ghost";
  className?: string;
}

/**
 * A link styled as a premium pill that subtly leans toward the cursor on hover
 * (a "magnetic" micro-interaction) and springs back on leave. The pull is
 * pointer-driven only, so touch and reduced-motion users get a clean static
 * button with no jitter.
 *
 * @example
 * <MagneticButton href="/register" variant="primary">Start building</MagneticButton>
 */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  className,
}: MagneticButtonProps): React.JSX.Element {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMove = (event: React.PointerEvent<HTMLAnchorElement>): void => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.22);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.22);
  };

  const reset = (): void => {
    x.set(0);
    y.set(0);
  };

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight transition-colors duration-300 sentinel-focus";
  const styles =
    variant === "primary"
      ? "bg-porcelain text-ink-950 hover:bg-gold"
      : "glass ring-hairline text-porcelain hover:bg-porcelain/10";

  return (
    <motion.div style={{ x: springX, y: springY }} className="inline-block">
      <Link
        ref={ref}
        href={href}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        className={cn(base, styles, className)}
      >
        {children}
      </Link>
    </motion.div>
  );
}
