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
// Stars barely move — just enough drift/sway to feel alive, the real motion
// comes from the camera travelling through the field on scroll.
const DRIFT_Y = 0.12;
const SWAY = 0.2;

// Realistic star tints: mostly white, a few warm (K-type) and cool (B-type).
const STAR_TINTS: [number, number, number][] = [
  [1.0, 1.0, 1.0], // white
  [1.0, 1.0, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 0.91, 0.77], // warm
  [0.79, 0.87, 1.0], // cool blue
];

/**
 * Star sprite: a hard bright core with a steep falloff (a point, not a dust
 * blob). `spikes` adds faint diffraction cross-streaks for the bright stars.
 */
function makeStarTexture(spikes: boolean): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  if (spikes) {
    // Two squashed radial gradients → thin horizontal/vertical streaks.
    for (const vertical of [false, true]) {
      ctx.save();
      ctx.translate(32, 32);
      if (vertical) ctx.rotate(Math.PI / 2);
      ctx.scale(1, 0.06);
      const streak = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      streak.addColorStop(0, 'rgba(255,255,255,0.85)');
      streak.addColorStop(0.4, 'rgba(210,225,255,0.3)');
      streak.addColorStop(1, 'rgba(210,225,255,0)');
      ctx.fillStyle = streak;
      ctx.fillRect(-32, -32, 64, 64);
      ctx.restore();
    }
  }

  const core = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(0.12, 'rgba(255,255,255,0.95)');
  core.addColorStop(0.3, 'rgba(215,228,255,0.28)');
  core.addColorStop(0.55, 'rgba(180,200,255,0.06)');
  core.addColorStop(1, 'rgba(160,180,255,0)');
  ctx.fillStyle = core;
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
    const colors = new Float32Array(count * 3);
    const baseX = new Float32Array(count);
    const speedY = new Float32Array(count);
    const phase = new Float32Array(count);
    // Per-star tint + brightness, and how fast/deep it twinkles.
    const tint = new Float32Array(count * 3);
    const base = new Float32Array(count);
    const twinkleSpeed = new Float32Array(count);
    const twinkleDepth = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      baseX[i] = (rand() * 2 - 1) * AREA.x;
      positions[i * 3] = baseX[i];
      positions[i * 3 + 1] = AREA.yMin + rand() * (AREA.yMax - AREA.yMin);
      positions[i * 3 + 2] = AREA.zMin + rand() * (AREA.zMax - AREA.zMin);
      speedY[i] = (0.3 + rand() * 0.7) * DRIFT_Y;
      phase[i] = rand() * Math.PI * 2;
      const t = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
      tint[i * 3] = t[0];
      tint[i * 3 + 1] = t[1];
      tint[i * 3 + 2] = t[2];
      base[i] = 0.55 + rand() * 0.45; // magnitude variety
      twinkleSpeed[i] = 0.8 + rand() * 2.2;
      twinkleDepth[i] = 0.25 + rand() * 0.45;
      colors[i * 3] = tint[i * 3] * base[i];
      colors[i * 3 + 1] = tint[i * 3 + 1] * base[i];
      colors[i * 3 + 2] = tint[i * 3 + 2] * base[i];
    }
    return {
      positions,
      colors,
      baseX,
      speedY,
      phase,
      tint,
      base,
      twinkleSpeed,
      twinkleDepth,
    };
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
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = geometry.attributes.color as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = pos[i * 3 + 1] + cloud.speedY[i] * dt;
      if (y > AREA.yMax) y = AREA.yMin;
      pos[i * 3] = cloud.baseX[i] + Math.sin(t * 0.15 + cloud.phase[i]) * SWAY;
      pos[i * 3 + 1] = y;
      // Twinkle: per-star brightness oscillation around its base magnitude.
      const tw =
        1 -
        cloud.twinkleDepth[i] *
          (0.5 + 0.5 * Math.sin(t * cloud.twinkleSpeed[i] + cloud.phase[i]));
      const b = cloud.base[i] * tw;
      col[i * 3] = cloud.tint[i * 3] * b;
      col[i * 3 + 1] = cloud.tint[i * 3 + 1] * b;
      col[i * 3 + 2] = cloud.tint[i * 3 + 2] * b;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[cloud.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        vertexColors
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
  const starTexture = useMemo(() => makeStarTexture(false), []);
  const brightTexture = useMemo(() => makeStarTexture(true), []);

  useEffect(() => {
    return () => {
      starTexture.dispose();
      brightTexture.dispose();
    };
  }, [starTexture, brightTexture]);

  return (
    <>
      {/* Faint field stars + a few bright ones with diffraction spikes */}
      <Cloud
        count={mobile ? 140 : 300}
        size={0.4}
        opacity={0.85}
        texture={starTexture}
      />
      <Cloud
        count={mobile ? 25 : 50}
        size={1.1}
        opacity={1}
        texture={brightTexture}
      />
    </>
  );
}
