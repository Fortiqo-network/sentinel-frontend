"use client";

import * as React from "react";
import { payRegistration } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";

type State = "idle" | "paying" | "paid" | "error";

/**
 * One-time seller registration fee card for the seller wallet.
 *
 * Pay $10 once from the wallet, then list unlimited agents. Renders a permanent
 * "paid" state once done (idempotent server-side — it can never charge twice).
 * A 402 (insufficient credits) points the seller at the Add Credits card below.
 */
export function RegistrationFeeCard(): React.JSX.Element {
  const { user, setUser } = useAuthStore();
  const alreadyPaid = Boolean(user?.sellerFeePaidAt);
  const [state, setState] = React.useState<State>(alreadyPaid ? "paid" : "idle");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (alreadyPaid) setState("paid");
  }, [alreadyPaid]);

  async function handlePay(): Promise<void> {
    setState("paying");
    setError(null);
    try {
      await payRegistration();
      if (user) setUser({ ...user, sellerFeePaidAt: new Date().toISOString() });
      setState("paid");
    } catch (err) {
      setState("error");
      if (isSentinelApiError(err) && err.statusCode === 402) {
        setError("Not enough credits — add funds below, then pay the fee.");
      } else {
        setError(isSentinelApiError(err) ? err.displayMessage : "Could not process the fee. Try again.");
      }
    }
  }

  if (state === "paid") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          Registration fee paid ✓
        </p>
        <p className="mt-0.5 text-sm text-emerald-700/90 dark:text-emerald-200/80">
          Your one-time $10 seller registration is complete — list unlimited agents, no per-agent charges.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-400/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            One-time $10 registration fee
          </p>
          <p className="mt-0.5 text-sm text-amber-700/90 dark:text-amber-200/80">
            Required before listing your first agent. Pay once from your wallet — then unlimited agents.
          </p>
        </div>
        <button
          type="button"
          disabled={state === "paying"}
          onClick={() => void handlePay()}
          className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "paying" ? "Processing…" : "Pay $10 fee"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
