"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  /** The exact word the user must type to enable confirmation. Defaults to "DELETE". */
  confirmWord?: string;
  /** Label for the confirm button. */
  confirmLabel?: string;
  /** Disables the confirm button while the action runs. */
  busy?: boolean;
}

/**
 * Destructive-action modal that requires the user to type a confirmation word
 * (default "DELETE") before the confirm button enables — a deliberate double
 * confirmation for irreversible/high-impact actions.
 *
 * @example
 * <ConfirmDeleteModal open={open} onClose={close} onConfirm={disable}
 *   title="Disable agent" description="This delists the agent." />
 */
export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord = "DELETE",
  confirmLabel = "Disable agent",
  busy = false,
}: ConfirmDeleteModalProps): React.JSX.Element | null {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (open) setValue("");
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape" && !busy) onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const matched = value.trim() === confirmWord;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !busy && onClose()} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-porcelain/10 dark:bg-ink-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-porcelain">{title}</h2>
        <div className="mt-2 text-sm text-slate-600 dark:text-porcelain/70">{description}</div>
        <label htmlFor="confirm-word" className="mt-5 block text-sm font-medium text-slate-700 dark:text-porcelain/70">
          Type <span className="font-mono font-semibold text-rose-600 dark:text-rose-300">{confirmWord}</span> to confirm
        </label>
        <input
          id="confirm-word"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={confirmWord}
          className="sentinel-focus mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 dark:bg-ink-800 dark:border-porcelain/15 dark:text-porcelain dark:placeholder:text-porcelain/30"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={!matched || busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
