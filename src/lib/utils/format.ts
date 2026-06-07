/**
 * Formatting utilities for currency, dates, and Sentinel-specific values.
 * All functions are pure and have no side effects.
 */

/** INR paise → formatted rupee string (e.g. 150000 → "₹1,500.00") */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(rupees);
}

/** ISO date string → locale-friendly date (e.g. "7 Jun 2026") */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** ISO date string → relative time (e.g. "3 days ago") */
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return rtf.format(-seconds, "second");
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-days, "day");
}

export interface TrustScoreLabel {
  label: string;
  color: string;
  band: "low" | "medium" | "high" | "elite";
}

/**
 * Maps a 0–100 trust score to a human label and colour token.
 * Bands: 0–39 Low (red), 40–69 Medium (amber), 70–89 High (green), 90–100 Elite (emerald).
 */
export function formatTrustScore(score: number): TrustScoreLabel {
  if (score >= 90) return { label: "Elite", color: "#10b981", band: "elite" };
  if (score >= 70) return { label: "High", color: "#22c55e", band: "high" };
  if (score >= 40) return { label: "Medium", color: "#f59e0b", band: "medium" };
  return { label: "Low", color: "#ef4444", band: "low" };
}

/** Truncates a string to maxLength characters, appending "…" if truncated. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
