"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sentinel.devBannerDismissed";

/**
 * A subtle, dismissible status pill noting that Sentinel is in active
 * development (early preview). Fixed to the bottom-left so it never obscures the
 * hero or navigation. The dismissal is remembered in localStorage.
 *
 * @example
 * <DevelopmentBanner />
 */
export function DevelopmentBanner(): React.JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!visible) return null;

  function dismiss(): void {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-full border border-gold/30 bg-ink-900/85 px-4 py-2 text-xs text-porcelain/80 shadow-lg shadow-black/40 backdrop-blur">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      <span>
        <span className="font-medium text-porcelain">Early preview</span>
        {" — "}Sentinel is in active development.
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss development notice"
        className="ml-1 text-porcelain/50 transition-colors hover:text-porcelain"
      >
        ✕
      </button>
    </div>
  );
}
