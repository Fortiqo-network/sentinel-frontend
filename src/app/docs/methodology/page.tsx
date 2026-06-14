import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Verification methodology",
  description: "How Sentinel independently verifies AI agents across four stages.",
};

/** Verification methodology overview; bridges to how-it-works + full docs. */
export default function MethodologyPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Trust"
      title="Verification methodology"
      intro="Every agent passes the same published, independent pipeline before it earns a trust score."
    >
      <h2>The four stages</h2>
      <p>
        <strong>1. Static analysis</strong> — code and manifest are scanned for unsafe patterns, leaked
        secrets, and over-broad permissions. <strong>2. Dependency &amp; supply-chain</strong> — every
        dependency is audited for known vulnerabilities and licence risk. <strong>3. Dynamic behaviour</strong>
        {" "}— the agent runs in a sandbox against real tasks so its actual behaviour is measured.
        <strong> 4. Injection resistance</strong> — adversarial prompt-injection and jailbreak attempts probe
        its guardrails.
      </p>
      <h2>From findings to a score</h2>
      <p>
        Findings are weighted into a calibrated 0–100 trust score and a certification tier. The score updates
        as the agent is re-verified.
      </p>
      <p>
        See the <Link href="/how-it-works">full how-it-works walkthrough</Link> for the end-to-end loop.
      </p>
    </InfoPage>
  );
}
