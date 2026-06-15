"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import type { NavSection } from "@/lib/docs";
import { cn } from "@/lib/utils/cn";

interface DocsSidebarProps {
  sections: NavSection[];
}

/**
 * Docs left navigation: grouped page links with active highlighting, a
 * client-side filter, and a mobile drawer. Cinematic dark surface to match the
 * marketing/dashboard theme.
 *
 * @example
 * <DocsSidebar sections={loadNavSections()} />
 */
export function DocsSidebar({ sections }: DocsSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({ ...s, links: s.links.filter((l) => l.title.toLowerCase().includes(q)) }))
      .filter((s) => s.links.length > 0);
  }, [sections, query]);

  const nav = (
    <nav className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-porcelain/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full rounded-lg border border-porcelain/15 bg-ink-800/60 py-2 pl-9 pr-3 text-sm text-porcelain placeholder:text-porcelain/40 focus:border-gold/50 focus:outline-none"
        />
      </div>
      {filtered.map((section) => (
        <div key={section.group}>
          <p className="mb-2 font-brand-mono text-xs uppercase tracking-[0.16em] text-porcelain/45">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-gold/15 font-medium text-gold"
                        : "text-porcelain/65 hover:bg-porcelain/5 hover:text-porcelain",
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {filtered.length === 0 && <p className="text-sm text-porcelain/40">No matches.</p>}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-porcelain/15 bg-ink-800 px-4 py-2.5 text-sm text-porcelain shadow-lg lg:hidden"
      >
        <Menu className="h-4 w-4" /> Docs
      </button>

      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 overflow-y-auto pr-2 lg:block">
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-porcelain/10 bg-ink-900 p-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-4 flex items-center gap-1 text-sm text-porcelain/60"
            >
              <X className="h-4 w-4" /> Close
            </button>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
