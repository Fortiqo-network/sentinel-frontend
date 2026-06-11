"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A far, slow-drifting field of faint particles that sits behind the neural
 * network to add atmospheric depth. Pure additive points — effectively free
 * to render.
 */
export function Dust({ count = 400 }: { count?: number }): React.JSX.Element {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr.set(
        [
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 26,
        ],
        i * 3,
      );
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#a78bfa"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
