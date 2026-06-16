/**
 * Formatting utilities for currency, dates, and Sentinel-specific values.
 * All functions are pure and have no side effects.
 */
import { trust } from "@/lib/design/colors";

/** Credits → formatted credit string (e.g. 1500 → "1,500 Cr"). */
export function formatCredits(credits: number): string {
  return `${new Intl.NumberFormat("en-IN").format(credits)} Cr`;
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
  if (score >= 90) return { label: "Elite", color: trust.elite, band: "elite" };
  if (score >= 70) return { label: "High", color: trust.high,  band: "high" };
  if (score >= 40) return { label: "Medium", color: trust.medium, band: "medium" };
  return { label: "Low", color: trust.low, band: "low" };
}

/** Truncates a string to maxLength characters, appending "…" if truncated. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
