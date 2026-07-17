'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';

const RADIUSES = {
  ringS: 3,
  ringM: 6,
  ringL: 9,
};
const BASE_RADIUS = RADIUSES.ringM;
const RING_SCALES = {
  ringS: RADIUSES.ringS / BASE_RADIUS,
  ringM: 1,
  ringL: RADIUSES.ringL / BASE_RADIUS,
};

interface RingProps {
  currentPage: number;
  scrollProgress: number;
}

// Responsive ring Y: f(aspect ratio)
// Fit from: iPhone SE(0.56→-70), iPhone 13 PM(0.46→-67), iPad Pro(0.70→-78), MacBook Air(1.64→-88)
// p1Y ≈ -62 - 16 * (w/h)
function getRingY(w: number, h: number): number {
  return -62 - 16 * (w / h);
}

// Responsive ring Z for page 1: f(width)
// Fit from: 375→220, 428→220, 581→212, 1599→206
// p1Z ≈ 222.5 - 0.011 * w, clamped to [206, 220]
function getRingZ(w: number): number {
  return THREE.MathUtils.clamp(222.5 - 0.011 * w, 206, 220);
}

// Responsive ring Y for page 6: f(aspect ratio)
// Fit from: iPhone 13 PM(0.46→-61), iPhone SE(0.56→-71), iPad Pro(0.70→-76), MacBook Air(1.64→-88)
// p6Y ≈ -58 - 19 * (w/h)
function getP6Y(w: number, h: number): number {
  return -58 - 19 * (w / h);
}

// Responsive ring Z for page 6: f(aspect ratio)
// Fit from: iPhone 13 PM(0.46→-186), iPhone SE(0.56→-189), iPad Pro(0.70→-192), MacBook Air(1.64→-196)
// p6Z ≈ -185 - 7 * (w/h)
function getP6Z(w: number, h: number): number {
  return -185 - 7 * (w / h);
}

// Static Z keyframes for pages 2-5 (constant across all screen sizes)
const PAGE_Z_REST = [124, 45, -36, -118];

// X keyframes for pages 0-5
const PAGE_X_POSITIONS = [0, 0, 0, 0, 0, 0];

// Per-page X offsets from mid ring for S and L rings
const PAGE_X_OFFSETS_S = [0, 0, 0, 0, 0, 0];
const PAGE_X_OFFSETS_L = [0, 1, 0, 0, 0, 0];

// Per-page Z offsets from mid ring for S and L rings (0 = all rings at same Z)
const PAGE_OFFSETS_S = [-2.5, 0.5, 0, -2.5, -2.5, 2];
const PAGE_OFFSETS_L = [2.5, 1.5, 0, 2.5, 2.5, 4.0];

// Per-page rotation angles [x, y] in radians for each ring
const PAGE_ROTATIONS_S: [number, number][] = [
  [0, 0],
  [0, -Math.PI * 0.15],
  [0, 0],
  [Math.PI / 3, Math.PI / 4],
  [0, Math.PI / 2],
  [0, 0],
];
const PAGE_ROTATIONS_M: [number, number][] = [
  [0, 0],
  [0, Math.PI * 0.15],
  [Math.PI / 6, Math.PI / 3],
  [Math.PI / 4, 0],
  [Math.PI / 6, Math.PI / 6],
  [0, 0],
];
const PAGE_ROTATIONS_L: [number, number][] = [
  [0, 0],
  [Math.PI * 1.3, Math.PI * 0.8],
  [0, -Math.PI / 4],
  [Math.PI / 6, -Math.PI / 4],
  [-Math.PI / 4, 0],
  [0, 0],
];

function interpolate(keyframes: number[], progress: number): number {
  const scaled = progress * (keyframes.length - 1);
  const idx = Math.floor(scaled);
  const t = scaled - idx;
  const from = keyframes[Math.min(idx, keyframes.length - 1)];
  const to = keyframes[Math.min(idx + 1, keyframes.length - 1)];
  return from + (to - from) * t;
}

const Ring = ({ currentPage, scrollProgress }: RingProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringSRef = useRef<THREE.Mesh>(null);
  const ringMRef = useRef<THREE.Mesh>(null);
  const ringLRef = useRef<THREE.Mesh>(null);
  const ringsGroupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  const RING_MATERIAL = {
    lightX: 0,
    lightY: 0,
    lightZ: 10,
    baseOpacity: 1.0,
    fresnelColor: '#4361EE',
    baseColor1: '#4361EE',
    baseColor2: '#fff',
    fresnelPower: 3.5,
    fresnelStrength: 5.0,
    fresnelBias: 0.0,
    rotationSpeed: 0.03,
  };

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0, 1, 0) },
      uBaseOpacity: { value: 1.0 },
      uFresnelColor: { value: new THREE.Color('#4361EE') },
      uBaseColor1: { value: new THREE.Color('#4361EE') },
      uBaseColor2: { value: new THREE.Color('#fff') },
      uFresnelPower: { value: 3.5 },
      uFresnelStrength: { value: 5.0 },
      uFresnelBias: { value: 0.0 },
    }),
    []
  );
  const sharedRingGeometry = useMemo(
    () => new THREE.TorusGeometry(BASE_RADIUS, 0.15, 16, 100),
    []
  );

  useEffect(() => {
    return () => {
      sharedRingGeometry.dispose();
    };
  }, [sharedRingGeometry]);

  useFrame(() => {
    const ringY = getRingY(size.width, size.height);
    const ringZ = getRingZ(size.width);
    const p6Y = getP6Y(size.width, size.height);
    const p6Z = getP6Z(size.width, size.height);
    const pageZ = [ringZ, ...PAGE_Z_REST, p6Z];

    const targetX = interpolate(PAGE_X_POSITIONS, scrollProgress);
    const targetZ = interpolate(pageZ, scrollProgress);
    // Blend Y from page 1 value toward page 6 value across scroll
    const targetY = ringY + (p6Y - ringY) * scrollProgress;
    if (ringMRef.current) {
      ringMRef.current.position.x = THREE.MathUtils.lerp(
        ringMRef.current.position.x,
        targetX,
        0.1
      );
      ringMRef.current.position.z = THREE.MathUtils.lerp(
        ringMRef.current.position.z,
        targetZ,
        0.1
      );
      ringMRef.current.position.y = targetY;
    }
    if (ringSRef.current) {
      const sXOffset = interpolate(PAGE_X_OFFSETS_S, scrollProgress);
      const sOffset = interpolate(PAGE_OFFSETS_S, scrollProgress);
      ringSRef.current.position.x = THREE.MathUtils.lerp(
        ringSRef.current.position.x,
        targetX + sXOffset,
        0.1
      );
      ringSRef.current.position.z = THREE.MathUtils.lerp(
        ringSRef.current.position.z,
        targetZ + sOffset,
        0.1
      );
      ringSRef.current.position.y = targetY;
    }
    if (ringLRef.current) {
      const lXOffset = interpolate(PAGE_X_OFFSETS_L, scrollProgress);
      const lOffset = interpolate(PAGE_OFFSETS_L, scrollProgress);
      ringLRef.current.position.x = THREE.MathUtils.lerp(
        ringLRef.current.position.x,
        targetX + lXOffset,
        0.1
      );
      ringLRef.current.position.z = THREE.MathUtils.lerp(
        ringLRef.current.position.z,
        targetZ + lOffset,
        0.1
      );
      ringLRef.current.position.y = targetY;
    }

    if (ringSRef.current) {
      ringSRef.current.rotation.z += RING_MATERIAL.rotationSpeed / RADIUSES.ringS;
      const sTargetX = interpolate(
        PAGE_ROTATIONS_S.map((r) => r[0]),
        scrollProgress
      );
      const sTargetY = interpolate(
        PAGE_ROTATIONS_S.map((r) => r[1]),
        scrollProgress
      );
      ringSRef.current.rotation.x = THREE.MathUtils.lerp(
        ringSRef.current.rotation.x,
        sTargetX,
        0.05
      );
      ringSRef.current.rotation.y = THREE.MathUtils.lerp(
        ringSRef.current.rotation.y,
        sTargetY,
        0.05
      );
    }
    if (ringMRef.current) {
      ringMRef.current.rotation.z += RING_MATERIAL.rotationSpeed / RADIUSES.ringM;
      const mTargetX = interpolate(
        PAGE_ROTATIONS_M.map((r) => r[0]),
        scrollProgress
      );
      const mTargetY = interpolate(
        PAGE_ROTATIONS_M.map((r) => r[1]),
        scrollProgress
      );
      ringMRef.current.rotation.x = THREE.MathUtils.lerp(
        ringMRef.current.rotation.x,
        mTargetX,
        0.05
      );
      ringMRef.current.rotation.y = THREE.MathUtils.lerp(
        ringMRef.current.rotation.y,
        mTargetY,
        0.05
      );
    }
    if (ringLRef.current) {
      ringLRef.current.rotation.z += RING_MATERIAL.rotationSpeed / RADIUSES.ringL;
      const lTargetX = interpolate(
        PAGE_ROTATIONS_L.map((r) => r[0]),
        scrollProgress
      );
      const lTargetY = interpolate(
        PAGE_ROTATIONS_L.map((r) => r[1]),
        scrollProgress
      );
      ringLRef.current.rotation.x = THREE.MathUtils.lerp(
        ringLRef.current.rotation.x,
        lTargetX,
        0.05
      );
      ringLRef.current.rotation.y = THREE.MathUtils.lerp(
        ringLRef.current.rotation.y,
        lTargetY,
        0.05
      );
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uLightDir.value
        .set(RING_MATERIAL.lightX, RING_MATERIAL.lightY, RING_MATERIAL.lightZ)
        .normalize();
      materialRef.current.uniforms.uBaseOpacity.value = RING_MATERIAL.baseOpacity;
      materialRef.current.uniforms.uFresnelPower.value = RING_MATERIAL.fresnelPower;
      materialRef.current.uniforms.uFresnelStrength.value =
        RING_MATERIAL.fresnelStrength;
      materialRef.current.uniforms.uFresnelBias.value = RING_MATERIAL.fresnelBias;
      materialRef.current.uniforms.uFresnelColor.value.set(
        RING_MATERIAL.fresnelColor
      );
      materialRef.current.uniforms.uBaseColor1.value.set(RING_MATERIAL.baseColor1);
      materialRef.current.uniforms.uBaseColor2.value.set(RING_MATERIAL.baseColor2);
    }
  });
  return (
    <>
      <group ref={ringsGroupRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          ref={ringSRef}
          scale={[RING_SCALES.ringS, RING_SCALES.ringS, RING_SCALES.ringS]}
          position={[
            PAGE_X_POSITIONS[0],
            0,
            PAGE_OFFSETS_S[0],
          ]}
        >
          <primitive object={sharedRingGeometry} attach="geometry" />
          <shaderMaterial
            ref={materialRef}
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
        <mesh
          ref={ringMRef}
          scale={[RING_SCALES.ringM, RING_SCALES.ringM, RING_SCALES.ringM]}
          position={[PAGE_X_POSITIONS[0], 0, 0]}
        >
          <primitive object={sharedRingGeometry} attach="geometry" />
          <shaderMaterial
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
        <mesh
          ref={ringLRef}
          scale={[RING_SCALES.ringL, RING_SCALES.ringL, RING_SCALES.ringL]}
          position={[
            PAGE_X_POSITIONS[0],
            0,
            PAGE_OFFSETS_L[0],
          ]}
        >
          <primitive object={sharedRingGeometry} attach="geometry" />
          <shaderMaterial
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
      </group>
    </>
  );
};

export default Ring;
