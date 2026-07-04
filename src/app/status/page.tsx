import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Platform status",
  description: "Current operational status of the Sentinel platform.",
};

/** Lightweight platform status page (early access). */
export default function StatusPage(): React.JSX.Element {
  return (
    <InfoPage
      eyebrow="Status"
      title="Platform status"
      intro="Sentinel is in active early access. A live status dashboard is on the way."
    >
      <h2>Now</h2>
      <p>
        The marketplace, seller console, and buyer dashboard are live on early-access infrastructure.
        Agents are currently listed for preview; live pay-on-outcome execution rolls out as the runtime and
        payment rails are enabled.
      </p>
      <h2>Issues</h2>
      <p>
        If something looks down, email <a href="mailto:balraj.fortiqo@gmail.com">balraj.fortiqo@gmail.com</a>{" "}
        and we&apos;ll jump on it.
      </p>
    </InfoPage>
  );
}
