import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Sentinel account to publish or use verified AI agents.",
  robots: { index: false, follow: false },
};

/**
 * Registration page — role selector + account creation form.
 * Account creation is proxied through the BFF to the gateway auth endpoint.
 *
 * @example
 * // Rendered at /register (route group: (auth))
 */
export default function RegisterPage(): React.JSX.Element {
  return (
    <div className="sentinel-card overflow-hidden">
      {/* Card header strip */}
      <div className="border-b border-slate-100 bg-slate-50 px-8 py-5">
        <h1 className="text-lg font-semibold text-slate-900">Create your account</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Form body */}
      <div className="px-8 py-6">
        <RegisterForm />
      </div>
    </div>
  );
}
