"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getKyc, submitKyc, type KycStatus, type KycStatusValue, type KycSubmission } from "@/lib/api/seller";
import { isSentinelApiError } from "@/lib/api/client";

type Provider = "razorpay" | "stripe";

interface FormState {
  legal_name: string;
  country: string;
  phone: string;
  address: string;
  organization: string;
  tax_id: string;
  website_url: string;
  payout_provider: Provider;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  upi_id: string;
  accepted_terms: boolean;
}

const EMPTY: FormState = {
  legal_name: "",
  country: "IN",
  phone: "",
  address: "",
  organization: "",
  tax_id: "",
  website_url: "",
  payout_provider: "razorpay",
  bank_account_name: "",
  bank_account_number: "",
  bank_ifsc: "",
  upi_id: "",
  accepted_terms: false,
};

const STATUS_BADGE: Record<KycStatusValue, { label: string; variant: "default" | "warning" | "success" | "destructive" }> = {
  pending: { label: "Not submitted", variant: "default" },
  submitted: { label: "Under review", variant: "warning" },
  verified: { label: "Verified", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

/** Seed the form from a previous submission so a re-submit after rejection is not from scratch. */
function fromDetails(status: KycStatus | null): FormState {
  const d = status?.details ?? {};
  return {
    ...EMPTY,
    legal_name: d.legal_name ?? "",
    country: d.country ?? "IN",
    phone: d.phone ?? "",
    address: d.address ?? "",
    organization: d.organization ?? "",
    tax_id: d.tax_id ?? "",
    website_url: d.website_url ?? "",
    payout_provider: d.payout_provider ?? "razorpay",
    bank_account_name: d.bank_account_name ?? "",
    bank_ifsc: d.bank_ifsc ?? "",
    upi_id: d.upi_id ?? "",
  };
}

/** Drop blank optional fields so the API sees `undefined`, not empty strings. */
function toSubmission(form: FormState): KycSubmission {
  const opt = (v: string): string | undefined => (v.trim() ? v.trim() : undefined);
  return {
    legal_name: form.legal_name.trim(),
    country: form.country.trim(),
    phone: opt(form.phone),
    address: opt(form.address),
    organization: opt(form.organization),
    tax_id: opt(form.tax_id),
    website_url: opt(form.website_url),
    payout_provider: form.payout_provider,
    bank_account_name: opt(form.bank_account_name),
    bank_account_number: opt(form.bank_account_number),
    bank_ifsc: opt(form.bank_ifsc),
    upi_id: opt(form.upi_id),
    accepted_terms: true,
  };
}

function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString() : "—";
}

/**
 * Seller payout onboarding: identity + bank / UPI details submitted once for
 * admin review. A verified profile is what lets the daily payout batch pay
 * this seller; until then earnings accrue but cannot be withdrawn.
 */
export default function SellerKycPage(): React.JSX.Element {
  const [status, setStatus] = React.useState<KycStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [editing, setEditing] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getKyc()
      .then((s) => {
        if (!active) return;
        setStatus(s);
        setForm(fromDetails(s));
        setEditing(s.status === "pending");
      })
      .catch((err) => active && setLoadError(isSentinelApiError(err) ? err.message : "Unable to load your KYC status."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError(null);
    if (!form.accepted_terms) {
      setSubmitError("You must accept the seller terms to submit.");
      return;
    }
    setSubmitting(true);
    try {
      const next = await submitKyc(toSubmission(form));
      setStatus(next);
      setForm(fromDetails(next));
      setEditing(false);
    } catch (err) {
      setSubmitError(isSentinelApiError(err) ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const badge = status ? STATUS_BADGE[status.status] : null;
  const razorpay = form.payout_provider === "razorpay";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seller"
        title="Payouts & KYC"
        description="Verify your identity and add a payout destination so settled earnings can be paid out."
      />

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{loadError}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400 dark:text-porcelain/40">Loading…</div>
      ) : status ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-porcelain/70">Status</span>
                {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
              </div>
              {!editing && status.status !== "submitted" && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  {status.status === "verified" ? "Update details" : "Edit and resubmit"}
                </Button>
              )}
            </div>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-slate-500 dark:text-porcelain/50">Submitted</dt>
                <dd className="text-slate-900 dark:text-porcelain">{formatDate(status.submittedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-slate-500 dark:text-porcelain/50">Reviewed</dt>
                <dd className="text-slate-900 dark:text-porcelain">{formatDate(status.reviewedAt)}</dd>
              </div>
              {status.details?.bank_account_last4 && (
                <div className="flex justify-between gap-4 sm:block">
                  <dt className="text-slate-500 dark:text-porcelain/50">Bank account</dt>
                  <dd className="font-mono text-slate-900 dark:text-porcelain">•••• {status.details.bank_account_last4}</dd>
                </div>
              )}
              {status.details?.upi_id && (
                <div className="flex justify-between gap-4 sm:block">
                  <dt className="text-slate-500 dark:text-porcelain/50">UPI</dt>
                  <dd className="font-mono text-slate-900 dark:text-porcelain">{status.details.upi_id}</dd>
                </div>
              )}
            </dl>
            {status.status === "rejected" && status.reviewNote && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                <span className="font-medium">Reviewer note:</span> {status.reviewNote}
              </div>
            )}
            {status.status === "submitted" && (
              <p className="mt-4 text-sm text-slate-500 dark:text-porcelain/50">
                We are reviewing your details. You will be able to withdraw settled earnings once verified.
              </p>
            )}
            {status.status === "verified" && (
              <p className="mt-4 text-sm text-slate-500 dark:text-porcelain/50">
                You are set up for payouts. Settled earnings are paid out in the daily batch. See{" "}
                <Link href="/seller/earnings" className="text-indigo-600 underline dark:text-gold">Earnings</Link>.
              </p>
            )}
          </div>

          {!status.emailVerified && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200">
              Confirm your email address in{" "}
              <Link href="/seller/settings" className="underline">Settings</Link> before submitting KYC.
            </div>
          )}

          {editing && (
            <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-porcelain">Identity</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input id="kyc-legal-name" label="Legal name" required minLength={2} maxLength={200} value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} hint="As it appears on your bank account and ID." />
                  <Input id="kyc-country" label="Country" required minLength={2} maxLength={64} value={form.country} onChange={(e) => set("country", e.target.value)} hint="ISO code or name, e.g. IN." />
                  <Input id="kyc-phone" label="Phone" maxLength={32} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  <Input id="kyc-organization" label="Organisation" maxLength={128} value={form.organization} onChange={(e) => set("organization", e.target.value)} />
                  <Input id="kyc-tax-id" label="Tax / GST / registration number" maxLength={64} value={form.tax_id} onChange={(e) => set("tax_id", e.target.value)} />
                  <Input id="kyc-website" label="Website" maxLength={512} value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://" />
                </div>
                <Input id="kyc-address" label="Registered address" maxLength={512} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </section>

              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-porcelain">Payout destination</h2>
                <fieldset className="flex flex-wrap gap-4 text-sm">
                  <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-porcelain/70">Payout rail</legend>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-porcelain/80">
                    <input id="kyc-provider-razorpay" type="radio" name="payout_provider" checked={razorpay} onChange={() => set("payout_provider", "razorpay")} />
                    Indian bank or UPI (Razorpay)
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-porcelain/80">
                    <input id="kyc-provider-stripe" type="radio" name="payout_provider" checked={!razorpay} onChange={() => set("payout_provider", "stripe")} />
                    International (Stripe Connect)
                  </label>
                </fieldset>
                {razorpay ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input id="kyc-bank-name" label="Account holder name" maxLength={200} value={form.bank_account_name} onChange={(e) => set("bank_account_name", e.target.value)} />
                      <Input id="kyc-ifsc" label="IFSC" value={form.bank_ifsc} onChange={(e) => set("bank_ifsc", e.target.value.toUpperCase())} placeholder="HDFC0001234" hint="11 characters: 4 letters, 0, 6 alphanumerics." />
                      <Input id="kyc-account-number" label="Bank account number" type="password" autoComplete="off" minLength={6} maxLength={34} value={form.bank_account_number} onChange={(e) => set("bank_account_number", e.target.value)} hint={status.details?.bank_account_last4 ? `Re-enter the full number (currently •••• ${status.details.bank_account_last4}); encrypted at rest.` : "Encrypted at rest; only the last 4 digits are ever shown again."} />
                      <Input id="kyc-upi" label="UPI id (alternative)" maxLength={64} value={form.upi_id} onChange={(e) => set("upi_id", e.target.value)} placeholder="name@bank" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-porcelain/50">
                      Provide the full bank details (name, number, IFSC) or a UPI id.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-porcelain/50">
                    We will set up a Stripe Connect account with you during review and attach it to your profile.
                  </p>
                )}
              </section>

              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-porcelain/80">
                <input id="kyc-accept-terms" type="checkbox" className="mt-0.5" checked={form.accepted_terms} onChange={(e) => set("accepted_terms", e.target.checked)} />
                <span>
                  I confirm these details are accurate and accept the{" "}
                  <Link href="/terms" className="underline" target="_blank">seller and payout terms</Link>.
                </span>
              </label>

              {submitError && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{submitError}</div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitting || !status.emailVerified}>
                  {submitting ? "Submitting…" : "Submit for review"}
                </Button>
                {status.status !== "pending" && (
                  <Button type="button" variant="ghost" onClick={() => { setEditing(false); setForm(fromDetails(status)); setSubmitError(null); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </>
      ) : null}
    </div>
  );
}
