import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageChart } from "@/components/dashboard/UsageChart";

export const metadata: Metadata = {
  title: "Usage",
  robots: { index: false, follow: false },
};

/**
 * Detailed usage page. Shows per-agent invocation counts and spend over time.
 * Chart data is hydrated client-side from TanStack Query once auth is resolved.
 */
export default function UsagePage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <p className="sen-eyebrow mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-bold text-sen-text">Usage</h1>
        <p className="mt-1 text-sen-muted">Invocation history and spend across all your agents.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Invocations", value: "—" },
          { label: "This Month", value: "—" },
          { label: "Success Rate", value: "—" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold font-mono text-sen-text">{value}</div>
              <div className="mt-1 text-sm text-sen-muted">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invocations Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <UsageChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-Agent Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-sen-muted">No usage data available yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
