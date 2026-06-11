import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout for authentication pages (login, register, forgot-password).
 * Dark ink-navy centred layout with Sentinel brand mark.
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sen-bg px-4 py-12">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(42,78,124,0.20) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mb-8 text-center">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-bold tracking-tight text-sen-text">
            Sentinel<span className="text-sen-gold">.</span>
          </span>
        </Link>
        <p className="mt-1 text-sm text-sen-muted">Verified AI Agent Marketplace</p>
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>

      <p className="relative z-10 mt-8 text-center text-xs text-sen-muted">
        &copy; {new Date().getFullYear()} Sentinel. All rights reserved.
      </p>
    </div>
  );
}
