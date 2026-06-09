"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";

/**
 * Login form. Submits credentials to the gateway (`POST /v1/auth/login`),
 * which verifies them against core-api and sets the httpOnly session cookie.
 * On success the user is redirected to their dashboard.
 *
 * @example
 * <LoginForm />
 */
export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const field = (name: string): string => {
      const v = form.get(name);
      return typeof v === "string" ? v : "";
    };
    const email = field("email").trim();
    const password = field("password");
    try {
      await login({ email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (isSentinelApiError(err) && (err.statusCode === 401 || err.statusCode === 403)) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Sign in failed. Please try again shortly.");
      }
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
