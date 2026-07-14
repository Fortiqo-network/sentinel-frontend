"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";
import { postAuthDestination } from "@/lib/utils/portal";

const GSI_SRC = "https://accounts.google.com/gsi/client";

const CELL_BASE =
  "flex items-center justify-center gap-2 rounded-lg border border-porcelain/15 bg-ink-800/40 px-3 py-2.5 text-sm";
const CELL_ACTIVE = `${CELL_BASE} text-porcelain/80 transition-colors hover:bg-ink-800/70 hover:text-porcelain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-60`;
const CELL_DISABLED = `${CELL_BASE} cursor-not-allowed text-porcelain/45`;

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  twitter_denied: "X sign-in was cancelled.",
  twitter_state: "X sign-in could not be verified. Please try again.",
  twitter_failed: "X sign-in failed. Please try again.",
  twitter_unconfigured: "X sign-in is not available right now.",
};

interface CredentialResponse {
  credential?: string;
}

interface PromptMoment {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }): void;
  prompt(momentListener?: (moment: PromptMoment) => void): void;
}

interface GoogleNamespace {
  accounts: { id: GoogleIdApi };
}

declare global {
  interface Window {
    google?: GoogleNamespace;
  }
}

/**
 * Loads the Google Identity Services script once, resolving when the
 * `google.accounts.id` API is available. Reuses an in-flight/existing tag.
 */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google sign-in.")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });
}

interface SocialSignInGridProps {
  googleEnabled: boolean;
  twitterEnabled: boolean;
}

/**
 * The 3-cell social sign-in grid (Google · X · Wallet) shared by the login and
 * register screens. Google signs in via the Google Identity Services prompt; X
 * starts the redirect OAuth flow at the BFF (`/api/v1/auth/x/start`); Wallet is
 * still scaffolded. Cells for unconfigured providers render as disabled
 * placeholders so the grid always looks consistent.
 *
 * @example
 * <SocialSignInGrid googleEnabled twitterEnabled={false} />
 */
export function SocialSignInGrid({
  googleEnabled,
  twitterEnabled,
}: SocialSignInGridProps): React.JSX.Element {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [ready, setReady] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleActive = googleEnabled && Boolean(clientId);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("error");
    if (reason && OAUTH_ERROR_MESSAGES[reason]) {
      setError(OAUTH_ERROR_MESSAGES[reason]);
    }
  }, []);

  const handleCredential = React.useCallback(
    async (response: CredentialResponse) => {
      if (!response.credential) {
        setError("Google sign-in was cancelled. Please try again.");
        return;
      }
      setError(undefined);
      setIsSubmitting(true);
      try {
        const user = await loginWithGoogle(response.credential);
        setUser(user);
        router.push(postAuthDestination(user));
        router.refresh();
      } catch (err) {
        setIsSubmitting(false);
        if (isSentinelApiError(err) && err.statusCode === 503) {
          setError("Google sign-in is not available right now.");
        } else {
          setError("Google sign-in failed. Please try again.");
        }
      }
    },
    [router, setUser],
  );

  React.useEffect(() => {
    if (!googleActive || !clientId) return;
    let cancelled = false;
    void loadGsiScript()
      .then(() => {
        const api = window.google?.accounts?.id;
        if (cancelled || !api) return;
        api.initialize({
          client_id: clientId,
          callback: (response) => void handleCredential(response),
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load Google sign-in.");
      });
    return () => {
      cancelled = true;
    };
  }, [googleActive, clientId, handleCredential]);

  const handleGoogleClick = React.useCallback(() => {
    const api = window.google?.accounts?.id;
    if (!api) {
      setError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }
    setError(undefined);
    api.prompt((moment) => {
      if (moment.isNotDisplayed?.() || moment.isSkippedMoment?.()) {
        setError("Google sign-in didn't open. Allow pop-ups for this site, then try again.");
      }
    });
  }, []);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {googleActive ? (
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={!ready || isSubmitting}
            title="Continue with Google"
            className={CELL_ACTIVE}
          >
            <span className="font-bold">G</span>
            <span className="hidden sm:inline">{isSubmitting ? "…" : "Google"}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Google sign-in — coming soon"
            className={CELL_DISABLED}
          >
            <span className="font-bold">G</span>
            <span className="hidden sm:inline">Google</span>
          </button>
        )}

        {twitterEnabled ? (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- BFF API route that issues a server-side OAuth redirect, not a Next page
          <a href="/api/v1/auth/x/start" title="Continue with X" className={CELL_ACTIVE}>
            <span className="font-bold">𝕏</span>
            <span className="hidden sm:inline">X</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="X sign-in — coming soon"
            className={CELL_DISABLED}
          >
            <span className="font-bold">𝕏</span>
            <span className="hidden sm:inline">X</span>
          </button>
        )}

        <button
          type="button"
          disabled
          title="Wallet sign-in — coming soon"
          className={CELL_DISABLED}
        >
          <span className="font-bold">⬡</span>
          <span className="hidden sm:inline">Wallet</span>
        </button>
      </div>
      {error !== undefined && (
        <p role="alert" className="text-center text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
