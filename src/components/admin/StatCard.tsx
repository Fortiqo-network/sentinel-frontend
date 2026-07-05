import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

/**
 * Compact metric tile for the admin dashboard. Accent variant highlights the
 * headline figure (e.g. revenue or pending settlements).
 */
export function StatCard({ label, value, sub, accent }: StatCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm dark:shadow-none",
        accent
          ? "border-indigo-200 bg-indigo-50 dark:border-gold/30 dark:bg-gold/10"
          : "border-slate-200 bg-white dark:border-porcelain/10 dark:bg-ink-800",
      )}
    >
      <div className={cn("text-2xl font-bold", accent ? "text-indigo-700 dark:text-gold" : "text-slate-900 dark:text-porcelain")}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-500 dark:text-porcelain/50">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400 dark:text-porcelain/40">{sub}</div>}
    </div>
  );
}
