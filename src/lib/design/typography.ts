/**
 * Typography tokens — single source of truth for all font sizes and families.
 *
 * This file is imported by tailwind.config.ts so Tailwind's generated classes
 * (text-display, text-sm, font-brand, etc.) always match these values.
 * globals.css references the same values for CSS custom properties.
 *
 * Explicit types are required here because TypeScript infers mixed arrays as
 * `(string | object)[]`, which doesn't satisfy Tailwind's tuple constraints.
 */

type FontSizeEntry = [
  size: string,
  config: Partial<{ lineHeight: string; letterSpacing: string; fontWeight: string | number }>,
];

// ── Font families ──────────────────────────────────────────────────────────────

export const fontFamily: Record<string, string[]> = {
  /** App default UI (loaded via next/font as var(--font-geist-sans)). */
  sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
  /** App monospace (loaded via next/font as var(--font-geist-mono)). */
  mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
  /** Marketing / display headings (Archivo). */
  brand: ["var(--font-archivo)", "system-ui", "sans-serif"],
  /** Marketing labels and data readouts (IBM Plex Mono). */
  "brand-mono": ["var(--font-plex-mono)", "ui-monospace", "monospace"],
};

// ── Fluid display sizes ────────────────────────────────────────────────────────
// Used only for cinematic / marketing heroes — scale smoothly with the viewport.
// The base Tailwind type scale (xs → 9xl) is unchanged.

export const fontSize: Record<string, FontSizeEntry> = {
  /** 36–56 px — section heroes, page titles on marketing pages. */
  "display-sm": [
    "clamp(2.25rem, 6vw, 3.5rem)",
    { lineHeight: "1.04", letterSpacing: "-0.03em" },
  ],
  /** 44–96 px — primary hero headings. */
  display: [
    "clamp(2.75rem, 9vw, 6rem)",
    { lineHeight: "0.98", letterSpacing: "-0.035em" },
  ],
  /** 52–144 px — full-bleed statement headings. */
  "display-lg": [
    "clamp(3.25rem, 12vw, 9rem)",
    { lineHeight: "0.94", letterSpacing: "-0.04em" },
  ],
};
