import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  AVATAR_PRESETS,
  defaultPresetFor,
  initialsOf,
  isImageUrl,
  presetValue,
  resolvePreset,
  type AvatarPreset,
} from "@/lib/avatars";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
} as const;

type Size = keyof typeof SIZES;

export interface AvatarProps {
  /** Stored avatar value: an image URL, a `preset:<id>` reference, or empty. */
  src?: string | null;
  /** Display name or email — used for initials and a deterministic fallback colour. */
  name?: string | null;
  /** Size preset. Defaults to "md". */
  size?: Size;
  className?: string;
}

/**
 * Renders a user or agent avatar from a stored value. Self-hosted / R2 image
 * URLs render as an `<img>`; preset references render a brand gradient with
 * initials; missing values fall back to a deterministic preset based on `name`.
 *
 * @example
 * <Avatar src={user.avatarUrl} name={user.displayName} size="md" />
 * <Avatar src="preset:aurora" name="CodeReview Pro" size="lg" />
 */
export function Avatar({ src, name, size = "md", className }: AvatarProps): React.JSX.Element {
  const initials = initialsOf(name);
  const base = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-bold select-none overflow-hidden ring-1 ring-black/5",
    SIZES[size],
    className,
  );

  if (isImageUrl(src)) {
    return (
      <img
        src={src}
        alt={name ? `${name} avatar` : "Avatar"}
        className={cn(base, "object-cover")}
      />
    );
  }

  const preset: AvatarPreset = resolvePreset(src) ?? defaultPresetFor(name ?? "sentinel");
  return (
    <span
      className={cn(base, "bg-gradient-to-br", preset.from, preset.to, preset.fg)}
      aria-label={name ? `${name} avatar` : "Avatar"}
    >
      {initials}
    </span>
  );
}

export interface AvatarPickerProps {
  /** Currently selected value (`preset:<id>` or an image URL). */
  value?: string | null;
  /** Called with the new `preset:<id>` value when a preset is chosen. */
  onSelect: (value: string) => void;
  /** Name used for the preview initials. */
  name?: string | null;
  className?: string;
}

/**
 * A 6-swatch picker for choosing an avatar preset. Logo/photo upload to R2 is a
 * later capability; for now accounts select from the brand presets.
 *
 * @example
 * <AvatarPicker value={avatar} onSelect={setAvatar} name={displayName} />
 */
export function AvatarPicker({ value, onSelect, name, className }: AvatarPickerProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {AVATAR_PRESETS.map((preset) => {
        const presetRef = presetValue(preset.id);
        const selected = value === presetRef;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(presetRef)}
            aria-label={`Choose ${preset.label} avatar`}
            aria-pressed={selected}
            title={preset.label}
            className={cn(
              "rounded-full p-0.5 transition-transform hover:scale-105",
              selected ? "ring-2 ring-indigo-500 ring-offset-2" : "ring-1 ring-transparent",
            )}
          >
            <Avatar src={presetRef} name={name} size="md" />
          </button>
        );
      })}
    </div>
  );
}
