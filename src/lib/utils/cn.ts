import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names with clsx, resolving conflicts using
 * tailwind-merge. Use this everywhere instead of raw string concatenation.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-indigo-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
