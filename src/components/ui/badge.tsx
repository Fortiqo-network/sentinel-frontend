import * as React from "react";
import { cn } from "@/lib/utils/cn";

const VARIANTS = {
  default: "bg-slate-100 text-slate-700 border-transparent dark:bg-ink-700 dark:text-porcelain/70",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  destructive: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  info: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-gold/15 dark:text-gold dark:border-gold/30",
} as const;

type Variant = keyof typeof VARIANTS;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant. Defaults to "default". */
  variant?: Variant;
}

/**
 * Compact inline badge for displaying status labels, tier identifiers, and tags.
 *
 * @example
 * <Badge variant="success">Verified</Badge>
 * <Badge variant="warning">Pending</Badge>
 */
export function Badge({ className, variant = "default", ...props }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
