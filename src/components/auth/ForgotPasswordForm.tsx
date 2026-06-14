"use client";

import * as React from "react";

/**
 * Password-reset request form. Self-serve reset isn't wired yet, so this
 * acknowledges the request and points to support rather than silently failing.
 *
 * @example
 * <ForgotPasswordForm />
 */
export function ForgotPasswordForm(): React.JSX.Element {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-porcelain/10 bg-ink-800/40 p-4 text-sm text-porcelain/70">
        Self-serve password reset is coming soon. To recover{" "}
        <span className="font-medium text-porcelain">{email || "your account"}</span> now, email{" "}
        <a href="mailto:balraj.fortiqo@gmail.com" className="text-gold hover:underline">
          balraj.fortiqo@gmail.com
        </a>{" "}
        and we&apos;ll help.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
    >
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
      <button
        type="submit"
        className="w-full rounded-lg bg-gold py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/90"
      >
        Send reset link
      </button>
    </form>
  );
}
