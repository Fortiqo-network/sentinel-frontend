"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Root dialog provider — manages open/close state. */
export const Dialog = DialogPrimitive.Root;

/** Button that opens the dialog. */
export const DialogTrigger = DialogPrimitive.Trigger;

/** Programmatic close trigger. */
export const DialogClose = DialogPrimitive.Close;

function DialogPortal({ ...props }: DialogPrimitive.DialogPortalProps): React.JSX.Element {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps & { className?: string }): React.JSX.Element {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

/** Dialog content panel. Renders centred on screen with close button. */
export function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.DialogContentProps & { className?: string }): React.JSX.Element {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border border-slate-200 bg-white shadow-xl dark:border-porcelain/10 dark:bg-ink-800",
          "p-6",
          "animate-slide-up",
          "focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-md p-1 text-slate-400 dark:text-porcelain/40",
            "hover:text-slate-700 hover:bg-slate-100 dark:hover:text-porcelain dark:hover:bg-ink-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            "transition-colors",
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** Dialog header section. */
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("mb-4 space-y-1.5", className)} {...props} />;
}

/** Dialog title — renders as h2. */
export function DialogTitle({ className, ...props }: DialogPrimitive.DialogTitleProps & { className?: string }): React.JSX.Element {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-slate-900 dark:text-porcelain", className)}
      {...props}
    />
  );
}

/** Dialog description — muted secondary text. */
export function DialogDescription({ className, ...props }: DialogPrimitive.DialogDescriptionProps & { className?: string }): React.JSX.Element {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-slate-500 dark:text-porcelain/50", className)}
      {...props}
    />
  );
}
