"use client";

import * as React from "react";
import Link from "next/link";
import { verifyEmail } from "@/lib/api/auth";

interface Props {
  token: string;
}

type State = "verifying" | "done" | "error";

/**
 * Confirms an email address from /verify-email?token=… by calling
 * POST /v1/auth/verify-email once on mount, then showing the result.
 *
 * @example
 * <VerifyEmailForm token="abc123" />
 */
export function VerifyEmailForm({ token }: Props): React.JSX.Element {
  const [state, setState] = React.useState<State>("verifying");

  React.useEffect(() => {
    let active = true;
    verifyEmail(token)
      .then(() => active && setState("done"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [token]);

  if (state === "verifying") {
    return (
      <div className="text-sm text-porcelain/70">Confirming your email address…</div>
    );
  }

  if (state === "done") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          Your email address has been confirmed.
        </div>
        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90"
        >
          Continue to your dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        This verification link is invalid or has expired.
      </div>
      <p className="text-sm text-porcelain/70">
        Sign in and request a new confirmation email from your account settings.
      </p>
      <Link
        href="/login"
        className="block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90"
      >
        Back to sign in
      </Link>
    </div>
  );
}
