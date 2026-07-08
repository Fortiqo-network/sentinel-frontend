"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getLinks,
  linkGoogle,
  unlinkProvider,
  asLinkConflict,
  type AccountLinks,
  type LinkConflict,
} from "@/lib/api/links";
import { isSentinelApiError } from "@/lib/api/client";

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredential {
  credential?: string;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (r: GoogleCredential) => void;
    auto_select?: boolean;
    use_fedcm_for_prompt?: boolean;
  }): void;
  prompt(): void;
}

// The Window.google global is declared in SocialSignInGrid; read it via a cast
// here to avoid a duplicate (mismatched) global augmentation.
function gsiApi(): GoogleIdApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { google?: { accounts?: { id?: GoogleIdApi } } }).google?.accounts
    ?.id;
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || gsiApi()) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi")));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("gsi"));
    document.head.appendChild(s);
  });
}

/**
 * Connected sign-in methods for the settings page. Lists the account's linked
 * identities and lets the user link/unlink Google (via the GSI popup). If the
 * Google account is already linked elsewhere, a confirmation modal warns that
 * linking it here removes it from the other account before proceeding.
 */
export function ConnectedAccountsCard(_props: { activeMethod?: string } = {}): React.JSX.Element {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [links, setLinks] = React.useState<AccountLinks | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | undefined>();
  const [conflict, setConflict] = React.useState<LinkConflict | null>(null);
  const pendingCredential = React.useRef<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLinks(await getLinks());
    } catch {
      /* leave the last-known state; the page still renders */
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const googleLinked = links?.identities.find((i) => i.provider === "google");

  const doLink = React.useCallback(async (credential: string, confirm: boolean) => {
    setBusy("google");
    setError(undefined);
    try {
      setLinks(await linkGoogle(credential, confirm));
      setConflict(null);
      pendingCredential.current = null;
    } catch (err) {
      const c = asLinkConflict(err);
      if (c) {
        pendingCredential.current = credential;
        setConflict(c);
      } else {
        setError(isSentinelApiError(err) ? err.message : "Could not link Google. Try again.");
      }
    } finally {
      setBusy(null);
    }
  }, []);

  const connectGoogle = React.useCallback(async () => {
    if (!clientId) return;
    setError(undefined);
    try {
      await loadGsi();
      const api = gsiApi();
      if (!api) throw new Error("gsi");
      api.initialize({
        client_id: clientId,
        callback: (r) => {
          if (r.credential) void doLink(r.credential, false);
        },
        auto_select: false,
        use_fedcm_for_prompt: true,
      });
      api.prompt();
    } catch {
      setError("Could not open Google sign-in. Allow pop-ups and try again.");
    }
  }, [clientId, doLink]);

  const unlink = React.useCallback(async (provider: string) => {
    setBusy(provider);
    setError(undefined);
    try {
      setLinks(await unlinkProvider(provider));
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Could not unlink. Try again.");
    } finally {
      setBusy(null);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in methods</CardTitle>
        <CardDescription>Link additional ways to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 dark:divide-porcelain/10">
        <Row
          name="Email & password"
          detail={links?.email ?? "Your account email"}
          right={links?.has_password ? <Badge variant="success">Active</Badge> : <Soon />}
        />

        <Row
          name="Google"
          detail={googleLinked ? (googleLinked.label ?? "Linked") : "Sign in with your Google account"}
          right={
            googleLinked ? (
              <ActionButton
                label={busy === "google" ? "…" : "Unlink"}
                onClick={() => unlink("google")}
                disabled={busy !== null}
              />
            ) : clientId ? (
              <ActionButton
                label={busy === "google" ? "…" : "Connect"}
                onClick={connectGoogle}
                disabled={busy !== null}
                primary
              />
            ) : (
              <Soon />
            )
          }
        />

        <Row name="X" detail="Sign in with your X account" right={<Soon />} />
        <Row name="EVM wallet" detail="Connect a wallet for on-chain settlement" right={<Soon />} />

        {error !== undefined && (
          <p role="alert" className="pt-3 text-xs text-red-500">
            {error}
          </p>
        )}
      </CardContent>

      {conflict && (
        <ConflictModal
          conflict={conflict}
          busy={busy === "google"}
          onCancel={() => {
            setConflict(null);
            pendingCredential.current = null;
          }}
          onConfirm={() => {
            if (pendingCredential.current) void doLink(pendingCredential.current, true);
          }}
        />
      )}
    </Card>
  );
}

function Row({
  name,
  detail,
  right,
}: {
  name: string;
  detail: string;
  right: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-porcelain">{name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-porcelain/50">{detail}</p>
      </div>
      {right}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  primary,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "bg-gold text-ink-950 hover:opacity-90"
          : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-porcelain/15 dark:text-porcelain/70 dark:hover:bg-ink-800/60"
      }`}
    >
      {label}
    </button>
  );
}

function Soon(): React.JSX.Element {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:border-porcelain/10 dark:text-porcelain/40"
    >
      Connect · soon
    </button>
  );
}

function ConflictModal({
  conflict,
  busy,
  onCancel,
  onConfirm,
}: {
  conflict: LinkConflict;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-porcelain/10 bg-ink-900 p-6 text-porcelain">
        <h3 className="text-base font-semibold">This account is already linked elsewhere</h3>
        <p className="mt-2 text-sm text-porcelain/65">
          {conflict.message}
          {conflict.label ? (
            <>
              {" ("}
              <span className="font-medium text-porcelain/80">{conflict.label}</span>
              {")"}
            </>
          ) : null}{" "}
          The other account will lose access to this sign-in method.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-porcelain/15 px-4 py-2 text-sm text-porcelain/80 hover:bg-ink-800/60 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Linking…" : "Link here anyway"}
          </button>
        </div>
      </div>
    </div>
  );
}
