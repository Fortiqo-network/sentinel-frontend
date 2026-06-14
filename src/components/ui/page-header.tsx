import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional eyebrow label above the title (e.g. "Developer portal"). */
  eyebrow?: string;
  /** Action buttons rendered on the right (wraps on mobile). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page heading for portal pages — eyebrow, title, description, and a
 * right-aligned actions slot that wraps below on small screens.
 *
 * @example
 * <PageHeader title="Billing" description="Manage credits and invoices."
 *   actions={<Button>Buy credits</Button>} />
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
