import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listAgents } from "@/lib/api/agents";

/**
 * Sitemap of the public, indexable routes plus every live agent detail page
 * (so individual agents are discoverable in search). Authenticated app areas are
 * excluded (see robots.ts). Agent fetch failures degrade to the static routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/agents`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/how-it-works`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/playground`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  let agentRoutes: MetadataRoute.Sitemap = [];
  try {
    const { agents } = await listAgents({ pageSize: 100 });
    agentRoutes = agents.map((a) => ({
      url: `${SITE_URL}/agents/${a.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Marketplace unavailable at build/request time — ship the static routes only.
  }

  return [...staticRoutes, ...agentRoutes];
}
