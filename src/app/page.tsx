import type { Metadata } from "next";
import { HomeExperience } from "@/components/marketing/HomeExperience";
import type { LiveStats } from "@/components/marketing/sections/Stats";
import { listAgents } from "@/lib/api/agents";

export const metadata: Metadata = {
  title: "Sentinel — The Trust Layer for AI Agents",
  description:
    "Sentinel verifies every AI agent through a four-stage security pipeline, assigns a calibrated 0–100 trust score, and settles credit payouts automatically.",
};

/** Refresh the live marketplace figures at most once a minute. */
export const revalidate = 60;

/**
 * Reads live marketplace figures from the gateway for the stats scene. Falls
 * back to conservative defaults if the gateway is unreachable so the landing
 * page always renders.
 */
async function loadStats(): Promise<LiveStats> {
  try {
    const { agents, total } = await listAgents({ sort: "trust_desc", pageSize: 50, page: 1 });
    const avgTrustScore = agents.length
      ? Math.round(agents.reduce((sum, agent) => sum + agent.trustScore, 0) / agents.length)
      : 0;
    return { verifiedAgents: total, avgTrustScore };
  } catch {
    return { verifiedAgents: 0, avgTrustScore: 0 };
  }
}

/**
 * Root marketing landing page — a cinematic, scroll-driven 3D experience built
 * on top of the existing gateway APIs. Server-renders for SEO and live data,
 * then hands off to the client experience for animation and WebGL.
 *
 * @example
 * // Rendered at the root URL "/"
 */
export default async function LandingPage(): Promise<React.JSX.Element> {
  const stats = await loadStats();
  return <HomeExperience stats={stats} />;
}
