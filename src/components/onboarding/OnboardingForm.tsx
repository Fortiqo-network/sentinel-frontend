"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changePassword, completeOnboarding } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";
import { portalHome } from "@/lib/utils/portal";

type Role = "buyer" | "seller";

const REFERRAL_OPTIONS = ["Search", "X / Twitter", "A friend", "LinkedIn", "Other"];

const ROLE_COPY: Record<Role, { title: string; blurb: string }> = {
  buyer: {
    title: "I'm here to use agents",
    blurb: "Discover verified AI agents and pay only when they deliver.",
  },
  seller: {
    title: "I'm here to publish agents",
    blurb: "List your agents, get them verified, and earn on every delivered call.",
  },
};

const INPUT_CLASS =
  "w-full rounded-lg border border-porcelain/15 bg-ink-800/50 px-3 py-2 text-sm text-porcelain placeholder:text-porcelain/30 focus:border-gold/50 focus:outline-none";

interface OnboardingFormProps {
  displayName: string | null;
  /** Forced rotation (admin-created accounts) — the password step cannot be skipped. */
  mustChangePassword: boolean;
  /** Admins only rotate their password; the role/questions/terms steps are skipped. */
  isAdmin: boolean;
  /** Offer the optional password step (first sign-in). */
  offerPasswordChange: boolean;
}

/**
 * The first-login wizard. Step 1 offers a password change (mandatory for
 * admin-created accounts); step 2 collects the role choice, a few onboarding
 * questions, and the required Terms & Conditions acceptance. Admins finish
 * after step 1 — the buyer/seller onboarding never applies to them.
 */
export function OnboardingForm({
  displayName,
  mustChangePassword,
  isAdmin,
  offerPasswordChange,
}: OnboardingFormProps): React.JSX.Element {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [step, setStep] = React.useState<"password" | "profile">(
    mustChangePassword || offerPasswordChange ? "password" : "profile",
  );
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [role, setRole] = React.useState<Role | null>(null);
  const [primaryUse, setPrimaryUse] = React.useState("");
  const [referralSource, setReferralSource] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [signinReason, setSigninReason] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const finishForAdmin = React.useCallback(() => {
    router.push(portalHome("admin"));
    router.refresh();
  }, [router]);

  const onPasswordSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(undefined);
      if (newPassword.length < 12) {
        setError("The new password must be at least 12 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setSubmitting(true);
      try {
        const user = await changePassword({
          currentPassword: currentPassword || undefined,
          newPassword,
        });
        setUser(user);
        setSubmitting(false);
        if (isAdmin) {
          finishForAdmin();
        } else {
          setStep("profile");
        }
      } catch (err) {
        setSubmitting(false);
        setError(
          isSentinelApiError(err)
            ? err.message
            : "Could not change the password. Please try again.",
        );
      }
    },
    [currentPassword, newPassword, confirmPassword, isAdmin, finishForAdmin, setUser],
  );

  const onProfileSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!role) {
        setError("Please choose how you'll use Sentinel.");
        return;
      }
      if (!acceptTerms) {
        setError("You must accept the Terms & Conditions to continue.");
        return;
      }
      setError(undefined);
      setSubmitting(true);
      try {
        const user = await completeOnboarding({
          role,
          primaryUse: primaryUse.trim() || undefined,
          referralSource: referralSource || undefined,
          organization: organization.trim() || undefined,
          signinReason: signinReason.trim() || undefined,
          acceptTerms: true,
        });
        setUser(user);
        router.push(portalHome(user.role));
        router.refresh();
      } catch (err) {
        setSubmitting(false);
        setError(
          isSentinelApiError(err) ? err.message : "Could not save your choice. Please try again.",
        );
      }
    },
    [role, primaryUse, referralSource, organization, signinReason, acceptTerms, router, setUser],
  );

  if (step === "password") {
    return (
      <form
        onSubmit={onPasswordSubmit}
        className="w-full max-w-lg space-y-6 rounded-2xl border border-porcelain/10 bg-ink-900/60 p-8"
      >
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-porcelain/55">
            {mustChangePassword
              ? "For security, set a new password before proceeding."
              : "First things first — you can change your password now, or skip this step."}
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs text-porcelain/60">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-porcelain/60">New password (min 12 characters)</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-porcelain/60">Confirm new password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={INPUT_CLASS}
          />
        </label>

        {error !== undefined && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Change password"}
          </button>
          {!mustChangePassword && (
            <button
              type="button"
              onClick={() => {
                setError(undefined);
                if (isAdmin) {
                  finishForAdmin();
                } else {
                  setStep("profile");
                }
              }}
              className="w-full rounded-lg border border-porcelain/15 px-4 py-2.5 text-sm text-porcelain/70 transition-colors hover:bg-ink-800/60"
            >
              Keep my current password
            </button>
          )}
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={onProfileSubmit}
      className="w-full max-w-lg space-y-6 rounded-2xl border border-porcelain/10 bg-ink-900/60 p-8"
    >
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-porcelain/55">
          One quick step — tell us how you'll use Sentinel.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["buyer", "seller"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            aria-pressed={role === r}
            className={`rounded-xl border p-4 text-left transition-colors ${
              role === r
                ? "border-gold/70 bg-gold/10"
                : "border-porcelain/15 bg-ink-800/40 hover:bg-ink-800/70"
            }`}
          >
            <span className="block text-sm font-semibold text-porcelain">{ROLE_COPY[r].title}</span>
            <span className="mt-1 block text-xs text-porcelain/55">{ROLE_COPY[r].blurb}</span>
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs text-porcelain/60">Why are you signing up? (optional)</span>
        <textarea
          value={signinReason}
          onChange={(e) => setSigninReason(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={
            role === "seller"
              ? "e.g. monetise the agents my team already runs"
              : "e.g. find a reliable research agent for my startup"
          }
          className={INPUT_CLASS}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-porcelain/60">What do you mainly want to do? (optional)</span>
        <input
          type="text"
          value={primaryUse}
          onChange={(e) => setPrimaryUse(e.target.value)}
          maxLength={200}
          placeholder={role === "seller" ? "e.g. publish a code-review agent" : "e.g. automate research"}
          className={INPUT_CLASS}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-porcelain/60">Company / organisation (optional)</span>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          maxLength={128}
          placeholder="Acme AI"
          className={INPUT_CLASS}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-porcelain/60">How did you hear about us? (optional)</span>
        <select
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className="w-full rounded-lg border border-porcelain/15 bg-ink-800/50 px-3 py-2 text-sm text-porcelain focus:border-gold/50 focus:outline-none"
        >
          <option value="">Select…</option>
          {REFERRAL_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-porcelain/15 bg-ink-800/40 p-3">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#E7A03C]"
        />
        <span className="text-xs leading-relaxed text-porcelain/70">
          I have read and accept the{" "}
          <Link href="/terms" target="_blank" className="text-gold underline underline-offset-2">
            Terms &amp; Conditions
          </Link>{" "}
          and the{" "}
          <Link href="/privacy" target="_blank" className="text-gold underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {error !== undefined && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !role || !acceptTerms}
        className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Setting up…" : "Accept terms & continue"}
      </button>
    </form>
  );
}
