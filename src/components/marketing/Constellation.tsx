"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  amber: number;
}

const LINK_DISTANCE = 132;
const PORCELAIN = "236, 234, 227";
const AMBER = "231, 160, 60";

/**
 * A calm, monochrome constellation of drifting dots linked by faint lines —
 * the hero's ambient backdrop. Links occasionally pulse amber as they "verify".
 * Rendered on a single Canvas 2D layer (no DOM churn), capped DPR, paused when
 * off-screen, and reduced to a static frame under reduced motion.
 */
export function Constellation({ className }: { className?: string }): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const resize = (): void => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(72, Math.round((width * height) / 16000));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        amber: 0,
      }));
    };

    const draw = (): void => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += width;
        else if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        else if (p.y > height) p.y -= height;
        if (p.amber > 0) p.amber -= 0.011;
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= LINK_DISTANCE) continue;
          const fade = 1 - dist / LINK_DISTANCE;
          const lit = Math.max(a.amber, b.amber);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          if (lit > 0) {
            ctx.strokeStyle = `rgba(${AMBER}, ${0.5 * fade * lit})`;
            ctx.lineWidth = 1;
          } else {
            ctx.strokeStyle = `rgba(${PORCELAIN}, ${0.12 * fade})`;
            ctx.lineWidth = 0.7;
          }
          ctx.stroke();
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle =
          p.amber > 0
            ? `rgba(${AMBER}, ${0.45 + 0.5 * p.amber})`
            : `rgba(${PORCELAIN}, 0.42)`;
        ctx.fill();
      }
    };

    let raf = 0;
    let pulseTimer = 0;
    const tick = (): void => {
      pulseTimer += 1;
      if (pulseTimer > 70 && particles.length) {
        pulseTimer = 0;
        const p = particles[Math.floor(Math.random() * particles.length)];
        if (p) p.amber = 1;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    resize();
    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onResize = (): void => resize();
    window.addEventListener("resize", onResize);

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry?.isIntersecting ?? true;
      if (reduced) return;
      if (visible && !raf) raf = requestAnimationFrame(tick);
      else if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(canvas);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}
