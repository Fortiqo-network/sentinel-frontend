import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  detail: string;
}

const PROVIDERS: Provider[] = [
  { id: "google", name: "Google", detail: "Sign in with your Google account" },
  { id: "x", name: "X", detail: "Sign in with your X account" },
  { id: "email", name: "Email & password", detail: "Your current sign-in method", },
  { id: "evm", name: "EVM wallet", detail: "Connect a wallet for on-chain settlement" },
];

/**
 * Connected sign-in methods. Google, X, and EVM-wallet linking are scaffolded
 * here and ship behind the auth integration work; email/password is the active
 * method today.
 *
 * @example
 * <ConnectedAccountsCard activeMethod="email" />
 */
export function ConnectedAccountsCard({ activeMethod = "email" }: { activeMethod?: string }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in methods</CardTitle>
        <CardDescription>Link additional ways to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 dark:divide-porcelain/10">
        {PROVIDERS.map((p) => {
          const active = p.id === activeMethod;
          return (
            <div key={p.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-porcelain">{p.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-porcelain/50">{p.detail}</p>
              </div>
              {active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:border-porcelain/10 dark:text-porcelain/40"
                  title="Coming soon"
                >
                  Connect · soon
                </button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
