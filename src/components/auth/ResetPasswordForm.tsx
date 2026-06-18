"use client";

import * as React from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/api/auth";

interface Props {
  token: string;
}

type State = "idle" | "submitting" | "done" | "error";

/**
 * New-password form rendered on /reset-password?token=…
 * Validates client-side before calling POST /v1/auth/reset-password.
 *
 * @example
 * <ResetPasswordForm token="abc123" />
 */
export function ResetPasswordForm({ token }: Props): React.JSX.Element {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [state, setState] = React.useState<State>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErrorMsg("");
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      setState("error");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setState("error");
      return;
    }
    setState("submitting");
    try {
      await resetPassword(token, password);
      setState("done");
    } catch {
      setErrorMsg("This link is invalid or has expired. Request a new one.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          Password updated successfully.
        </div>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90"
        >
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-porcelain/80">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2.5 text-sm text-porcelain placeholder:text-porcelain/30"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-sm font-medium text-porcelain/80">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your new password"
          className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2.5 text-sm text-porcelain placeholder:text-porcelain/30"
        />
      </div>
      {(state === "error") && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-lg bg-gold py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90 disabled:opacity-60"
      >
        {state === "submitting" ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
