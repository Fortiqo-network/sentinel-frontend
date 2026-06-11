"use client";

import type { ReactNode } from "react";
import { SmoothScroll } from "./providers/SmoothScroll";
import { Nav } from "./sections/Nav";
import { Footer } from "./sections/Footer";
import { cn } from "@/lib/utils/cn";

/**
 * Shared cinematic shell for non-home marketing pages (How it works, and any
 * page that should match the landing experience). Provides the ink surface,
 * smooth scroll, the scanning-Tessera nav, the ambient wash, and the
 * counterpart-proof footer — so every page reads as one continuous world.
 *
 * @example
 * <PageShell><MyPageSections /></PageShell>
 */
export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen overflow-x-clip bg-ink-950 font-brand text-porcelain antialiased">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_0%,rgba(231,160,60,0.07),transparent_60%)]"
        />
        <div className="relative z-10">
          <Nav />
          <main className={cn("pt-28", className)}>{children}</main>
          <Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
