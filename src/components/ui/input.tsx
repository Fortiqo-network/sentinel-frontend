import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered above the input. */
  label?: string;
  /** Error message displayed below the input in red. */
  error?: string;
  /** Helper text displayed below the input. Hidden when error is present. */
  hint?: string;
}

/**
 * Styled text input field with optional label, error, and hint support.
 * Fully forwards the ref for use with react-hook-form.
 *
 * @example
 * <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-sen-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-9 w-full rounded-md border border-sen-border bg-sen-surface px-3 py-1 text-sm text-sen-text",
            "placeholder:text-sen-muted",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sen-gold/30 focus-visible:border-sen-gold",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-sen-danger focus-visible:ring-sen-danger/30",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-sen-danger">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-sen-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
