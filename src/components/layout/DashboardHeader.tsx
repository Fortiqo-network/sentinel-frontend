"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function IconBell(): React.JSX.Element {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function IconUser(): React.JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function IconLogout(): React.JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Notification panel
// ---------------------------------------------------------------------------

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Agent verified",
    description: "Your agent \"DataSummariser v2\" passed the 4-stage pipeline.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Credits added",
    description: "500 Cr have been added to your wallet.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    title: "New review",
    description: "A buyer left a 5-star review on \"CodeReviewer Pro\".",
    time: "3 hr ago",
    read: false,
  },
  {
    id: "4",
    title: "Payout processed",
    description: "1,200 Cr earnings have been transferred to your account.",
    time: "Yesterday",
    read: true,
  },
];

function NotificationPanel(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);
  const ref = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead(): void {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string): void {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
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
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                    !n.read && "bg-indigo-50/50",
                  )}
                >
                  {/* Unread dot */}
                  <span className="mt-1.5 flex-shrink-0">
                    <span
                      className={cn(
                        "block h-2 w-2 rounded-full",
                        n.read ? "bg-slate-200" : "bg-indigo-500",
                      )}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", n.read ? "font-medium text-slate-600" : "font-semibold text-slate-800")}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 text-center">
            <span className="text-xs text-slate-400">All notifications shown</span>
          </div>
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
  initial: string;
  profileHref: string;
}

function ProfileDropdown({ displayName, initial, profileHref }: ProfileDropdownProps): React.JSX.Element {
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
          "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors select-none",
          open
            ? "border-indigo-300 bg-indigo-100 text-indigo-700"
            : "border-slate-200 bg-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        )}
        aria-label="Profile menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-xs text-slate-400">Signed in as</p>
            <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
          </div>
          <div className="py-1">
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <IconUser />
              My Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                console.log("Logout clicked");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <IconLogout />
              Logout
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
 * Authenticated app header used inside the buyer dashboard and developer portal
 * layouts. Renders the logo, a notification bell, and a profile menu with
 * "My Profile" and "Logout" options. Does not show the public marketing nav.
 *
 * @example
 * <DashboardHeader />
 */
export function DashboardHeader(): React.JSX.Element {
  const { user } = useAuthStore();

  const displayName = user?.displayName ?? user?.email ?? "Account";
  const initial = displayName.charAt(0).toUpperCase();
  const profileHref =
    user?.role === "developer" ? "/developer/profile" : "/dashboard/profile";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Logo href="/" sealStroke="currentColor" className="flex-shrink-0 text-slate-900" />

        <div className="flex items-center gap-2">
          <NotificationPanel />

          {/* Profile menu */}
          <ProfileDropdown
            displayName={displayName}
            initial={initial}
            profileHref={profileHref}
          />
        </div>
      </div>
    </header>
  );
}
