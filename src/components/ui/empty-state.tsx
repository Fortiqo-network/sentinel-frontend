import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Optional call-to-action (e.g. a Button or Link). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Neutral empty / zero-data placeholder for tables, lists, and panels.
 *
 * @example
 * <EmptyState title="No agents yet" description="Publish your first agent."
 *   action={<Button>Publish</Button>} />
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-ink-700 dark:text-porcelain/40">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-slate-800 dark:text-porcelain">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-porcelain/50">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
