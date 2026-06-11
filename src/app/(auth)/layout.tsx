import Link from "next/link";
import { Tessera } from "@/components/brand/Tessera";
import { Wordmark } from "@/components/brand/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout for authentication pages (login, register, forgot-password).
 * Renders a centred card with the Sentinel brand mark above it.
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center text-slate-900">
        <Link href="/" className="flex flex-col items-center gap-3">
          <Tessera className="h-12 w-12" seam="scan" fill="currentColor" />
          <Wordmark className="h-4 text-slate-900" />
        </Link>
        <p className="mt-3 text-sm text-slate-500">Verified AI Agent Marketplace</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.
      </p>
    </div>
  );
}
