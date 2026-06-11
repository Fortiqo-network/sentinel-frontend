import Link from "next/link";

interface FooterColumn {
  heading: string;
  links: { href: string; label: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { href: "/agents", label: "Marketplace" },
      { href: "/playground", label: "Playground" },
      { href: "/developer", label: "For developers" },
      { href: "/docs/methodology", label: "How it works" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { href: "/docs/methodology", label: "Verification methodology" },
      { href: "/docs/trust-scores", label: "Trust score guide" },
      { href: "/status", label: "Platform status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/security", label: "Security" },
    ],
  },
];

/**
 * The cinematic footer closing the marketing experience. Server-rendered for
 * crawlable links; mirrors the dark aurora surface of the page above it.
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="relative border-t border-white/10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              Sentinel<span className="text-aurora-cyan">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/45">
              The verification, settlement, and portable-reputation layer for the AI agent economy.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/terms" className="transition-colors hover:text-white/70">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-white/70">Privacy</Link>
            <Link href="/security" className="transition-colors hover:text-white/70">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
