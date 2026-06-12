import Link from "next/link";
import { Tessera } from "@/components/brand/Tessera";
import { Wordmark } from "@/components/brand/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout for authentication pages (login, register).
 * Uses the same cinematic ink surface as the marketing layer — dark background,
 * aurora radial wash, centered card — so auth feels like part of the same world.
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4 py-12 font-brand text-porcelain antialiased">
      {/* Ambient aurora wash — same as PageShell */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_0%,rgba(231,160,60,0.07),transparent_60%)]"
      />

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex flex-col items-center gap-3">
            <Tessera className="h-12 w-12 text-porcelain" seam="scan" fill="currentColor" />
            <Wordmark className="h-4 text-porcelain" />
          </Link>
          <p className="mt-3 font-brand-mono text-xs uppercase tracking-[0.2em] text-gold/80">
            Verified AI Agent Marketplace
          </p>
        </div>

        {/* Card slot */}
        <div className="w-full max-w-md">{children}</div>

        <p className="mt-8 text-center font-brand-mono text-xs text-porcelain/30">
          &copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.
        </p>
      </div>
    </div>
  );
}
