"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Role = "buyer" | "developer";

interface RoleOption {
  id: Role;
  icon: string;
  title: string;
  subtitle: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "buyer",
    icon: "🛒",
    title: "I'm a Buyer",
    subtitle: "I use agents to automate workflows",
  },
  {
    id: "developer",
    icon: "⚙️",
    title: "I'm a Developer",
    subtitle: "I build and publish agents",
  },
];

/**
 * Registration form. Users choose between buyer (wants to use agents) and
 * developer (wants to publish agents). Role selection is cosmetic — the gateway
 * enforces access control.
 *
 * Developers see an optional company name field. All users must accept
 * Terms of Service and Privacy Policy before submitting.
 *
 * TODO: wire up react-hook-form + zod validation once BFF route is ready.
 *
 * @example
 * <RegisterForm />
 */
export function RegisterForm(): React.JSX.Element {
  const [role, setRole] = React.useState<Role>("buyer");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);
    try {
      // TODO: call /api/auth/register BFF route handler
      await new Promise<void>((r) => setTimeout(r, 800));
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
      {/* ── Role selector ─────────────────────────────────────────────────── */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">I am joining as…</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map(({ id, icon, title, subtitle }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              aria-pressed={role === id}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-all",
                role === id
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span className="mb-1 block text-xl leading-none">{icon}</span>
              <span
                className={cn(
                  "block font-semibold",
                  role === id ? "text-indigo-700" : "text-slate-900",
                )}
              >
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Hidden role value for form submission */}
      <input type="hidden" name="role" value={role} />

      {/* ── Fields ────────────────────────────────────────────────────────── */}
      <Input
        label="Display Name"
        type="text"
        name="displayName"
        autoComplete="name"
        placeholder="Jane Doe"
        required
      />

      {/* Developer-only: company name */}
      {role === "developer" && (
        <Input
          label="Company Name"
          type="text"
          name="companyName"
          autoComplete="organization"
          placeholder="Acme Labs (optional)"
          hint="Optional. Shown on your agent listings."
        />
      )}

      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
        hint="Minimum 8 characters."
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repeat your password"
        required
      />

      {/* ── Terms acceptance ──────────────────────────────────────────────── */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
        <span className="text-sm text-slate-600">
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-indigo-600 underline hover:text-indigo-500">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-indigo-600 underline hover:text-indigo-500">
            Privacy Policy
          </Link>
        </span>
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
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
