import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SocialSignInButtons } from "@/components/auth/SocialSignInButtons";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Sentinel account to publish or use verified AI agents.",
  robots: { index: false, follow: false },
};

/**
 * Registration page — glass card on the cinematic ink surface.
 * Account creation is proxied through the BFF to the gateway auth endpoint.
 */
export default function RegisterPage(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl glass ring-hairline">
      {/* Card header */}
      <div className="border-b border-porcelain/10 bg-ink-800/40 px-8 py-5">
        <h1 className="text-lg font-semibold text-porcelain">Create your account</h1>
        <p className="mt-0.5 text-sm text-porcelain/55">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-gold transition-colors hover:text-gold/75"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Form body */}
      <div className="space-y-5 px-8 py-6">
        <SocialSignInButtons />
        <RegisterForm />
      </div>
    </div>
  );
}
