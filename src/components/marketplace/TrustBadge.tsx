import * as React from "react";
import { cn } from "@/lib/utils/cn";

/** Verification stage shown in the badge's detail view. */
export interface VerificationStage {
  label: string;
  passed: boolean;
}

interface TrustBadgeProps {
  /** 0–100 trust score. */
  score: number;
  /** Display size. Defaults to "md". */
  size?: "sm" | "md" | "lg";
  /**
   * Optional certification level label override.
   */
  certLevel?: "certified_managed" | "certified" | "provisional" | "uncertified";
  /**
   * Verification stages, rendered as pass/fail dots. Only shown at size "lg".
   */
  stages?: VerificationStage[];
  className?: string;
}

// ── Colour bands ──────────────────────────────────────────────────────────────

interface TrustColour {
  stroke: string;
  text: string;
  label: string;
}

function getTrustColour(score: number): TrustColour {
  if (score >= 75) return { stroke: "#4ADE80", text: "text-green-400",  label: "Certified" };
  if (score >= 50) return { stroke: "#FBBF24", text: "text-yellow-400", label: "Provisional" };
  return           { stroke: "#F87171",        text: "text-red-400",    label: "Uncertified" };
}

// ── Cert-level config ─────────────────────────────────────────────────────────

const CERT_LABELS: Record<NonNullable<TrustBadgeProps["certLevel"]>, string> = {
  certified_managed: "Certified Managed",
  certified:         "Certified",
  provisional:       "Provisional",
  uncertified:       "Uncertified",
};

const CERT_COLOURS: Record<NonNullable<TrustBadgeProps["certLevel"]>, string> = {
  certified_managed: "text-teal-400",
  certified:         "text-emerald-400",
  provisional:       "text-amber-400",
  uncertified:       "text-sen-muted",
};

// ── Stage pass/fail dot ───────────────────────────────────────────────────────

function StageIcon({ passed, label }: { passed: boolean; label: string }): React.JSX.Element {
  return (
    <span
      title={`${label}: ${passed ? "Passed" : "Failed"}`}
      aria-label={`${label} ${passed ? "passed" : "failed"}`}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-full",
        passed ? "bg-teal-500/20 text-teal-400" : "bg-red-500/20 text-red-400",
      )}
    >
      {passed ? (
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

// ── TrustBadge ────────────────────────────────────────────────────────────────

const SIZE: Record<"sm" | "md" | "lg", { w: number; h: number; r: number; sw: number; fs: number }> = {
  sm: { w: 40, h: 40, r: 16, sw: 2.5, fs: 10 },
  md: { w: 48, h: 48, r: 20, sw: 2.5, fs: 12 },
  lg: { w: 64, h: 64, r: 27, sw: 3,   fs: 16 },
};

/**
 * SVG arc-ring trust score indicator, coloured by band:
 * teal (≥75 Certified), amber (≥50 Provisional), red (<50 Uncertified).
 * Optionally shows cert label and pipeline stage pass/fail dots.
 *
 * @example
 * <TrustBadge score={87} size="md" certLevel="certified" />
 * <TrustBadge score={62} size="lg" stages={[{ label: "Static", passed: true }]} />
 */
export function TrustBadge({
  score,
  size = "md",
  certLevel,
  stages,
  className,
}: TrustBadgeProps): React.JSX.Element {
  const colours = getTrustColour(score);
  const cfg = SIZE[size];
  const circ = 2 * Math.PI * cfg.r;
  const dash = (score / 100) * circ;
  const cx = cfg.w / 2;
  const cy = cfg.h / 2;

  const certLabel  = certLevel != null ? CERT_LABELS[certLevel]  : colours.label;
  const certColour = certLevel != null ? CERT_COLOURS[certLevel] : colours.text;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Arc ring */}
      <div
        role="img"
        aria-label={`Trust score ${score} out of 100 — ${certLabel}`}
        title={`Trust score: ${score}/100 (${certLabel})`}
      >
        <svg width={cfg.w} height={cfg.h} viewBox={`0 0 ${cfg.w} ${cfg.h}`}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={cfg.r} fill="none" style={{ stroke: "rgb(var(--sen-border))" }} strokeWidth={cfg.sw} />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={cfg.r}
            fill="none"
            stroke={colours.stroke}
            strokeWidth={cfg.sw}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 3px ${colours.stroke}70)` }}
          />
          {/* Score number */}
          <text
            x={cx} y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={cfg.fs}
            fontWeight="700"
            fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
            fill={colours.stroke}
          >
            {score}
          </text>
        </svg>
      </div>

      {/* Cert label */}
      {size !== "sm" && (
        <span className={cn("mt-1 text-xs font-medium", certColour)}>
          {certLabel}
        </span>
      )}

      {/* Stage pass/fail dots — lg only */}
      {size === "lg" && stages != null && stages.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          {stages.map((stage) => (
            <StageIcon key={stage.label} passed={stage.passed} label={stage.label} />
          ))}
        </div>
      )}
    </div>
  );
}
