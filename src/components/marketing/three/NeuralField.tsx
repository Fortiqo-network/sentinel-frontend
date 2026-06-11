"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NeuralFieldProps {
  /** Number of network nodes. Tune down on low-power devices. */
  nodeCount?: number;
  /** Max distance between two nodes for a synapse to be drawn. */
  linkDistance?: number;
}

const PALETTE = [
  new THREE.Color("#6366f1"),
  new THREE.Color("#a78bfa"),
  new THREE.Color("#22d3ee"),
];

/**
 * Builds a soft circular sprite so points render as glowing dots rather than
 * hard squares. Created once on the client (the canvas only mounts client-side).
 */
function useSoftCircleTexture(): THREE.Texture {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.35, "rgba(255,255,255,0.75)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/**
 * A slowly-rotating constellation of AI "neurons": glowing nodes wired together
 * by faint synapses, drifting in deep space and parallaxing toward the pointer.
 * Geometry is generated once and animated on the GPU-friendly transform of a
 * single group, so it stays cheap regardless of node count.
 */
export function NeuralField({ nodeCount = 90, linkDistance = 2.1 }: NeuralFieldProps): React.JSX.Element {
  const group = useRef<THREE.Group>(null);
  const sprite = useSoftCircleTexture();
  const pointer = useThree((state) => state.pointer);

  const { nodePositions, nodeColors, linkPositions } = useMemo(() => {
    const radius = 5.5;
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);
    const points: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      )
        .normalize()
        .multiplyScalar(radius * (0.45 + Math.random() * 0.55));
      points.push(v);
      positions.set([v.x, v.y, v.z], i * 3);
      const color = PALETTE[i % PALETTE.length] ?? PALETTE[0]!;
      colors.set([color.r, color.g, color.b], i * 3);
    }

    const links: number[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i]!.distanceTo(points[j]!) < linkDistance) {
          const a = points[i]!;
          const b = points[j]!;
          links.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }

    return {
      nodePositions: positions,
      nodeColors: colors,
      linkPositions: new Float32Array(links),
    };
  }, [nodeCount, linkDistance]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.06;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      pointer.y * 0.25,
      0.04,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      pointer.x * 0.15,
      0.04,
    );
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linkPositions, 3]}
            count={linkPositions.length / 3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodePositions, 3]}
            count={nodePositions.length / 3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[nodeColors, 3]}
            count={nodeColors.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.34}
          map={sprite}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
