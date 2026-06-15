/**
 * Public site origin used for canonical URLs, sitemaps, and social cards.
 * Currently the free Vercel deployment; override via NEXT_PUBLIC_SITE_URL when a
 * custom domain is connected.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinel.fortiqo.xyz";

/** Standalone documentation site (separate Vercel project + Cloudflare domain). */
export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.fortiqo.xyz";
