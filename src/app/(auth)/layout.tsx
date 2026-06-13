import Link from "next/link";
import { Tessera } from "@/components/brand/Tessera";
import { Wordmark } from "@/components/brand/Logo";
import { Mosaic } from "@/components/brand/Mosaic";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const TRUST_POINTS: Array<{ title: string; detail: string }> = [
  {
    title: "Independently verified agents",
    detail: "Every agent passes a four-stage security pipeline and earns a 0–100 trust score.",
  },
  {
    title: "Pay only on outcome",
    detail: "Credits are held and charged only when a call demonstrably succeeds.",
  },
  {
    title: "Developers keep 99%",
    detail: "A flat 1% platform fee, automatic payouts, and portable reputation.",
  },
];

/**
 * Shared layout for authentication pages (login, register). A premium two-column
 * split: a brand + trust panel on the left (hidden on small screens) and the
 * auth card on the right — all on the cinematic ink surface so auth feels like
 * part of the same world.
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="relative min-h-screen bg-ink-950 font-brand text-porcelain antialiased lg:grid lg:grid-cols-2">
      {/* Left — brand + trust panel */}
      <aside className="relative hidden overflow-hidden border-r border-porcelain/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Mosaic className="text-porcelain" opacity={0.3} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_30%_0%,rgba(231,160,60,0.1),transparent_60%)]"
        />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <Tessera className="h-9 w-9 text-porcelain" seam="scan" fill="currentColor" />
            <Wordmark className="h-4 text-porcelain" />
          </Link>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-porcelain">
            Trust, measured. <br />
            Money, exact.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-porcelain/55">
            The verified marketplace for the AI agent economy — discover agents you can trust, pay
            on outcome, and publish your own with 99% economics.
          </p>
          <ul className="mt-10 space-y-6">
            {TRUST_POINTS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span aria-hidden className="mt-1 text-gold">
                  ✦
                </span>
                <div>
                  <div className="text-sm font-semibold text-porcelain">{p.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-porcelain/50">{p.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-brand-mono text-xs text-porcelain/30">
          Early preview — Sentinel is in active development.
        </p>
      </aside>

      {/* Right — auth card */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_0%,rgba(231,160,60,0.06),transparent_60%)] lg:hidden"
        />
        <div className="relative z-10 flex w-full flex-col items-center">
          {/* Brand mark — shown on small screens where the side panel is hidden */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Link href="/" className="flex flex-col items-center gap-3">
              <Tessera className="h-12 w-12 text-porcelain" seam="scan" fill="currentColor" />
              <Wordmark className="h-4 text-porcelain" />
            </Link>
            <p className="mt-3 font-brand-mono text-xs uppercase tracking-[0.2em] text-gold/80">
              Verified AI Agent Marketplace
            </p>
          </div>

          <div className="w-full max-w-md">{children}</div>

          <p className="mt-8 text-center font-brand-mono text-xs text-porcelain/30">
            &copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
