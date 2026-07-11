"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";
import { postAuthDestination } from "@/lib/utils/portal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login form with live validation and a show/hide-password toggle. Submits to
 * the gateway (`POST /v1/auth/login`), which verifies credentials and sets an
 * httpOnly session cookie, then redirects to the dashboard.
 *
 * @example
 * <LoginForm />
 */
export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [touched, setTouched] = React.useState({ email: false, password: false });
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const emailError = !EMAIL_RE.test(email.trim()) ? "Enter a valid email address." : undefined;
  const passwordError = password.length === 0 ? "Enter your password." : undefined;
  const isValid = emailError === undefined && passwordError === undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError(undefined);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      setUser(user);
      router.push(postAuthDestination(user));
      router.refresh();
    } catch (err) {
      if (isSentinelApiError(err)) {
        if (err.statusCode === 401 || err.statusCode === 403) {
          setError("Invalid email or password. Please try again.");
        } else if (err.statusCode === 0) {
          setError("Could not reach the server. Check your connection and try again.");
        } else if (err.statusCode >= 400 && err.statusCode < 500) {
          setError(err.displayMessage);
        } else {
          setError("Sign in failed. Please try again shortly.");
        }
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={(touched.email || submitAttempted) ? emailError : undefined}
        variant="dark"
        required
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={(touched.password || submitAttempted) ? passwordError : undefined}
          variant="dark"
          required
        />
        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-porcelain/55">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-ink-600 accent-gold"
            />
            Show password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-porcelain/50 transition-colors hover:text-gold"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {error !== undefined && (
        <p
          role="alert"
          className="rounded-lg border border-red-700/40 bg-red-900/25 px-3 py-2 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-gold font-semibold text-ink-950 hover:bg-gold/85 focus-visible:ring-gold focus-visible:ring-offset-ink-950"
        disabled={isSubmitting || (submitAttempted && !isValid)}
      >
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
