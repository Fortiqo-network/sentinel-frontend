import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Set a new password for your Sentinel account.",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

/** Reset-password page — renders the token-gated new-password form. */
export default async function ResetPasswordPage({ searchParams }: Props): Promise<React.JSX.Element> {
  const { token } = await searchParams;

  return (
    <div className="overflow-hidden rounded-2xl glass ring-hairline">
      <div className="border-b border-porcelain/10 bg-ink-800/40 px-8 py-5">
        <h1 className="text-lg font-semibold text-porcelain">Set new password</h1>
        <p className="mt-0.5 text-sm text-porcelain/55">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-gold transition-colors hover:text-gold/75">
            Back to sign in
          </Link>
        </p>
      </div>
      <div className="px-8 py-6">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="text-sm text-porcelain/70">
            This link is invalid or has expired.{" "}
            <Link href="/forgot-password" className="font-medium text-gold hover:text-gold/75">
              Request a new one
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
