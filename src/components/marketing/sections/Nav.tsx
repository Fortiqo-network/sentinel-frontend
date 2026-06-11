"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/agents", label: "Marketplace" },
  { href: "/playground", label: "Playground" },
  { href: "/developer", label: "Developers" },
  { href: "/docs/methodology", label: "How it works" },
];

/**
 * The cinematic top navigation: transparent over the hero, condensing into a
 * frosted glass bar once the user scrolls. Links route into the existing app;
 * the primary CTA is the magnetic "Get started" pill.
 */
export function Nav(): React.JSX.Element {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

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
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-porcelain/70 transition-colors hover:text-porcelain sm:inline-block"
          >
            Sign in
          </Link>
          <MagneticButton href="/register" variant="primary" className="px-5 py-2.5 text-sm">
            Get started
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}
