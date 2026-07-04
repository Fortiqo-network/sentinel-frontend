/**
 * "Verified by Sentinel" embeddable badge helpers (B3).
 *
 * Pure, framework-agnostic builders for the copy-paste embed code a seller
 * places on their own site. The badge image/widget are served live by the
 * Sentinel API (see core-api `api/v1/badge.py`), so an embedded badge always
 * reflects the agent's current trust score and cannot be forged with stale text.
 */

import { SITE_URL } from "@/lib/site";

/**
 * Public Sentinel API origin that serves the badge endpoints. Badges are
 * embedded on external sites, so these must be absolute URLs to the public API.
 */
export const BADGE_API_BASE =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://sentinel-api.fortiqo.xyz";

export interface BadgeEmbed {
  /** Canonical agent page on the Sentinel marketplace. */
  agentUrl: string;
  /** Live SVG badge URL — use in an `<img>`. */
  svgUrl: string;
  /** HTML widget URL — use in an `<iframe>`. */
  embedUrl: string;
  /** Ready-to-paste `<a><img></a>` snippet. */
  html: string;
  /** Ready-to-paste Markdown badge. */
  markdown: string;
  /** Ready-to-paste `<iframe>` snippet. */
  iframe: string;
}

export interface BuildBadgeOptions {
  /** Override the public API origin (defaults to {@link BADGE_API_BASE}). */
  apiBase?: string;
  /** Override the marketplace site origin (defaults to {@link SITE_URL}). */
  siteUrl?: string;
}

const stripTrailingSlash = (s: string): string => s.replace(/\/+$/, "");

/**
 * Build the badge URLs and copy-paste snippets for an agent slug.
 *
 * @param slug - The agent's URL slug.
 * @returns Absolute URLs plus ready-to-paste HTML/Markdown/iframe snippets.
 */
export function buildBadgeEmbed(slug: string, opts: BuildBadgeOptions = {}): BadgeEmbed {
  const apiBase = stripTrailingSlash(opts.apiBase ?? BADGE_API_BASE);
  const siteUrl = stripTrailingSlash(opts.siteUrl ?? SITE_URL);

  const svgUrl = `${apiBase}/v1/badge/${slug}.svg`;
  const embedUrl = `${apiBase}/v1/badge/${slug}/embed`;
  const agentUrl = `${siteUrl}/agents/${slug}`;
  const alt = "Verified by Sentinel";

  return {
    agentUrl,
    svgUrl,
    embedUrl,
    html: `<a href="${agentUrl}"><img src="${svgUrl}" alt="${alt}"></a>`,
    markdown: `[![${alt}](${svgUrl})](${agentUrl})`,
    iframe: `<iframe src="${embedUrl}" width="340" height="56" frameborder="0" title="${alt}"></iframe>`,
  };
}
