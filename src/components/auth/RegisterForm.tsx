"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type Role = "buyer" | "developer";

interface RoleOption {
  id: Role;
  icon: string;
  title: string;
  subtitle: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: "buyer", icon: "🛒", title: "I'm a Buyer", subtitle: "I use agents to automate workflows" },
  { id: "developer", icon: "⚙️", title: "I'm a Developer", subtitle: "I build and publish agents" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PasswordStrength {
  score: number; // 0–4
  label: string;
  barClass: string;
  textClass: string;
}

/** Score password strength 0–4 from length and character variety. */
function scorePassword(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  const map: PasswordStrength[] = [
    { score: 1, label: "Weak", barClass: "bg-red-400", textClass: "text-red-600" },
    { score: 2, label: "Fair", barClass: "bg-amber-400", textClass: "text-amber-600" },
    { score: 3, label: "Good", barClass: "bg-lime-500", textClass: "text-lime-600" },
    { score: 4, label: "Strong", barClass: "bg-emerald-500", textClass: "text-emerald-600" },
  ];
  return (
    map[score - 1] ?? {
      score: 0,
      label: "Too short",
      barClass: "bg-slate-200",
      textClass: "text-slate-400",
    }
  );
}

interface FormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Registration form with live validation, a password-strength meter, a
 * show/hide-password toggle, and inline per-field errors. Submits to the
 * gateway (`POST /v1/auth/register`), which creates the account and starts a
 * session, then redirects to the dashboard.
 *
 * @example
 * <RegisterForm />
 */
export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const [role, setRole] = React.useState<Role>("buyer");
  const [values, setValues] = React.useState<FormValues>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = React.useState<Record<keyof FormValues, boolean>>({
    displayName: false,
    email: false,
    password: false,
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
      await register({
        email: values.email.trim(),
        password: values.password,
        displayName: values.displayName.trim(),
        role,
      });
      router.push("/dashboard");
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
              <span className={cn("block font-semibold", role === id ? "text-indigo-700" : "text-slate-900")}>
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
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
          required
        />
        {/* Strength meter */}
        {values.password.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-full flex-1 rounded-full transition-colors",
                    i <= strength.score ? strength.barClass : "bg-slate-200",
                  )}
                />
              ))}
            </div>
            <span className={cn("text-xs font-medium", strength.textClass)}>{strength.label}</span>
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
        required
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
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
      {submitAttempted && !acceptTerms && (
        <p role="alert" className="text-xs text-red-600">
          You must accept the Terms and Privacy Policy to continue.
        </p>
      )}

      {error !== undefined && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-indigo-600 font-medium hover:bg-indigo-500"
        disabled={isSubmitting || (submitAttempted && !isValid)}
      >
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
