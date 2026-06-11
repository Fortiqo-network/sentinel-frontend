"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { NeuralField } from "./NeuralField";
import { Dust } from "./Dust";

interface HeroCanvasProps {
  /** Quality tier resolved from the device — controls node count and bloom. */
  tier: "high" | "low";
  /** Whether the canvas is on-screen; drives the render loop to save GPU. */
  active: boolean;
}

/**
 * The WebGL stage behind the hero: a neural constellation in a dusty void, lit
 * with aurora tones and finished with a soft bloom on the high tier. Renders
 * on demand only while `active`, so scrolling past the hero stops the loop.
 *
 * Mounted exclusively through {@link "./SceneStage"}'s dynamic import, never on
 * the server.
 */
export function HeroCanvas({ tier, active }: HeroCanvasProps): React.JSX.Element {
  const high = tier === "high";
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 13], fov: 55 }}
      dpr={high ? [1, 1.75] : [1, 1]}
      gl={{ antialias: high, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[8, 8, 8]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-8, -6, 4]} intensity={1} color="#a78bfa" />

      <NeuralField nodeCount={high ? 100 : 55} linkDistance={high ? 2.1 : 1.9} />
      <Dust count={high ? 420 : 160} />

      {high ? (
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
