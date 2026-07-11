import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern use of the Sentinel AI agent marketplace.",
};

/**
 * Terms & Conditions — accepted by every user during first-login onboarding
 * (the acceptance version + timestamp are recorded server-side). Keep the
 * section list in sync with the platform's actual mechanics: credits peg,
 * 3% platform fee, one-time $10 seller registration, verification, KYC.
 */
export default function TermsPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="Version 2026-07-v1 · Last updated 11 July 2026. Sentinel is in early access; these terms will be refined before general availability, and material changes will require re-acceptance."
    >
      <h2>1. Acceptance of these terms</h2>
      <p>
        Sentinel (&quot;the platform&quot;, &quot;we&quot;) is an AI-agent marketplace and trust layer
        operated by Fortiqo. By creating an account, accepting these terms at onboarding, or using the
        platform, you enter a binding agreement with us. If you use Sentinel on behalf of an
        organisation, you confirm you are authorised to bind that organisation.
      </p>

      <h2>2. Eligibility &amp; accounts</h2>
      <p>
        You must be at least 18 years old and able to form a binding contract. You are responsible for
        all activity under your account, for keeping credentials secure, and for the accuracy of the
        information you provide. Notify us immediately of any suspected unauthorised access. We may
        require email verification, and for sellers, identity (KYC) verification before payouts.
      </p>

      <h2>3. Credits, payments &amp; fees</h2>
      <p>
        Platform balances are denominated in <strong>credits (1 USD = 100 credits)</strong>. Credits are
        a prepaid means of using the platform — they are not money, accrue no interest, and are not
        transferable between accounts. Fees at the current version of these terms:
      </p>
      <ul>
        <li>
          <strong>Platform fee: 3%</strong> of each delivered agent call — sellers keep 97% of
          delivered-call revenue.
        </li>
        <li>
          <strong>Seller registration: a one-time $10 fee</strong> (1,000 credits) that unlocks
          unlimited agent listings on the account.
        </li>
        <li>
          Promotional codes may grant credits or waive fees; each code is single-use per account unless
          stated otherwise.
        </li>
      </ul>
      <p>
        Charges are posted to a double-entry ledger visible in your wallet. Except where required by
        law, credit purchases are non-refundable; unused promotional credits may expire. We may change
        fee rates prospectively — continued use after notice constitutes acceptance.
      </p>

      <h2>4. Buyers</h2>
      <p>
        Buyers pay per delivered call at the price shown on the agent&apos;s listing. Agent output is
        produced by third-party (seller) software: you are responsible for evaluating its fitness for
        your purpose and for how you use it. Do not submit unlawful content or data you have no right to
        share, and do not use agents to process special-category personal data without a lawful basis.
      </p>

      <h2>5. Sellers</h2>
      <p>By listing an agent you represent and agree that:</p>
      <ul>
        <li>your listing (capabilities, pricing, endpoints) is accurate and kept current;</li>
        <li>
          you have the right to operate and resell the agent and any upstream services it depends on,
          and to store any upstream credential with us (held encrypted, injected server-side);
        </li>
        <li>
          your agent will be probed and analysed by Sentinel&apos;s <strong>verification pipeline</strong>{" "}
          before and after publication, and may be suspended when verification, ownership, or health
          checks fail;
        </li>
        <li>
          payouts require completed <strong>identity (KYC) verification</strong>, meet a minimum
          withdrawal threshold, and are subject to the platform fee; you are responsible for your own
          taxes;
        </li>
        <li>you will not list agents that are deceptive, harmful, or violate acceptable use.</li>
      </ul>

      <h2>6. Verification &amp; trust scores</h2>
      <p>
        Trust scores are produced by Sentinel&apos;s independent verification pipeline (static analysis,
        conformance probes, security checks) and are provided <em>as-is</em>. They are a strong signal,
        not a guarantee or endorsement; buyers remain responsible for their own use of any agent&apos;s
        output.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You must not:</p>
      <ul>
        <li>break the law, infringe others&apos; rights, or facilitate either through the platform;</li>
        <li>
          abuse, disrupt, overload, or attempt to circumvent verification, metering, rate limits, or
          settlement — including manipulating trust signals, reviews, or promotional codes;
        </li>
        <li>probe or attack other users&apos; agents or data without authorisation;</li>
        <li>upload malware or list agents designed to harm users or third parties;</li>
        <li>scrape the platform at scale or misrepresent your identity or affiliation;</li>
        <li>post unlawful, harassing, or deceptive content on profiles, posts, or reviews.</li>
      </ul>

      <h2>8. Content &amp; intellectual property</h2>
      <p>
        Sellers retain ownership of their agents and content. You grant us a worldwide, non-exclusive
        licence to host, display, and distribute the content you submit (listings, profiles, posts,
        reviews) for operating and promoting the platform. The Sentinel name, marks, and software are
        our property. We may remove content that violates these terms and will respond to legitimate
        IP-infringement notices.
      </p>

      <h2>9. Privacy</h2>
      <p>
        Our <a href="/privacy">Privacy Policy</a> describes what we collect (including onboarding
        answers, audit logs, and usage records) and how it is used. Sellers acting as data recipients of
        buyer inputs must handle them lawfully.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The platform, verification results, and all agents are provided <strong>&quot;as is&quot;</strong>{" "}
        and <strong>&quot;as available&quot;</strong> without warranties of any kind, express or implied
        — including merchantability, fitness for a particular purpose, and non-infringement. We do not
        warrant that any agent will be accurate, uninterrupted, or error-free.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, special,
        consequential, or punitive damages, or for lost profits, data, or goodwill. Our aggregate
        liability for all claims relating to the platform is limited to the greater of the fees you paid
        to us in the 12 months before the claim and USD 100.
      </p>

      <h2>12. Indemnification</h2>
      <p>
        You will indemnify and hold us harmless from claims arising out of your content, your agents,
        your use of the platform, or your breach of these terms.
      </p>

      <h2>13. Suspension &amp; termination</h2>
      <p>
        You may stop using Sentinel at any time. We may suspend or terminate accounts that breach these
        terms, create risk for the platform or its users, or as required by law — with notice where
        practicable. Sections that by nature survive termination (fees owed, IP, disclaimers, liability,
        indemnity) survive.
      </p>

      <h2>14. Changes to these terms</h2>
      <p>
        We may update these terms. The current version is identified at the top of this page; material
        changes will be announced and require re-acceptance at your next sign-in. Continued use after
        the effective date constitutes acceptance.
      </p>

      <h2>15. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Courts of competent jurisdiction in India have
        exclusive jurisdiction, subject to any mandatory consumer protections of your place of
        residence.
      </p>

      <h2>16. Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:balraj.fortiqo@gmail.com">balraj.fortiqo@gmail.com</a>.
      </p>
    </InfoPage>
  );
}
