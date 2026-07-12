"use client";

import * as React from "react";

interface CopyButtonProps {
  /** The text placed on the clipboard when clicked. */
  value: string;
  /** Accessible label / tooltip. */
  label?: string;
  className?: string;
}

/**
 * A small copy-to-clipboard button. Shows a transient "Copied" state and is
 * safe on non-secure contexts (falls back to a hidden textarea + execCommand).
 */
export function CopyButton({ value, label = "Copy", className }: CopyButtonProps): React.JSX.Element {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — leave the button state unchanged.
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={label}
      title={label}
      className={
        "inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 " +
        (className ?? "")
      }
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}
