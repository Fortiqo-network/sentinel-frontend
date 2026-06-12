import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Sentinel account to access the verified AI agent marketplace.",
  robots: { index: false, follow: false },
};

/**
 * Login page — glass card on the cinematic ink surface.
 * Auth is performed via the BFF route handler at /api/auth/login which
 * sets an httpOnly session cookie.
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl glass ring-hairline">
      {/* Card header */}
      <div className="border-b border-porcelain/10 bg-ink-800/40 px-8 py-5">
        <h1 className="text-lg font-semibold text-porcelain">Sign in to Sentinel</h1>
        <p className="mt-0.5 text-sm text-porcelain/55">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-gold transition-colors hover:text-gold/75"
          >
            Create one free
          </Link>
        </p>
      </div>

      {/* Form body */}
      <div className="px-8 py-6">
        <LoginForm />
      </div>

      {/* Legal footer */}
      <div className="border-t border-porcelain/10 bg-ink-800/40 px-8 py-4 text-center">
        <p className="text-xs text-porcelain/35">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-porcelain/60">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-porcelain/60">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
