"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const PORCELAIN = "236, 234, 227";
const GOLD = "231, 160, 60";

const SPACING = 38;
const TILE = 3.4;
const RADIUS = 230;
const BASE_ALPHA = 0.05;

interface Tile {
  x: number;
  y: number;
  seed: number;
}

/**
 * Signature hero backdrop — a dark mosaic of tesserae that a gold "verification"
 * light reveals as it moves: it follows the pointer and, when idle, drifts on its
 * own Lissajous path. Tiles inside the light ignite (gold→porcelain), scale up,
 * and fade behind it, as if structure is being scanned into view. One Canvas 2D
 * layer, DPR-capped, paused off-screen, static under reduced motion.
 *
 * @example
 * <MosaicReveal className="z-0" />
 */
export function MosaicReveal({ className }: { className?: string }): React.JSX.Element {
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
    let tiles: Tile[] = [];
    let frame = 0;

    let lightX = 0;
    let lightY = 0;
    let targetX = 0;
    let targetY = 0;
    let pointerUntil = 0;

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

      tiles = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.push({ x: c * SPACING, y: r * SPACING, seed: (c * 31 + r * 17) % 100 });
        }
      }
      lightX = targetX = width / 2;
      lightY = targetY = height * 0.42;
    };

    const drawTile = (t: Tile): void => {
      const dx = t.x - lightX;
      const dy = t.y - lightY;
      const d = Math.hypot(dx, dy);
      const intensity = d < RADIUS ? Math.pow(1 - d / RADIUS, 1.6) : 0;
      const shimmer = 0.5 + 0.5 * Math.sin(frame * 0.04 + t.seed);
      const alpha = BASE_ALPHA * (0.6 + 0.4 * shimmer) + intensity * 0.95;
      if (alpha < 0.02) return;

      const size = TILE * (1 + intensity * 1.8);
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(Math.PI / 4);
      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.fillStyle = `rgb(${GOLD})`;
      ctx.fillRect(-size / 2, -size / 2, size, size);
      if (intensity > 0.65) {
        const core = size * 0.5;
        ctx.globalAlpha = (intensity - 0.65) / 0.35;
        ctx.fillStyle = `rgb(${PORCELAIN})`;
        ctx.fillRect(-core / 2, -core / 2, core, core);
      }
      ctx.restore();
    };

    const draw = (): void => {
      ctx.clearRect(0, 0, width, height);

      const pool = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, RADIUS * 1.15);
      pool.addColorStop(0, `rgba(${GOLD}, 0.10)`);
      pool.addColorStop(1, `rgba(${GOLD}, 0)`);
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, width, height);

      for (const t of tiles) drawTile(t);
    };

    const tick = (): void => {
      frame += 1;

      if (frame > pointerUntil) {
        const a = frame * 0.006;
        targetX = width * (0.5 + 0.33 * Math.cos(a) * Math.cos(a * 0.5));
        targetY = height * (0.46 + 0.3 * Math.sin(a * 0.9));
      }
      lightX += (targetX - lightX) * 0.06;
      lightY += (targetY - lightY) * 0.06;

      draw();
      raf = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      pointerUntil = frame + 90;
    };

    let raf = 0;
    resize();
    if (reduced) {
      draw();
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
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
      window.removeEventListener("pointermove", onPointer);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
