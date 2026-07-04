import * as React from "react";
import { cn } from "@/lib/utils/cn";

const ACCENTS = {
  indigo: "text-indigo-600 bg-indigo-50",
  emerald: "text-emerald-600 bg-emerald-50",
  amber: "text-amber-600 bg-amber-50",
  rose: "text-rose-600 bg-rose-50",
  slate: "text-slate-600 bg-slate-100",
} as const;

type Accent = keyof typeof ACCENTS;

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional supporting line below the value. */
  sub?: string;
  /** Optional leading icon (e.g. a lucide icon element). */
  icon?: React.ReactNode;
  /** Icon tint. Defaults to "indigo". */
  accent?: Accent;
  /** Optional trend chip, e.g. "+12%". */
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}

/**
 * Headline metric tile used across the buyer and seller portals. Optionally
 * shows an icon, a supporting line, and a coloured trend chip.
 *
 * @example
 * <StatCard label="Credits spent" value="12,400 Cr" sub="Last 30 days" icon={<Wallet />} />
 */
export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "indigo",
  trend,
  className,
}: StatCardProps): React.JSX.Element {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        {icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", ACCENTS[accent])}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              trend.direction === "up" && "bg-emerald-50 text-emerald-700",
              trend.direction === "down" && "bg-rose-50 text-rose-700",
              trend.direction === "flat" && "bg-slate-100 text-slate-600",
            )}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
