import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Sentinel account to access the verified AI agent marketplace.",
  robots: { index: false, follow: false },
};

/**
 * Login page — centered card layout with Sentinel branding.
 * Auth is performed via the BFF route handler at /api/auth/login which
 * initiates the OIDC PKCE flow and sets an httpOnly session cookie.
 *
 * @example
 * // Rendered at /login (route group: (auth))
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <div className="sentinel-card overflow-hidden">
      {/* Card header strip */}
      <div className="border-b border-slate-100 bg-slate-50 px-8 py-5">
        <h1 className="text-lg font-semibold text-slate-900">Sign in to Sentinel</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Create one free
          </Link>
        </p>
      </div>

      {/* Form body */}
      <div className="px-8 py-6">
        <LoginForm />
      </div>

      {/* Divider + OAuth placeholder (future) */}
      <div className="border-t border-slate-100 bg-slate-50 px-8 py-4 text-center">
        <p className="text-xs text-slate-400">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
