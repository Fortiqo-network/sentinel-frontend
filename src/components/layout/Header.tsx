"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";
import { portalHome, portalLabel as portalLabelFor } from "@/lib/utils/portal";

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
// Dashboard dropdown
// ---------------------------------------------------------------------------

interface DashboardDropdownProps {
  role: "buyer" | "seller" | "admin" | "super_admin";
}

function DashboardDropdown({ role }: DashboardDropdownProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const portalHref = portalHome(role);
  const portalLabel = portalLabelFor(role);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors",
          open && "bg-slate-50 border-indigo-300",
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Dashboard
        <svg
          className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
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
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            <Link
              href={portalHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {portalLabel}
            </Link>
          </div>
          <div className="border-t border-slate-100 py-1">
            <Link
              href="/api/v1/auth/logout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
  role?: "buyer" | "seller" | "admin" | "super_admin";
}

function MobileMenu({ open, onClose, isAuthenticated, role }: MobileMenuProps): React.JSX.Element | null {
  if (!open) return null;

  const portalHref = portalHome(role);
  const portalLabel = portalLabelFor(role);

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden shadow-sm">
      <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
        {PUBLIC_NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            {label}
          </Link>
        ))}
        <div className="mt-2 border-t border-slate-100 pt-2">
          {isAuthenticated ? (
            <>
              <Link
                href={portalHref}
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {portalLabel}
              </Link>
              <Link
                href="/api/v1/auth/logout"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="mt-1 block rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
              >
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
 * Global navigation header. Shows public nav links (Marketplace, Docs, Pricing),
 * a Dashboard dropdown when authenticated with links to Buyer Dashboard and
 * Seller Dashboard, and Login/Get Started when not authenticated.
 * Includes a mobile-responsive hamburger menu.
 *
 * @example
 * <Header />
 */
export function Header(): React.JSX.Element {
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      {/* Main bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Logo href="/" sealStroke="currentColor" className="flex-shrink-0 text-slate-900" />

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
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right-side auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-slate-500 hidden lg:block">
                {user.displayName ?? user.email}
              </span>
              <DashboardDropdown role={user.role} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
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

      {/* Mobile menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        role={user?.role}
      />
    </header>
  );
}
