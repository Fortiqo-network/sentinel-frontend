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
        "rounded-xl border p-5 shadow-sm",
        accent ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white",
      )}
    >
      <div className={cn("text-2xl font-bold", accent ? "text-indigo-700" : "text-slate-900")}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
