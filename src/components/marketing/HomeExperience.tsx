"use client";

import { SmoothScroll } from "./providers/SmoothScroll";
import { DevelopmentBanner } from "./DevelopmentBanner";
import { Nav } from "./sections/Nav";
import { Hero } from "./sections/Hero";
import { Pipeline } from "./sections/Pipeline";
import { Features } from "./sections/Features";
import { Ecosystem } from "./sections/Ecosystem";
import { Stats, type LiveStats } from "./sections/Stats";
import { CallToAction } from "./sections/CallToAction";
import { Footer } from "./sections/Footer";

/**
 * The cinematic home experience: a single dark, smooth-scrolled canvas that
 * sequences the six scenes. Receives live platform figures from the server
 * page and threads them into the stats scene.
 *
 * Scoped dark surface — this component owns its own `void` background and white
 * text, leaving the light-mode app (dashboard, marketplace) untouched.
 *
 * @example
 * <HomeExperience stats={{ verifiedAgents: 42, avgTrustScore: 86 }} />
 */
export function HomeExperience({ stats }: { stats: LiveStats }): React.JSX.Element {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen overflow-x-clip bg-ink-950 font-brand text-porcelain antialiased">
        {/* Ambient gradient wash beneath every scene. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(231,160,60,0.08),transparent_60%)]"
        />
        <div className="relative z-10">
          <Nav />
          <main>
            <Hero />
            <Pipeline />
            <Features />
            <Ecosystem />
            <Stats stats={stats} />
            <CallToAction />
          </main>
          <Footer />
        </div>
        <DevelopmentBanner />
      </div>
    </SmoothScroll>
  );
}
