"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/lib/api/auth";
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

interface OnboardingFormProps {
  displayName: string | null;
}

/**
 * The post-signup onboarding form: pick a role (buyer/seller) and answer a few
 * basics. On submit it persists the choice, updates the client session, and
 * routes to the chosen portal.
 */
export function OnboardingForm({ displayName }: OnboardingFormProps): React.JSX.Element {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [role, setRole] = React.useState<Role | null>(null);
  const [primaryUse, setPrimaryUse] = React.useState("");
  const [referralSource, setReferralSource] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!role) {
        setError("Please choose how you'll use Sentinel.");
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
    [role, primaryUse, referralSource, organization, router, setUser],
  );

  return (
    <form
      onSubmit={onSubmit}
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
        <span className="text-xs text-porcelain/60">What do you mainly want to do? (optional)</span>
        <input
          type="text"
          value={primaryUse}
          onChange={(e) => setPrimaryUse(e.target.value)}
          maxLength={200}
          placeholder={role === "seller" ? "e.g. publish a code-review agent" : "e.g. automate research"}
          className="w-full rounded-lg border border-porcelain/15 bg-ink-800/50 px-3 py-2 text-sm text-porcelain placeholder:text-porcelain/30 focus:border-gold/50 focus:outline-none"
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
          className="w-full rounded-lg border border-porcelain/15 bg-ink-800/50 px-3 py-2 text-sm text-porcelain placeholder:text-porcelain/30 focus:border-gold/50 focus:outline-none"
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

      {error !== undefined && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !role}
        className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Setting up…" : "Continue"}
      </button>
    </form>
  );
}
