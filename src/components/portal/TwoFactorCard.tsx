"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMfaStatus,
  setupTotp,
  enableTotp,
  enableEmailMfa,
  disableMfa,
  type MfaStatus,
  type TotpSetup,
} from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";

type View = "idle" | "totp" | "disable";

/**
 * Two-factor authentication settings. Shows the current 2FA state and lets the
 * user enrol an authenticator app (TOTP, with QR) or an emailed login code, and
 * disable 2FA (which requires the account password).
 */
export function TwoFactorCard(): React.JSX.Element {
  const [status, setStatus] = React.useState<MfaStatus | null>(null);
  const [view, setView] = React.useState<View>("idle");
  const [setup, setSetup] = React.useState<TotpSetup | null>(null);
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [notice, setNotice] = React.useState<string | undefined>();

  const load = React.useCallback(async () => {
    try {
      setStatus(await getMfaStatus());
    } catch {
      setStatus({ mfa_enabled: false, mfa_method: null });
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  function reset(): void {
    setView("idle");
    setSetup(null);
    setCode("");
    setPassword("");
    setError(undefined);
  }

  function fail(err: unknown, fallback: string): void {
    setError(isSentinelApiError(err) ? err.displayMessage || fallback : fallback);
  }

  async function beginTotp(): Promise<void> {
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      setSetup(await setupTotp());
      setView("totp");
    } catch (err) {
      fail(err, "Could not start authenticator setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmTotp(): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      const next = await enableTotp(code.trim());
      setStatus(next);
      setNotice("Authenticator app enabled. You'll be asked for a code at sign-in.");
      reset();
    } catch (err) {
      fail(err, "That code wasn't right. Try the current one.");
    } finally {
      setBusy(false);
    }
  }

  async function enableEmail(): Promise<void> {
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const next = await enableEmailMfa();
      setStatus(next);
      setNotice("Email codes enabled. You'll be emailed a code at sign-in.");
    } catch (err) {
      fail(err, "Could not enable email codes. Verify your email first.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      const next = await disableMfa(password || undefined);
      setStatus(next);
      setNotice("Two-factor authentication disabled.");
      reset();
    } catch (err) {
      fail(err, "Could not disable 2FA. Check your password.");
    } finally {
      setBusy(false);
    }
  }

  const enabled = status?.mfa_enabled === true;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>Protect sign-in with a second factor.</CardDescription>
          </div>
          {enabled ? (
            <Badge variant="success">
              On · {status?.mfa_method === "email" ? "Email code" : "Authenticator"}
            </Badge>
          ) : (
            <Badge variant="default">Off</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notice && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        {enabled && view === "idle" && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-porcelain/70">
              Your account is protected. Disabling requires your password.
            </p>
            <Button size="sm" variant="destructive" onClick={() => setView("disable")}>
              Disable
            </Button>
          </div>
        )}

        {!enabled && view === "idle" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-porcelain/10">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-porcelain">Authenticator app</p>
                <p className="text-xs text-slate-500 dark:text-porcelain/50">Use Google Authenticator, 1Password, or similar.</p>
              </div>
              <Button size="sm" variant="primary" disabled={busy} onClick={() => void beginTotp()}>
                Set up
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-porcelain/10">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-porcelain">Email code</p>
                <p className="text-xs text-slate-500 dark:text-porcelain/50">Get a one-time code by email at sign-in.</p>
              </div>
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => void enableEmail()}>
                Enable
              </Button>
            </div>
          </div>
        )}

        {view === "totp" && setup && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-porcelain/70">
              Scan this QR in your authenticator app, then enter the 6-digit code to confirm.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={setup.qr_data_uri}
              alt="Authenticator QR code"
              className="h-44 w-44 rounded-lg bg-white p-2"
            />
            <p className="break-all text-xs text-slate-500 dark:text-porcelain/50">
              Or enter this key manually: <span className="font-mono text-slate-700 dark:text-porcelain/80">{setup.secret}</span>
            </p>
            <Input
              label="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              variant="dark"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="primary" disabled={busy || code.trim().length === 0} onClick={() => void confirmTotp()}>
                {busy ? "Confirming…" : "Confirm and enable"}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {view === "disable" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-porcelain/70">Enter your account password to turn off 2FA.</p>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="dark"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" disabled={busy} onClick={() => void confirmDisable()}>
                {busy ? "Disabling…" : "Disable 2FA"}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
