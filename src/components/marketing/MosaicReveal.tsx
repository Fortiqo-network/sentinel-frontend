"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

/** The Tessera halves (240 viewBox) used to stamp the logo glyph sprites. */
const HALF_LEFT = "M98 45 H69 A24 24 0 0 0 45 69 V171 A24 24 0 0 0 69 195 H128 V119 H98 Z";
const HALF_RIGHT = "M112 45 H171 A24 24 0 0 1 195 69 V171 A24 24 0 0 1 171 195 H142 V105 H112 Z";

const PORCELAIN = "236, 234, 227";
const GOLD = "231, 160, 60";

const SPACING = 66;
const GLYPH = 30;
const SPRITE_RES = 84;
const RADIUS = 240;
const BASE_ALPHA = 0.06;

interface Tile {
  x: number;
  y: number;
  seed: number;
}

/** Pre-render the Tessera mark once (two halves, no seam) in the given colour. */
function buildGlyph(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SPRITE_RES;
  c.height = SPRITE_RES;
  const g = c.getContext("2d");
  if (!g) return c;
  const scale = SPRITE_RES / 215;
  g.translate(SPRITE_RES / 2 - 120 * scale, SPRITE_RES / 2 - 120 * scale);
  g.scale(scale, scale);
  g.fillStyle = color;
  g.fill(new Path2D(HALF_LEFT));
  g.fill(new Path2D(HALF_RIGHT));
  return c;
}

/**
 * Signature hero backdrop — a faint field of Sentinel marks that a gold
 * "verification" light reveals as it moves: it follows the pointer and, when
 * idle, drifts on its own Lissajous path. Marks inside the light ignite
 * (gold→porcelain) and scale up, then fade behind it, as if structure is being
 * scanned into view. One Canvas 2D layer with cached glyph sprites, DPR-capped,
 * paused off-screen, static under reduced motion.
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
    const glyphGold = buildGlyph(`rgba(${GOLD}, 1)`);
    const glyphPorcelain = buildGlyph(`rgba(${PORCELAIN}, 1)`);

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
      const offX = (width - (cols - 1) * SPACING) / 2;
      const offY = (height - (rows - 1) * SPACING) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.push({ x: offX + c * SPACING, y: offY + r * SPACING, seed: (c * 31 + r * 17) % 100 });
        }
      }
      lightX = targetX = width / 2;
      lightY = targetY = height * 0.42;
    };

    const drawTile = (t: Tile): void => {
      const d = Math.hypot(t.x - lightX, t.y - lightY);
      const intensity = d < RADIUS ? Math.pow(1 - d / RADIUS, 1.6) : 0;
      const shimmer = 0.5 + 0.5 * Math.sin(frame * 0.04 + t.seed);
      const alpha = BASE_ALPHA * (0.6 + 0.4 * shimmer) + intensity * 0.95;
      if (alpha < 0.02) return;

      const size = GLYPH * (1 + intensity * 1.0);
      const half = size / 2;
      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.drawImage(glyphGold, t.x - half, t.y - half, size, size);
      if (intensity > 0.62) {
        ctx.globalAlpha = (intensity - 0.62) / 0.38;
        ctx.drawImage(glyphPorcelain, t.x - half, t.y - half, size, size);
      }
    };

    const draw = (): void => {
      ctx.clearRect(0, 0, width, height);

      const pool = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, RADIUS * 1.15);
      pool.addColorStop(0, `rgba(${GOLD}, 0.09)`);
      pool.addColorStop(1, `rgba(${GOLD}, 0)`);
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, width, height);

      ctx.globalAlpha = 1;
      for (const t of tiles) drawTile(t);
      ctx.globalAlpha = 1;
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
