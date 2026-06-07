"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Login form. Submits credentials to /api/auth/login (BFF route handler)
 * which performs the OIDC token exchange and sets the httpOnly session cookie.
 *
 * Includes "remember me" checkbox and a forgot-password link.
 *
 * TODO: wire up react-hook-form + zod validation once BFF route is ready.
 *
 * @example
 * <LoginForm />
 */
export function LoginForm(): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);
    try {
      // TODO: call /api/auth/login BFF route handler
      await new Promise<void>((r) => setTimeout(r, 800));
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-slate-500 transition-colors hover:text-indigo-600"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Remember me */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          name="rememberMe"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
        <span className="text-sm text-slate-600">Remember me for 30 days</span>
      </label>

      {error !== undefined && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-indigo-600 font-medium hover:bg-indigo-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
