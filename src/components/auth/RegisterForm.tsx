"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils/cn";

type Role = "buyer" | "developer";

interface RoleOption {
  id: Role;
  icon: string;
  title: string;
  subtitle: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: "buyer",     icon: "🛒", title: "I'm a Buyer",     subtitle: "I use agents to automate workflows" },
  { id: "developer", icon: "⚙️", title: "I'm a Developer", subtitle: "I build and publish agents" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PasswordStrength {
  score: number;
  label: string;
  barClass: string;
  textClass: string;
}

function scorePassword(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  const map: PasswordStrength[] = [
    { score: 1, label: "Weak",   barClass: "bg-red-500",     textClass: "text-red-400" },
    { score: 2, label: "Fair",   barClass: "bg-amber-500",   textClass: "text-amber-400" },
    { score: 3, label: "Good",   barClass: "bg-lime-500",    textClass: "text-lime-400" },
    { score: 4, label: "Strong", barClass: "bg-emerald-500", textClass: "text-emerald-400" },
  ];
  return (
    map[score - 1] ?? {
      score:     0,
      label:     "Too short",
      barClass:  "bg-ink-600",
      textClass: "text-porcelain/40",
    }
  );
}

interface FormValues {
  displayName:     string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

/**
 * Registration form with live validation, a password-strength meter, a
 * show/hide-password toggle, and inline per-field errors. Submits to the
 * gateway (`POST /v1/auth/register`), creates the account and establishes a
 * session (same as login), then redirects to the role-appropriate portal.
 *
 * @example
 * <RegisterForm />
 */
export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [role, setRole] = React.useState<Role>("buyer");
  const [values, setValues] = React.useState<FormValues>({
    displayName:     "",
    email:           "",
    password:        "",
    confirmPassword: "",
  });
  const [touched, setTouched] = React.useState<Record<keyof FormValues, boolean>>({
    displayName:     false,
    email:           false,
    password:        false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const strength = scorePassword(values.password);

  const fieldErrors = React.useMemo(() => {
    const e: Partial<Record<keyof FormValues, string>> = {};
    if (values.displayName.trim().length < 2) e.displayName = "Enter at least 2 characters.";
    if (!EMAIL_RE.test(values.email.trim())) e.email = "Enter a valid email address.";
    if (values.password.length < 8) e.password = "Use at least 8 characters.";
    if (values.confirmPassword !== values.password) e.confirmPassword = "Passwords do not match.";
    return e;
  }, [values]);

  const isValid = Object.keys(fieldErrors).length === 0 && acceptTerms;

  const show = (field: keyof FormValues): string | undefined =>
    (touched[field] || submitAttempted) ? fieldErrors[field] : undefined;

  const set = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const blur = (field: keyof FormValues) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError(undefined);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const user = await register({
        email:       values.email.trim(),
        password:    values.password,
        displayName: values.displayName.trim(),
        role,
      });
      setUser(user);
      router.push(user.role === "developer" ? "/developer" : "/dashboard");
      router.refresh();
    } catch (err) {
      if (isSentinelApiError(err)) {
        if (err.statusCode === 409) {
          setError("An account with this email already exists.");
        } else if (err.statusCode === 0) {
          setError("Could not reach the server. Check your connection and try again.");
        } else if (err.statusCode >= 400 && err.statusCode < 500) {
          setError(err.displayMessage);
        } else {
          setError("Registration failed. Please try again shortly.");
        }
      } else {
        setError("Registration failed. Please try again shortly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
      {/* ── Role selector ─────────────────────────────────────────────────── */}
      <fieldset>
        <legend className="mb-2 font-brand-mono text-xs uppercase tracking-[0.18em] text-gold/80">
          I am joining as…
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map(({ id, icon, title, subtitle }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              aria-pressed={role === id}
              className={cn(
                "rounded-xl border p-3 text-left text-sm transition-all",
                role === id
                  ? "border-gold/50 bg-gold/10 ring-1 ring-gold/40"
                  : "border-porcelain/15 hover:border-porcelain/25 hover:bg-ink-700",
              )}
            >
              <span className="mb-1 block text-xl leading-none">{icon}</span>
              <span
                className={cn(
                  "block font-semibold",
                  role === id ? "text-gold" : "text-porcelain",
                )}
              >
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-porcelain/50">{subtitle}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <Input
        label="Display Name"
        type="text"
        name="displayName"
        autoComplete="name"
        placeholder="Jane Doe"
        value={values.displayName}
        onChange={set("displayName")}
        onBlur={blur("displayName")}
        error={show("displayName")}
        variant="dark"
        required
      />

      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={set("email")}
        onBlur={blur("email")}
        error={show("email")}
        variant="dark"
        required
      />

      <div className="space-y-2">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          onChange={set("password")}
          onBlur={blur("password")}
          error={show("password")}
          variant="dark"
          required
        />
        {values.password.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-full flex-1 rounded-full transition-colors",
                    i <= strength.score ? strength.barClass : "bg-ink-600",
                  )}
                />
              ))}
            </div>
            <span className={cn("text-xs font-medium", strength.textClass)}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={values.confirmPassword}
        onChange={set("confirmPassword")}
        onBlur={blur("confirmPassword")}
        error={show("confirmPassword")}
        variant="dark"
        required
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-porcelain/60">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="h-4 w-4 rounded border-ink-600 accent-gold"
        />
        Show passwords
      </label>

      {/* ── Terms acceptance ──────────────────────────────────────────────── */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink-600 accent-gold focus:ring-2 focus:ring-gold/50 focus:ring-offset-ink-950"
        />
        <span className="text-sm text-porcelain/60">
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-gold underline hover:text-gold/75">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-gold underline hover:text-gold/75">
            Privacy Policy
          </Link>
        </span>
      </label>
      {submitAttempted && !acceptTerms && (
        <p role="alert" className="text-xs text-red-400">
          You must accept the Terms and Privacy Policy to continue.
        </p>
      )}

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
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
