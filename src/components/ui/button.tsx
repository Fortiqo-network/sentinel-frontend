"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

// ── Variant map ───────────────────────────────────────────────────────────────

const VARIANTS = {
  primary:
    "bg-indigo-500 text-white shadow hover:bg-indigo-400 active:bg-indigo-600 focus-visible:ring-indigo-500",
  secondary:
    "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400",
  ghost:
    "text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400",
  destructive:
    "bg-red-500 text-white shadow hover:bg-red-400 active:bg-red-600 focus-visible:ring-red-500",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400",
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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
