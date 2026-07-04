/**
 * Avatar presets for users and agents.
 *
 * Until self-hosted / R2 image hosting is wired up, accounts pick from a small
 * set of brand-aligned gradient presets. An avatar value is one of:
 *   - an absolute URL          → "https://…/me.png"  (self-hosted or R2 later)
 *   - a preset reference       → "preset:aurora"
 *   - undefined / empty        → render initials fallback
 *
 * The same model is reused for agent logos: a seller-hosted logo URL is used
 * verbatim; otherwise a preset (and, later, an R2-hosted upload) is used.
 */

export interface AvatarPreset {
  /** Stable identifier stored as `preset:<id>`. */
  id: string;
  /** Human label shown in the picker. */
  label: string;
  /** Tailwind gradient `from-` class. */
  from: string;
  /** Tailwind gradient `to-` class. */
  to: string;
  /** Foreground text colour class for the initial. */
  fg: string;
}

/** The selectable avatar presets (6 brand-aligned gradients). */
export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: "aurora", label: "Aurora", from: "from-indigo-500", to: "to-violet-500", fg: "text-white" },
  { id: "ember", label: "Ember", from: "from-amber-400", to: "to-orange-500", fg: "text-white" },
  { id: "mint", label: "Mint", from: "from-emerald-400", to: "to-teal-500", fg: "text-white" },
  { id: "rose", label: "Rose", from: "from-rose-400", to: "to-pink-500", fg: "text-white" },
  { id: "slate", label: "Graphite", from: "from-slate-600", to: "to-slate-800", fg: "text-white" },
  { id: "gold", label: "Gold", from: "from-yellow-400", to: "to-amber-500", fg: "text-slate-900" },
] as const;

const PRESET_PREFIX = "preset:";

/** Builds the stored value for a preset id (e.g. "preset:aurora"). */
export function presetValue(id: string): string {
  return `${PRESET_PREFIX}${id}`;
}

/** Returns the preset id if `value` is a preset reference, else null. */
export function presetId(value: string | undefined | null): string | null {
  if (!value || !value.startsWith(PRESET_PREFIX)) return null;
  return value.slice(PRESET_PREFIX.length);
}

/** Resolves a stored preset reference to its definition, or null. */
export function resolvePreset(value: string | undefined | null): AvatarPreset | null {
  const id = presetId(value);
  if (!id) return null;
  return AVATAR_PRESETS.find((p) => p.id === id) ?? null;
}

/** True when the value is an absolute http(s) URL (self-hosted / R2 image). */
export function isImageUrl(value: string | undefined | null): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

/**
 * Picks a deterministic default preset for a seed string (e.g. user id/email),
 * so accounts without a chosen avatar still get a stable, distinct colour.
 */
export function defaultPresetFor(seed: string): AvatarPreset {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const index = hash % AVATAR_PRESETS.length;
  return AVATAR_PRESETS[index] ?? AVATAR_PRESETS[0]!;
}

/** Derives up to two uppercase initials from a name or email. */
export function initialsOf(nameOrEmail: string | undefined | null): string {
  if (!nameOrEmail) return "?";
  const trimmed = nameOrEmail.trim();
  if (!trimmed) return "?";
  const handle = trimmed.includes("@") ? trimmed.split("@")[0]! : trimmed;
  const parts = handle.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return handle.charAt(0).toUpperCase();
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
}
