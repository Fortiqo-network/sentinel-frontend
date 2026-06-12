/**
 * Color palette — single source of truth for every color in the design system.
 *
 * This file is imported by tailwind.config.ts so Tailwind's generated classes
 * (bg-ink-950, text-gold, etc.) always match these values. globals.css
 * references the same hex values for CSS custom properties. No color lives in
 * more than one place.
 */

// ── Dark cinematic surface ─────────────────────────────────────────────────────
// The "ink" canvas used by the marketing layer and the marketplace.

export const ink = {
  950: "#0B0C0F",
  900: "#0E1014",
  800: "#111318",
  700: "#191C23",
  600: "#23262e",
  500: "#2c2f38",
} as const;

// ── Brand accent palette ───────────────────────────────────────────────────────

/** Primary light text on dark (ink) surfaces. */
export const porcelain = "#ECEAE3";

/** Amber/gold — the sealed-core identity accent. */
export const gold = {
  DEFAULT: "#E7A03C",
  deep:    "#B97718",
} as const;

/** Muted neutrals for secondary chrome on dark surfaces. */
export const graphite = {
  DEFAULT: "#80848F",
  dim:     "#4A4E58",
} as const;

// ── Sentinel indigo ────────────────────────────────────────────────────────────
// Primary interactive accent used in the light app shell (dashboard, auth).

export const sentinel = {
  50:  "#f0f4ff",
  100: "#e0e9ff",
  200: "#c7d7fe",
  300: "#a5bafc",
  400: "#8193f8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
  950: "#1e1b4b",
} as const;

// ── Trust score bands ──────────────────────────────────────────────────────────
// Semantic — not brand-specific. Applied to TrustBadge, cert chips, filter labels.

export const trust = {
  low:    "#ef4444", // 0–49   red-500
  medium: "#f59e0b", // 50–74  amber-500
  high:   "#22c55e", // 75–89  green-500
  elite:  "#10b981", // 90–100 emerald-500
} as const;

// ── Full palette object ────────────────────────────────────────────────────────
// Imported by tailwind.config.ts as `theme.extend.colors`.

export const colors = {
  ink,
  porcelain,
  gold,
  graphite,
  sentinel,
  trust,
  // Legacy alias — keeps any older `void-*` references working without a sweep.
  void: ink,
} as const;
