"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

// ── Toast types ───────────────────────────────────────────────────────────────

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  /** Duration in milliseconds before auto-dismiss. 0 = persist until dismissed. Default: 4000. */
  duration?: number;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ToasterContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToasterContext = React.createContext<ToasterContextValue | undefined>(undefined);

/**
 * Hook to imperatively fire toast notifications from any client component.
 * Must be used within a component tree wrapped by <ToastProvider>.
 *
 * @example
 * const { addToast } = useToast();
 * addToast({ message: "Agent published!", variant: "success" });
 */
export function useToast(): ToasterContextValue {
  const ctx = React.useContext(ToasterContext);
  if (ctx === undefined) {
    throw new Error("useToast must be used within a <ToastProvider> component tree.");
  }
  return ctx;
}

// ── Variant styles ────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: "bg-slate-900 text-white border-slate-700",
  success: "bg-emerald-600 text-white border-emerald-500",
  error: "bg-red-600 text-white border-red-500",
  warning: "bg-amber-500 text-slate-900 border-amber-400",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  default: "ℹ",
  success: "✓",
  error: "✕",
  warning: "⚠",
};

// ── Individual toast ──────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps): React.JSX.Element {
  const { id, message, variant = "default" } = toast;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        "animate-[fade-slide-in_0.2s_ease-out]",
        VARIANT_STYLES[variant],
      )}
    >
      <span className="mt-0.5 shrink-0 text-sm font-bold" aria-hidden="true">
        {VARIANT_ICONS[variant]}
      </span>
      <p className="flex-1 text-sm leading-snug">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="ml-1 shrink-0 rounded opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M1.293 1.293a1 1 0 0 1 1.414 0L7 5.586l4.293-4.293a1 1 0 1 1 1.414 1.414L8.414 7l4.293 4.293a1 1 0 0 1-1.414 1.414L7 8.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L5.586 7 1.293 2.707a1 1 0 0 1 0-1.414Z" />
        </svg>
      </button>
    </div>
  );
}

// ── Toast provider ────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Provides toast context to the component tree and renders the toast overlay.
 * Mount this once in your root layout wrapping the page children.
 *
 * @example
 * // In layout.tsx:
 * <QueryProvider>
 *   <ToastProvider>
 *     {children}
 *   </ToastProvider>
 * </QueryProvider>
 */
export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const duration = toast.duration ?? 4000;
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Fixed toast overlay — bottom-right */}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

/**
 * Toaster — convenience alias for ToastProvider.
 * Drop-in replacement for the root layout.
 *
 * @example
 * // In layout.tsx:
 * <QueryProvider>
 *   <Toaster>{children}</Toaster>
 * </QueryProvider>
 */
export function Toaster({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <ToastProvider>{children}</ToastProvider>;
}
