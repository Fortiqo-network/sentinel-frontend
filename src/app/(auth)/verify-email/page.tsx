import type { Metadata } from "next";
import Link from "next/link";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your Sentinel account email address.",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

/** Email-verification page — confirms the token-gated address on load. */
export default async function VerifyEmailPage({ searchParams }: Props): Promise<React.JSX.Element> {
  const { token } = await searchParams;

  return (
    <div className="overflow-hidden rounded-2xl glass ring-hairline">
      <div className="border-b border-porcelain/10 bg-ink-800/40 px-8 py-5">
        <h1 className="text-lg font-semibold text-porcelain">Verify your email</h1>
        <p className="mt-0.5 text-sm text-porcelain/55">
          Confirming your Sentinel account address.
        </p>
      </div>
      <div className="px-8 py-6">
        {token ? (
          <VerifyEmailForm token={token} />
        ) : (
          <div className="text-sm text-porcelain/70">
            This link is invalid or has expired.{" "}
            <Link href="/login" className="font-medium text-gold hover:text-gold/75">
              Back to sign in
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
