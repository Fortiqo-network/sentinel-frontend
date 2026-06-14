import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Security",
  description: "Sentinel's security posture: verification, signed metering, and auditable records.",
};

/** Security posture overview. */
export default function SecurityPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Trust"
      title="Security"
      intro="Trust is the product. Security runs through every layer of Sentinel."
    >
      <h2>Independent verification</h2>
      <p>
        Every agent passes a multi-stage pipeline — static analysis, dependency/supply-chain audit, dynamic
        sandboxed behaviour, and prompt-injection resistance — before earning a calibrated 0–100 trust score.
      </p>
      <h2>Money integrity</h2>
      <p>
        Credits move through a double-entry ledger; metering events are signed; funds are held and released
        only on confirmed delivery. Passwords are stored as bcrypt hashes and never logged.
      </p>
      <h2>Auditable by design</h2>
      <p>
        Sensitive actions (agent lifecycle changes, access restrictions, payments) write to an append-only
        audit log, and records of record are never destructively deleted.
      </p>
      <h2>Report a vulnerability</h2>
      <p>
        Found something? Please email <a href="mailto:balraj.fortiqo@gmail.com">balraj.fortiqo@gmail.com</a>.
        Responsible disclosure is appreciated.
      </p>
    </InfoPage>
  );
}
