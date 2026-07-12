import * as React from "react";
import { CopyButton } from "@/components/ui/CopyButton";

interface CodeSnippetProps {
  /** Optional small heading above the block. */
  label?: string;
  /** The code/text shown and copied. */
  code: string;
  /** Wrap long lines instead of horizontal scroll (good for curl commands). */
  wrap?: boolean;
}

/**
 * A high-contrast, copyable code block. Deliberately light-on-light (near-white
 * surface, near-black text) so it reads clearly on the dark app shell — the
 * previous gray-on-black blocks were hard to read.
 */
export function CodeSnippet({ label, code, wrap = false }: CodeSnippetProps): React.JSX.Element {
  return (
    <div>
      {label && (
        <div className="mb-1 font-brand-mono text-[11px] uppercase tracking-wider text-porcelain/40">
          {label}
        </div>
      )}
      <div className="group relative">
        <pre
          className={
            "rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2.5 pr-16 font-brand-mono text-[12px] leading-relaxed text-slate-800 " +
            (wrap ? "whitespace-pre-wrap break-all" : "overflow-x-auto")
          }
        >
          <code>{code}</code>
        </pre>
        <div className="absolute right-2 top-2">
          <CopyButton value={code} label={label ? `Copy ${label}` : "Copy"} />
        </div>
      </div>
    </div>
  );
}
