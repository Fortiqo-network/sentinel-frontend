import * as React from "react";
import { cn } from "@/lib/utils/cn";

/** Verification stage shown as a small icon row inside the badge. */
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
   * Optional certification level. When provided, renders a text label
   * beneath the score circle.
   */
  certLevel?: "certified_managed" | "certified" | "provisional" | "uncertified";
  /**
   * Optional verification stages to render as small pass/fail icons below the cert label.
   * Only shown when size is "lg".
   */
  stages?: VerificationStage[];
  /** Additional class names. */
  className?: string;
}

// ── colour bands ──────────────────────────────────────────────────────────────

interface TrustColour {
  ring: string;
  bg: string;
  text: string;
  label: string;
}

function getTrustColour(score: number): TrustColour {
  if (score >= 75) {
    return {
      ring: "ring-emerald-500",
      bg: "bg-emerald-500",
      text: "text-emerald-700",
      label: "Certified",
    };
  }
  if (score >= 50) {
    return {
      ring: "ring-amber-500",
      bg: "bg-amber-500",
      text: "text-amber-700",
      label: "Provisional",
    };
  }
  return {
    ring: "ring-red-500",
    bg: "bg-red-500",
    text: "text-red-700",
    label: "Uncertified",
  };
}

// ── cert-level config ─────────────────────────────────────────────────────────

const CERT_LABELS: Record<NonNullable<TrustBadgeProps["certLevel"]>, string> = {
  certified_managed: "Certified Managed",
  certified: "Certified",
  provisional: "Provisional",
  uncertified: "Uncertified",
};

const CERT_COLOURS: Record<NonNullable<TrustBadgeProps["certLevel"]>, string> = {
  certified_managed: "text-indigo-700",
  certified: "text-emerald-700",
  provisional: "text-amber-700",
  uncertified: "text-slate-500",
};

// ── size config ───────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: {
    circle: "h-10 w-10 text-xs ring-2",
    certLabel: "hidden",
    stages: false,
  },
  md: {
    circle: "h-12 w-12 text-sm ring-2",
    certLabel: "mt-1 text-xs font-medium",
    stages: false,
  },
  lg: {
    circle: "h-16 w-16 text-lg font-bold ring-2",
    certLabel: "mt-1.5 text-xs font-semibold",
    stages: true,
  },
} as const;

// ── Shield SVG icon ───────────────────────────────────────────────────────────

interface ShieldIconProps {
  className?: string;
}

function ShieldIcon({ className }: ShieldIconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z" />
    </svg>
  );
}

// ── Stage icon ────────────────────────────────────────────────────────────────

interface StageIconProps {
  passed: boolean;
  label: string;
}

function StageIcon({ passed, label }: StageIconProps): React.JSX.Element {
  return (
    <span
      title={`${label}: ${passed ? "Passed" : "Failed"}`}
      aria-label={`${label} ${passed ? "passed" : "failed"}`}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-full text-white",
        passed ? "bg-emerald-500" : "bg-red-400",
      )}
    >
      {passed ? (
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

// ── TrustBadge component ──────────────────────────────────────────────────────

/**
 * Visual trust score indicator. Renders a circular badge with a shield icon,
 * coloured by band: emerald (>=75), amber (>=50), red (<50).
 * Optionally shows a certification level label and stage pass/fail icons.
 *
 * @example
 * <TrustBadge score={87} size="md" certLevel="certified" />
 * <TrustBadge score={62} size="lg" stages={[{ label: "Static Analysis", passed: true }]} />
 */
export function TrustBadge({
  score,
  size = "md",
  certLevel,
  stages,
  className,
}: TrustBadgeProps): React.JSX.Element {
  const colours = getTrustColour(score);
  const config = SIZE_CONFIG[size];

  const derivedCertLabel =
    certLevel != null
      ? CERT_LABELS[certLevel]
      : colours.label;

  const derivedCertColour =
    certLevel != null
      ? CERT_COLOURS[certLevel]
      : colours.text;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Score circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-white font-semibold text-white ring-offset-0",
          colours.ring,
          config.circle,
        )}
        role="img"
        aria-label={`Trust score ${score} out of 100 — ${derivedCertLabel}`}
        title={`Trust score: ${score}/100 (${derivedCertLabel})`}
      >
        {/* Shield background fill */}
        <ShieldIcon
          className={cn(
            "absolute inset-0 h-full w-full p-1 opacity-15",
            colours.text,
          )}
        />
        <span className={cn("relative z-10 font-bold leading-none", colours.text)}>
          {score}
        </span>
      </div>

      {/* Cert level label */}
      {config.certLabel !== "hidden" && (
        <span className={cn(config.certLabel, derivedCertColour)}>
          {derivedCertLabel}
        </span>
      )}

      {/* Verification stage icons (lg only) */}
      {config.stages && stages != null && stages.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          {stages.map((stage) => (
            <StageIcon key={stage.label} passed={stage.passed} label={stage.label} />
          ))}
        </div>
      )}
    </div>
  );
}
