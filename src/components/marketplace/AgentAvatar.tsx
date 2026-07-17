import * as React from "react";

interface AgentAvatarProps {
  name: string;
  /** Optional real logo URL; falls back to a generated avatar when absent/blank. */
  iconUrl?: string | null;
  /** Tailwind size classes, e.g. "h-16 w-16". */
  className?: string;
}

// A small palette of on-brand gradients; the agent name deterministically
// selects one so the same agent always renders the same avatar.
const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

/**
 * An agent's avatar: the real logo when a usable `iconUrl` is present, otherwise
 * a deterministic gradient tile with the agent's initials (so every agent has a
 * consistent, non-broken avatar even without an uploaded image).
 */
export function AgentAvatar({ name, iconUrl, className = "h-16 w-16" }: AgentAvatarProps): React.JSX.Element {
  if (typeof iconUrl === "string" && /^https?:\/\//.test(iconUrl.trim())) {
    return (
      // Agent logos are arbitrary seller-supplied URLs, so next/image (which
      // needs each host allowlisted in images.remotePatterns) is intentionally
      // not used; a plain lazy <img> renders any host without config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={name}
        className={`${className} shrink-0 rounded-2xl object-cover`}
        loading="lazy"
      />
    );
  }
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length];
  return (
    <div
      aria-label={name}
      role="img"
      className={`${className} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-brand text-lg font-bold text-white`}
    >
      {initials(name)}
    </div>
  );
}
