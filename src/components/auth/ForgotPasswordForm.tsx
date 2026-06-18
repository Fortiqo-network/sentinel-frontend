"use client";

import * as React from "react";
import { forgotPassword } from "@/lib/api/auth";

type State = "idle" | "submitting" | "sent" | "error";

/**
 * Password-reset request form. Calls POST /v1/auth/forgot-password and shows
 * a confirmation message regardless of whether the email is registered.
 *
 * @example
 * <ForgotPasswordForm />
 */
export function ForgotPasswordForm(): React.JSX.Element {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<State>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      await forgotPassword(email.trim());
      setState("sent");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-porcelain/10 bg-ink-800/40 p-4 text-sm text-porcelain/70">
        If{" "}
        <span className="font-medium text-porcelain">{email}</span>{" "}
        is registered, a reset link has been sent. Check your inbox (and spam folder).
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-porcelain/80">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2.5 text-sm text-porcelain placeholder:text-porcelain/30"
        />
      </div>
      {state === "error" && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-lg bg-gold py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
