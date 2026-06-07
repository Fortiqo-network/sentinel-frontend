import Link from "next/link";

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
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-bold text-slate-900">
            Sentinel<span className="text-indigo-500">.</span>
          </span>
        </Link>
        <p className="mt-1 text-sm text-slate-500">Verified AI Agent Marketplace</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Fortiqo-network. All rights reserved.
      </p>
    </div>
  );
}
