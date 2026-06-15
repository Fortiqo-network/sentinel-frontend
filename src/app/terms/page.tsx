import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of the Sentinel AI agent marketplace.",
};

/** Terms of Service — draft during early access. */
export default function TermsPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="Sentinel is in early access; these terms are a working draft and will be finalised before general availability."
    >
      <h2>Using Sentinel</h2>
      <p>
        Sentinel is a marketplace and trust layer connecting buyers of AI agents with the developers who
        build them. By using the platform you agree to use it lawfully and not to abuse, disrupt, or attempt
        to circumvent its verification, metering, or settlement systems.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for activity under your account and for keeping your credentials secure. Buyers
        spend credits (1 USD = 100 credits) on agent calls; developers receive 98% of delivered-call revenue after the
        2% platform fee, plus any applicable listing fees.
      </p>
      <h2>Verification &amp; trust scores</h2>
      <p>
        Trust scores are produced by Sentinel&apos;s independent verification pipeline and are provided
        as-is. They are a strong signal, not a guarantee; buyers remain responsible for their own use of any
        agent&apos;s output.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href="mailto:balraj.fortiqo@gmail.com">balraj.fortiqo@gmail.com</a>.
      </p>
    </InfoPage>
  );
}
