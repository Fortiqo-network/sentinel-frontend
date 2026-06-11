"use client";

import * as React from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Provides a light/dark theme toggle to the whole tree via React context.
 * Reads localStorage on mount (defaults to "light"), sets/removes the
 * "dark" class on <html> for Tailwind's `darkMode: "class"` strategy.
 *
 * @example
 * <ThemeProvider><App /></ThemeProvider>
 */
export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    const stored = localStorage.getItem("sen-theme") as Theme | null;
    const initial: Theme = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      localStorage.setItem("sen-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the current theme and a toggle function.
 * Must be used inside <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext);
}
