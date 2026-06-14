import * as React from "react";

interface Provider {
  id: string;
  label: string;
  glyph: React.ReactNode;
}

const PROVIDERS: Provider[] = [
  { id: "google", label: "Google", glyph: <span className="font-bold">G</span> },
  { id: "x", label: "X", glyph: <span className="font-bold">𝕏</span> },
  { id: "wallet", label: "Wallet", glyph: <span className="font-bold">⬡</span> },
];

/**
 * Social / wallet sign-in options for the auth screens. Google, X, and EVM
 * wallet are scaffolded here on the cinematic auth surface and ship behind the
 * auth-integration work; email/password is the active method today.
 *
 * @example
 * <SocialSignInButtons />
 */
export function SocialSignInButtons(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled
            title={`${p.label} sign-in — coming soon`}
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-porcelain/15 bg-ink-800/40 px-3 py-2.5 text-sm text-porcelain/45"
          >
            {p.glyph}
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-porcelain/35">
        Google · X · EVM wallet sign-in coming soon
      </p>
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-porcelain/10" />
        <span className="text-xs text-porcelain/40">or continue with email</span>
        <span className="h-px flex-1 bg-porcelain/10" />
      </div>
    </div>
  );
}
