import { cn } from "@/lib/utils/cn";

/** The two counterpart halves of the token and the seam that runs between them. */
const HALF_LEFT = "M98 45 H69 A24 24 0 0 0 45 69 V171 A24 24 0 0 0 69 195 H128 V119 H98 Z";
const HALF_RIGHT = "M112 45 H171 A24 24 0 0 1 195 69 V171 A24 24 0 0 1 171 195 H142 V105 H112 Z";
const SEAM = "M105 45 V112 H135 V195";

type SeamState = "scan" | "fill" | "drain" | "verified" | "none";

interface TesseraProps {
  className?: string;
  /** Seam behaviour. `scan` (default) runs the permanent amber line; `verified`
   *  holds it filled; `fill`/`drain` are driven by the proof sequence. */
  seam?: SeamState;
  /** Half fill colour. Defaults to `currentColor` so it adapts to the surface. */
  fill?: string;
  /** Horizontal offset (px in the 240 viewBox) the right half is pulled to,
   *  for the proof's "a forged half cannot fit" beat. */
  rightShift?: number;
  /** Mirror the right half (the forged counterpart). */
  rightMirror?: boolean;
}

/**
 * The Sentinel **Tessera** — two halves of one token that only fit as true
 * counterparts, with an amber seam. At rest the seam *scans* top-to-bottom
 * forever ("the system is never asleep"); it has no rotation. Pure SVG + CSS,
 * safe in server components.
 *
 * @example
 * <Tessera className="h-7 w-7" seam="scan" />
 */
export function Tessera({
  className,
  seam = "scan",
  fill = "currentColor",
  rightShift = 0,
  rightMirror = false,
}: TesseraProps): React.JSX.Element {
  const seamClass =
    seam === "scan" ? "tessera-scan" : seam === "fill" ? "tessera-fill" : seam === "drain" ? "tessera-drain" : "";

  return (
    <svg viewBox="0 0 240 240" fill="none" className={cn("overflow-visible", className)} aria-hidden>
      <path d={HALF_LEFT} fill={fill} />
      <g
        style={{
          transform: `translateX(${rightShift}px)${rightMirror ? " scaleX(-1)" : ""}`,
          transformOrigin: "153px 120px",
          transition: "transform 0.85s cubic-bezier(0.6,0,0.15,1)",
        }}
      >
        <path d={HALF_RIGHT} fill={fill} />
      </g>
      {seam === "verified" ? (
        <path d={SEAM} fill="none" stroke="#E7A03C" strokeWidth={14} />
      ) : seam !== "none" ? (
        <path className={seamClass} pathLength={180} d={SEAM} fill="none" stroke="#E7A03C" strokeWidth={14} />
      ) : null}
    </svg>
  );
}
