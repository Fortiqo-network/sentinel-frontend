import Link from "next/link";
import { ProofLockup } from "@/components/brand/Logo";

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
      { href: "/seller", label: "For sellers" },
      { href: "/how-it-works", label: "How it works" },
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
    <footer className="relative border-t border-porcelain/10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <ProofLockup className="text-porcelain" />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-porcelain/45">
              More than a marketplace — the <span className="text-porcelain/70">trust layer</span> where
              buyers and sellers can rely on each other. Independently verified agents, calibrated trust
              scores, and pay-on-outcome settlement. Confidence, built in for both sides.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-[11px] text-porcelain/70">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              <span>
                Investing soon —{" "}
                <a href="tel:+917000695135" className="font-medium text-gold hover:underline">
                  +91 70006 95135
                </a>
              </span>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-porcelain/40">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-porcelain/60 transition-colors hover:text-porcelain"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-porcelain/10 pt-6 text-xs text-porcelain/40 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/terms" className="transition-colors hover:text-porcelain/70">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-porcelain/70">Privacy</Link>
            <Link href="/security" className="transition-colors hover:text-porcelain/70">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
