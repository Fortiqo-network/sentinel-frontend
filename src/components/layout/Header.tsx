"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/ThemeProvider";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface NavLink {
  href: string;
  label: string;
}

const PUBLIC_NAV: NavLink[] = [
  { href: "/agents", label: "Marketplace" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------

/**
 * Sun/moon icon button that switches between light and dark mode.
 * Shows moon when currently light (click to go dark), sun when dark (click to go light).
 */
function ThemeToggle(): React.JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        border: isDark ? "1px solid rgba(139,92,246,0.45)" : "1px solid rgba(124,58,237,0.35)",
        background: isDark ? "rgba(139,92,246,0.12)" : "rgba(124,58,237,0.08)",
        color: isDark ? "#8B5CF6" : "#7C3AED",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {isDark ? (
        /* Sun icon — shown in dark mode */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Moon icon — shown in light mode */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dashboard dropdown
// ---------------------------------------------------------------------------

function DashboardDropdown(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
          open
            ? "border-sen-gold/40 bg-sen-surface-2 text-sen-gold"
            : "border-sen-border bg-sen-surface text-sen-text hover:border-sen-border-hi hover:bg-sen-surface-2",
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Dashboard
        <svg
          className={cn("h-3.5 w-3.5 text-sen-muted transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-sen-border bg-sen-surface shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sen-text hover:bg-sen-surface-2 hover:text-sen-gold transition-colors"
            >
              <svg className="h-4 w-4 text-sen-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Buyer Dashboard
            </Link>
            <Link
              href="/developer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sen-text hover:bg-sen-surface-2 hover:text-sen-gold transition-colors"
            >
              <svg className="h-4 w-4 text-sen-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Developer Dashboard
            </Link>
          </div>
          <div className="border-t border-sen-border py-1">
            <Link
              href="/api/auth/logout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sen-danger hover:bg-sen-surface-2 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
}

function MobileMenu({ open, onClose, isAuthenticated }: MobileMenuProps): React.JSX.Element | null {
  if (!open) return null;

  return (
    <div className="border-t border-sen-border bg-sen-surface px-4 py-4 md:hidden">
      <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
        {PUBLIC_NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-sen-text hover:bg-sen-surface-2 hover:text-sen-gold transition-colors"
          >
            {label}
          </Link>
        ))}
        <div className="mt-2 border-t border-sen-border pt-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-sen-text hover:bg-sen-surface-2">
                Buyer Dashboard
              </Link>
              <Link href="/developer" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-sen-text hover:bg-sen-surface-2">
                Developer Dashboard
              </Link>
              <Link href="/api/auth/logout" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-sen-danger hover:bg-sen-surface-2">
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={onClose} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-sen-text hover:bg-sen-surface-2">
                Sign In
              </Link>
              <Link href="/register" onClick={onClose} className="mt-1 block rounded-lg bg-sen-gold px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

/**
 * Global navigation header. Dark ink-navy base with gold accent.
 * Shows public nav, authenticated dashboard dropdown, or login/register.
 *
 * @example
 * <Header />
 */
export function Header(): React.JSX.Element {
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-sen-border bg-sen-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-lg font-bold tracking-tight text-sen-text">
            Sentinel<span className="text-sen-gold">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {PUBLIC_NAV.map(({ href, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-sen-gold" : "text-sen-muted hover:text-sen-text",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-sen-muted hidden lg:block">
                {user.displayName ?? user.email}
              </span>
              <DashboardDropdown />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-sen-muted hover:text-sen-text transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-sen-gold px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex items-center justify-center rounded-md p-2 text-sen-muted hover:bg-sen-surface-2 hover:text-sen-text transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
}
