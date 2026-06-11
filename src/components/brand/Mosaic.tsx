"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";

const HALF_LEFT = "M98 45 H69 A24 24 0 0 0 45 69 V171 A24 24 0 0 0 69 195 H128 V119 H98 Z";
const HALF_RIGHT = "M112 45 H171 A24 24 0 0 1 195 69 V171 A24 24 0 0 1 171 195 H142 V105 H112 Z";
const SEAM = "M105 45 V112 H135 V195";

interface MosaicProps {
  className?: string;
  /** Cell size in px. Smaller = denser field. Defaults to 64. */
  cell?: number;
  /** Overall opacity of the field. Defaults to 0.5 (the brief's 50%). */
  opacity?: number;
}

/**
 * The **Mosaic** — the brand's "living wall" of tessera tiles used as a card
 * background, not the mark repeated as a logo. A tiled SVG pattern of tessera
 * silhouettes (cheap, never repaints) with a couple of amber seams lit, as if a
 * few transactions just verified. Sits behind card content at reduced opacity.
 *
 * @example
 * <div className="relative"><Mosaic /> …card content… </div>
 */
export function Mosaic({ className, cell = 64, opacity = 0.5 }: MosaicProps): React.JSX.Element {
  const rawId = useId();
  const id = `mosaic-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  // Map the 240-unit mark into the cell with a little padding.
  const scale = (cell * 0.78) / 240;
  const pad = cell * 0.11;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" fill="none">
        <defs>
          <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse">
            <g transform={`translate(${pad} ${pad}) scale(${scale})`} stroke="currentColor" strokeWidth="6" opacity="0.22">
              <path d={HALF_LEFT} />
              <path d={HALF_RIGHT} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
        {/* A few seams lit amber — transactions verifying. */}
        <g stroke="#E7A03C" strokeWidth="3" opacity="0.5">
          <path
            transform={`translate(${pad + cell} ${pad}) scale(${scale})`}
            d={SEAM}
          />
          <path
            transform={`translate(${pad + cell * 3} ${pad + cell * 2}) scale(${scale})`}
            d={SEAM}
          />
        </g>
      </svg>
    </div>
  );
}
