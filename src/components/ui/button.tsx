"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

// ── Variant map ───────────────────────────────────────────────────────────────

const VARIANTS = {
  primary:
    "bg-sen-gold text-white shadow hover:bg-violet-500 active:bg-violet-700 focus-visible:ring-sen-gold/40",
  secondary:
    "bg-sen-surface-2 text-sen-text shadow-sm hover:bg-sen-border hover:text-sen-text active:bg-sen-border focus-visible:ring-sen-border-hi",
  ghost:
    "text-sen-muted hover:bg-sen-surface-2 hover:text-sen-text active:bg-sen-border focus-visible:ring-sen-border",
  destructive:
    "bg-red-600 text-white shadow hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500",
  outline:
    "border border-sen-border bg-sen-surface text-sen-text shadow-sm hover:bg-sen-surface-2 hover:border-sen-border-hi active:bg-sen-surface-2 focus-visible:ring-sen-border-hi",
} as const;

type Variant = keyof typeof VARIANTS;

const SIZES = {
  sm: "h-8 rounded-md px-3 text-xs",
  md: "h-9 rounded-md px-4 text-sm",
  lg: "h-10 rounded-lg px-6 text-sm font-medium",
  icon: "h-9 w-9 rounded-md",
} as const;

type Size = keyof typeof SIZES;

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. Defaults to "primary". */
  variant?: Variant;
  /** Size preset. Defaults to "md". */
  size?: Size;
  /**
   * When true, the button renders its child element instead of a <button>,
   * merging all props (useful for wrapping <Link>).
   */
  asChild?: boolean;
}

/**
 * Sentinel button primitive. Supports five variants and four sizes.
 * Use `asChild` to render a Next.js Link with button styles.
 *
 * @example
 * <Button variant="primary" size="lg">Get Started</Button>
 * <Button asChild variant="ghost"><Link href="/agents">Browse</Link></Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sen-bg",
          "disabled:pointer-events-none disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
