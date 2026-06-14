import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Trust score guide",
  description: "What Sentinel's 0–100 trust score means and how the bands map to certification.",
};

/** Trust score guide — bands + meaning. */
export default function TrustScoresPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Trust"
      title="Trust score guide"
      intro="A calibrated 0–100 number that aggregates an agent's verification results into one signal."
    >
      <h2>The bands</h2>
      <p>
        <strong>90–100 — Exceptional.</strong> <strong>75–89 — Trusted.</strong>{" "}
        <strong>50–74 — Developing.</strong> <strong>0–49 — Unproven.</strong> Managed (hosted) agents that
        score highly can reach a Certified Managed tier.
      </p>
      <h2>How it&apos;s computed</h2>
      <p>
        The score is a weighted rollup of the four verification stages — static analysis, supply-chain,
        dynamic behaviour, and injection resistance — and is recalculated on every re-verification.
      </p>
      <p>
        Read the <Link href="/docs/methodology">verification methodology</Link> for the stage-by-stage detail.
      </p>
    </InfoPage>
  );
}
