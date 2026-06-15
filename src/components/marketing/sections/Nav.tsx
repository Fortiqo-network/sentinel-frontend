"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils/cn";
import { DOCS_URL } from "@/lib/site";

const LINKS = [
  { href: "/agents", label: "Marketplace" },
  { href: "/playground", label: "Playground" },
  { href: "/developer", label: "Developers" },
  { href: "/how-it-works", label: "How it works" },
  { href: DOCS_URL, label: "Docs" },
];

/**
 * Avatar dropdown shown in the Nav when the user is authenticated.
 * Clicking the avatar opens a small menu with Dashboard, My Profile, and Sign out.
 */
function AvatarMenu({ portalHref, profileHref }: { portalHref: string; profileHref: string }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-porcelain transition-colors",
          open
            ? "border-gold/60 bg-ink-700"
            : "border-porcelain/20 bg-ink-800/60 hover:border-gold/50 hover:bg-ink-700",
        )}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-porcelain/10 bg-ink-900 shadow-xl shadow-black/40">
          <div className="py-1">
            <Link
              href={portalHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-porcelain/70 transition-colors hover:bg-ink-800 hover:text-porcelain"
            >
              Dashboard
            </Link>
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-porcelain/70 transition-colors hover:bg-ink-800 hover:text-porcelain"
            >
              My Profile
            </Link>
          </div>
          <div className="border-t border-porcelain/10 py-1">
            <Link
              href="/api/auth/logout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-ink-800 hover:text-red-300"
            >
              Sign out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The cinematic top navigation: transparent over the hero, condensing into a
 * frosted glass bar once the user scrolls. Links route into the existing app;
 * the primary CTA is the magnetic "Get started" pill.
 *
 * When the user is already authenticated the "Sign in" / "Get started" actions
 * are replaced with an avatar button that opens a dropdown (Dashboard, My Profile,
 * Sign out).
 */
export function Nav(): React.JSX.Element {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const portalHref = user?.role === "developer" ? "/developer" : "/dashboard";
  const profileHref = user?.role === "developer" ? "/developer/profile" : "/dashboard/profile";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500",
          scrolled ? "bg-ink-900/85 ring-hairline" : "bg-transparent",
        )}
      >
        <Logo href="/" sealStroke="#ECEAE3" className="text-porcelain" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm text-porcelain/70 transition-colors hover:text-porcelain"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <AvatarMenu portalHref={portalHref} profileHref={profileHref} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm text-porcelain/70 transition-colors hover:text-porcelain sm:inline-block"
              >
                Sign in
              </Link>
              <MagneticButton href="/register" variant="primary" className="px-5 py-2.5 text-sm">
                Get started
              </MagneticButton>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
