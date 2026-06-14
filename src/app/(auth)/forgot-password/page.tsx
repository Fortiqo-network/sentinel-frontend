import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Recover access to your Sentinel account.",
  robots: { index: false, follow: false },
};

/** Forgot-password page — glass card on the cinematic ink surface. */
export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl glass ring-hairline">
      <div className="border-b border-porcelain/10 bg-ink-800/40 px-8 py-5">
        <h1 className="text-lg font-semibold text-porcelain">Reset your password</h1>
        <p className="mt-0.5 text-sm text-porcelain/55">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-gold transition-colors hover:text-gold/75">
            Back to sign in
          </Link>
        </p>
      </div>
      <div className="px-8 py-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
