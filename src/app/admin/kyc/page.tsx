"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getKycDetail,
  listKyc,
  reviewKyc,
  type AdminKycRow,
  type KycReview,
} from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

type Status = AdminKycRow["kyc_status"];
type Provider = "razorpay" | "stripe";

const FILTERS: { value: Status; label: string }[] = [
  { value: "submitted", label: "Awaiting review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_VARIANT: Record<Status, "default" | "warning" | "success" | "destructive"> = {
  pending: "default",
  submitted: "warning",
  verified: "success",
  rejected: "destructive",
};

const IDENTITY_FIELDS: [string, string][] = [
  ["legal_name", "Legal name"],
  ["country", "Country"],
  ["phone", "Phone"],
  ["organization", "Organisation"],
  ["company", "Company"],
  ["tax_id", "Tax id"],
  ["website_url", "Website"],
  ["address", "Address"],
];

function str(v: unknown): string {
  return typeof v === "string" && v ? v : "—";
}

function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString() : "—";
}

interface ReviewPanelProps {
  row: AdminKycRow;
  onDone: (updated: AdminKycRow) => void;
}

/**
 * One expanded queue row: reveals the full submission (audited upstream) and
 * carries the approve / reject form. Approval needs the provider account
 * reference the admin created from the bank details; the backend refuses to
 * mark a seller verified without it.
 */
function ReviewPanel({ row, onDone }: ReviewPanelProps): React.JSX.Element {
  const requested = (row.details?.payout_provider as Provider | undefined) ?? "razorpay";
  const [detail, setDetail] = React.useState<AdminKycRow | null>(null);
  const [revealError, setRevealError] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<Provider>(row.payout_profile?.provider ?? requested);
  const [fundAccountId, setFundAccountId] = React.useState(row.payout_profile?.fund_account_id ?? "");
  const [stripeAccountId, setStripeAccountId] = React.useState(row.payout_profile?.stripe_account_id ?? "");
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState<"approve" | "reject" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getKycDetail(row.user_id)
      .then((d) => {
        if (!active) return;
        setDetail(d);
        if (d.payout_profile) {
          setProvider(d.payout_profile.provider);
          setFundAccountId(d.payout_profile.fund_account_id ?? "");
          setStripeAccountId(d.payout_profile.stripe_account_id ?? "");
        }
      })
      .catch((err) => active && setRevealError(isSentinelApiError(err) ? err.message : "Unable to reveal the submission."));
    return () => {
      active = false;
    };
  }, [row.user_id]);

  const d = detail?.details ?? row.details ?? {};
  const last4 = typeof d.bank_account_last4 === "string" ? d.bank_account_last4 : "";
  const bank = {
    name: str(d.bank_account_name),
    number: typeof d.bank_account_number === "string" ? d.bank_account_number : last4 ? `•••• ${last4}` : "—",
    ifsc: str(d.bank_ifsc),
    upi: str(d.upi_id),
  };

  async function decide(decision: KycReview["decision"]): Promise<void> {
    setError(null);
    setBusy(decision);
    try {
      const body: KycReview = { decision, note: note.trim() || undefined };
      if (decision === "approve") {
        body.provider = provider;
        if (provider === "razorpay") body.fund_account_id = fundAccountId.trim();
        else body.stripe_account_id = stripeAccountId.trim();
      }
      onDone(await reviewKyc(row.user_id, body));
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Review failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const ref = provider === "razorpay" ? fundAccountId.trim() : stripeAccountId.trim();

  return (
    <div className="grid gap-6 border-t border-slate-100 bg-slate-50 px-4 py-4 lg:grid-cols-2 dark:border-porcelain/10 dark:bg-ink-900">
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Identity</h3>
          <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            {IDENTITY_FIELDS.map(([key, label]) => (
              <React.Fragment key={key}>
                <dt className="text-slate-500 dark:text-porcelain/50">{label}</dt>
                <dd className="text-slate-900 dark:text-porcelain">{str(d[key])}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">
            Payout destination <span className="font-normal normal-case">(requested: {requested})</span>
          </h3>
          {revealError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{revealError}</p>}
          <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500 dark:text-porcelain/50">Account holder</dt>
            <dd className="text-slate-900 dark:text-porcelain">{bank.name}</dd>
            <dt className="text-slate-500 dark:text-porcelain/50">Account number</dt>
            <dd className="font-mono text-slate-900 dark:text-porcelain">{detail ? bank.number : "Revealing…"}</dd>
            <dt className="text-slate-500 dark:text-porcelain/50">IFSC</dt>
            <dd className="font-mono text-slate-900 dark:text-porcelain">{bank.ifsc}</dd>
            <dt className="text-slate-500 dark:text-porcelain/50">UPI</dt>
            <dd className="font-mono text-slate-900 dark:text-porcelain">{bank.upi}</dd>
          </dl>
          {row.payout_profile && (
            <p className="mt-2 text-xs text-slate-500 dark:text-porcelain/50">
              Billing profile: {row.payout_profile.provider} · {row.payout_profile.fund_account_id ?? row.payout_profile.stripe_account_id ?? "no ref"} ·{" "}
              {row.payout_profile.kyc_verified ? "payable" : "not payable"}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-porcelain/50">Decision</h3>
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-700 dark:text-porcelain/80">
            <input id={`kyc-${row.user_id}-razorpay`} type="radio" name={`provider-${row.user_id}`} checked={provider === "razorpay"} onChange={() => setProvider("razorpay")} />
            Razorpay
          </label>
          <label className="flex items-center gap-2 text-slate-700 dark:text-porcelain/80">
            <input id={`kyc-${row.user_id}-stripe`} type="radio" name={`provider-${row.user_id}`} checked={provider === "stripe"} onChange={() => setProvider("stripe")} />
            Stripe Connect
          </label>
        </fieldset>
        {provider === "razorpay" ? (
          <Input id={`kyc-${row.user_id}-fund-account`} label="Razorpay fund account id" value={fundAccountId} onChange={(e) => setFundAccountId(e.target.value)} placeholder="fa_…" hint="Create the contact + fund account in RazorpayX from the bank details above, then paste its id." />
        ) : (
          <Input id={`kyc-${row.user_id}-stripe-account`} label="Stripe Connect account id" value={stripeAccountId} onChange={(e) => setStripeAccountId(e.target.value)} placeholder="acct_…" hint="The connected account created for this seller in the Stripe dashboard." />
        )}
        <Input id={`kyc-${row.user_id}-note`} label="Reviewer note" maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} hint="Shown to the seller on rejection; kept in the audit log either way." />
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => decide("approve")} disabled={busy !== null || !ref}>
            {busy === "approve" ? "Approving…" : "Approve and enable payouts"}
          </Button>
          <Button variant="destructive" onClick={() => decide("reject")} disabled={busy !== null}>
            {busy === "reject" ? "Rejecting…" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin KYC queue: review seller identity + payout details and provision
 * billing payouts on approval. Bank numbers are masked in the list and only
 * revealed (audited) when a row is expanded.
 */
export default function AdminKycPage(): React.JSX.Element {
  const [filter, setFilter] = React.useState<Status>("submitted");
  const [rows, setRows] = React.useState<AdminKycRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const load = React.useCallback((status: Status) => {
    setLoading(true);
    setError(null);
    return listKyc({ status })
      .then((r) => {
        setRows(r.items);
        setTotal(r.total);
      })
      .catch((err) => setError(isSentinelApiError(err) ? err.message : "Unable to load the KYC queue."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    void load(filter);
    setOpenId(null);
  }, [filter, load]);

  function onReviewed(updated: AdminKycRow): void {
    setRows((current) => current.filter((r) => r.user_id !== updated.user_id));
    setTotal((t) => Math.max(0, t - 1));
    setOpenId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="KYC & payouts"
        description={`${total} seller${total === 1 ? "" : "s"} ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase() ?? ""}.`}
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              f.value === filter
                ? "rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-gold dark:text-ink-950"
                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-ink-700 dark:text-porcelain/70 dark:hover:bg-ink-600"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400 dark:text-porcelain/40">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-porcelain/10 dark:bg-ink-800 dark:text-porcelain/40">
          Nothing here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-porcelain/40">
              <tr>
                <th className="px-4 py-2 font-medium">Seller</th>
                <th className="px-4 py-2 font-medium">Rail</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 font-medium">Payable</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
              {rows.map((r) => (
                <React.Fragment key={r.user_id}>
                  <tr>
                    <td className="px-4 py-2">
                      <div className="text-slate-900 dark:text-porcelain">{r.display_name ?? str(r.details?.legal_name)}</div>
                      <div className="text-xs text-slate-500 dark:text-porcelain/50">{r.email}</div>
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-porcelain/70">{str(r.details?.payout_provider)}</td>
                    <td className="px-4 py-2"><Badge variant={STATUS_VARIANT[r.kyc_status]}>{r.kyc_status}</Badge></td>
                    <td className="px-4 py-2 text-slate-500 dark:text-porcelain/50">{formatDate(r.submitted_at)}</td>
                    <td className="px-4 py-2 text-slate-500 dark:text-porcelain/50">{r.payout_profile?.kyc_verified ? "Yes" : "No"}</td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => setOpenId(openId === r.user_id ? null : r.user_id)}>
                        {openId === r.user_id ? "Close" : "Review"}
                      </Button>
                    </td>
                  </tr>
                  {openId === r.user_id && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <ReviewPanel row={r} onDone={onReviewed} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
