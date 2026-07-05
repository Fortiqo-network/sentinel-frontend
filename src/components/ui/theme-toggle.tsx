"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Theme = "light" | "dark";

const STORAGE_KEY = "sentinel-theme";

/** Read the theme currently applied to <html> (set pre-paint by the root script). */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode / blocked); the class still applies.
  }
}

function IconSun(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
    </svg>
  );
}

function IconMoon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

/**
 * Light/dark theme toggle. The active theme is stored on <html> (class `dark`)
 * and persisted to localStorage under `sentinel-theme`; the initial value is
 * resolved pre-paint by an inline script in the root layout, so this control
 * only reads/flips it. Renders a stable placeholder until mounted to avoid a
 * hydration mismatch.
 *
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  function toggle(): void {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
        "border-slate-200 bg-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        "dark:border-porcelain/10 dark:bg-ink-700 dark:text-porcelain/70 dark:hover:border-gold/40 dark:hover:bg-ink-600 dark:hover:text-gold",
      )}
    >
      {mounted && isDark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
