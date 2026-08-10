'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Particles fill a tall box around the camera's full scroll path
// (worldY 200 → -200) so every page drifts through them.
const AREA = {
  x: 45,
  yMin: -260,
  yMax: 260,
  zMin: 45,
  zMax: 104,
};
// Gentle vertical drift + horizontal sway, like the particles.js demo.
const DRIFT_Y = 0.6;
const SWAY = 0.8;

function makeSpriteTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(205,220,255,0.6)');
  g.addColorStop(1, 'rgba(130,150,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Deterministic PRNG (mulberry32): keeps render pure — the field is identical
// across re-renders for a given count.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useParticleCloud(count: number) {
  return useMemo(() => {
    const rand = mulberry32(count * 7919 + 1);
    const positions = new Float32Array(count * 3);
    const baseX = new Float32Array(count);
    const speedY = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      baseX[i] = (rand() * 2 - 1) * AREA.x;
      positions[i * 3] = baseX[i];
      positions[i * 3 + 1] = AREA.yMin + rand() * (AREA.yMax - AREA.yMin);
      positions[i * 3 + 2] = AREA.zMin + rand() * (AREA.zMax - AREA.zMin);
      speedY[i] = (0.3 + rand() * 0.7) * DRIFT_Y;
      phase[i] = rand() * Math.PI * 2;
    }
    return { positions, baseX, speedY, phase };
  }, [count]);
}

function Cloud({
  count,
  size,
  opacity,
  texture,
}: {
  count: number;
  size: number;
  opacity: number;
  texture: THREE.CanvasTexture;
}) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const cloud = useParticleCloud(count);

  useFrame(({ clock }, delta) => {
    const geometry = geometryRef.current;
    if (!geometry) return;
    const attr = geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + cloud.speedY[i] * dt;
      if (y > AREA.yMax) y = AREA.yMin;
      arr[i * 3] = cloud.baseX[i] + Math.sin(t * 0.15 + cloud.phase[i]) * SWAY;
      arr[i * 3 + 1] = y;
    }
    attr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[cloud.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color="#aec4ff"
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Particles() {
  const { size } = useThree();
  const mobile = size.width < 768;
  const texture = useMemo(() => makeSpriteTexture(), []);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <>
      {/* Fine dust + a few brighter sparks for size variety */}
      <Cloud
        count={mobile ? 120 : 260}
        size={0.45}
        opacity={0.55}
        texture={texture}
      />
      <Cloud
        count={mobile ? 30 : 60}
        size={0.9}
        opacity={0.8}
        texture={texture}
      />
    </>
  );
}
