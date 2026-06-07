"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SidebarMode = "buyer" | "developer";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.JSX.Element;
}

interface SidebarProps {
  /** Controls which nav set to show. Defaults to "buyer". */
  mode?: SidebarMode;
  /** Additional class names for the aside element. */
  className?: string;
  /** Override links entirely; mode is ignored when provided. */
  links?: Array<{ href: string; label: string; icon?: React.ReactNode }>;
}

// ---------------------------------------------------------------------------
// Icons (inline SVGs — no dependency needed)
// ---------------------------------------------------------------------------

function IconGrid(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconChartBar(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconCreditCard(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function IconKey(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function IconCode(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function IconCurrencyRupee(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconShield(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconCog(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Nav configurations
// ---------------------------------------------------------------------------

const BUYER_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: <IconGrid /> },
  { href: "/dashboard/usage", label: "Usage", icon: <IconChartBar /> },
  { href: "/dashboard/billing", label: "Billing", icon: <IconCreditCard /> },
  { href: "/dashboard/api-keys", label: "API Keys", icon: <IconKey /> },
];

const DEVELOPER_LINKS: SidebarLink[] = [
  { href: "/developer", label: "Dashboard", icon: <IconGrid /> },
  { href: "/developer/agents", label: "My Agents", icon: <IconCode /> },
  { href: "/developer/earnings", label: "Earnings", icon: <IconCurrencyRupee /> },
  { href: "/developer/bonds", label: "Bond", icon: <IconShield /> },
  { href: "/developer/settings", label: "Settings", icon: <IconCog /> },
];

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

/**
 * Dashboard sidebar navigation. Renders developer or buyer nav link sets
 * based on the `mode` prop. Highlights the currently active route.
 * Branding is shown at the top; collapses at mobile viewports.
 *
 * @example
 * // In a layout:
 * <Sidebar mode="developer" />
 * <Sidebar mode="buyer" />
 *
 * // With custom links (backwards-compatible):
 * <Sidebar links={[{ href: "/foo", label: "Foo" }]} />
 */
export function Sidebar({ mode = "buyer", className, links: overrideLinks }: SidebarProps): React.JSX.Element {
  const pathname = usePathname();

  const resolvedLinks: SidebarLink[] =
    overrideLinks
      ? overrideLinks.map((l) => ({
          href: l.href,
          label: l.label,
          icon: (l.icon as React.JSX.Element) ?? <IconGrid />,
        }))
      : mode === "developer"
      ? DEVELOPER_LINKS
      : BUYER_LINKS;

  const modeLabel = mode === "developer" ? "Developer" : "Buyer";

  return (
    <aside
      className={cn(
        "hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50 lg:flex",
        className,
      )}
    >
      {/* Branding + mode indicator */}
      <div className="flex flex-col gap-0.5 border-b border-slate-200 px-5 py-4">
        <span className="text-base font-bold text-slate-900 tracking-tight">
          Sentinel<span className="text-indigo-500">.</span>
        </span>
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {modeLabel} Portal
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1" aria-label="Dashboard navigation">
        {resolvedLinks.map(({ href, label, icon }) => {
          // Exact match for root segments, prefix match for sub-pages
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && href !== "/developer" && pathname.startsWith(href + "/")) ||
            (pathname === href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-indigo-600" : "text-slate-400",
                )}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: switch portal link */}
      <div className="border-t border-slate-200 p-3">
        <Link
          href={mode === "developer" ? "/dashboard" : "/developer"}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Switch to {mode === "developer" ? "Buyer" : "Developer"} Portal
        </Link>
      </div>
    </aside>
  );
}
