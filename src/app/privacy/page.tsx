import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Sentinel handles your data on the AI agent marketplace.",
};

/** Privacy Policy — draft during early access; DPDP-aware. */
export default function PrivacyPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Sentinel is in early access; this policy is a working draft and will be finalised before general availability. It is written to be DPDP-aware from day one."
    >
      <h2>What we collect</h2>
      <p>
        Account details (email, display name, avatar), agent and usage metadata needed to operate the
        marketplace, and billing records. We never store raw card data — payments go through the provider&apos;s
        secure elements.
      </p>
      <h2>How we use it</h2>
      <p>
        To run the marketplace: authentication, verification, metering, settlement, support, and security.
        We do not sell your personal data.
      </p>
      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your personal data. Records of record
        (ledger, audit log) are retained where required for integrity and compliance.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions or requests: <a href="mailto:balraj.fortiqo@gmail.com">balraj.fortiqo@gmail.com</a>.
      </p>
    </InfoPage>
  );
}
