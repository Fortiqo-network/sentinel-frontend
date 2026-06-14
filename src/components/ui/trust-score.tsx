import * as React from "react";
import { cn } from "@/lib/utils/cn";

const SIZES = {
  sm: { box: 44, stroke: 4, text: "text-xs" },
  md: { box: 72, stroke: 6, text: "text-lg" },
  lg: { box: 112, stroke: 8, text: "text-3xl" },
} as const;

type Size = keyof typeof SIZES;

/** Maps a 0–100 score to a calibrated trust band. */
export function trustBand(score: number): { label: string; tone: "high" | "good" | "fair" | "low" } {
  if (score >= 90) return { label: "Exceptional", tone: "high" };
  if (score >= 75) return { label: "Trusted", tone: "good" };
  if (score >= 50) return { label: "Developing", tone: "fair" };
  return { label: "Unproven", tone: "low" };
}

const TONE_STROKE: Record<string, string> = {
  high: "stroke-emerald-500",
  good: "stroke-indigo-500",
  fair: "stroke-amber-500",
  low: "stroke-rose-500",
};

const TONE_TEXT: Record<string, string> = {
  high: "text-emerald-600",
  good: "text-indigo-600",
  fair: "text-amber-600",
  low: "text-rose-600",
};

export interface TrustScoreProps {
  /** Calibrated 0–100 trust score. */
  score: number;
  /** Ring size. Defaults to "md". */
  size?: Size;
  /** Show the band label beneath the ring. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Circular trust-score gauge. The arc length and colour track the calibrated
 * 0–100 score; an optional band label ("Trusted", "Developing", …) renders
 * below. Used on agent cards and the agent detail page.
 *
 * @example
 * <TrustScore score={94} size="lg" showLabel />
 */
export function TrustScore({ score, size = "md", showLabel = false, className }: TrustScoreProps): React.JSX.Element {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = trustBand(clamped);
  const { box, stroke, text } = SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} className="-rotate-90" aria-hidden="true">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-slate-100"
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-[stroke-dashoffset] duration-700", TONE_STROKE[band.tone])}
          />
        </svg>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold tabular-nums",
            text,
            TONE_TEXT[band.tone],
          )}
          role="img"
          aria-label={`Trust score ${clamped} out of 100, ${band.label}`}
        >
          {clamped}
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-xs font-semibold", TONE_TEXT[band.tone])}>{band.label}</span>
      )}
    </div>
  );
}
