"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SidebarMode = "buyer" | "developer" | "admin";

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

function IconStar(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function IconUsers(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 0a3 3 0 10-2.83-4M7 11a3 3 0 10-2.83-4" />
    </svg>
  );
}

function IconClose(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Nav configurations
// ---------------------------------------------------------------------------

const BUYER_LINKS: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: <IconGrid /> },
  { href: "/dashboard/subscriptions", label: "My Agents", icon: <IconStar /> },
  { href: "/dashboard/usage", label: "Usage", icon: <IconChartBar /> },
  { href: "/dashboard/billing", label: "Billing", icon: <IconCreditCard /> },
  { href: "/dashboard/api-keys", label: "API Keys", icon: <IconKey /> },
  { href: "/dashboard/settings", label: "Settings", icon: <IconCog /> },
];

const DEVELOPER_LINKS: SidebarLink[] = [
  { href: "/developer", label: "Overview", icon: <IconGrid /> },
  { href: "/developer/agents", label: "My Agents", icon: <IconCode /> },
  { href: "/developer/earnings", label: "Earnings", icon: <IconCurrencyRupee /> },
  { href: "/developer/bonds", label: "Bonds", icon: <IconShield /> },
  { href: "/developer/settings", label: "Settings", icon: <IconCog /> },
];

const ADMIN_LINKS: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: <IconGrid /> },
  { href: "/admin/analytics", label: "Analytics", icon: <IconChartBar /> },
  { href: "/admin/agents", label: "Agents", icon: <IconCode /> },
  { href: "/admin/moderation", label: "Moderation", icon: <IconShield /> },
  { href: "/admin/developers", label: "Developers", icon: <IconCurrencyRupee /> },
  { href: "/admin/users", label: "Users", icon: <IconUsers /> },
  { href: "/admin/sybil", label: "Multi-accounts", icon: <IconUsers /> },
  { href: "/admin/flags", label: "Feature flags", icon: <IconCog /> },
];

function resolveLinks(
  mode: SidebarMode,
  overrideLinks?: SidebarProps["links"],
): SidebarLink[] {
  if (overrideLinks) {
    return overrideLinks.map((l) => ({
      href: l.href,
      label: l.label,
      icon: (l.icon as React.JSX.Element) ?? <IconGrid />,
    }));
  }
  if (mode === "admin") return ADMIN_LINKS;
  return mode === "developer" ? DEVELOPER_LINKS : BUYER_LINKS;
}

// ---------------------------------------------------------------------------
// Shared nav body
// ---------------------------------------------------------------------------

interface SidebarNavProps {
  links: SidebarLink[];
  collapsed: boolean;
  onNavigate?: () => void;
}

function isLinkActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  const isRoot = href === "/dashboard" || href === "/developer" || href === "/admin";
  return !isRoot && pathname.startsWith(href + "/");
}

function SidebarNav({ links, collapsed, onNavigate }: SidebarNavProps): React.JSX.Element {
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex flex-1 flex-col gap-0.5", collapsed ? "p-2" : "p-3")}
      aria-label="Portal navigation"
    >
      {links.map(({ href, label, icon }) => {
        const active = isLinkActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5",
              active
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className={cn("flex-shrink-0", active ? "text-indigo-600" : "text-slate-400")}>
              {icon}
            </span>
            {!collapsed && label}
          </Link>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

/**
 * Portal sidebar navigation. Renders developer or buyer nav sets based on
 * `mode`. On large screens it is a persistent rail that collapses to icons via
 * the header hamburger (`sidebarCollapsed`). On small screens it is hidden and
 * instead appears as an overlay drawer driven by `mobileSidebarOpen`.
 *
 * @example
 * <Sidebar mode="developer" />
 */
export function Sidebar({ mode = "buyer", className, links: overrideLinks }: SidebarProps): React.JSX.Element {
  const { sidebarCollapsed: collapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const links = resolveLinks(mode, overrideLinks);
  const modeLabel = mode === "developer" ? "Developer" : mode === "admin" ? "Admin" : "Buyer";

  const closeMobile = React.useCallback(() => setMobileSidebarOpen(false), [setMobileSidebarOpen]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") closeMobile();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeMobile]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-slate-200 bg-slate-50 overflow-y-auto transition-all duration-300 lg:flex",
          collapsed ? "w-14" : "w-56",
          className,
        )}
      >
        <div
          className={cn(
            "flex border-b border-slate-200",
            collapsed ? "justify-center px-0 py-4" : "flex-col gap-0.5 px-5 py-4",
          )}
        >
          <Logo href="/" sealStroke="currentColor" showWordmark={!collapsed} className="text-slate-900" />
          {!collapsed && (
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-600">
              {modeLabel} Portal
            </span>
          )}
        </div>
        <SidebarNav links={links} collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeMobile} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Logo href="/" sealStroke="currentColor" className="text-slate-900" />
                <span className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-600">
                  {modeLabel} Portal
                </span>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <IconClose />
              </button>
            </div>
            <SidebarNav links={links} collapsed={false} onNavigate={closeMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
