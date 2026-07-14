"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees at the card edges. */
  intensity?: number;
}

/**
 * A glass card that tilts in 3D toward the cursor and lifts a radial glow that
 * tracks the pointer, giving each feature panel physical depth. Pointer-driven
 * only — touch devices get a flat, stable card with no transform.
 *
 * @example
 * <TiltCard><h3>Verification</h3><p>…</p></TiltCard>
 */
export function TiltCard({ children, className, intensity = 5 }: TiltCardProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), {
    stiffness: 150,
    damping: 18,
  });

  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const reset = (): void => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl glass ring-hairline p-8 [transform-style:preserve-3d]",
        className,
      )}
    >
      <motion.div
        aria-hidden
        style={{
          background: useTransform(
            [glowX, glowY],
            ([gx, gy]) => `radial-gradient(420px circle at ${String(gx)} ${String(gy)}, rgba(99,102,241,0.18), transparent 70%)`,
          ),
        }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative" style={{ transform: "translateZ(40px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
