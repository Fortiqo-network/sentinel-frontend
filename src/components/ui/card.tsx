import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Card container — a bordered, rounded surface with optional shadow.
 * Compose with CardHeader, CardTitle, CardContent, and CardFooter.
 *
 * @example
 * <Card>
 *   <CardHeader><CardTitle>Title</CardTitle></CardHeader>
 *   <CardContent>Body</CardContent>
 * </Card>
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm",
        "dark:border-porcelain/10 dark:bg-ink-800 dark:text-porcelain dark:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

/** Card header section — provides consistent top padding and spacing for title rows. */
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

/** Card title — renders as an h3 with appropriate weight and size. */
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={cn("text-base font-semibold leading-none tracking-tight text-slate-900 dark:text-porcelain", className)}
      {...props}
    />
  );
}

/** Card description — muted secondary text below the title. */
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return <p className={cn("text-sm text-slate-500 dark:text-porcelain/50", className)} {...props} />;
}

/** Card content area — consistent horizontal padding, no top padding (use pt-* when needed). */
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

/** Card footer — flex row with top border for action areas. */
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={cn("flex items-center border-t border-slate-100 p-6 pt-4 dark:border-porcelain/10", className)} {...props} />
  );
}
