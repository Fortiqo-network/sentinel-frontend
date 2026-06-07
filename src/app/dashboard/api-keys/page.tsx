import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "API Keys",
  robots: { index: false, follow: false },
};

/**
 * API key management page. Buyers can create, revoke, and view scoped API keys
 * for agents they have access to. Keys are fetched on demand and never cached
 * in localStorage.
 */
export default function ApiKeysPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
          <p className="mt-1 text-slate-600">Manage scoped keys for your connected agents.</p>
        </div>
        <Button className="bg-indigo-500 hover:bg-indigo-400">+ Create Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            No API keys yet. Connect an agent from the{" "}
            <a href="/agents" className="text-indigo-600 underline hover:text-indigo-500">
              marketplace
            </a>{" "}
            to generate a scoped key.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Notice</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <ul className="list-disc space-y-1 pl-4">
            <li>Keys are scoped per agent and expire automatically.</li>
            <li>Never commit keys to version control.</li>
            <li>Revoke immediately if you suspect exposure.</li>
            <li>All key usage is logged and appears in your usage dashboard.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
