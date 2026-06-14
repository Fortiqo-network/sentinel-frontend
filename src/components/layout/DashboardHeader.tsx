"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { logout as logoutRequest } from "@/lib/api/auth";
import { listNotifications, markNotificationsRead, type Notification } from "@/lib/api/notifications";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function IconBell(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function IconUser(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

function IconLogout(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Notification panel
// ---------------------------------------------------------------------------

function NotificationPanel(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listNotifications();
      if (!cancelled) {
        setNotifications(result);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead(): void {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void markNotificationsRead({ all: true });
  }

  function markRead(id: string): void {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void markNotificationsRead({ ids: [id] });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          open
            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
            : "border-slate-200 bg-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              {loaded ? "You're all caught up" : "Loading…"}
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn("flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50", !n.read && "bg-indigo-50/50")}
                  >
                    <span className="mt-1.5 flex-shrink-0">
                      <span className={cn("block h-2 w-2 rounded-full", n.read ? "bg-slate-200" : "bg-indigo-500")} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", n.read ? "font-medium text-slate-600" : "font-semibold text-slate-800")}>{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{relativeTime(n.createdAt)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile dropdown
// ---------------------------------------------------------------------------

interface ProfileDropdownProps {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  profileHref: string;
  settingsHref: string;
  onLogout: () => void;
  loggingOut: boolean;
}

function ProfileDropdown({
  displayName,
  email,
  avatarUrl,
  profileHref,
  settingsHref,
  onLogout,
  loggingOut,
}: ProfileDropdownProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
          "flex items-center rounded-full transition-transform hover:scale-105",
          open && "ring-2 ring-indigo-400 ring-offset-2",
        )}
        aria-label="Profile menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar src={avatarUrl} name={displayName} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Avatar src={avatarUrl} name={displayName} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <div className="py-1">
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
            >
              <IconUser />
              My Profile
            </Link>
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
            >
              <IconCog />
              Settings
            </Link>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <IconLogout />
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardHeader
// ---------------------------------------------------------------------------

/**
 * Authenticated app header for the buyer dashboard and developer portal. Shows
 * a responsive menu control (opens the mobile drawer below `lg`, toggles the
 * collapsed rail at `lg`+), live notifications, and a profile menu with a
 * working log out that clears the session and redirects to /login.
 *
 * @example
 * <DashboardHeader />
 */
export function DashboardHeader(): React.JSX.Element {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed, setMobileSidebarOpen } = useUIStore();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const displayName = user?.displayName ?? user?.email ?? "Account";
  const email = user?.email ?? "";
  const isDeveloper = user?.role === "developer";
  const profileHref = isDeveloper ? "/developer/profile" : "/dashboard/profile";
  const settingsHref = isDeveloper ? "/developer/settings" : "/dashboard/settings";

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await logoutRequest();
    } catch {
      // The cookie is cleared server-side regardless; proceed to redirect.
    } finally {
      clearSession();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
            className="flex items-center justify-center rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden items-center justify-center rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <NotificationPanel />
          <ProfileDropdown
            displayName={displayName}
            email={email}
            avatarUrl={user?.avatarUrl}
            profileHref={profileHref}
            settingsHref={settingsHref}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />
        </div>
      </div>
    </header>
  );
}
