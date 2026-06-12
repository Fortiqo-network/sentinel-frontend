import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered above the input. */
  label?: string;
  /** Error message displayed below the input in red. */
  error?: string;
  /** Helper text displayed below the input. Hidden when error is present. */
  hint?: string;
  /** "dark" renders on the cinematic ink surface; "light" is the default app style. */
  variant?: "light" | "dark";
}

/**
 * Styled text input field with optional label, error, and hint support.
 * Fully forwards the ref for use with react-hook-form.
 *
 * @example
 * <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} />
 * <Input label="Email" type="email" variant="dark" />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, variant = "light", ...props }, ref) => {
    const dark = variant === "dark";
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn("text-sm font-medium", dark ? "text-porcelain/70" : "text-slate-700")}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-9 w-full rounded-md border px-3 py-1 text-sm transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            dark
              ? [
                  "border-ink-600 bg-ink-800 text-porcelain placeholder:text-graphite",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-0",
                  error && "border-red-500/60 focus-visible:ring-red-500/50",
                ]
              : [
                  "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0",
                  error && "border-red-400 focus-visible:ring-red-400",
                ],
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className={cn("text-xs", dark ? "text-red-400" : "text-red-600")}
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className={cn("text-xs", dark ? "text-porcelain/45" : "text-slate-500")}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
