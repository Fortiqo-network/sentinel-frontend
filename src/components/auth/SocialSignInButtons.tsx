import * as React from "react";
import { SocialSignInGrid } from "./SocialSignInGrid";

/**
 * Social / wallet sign-in options for the auth screens. Renders the shared
 * Google · X · Wallet grid, enabling each provider based on its configuration:
 * Google via `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, X via `TWITTER_CLIENT_ID` (server).
 * Wallet remains scaffolded; email/password is the other active method.
 *
 * @example
 * <SocialSignInButtons />
 */
export function SocialSignInButtons(): React.JSX.Element {
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const twitterEnabled = Boolean(process.env.TWITTER_CLIENT_ID);

  return (
    <div className="space-y-3">
      <SocialSignInGrid googleEnabled={googleEnabled} twitterEnabled={twitterEnabled} />
      <p className="text-center text-[11px] text-porcelain/35">
        EVM wallet sign-in coming soon
      </p>
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-porcelain/10" />
        <span className="text-xs text-porcelain/40">or continue with email</span>
        <span className="h-px flex-1 bg-porcelain/10" />
      </div>
    </div>
  );
}
