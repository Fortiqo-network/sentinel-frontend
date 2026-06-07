import * as React from "react";
import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "/agents", label: "Marketplace" },
      { href: "/playground", label: "Playground" },
      { href: "/developer", label: "For Developers" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/methodology", label: "Verification Methodology" },
      { href: "/status", label: "Status" },
    ],
  },
];

/**
 * Site-wide footer. Renders a four-column grid with product, legal,
 * and resource links, plus the copyright line.
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-bold text-slate-900">
              Sentinel<span className="text-indigo-500">.</span>
            </Link>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xs">
              The verification, settlement, and portable-reputation layer for the AI agent economy.
            </p>
          </div>

          {/* Nav columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
