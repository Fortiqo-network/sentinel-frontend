import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Star glyph used for the save/subscribe ("star") control. Filled (gold) when
 * starred, outline when not.
 *
 * @example
 * <StarIcon filled className="text-amber-400" />
 */
export function StarIcon({ filled, className }: { filled: boolean; className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      strokeLinejoin="round"
    >
      <path d="M10 1.6l2.57 5.2 5.74.84-4.15 4.05.98 5.71L10 14.7l-5.14 2.7.98-5.71L1.69 7.64l5.74-.84L10 1.6z" />
    </svg>
  );
}
