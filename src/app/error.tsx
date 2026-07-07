"use client";

import * as React from "react";

/**
 * Root error boundary. Renders when a server component throws — notably when
 * `getServerUser` cannot reach the auth service after retries. Crucially, this
 * does NOT clear the session: the user stays logged in and can retry, instead of
 * being bounced to /login on a transient backend hiccup.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  React.useEffect(() => {
    // Surface for observability; no secrets are included in these messages.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold text-porcelain">Something went wrong</h2>
      <p className="max-w-md text-sm text-porcelain/60">
        We couldn&apos;t reach the service just now. Your session is still active —
        please try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg border border-porcelain/20 bg-ink-800/60 px-4 py-2 text-sm text-porcelain transition-colors hover:bg-ink-800"
      >
        Try again
      </button>
    </div>
  );
}
