'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';
import { useControls, folder } from 'leva';

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

// Z keyframes for pages 0-5
const PAGE_Z_POSITIONS = [204, 124, 45, -36, -118, -198];

// Per-page Z offsets from mid ring for S and L rings (0 = all rings at same Z)
const PAGE_OFFSETS_S = [-2.5, 0.5, 0, -2.5, -2.5, 2];
const PAGE_OFFSETS_L = [2.5, 0, 0, 2.5, 2.5, 4.0];

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
  [Math.PI * 0.9, Math.PI * 0.3],
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

  const controls = useControls({
    Ring: folder({
      'Ring Material': folder(
        {
          lightX: { value: 0, min: -50, max: 50, step: 1 },
          lightY: { value: 0, min: -50, max: 50, step: 1 },
          lightZ: { value: 10, min: -50, max: 50, step: 1 },
          baseOpacity: { value: 1.0, min: 0, max: 1, step: 0.01 },
          fresnelColor: '#4361EE',
          baseColor1: '#4361EE',
          baseColor2: '#fff',
          fresnelPower: { value: 3.5, min: 0, max: 10, step: 0.1 },
          fresnelStrength: { value: 5.0, min: 0, max: 10, step: 0.01 },
          fresnelBias: { value: 0.0, min: 0, max: 1, step: 0.01 },
          rotationSpeed: {
            value: 0.03,
            min: 0,
            max: 0.1,
            step: 0.001,
          },
        },
        { collapsed: true }
      ),
      'Ring Position': folder(
        {
          ringMY: { value: -86, min: -300, max: 300, step: 1 },
          'Page 1 Z': {
            value: PAGE_Z_POSITIONS[0],
            min: -500,
            max: 500,
            step: 1,
          },
          'Page 2 Z': {
            value: PAGE_Z_POSITIONS[1],
            min: -500,
            max: 500,
            step: 1,
          },
          'Page 3 Z': {
            value: PAGE_Z_POSITIONS[2],
            min: -500,
            max: 500,
            step: 1,
          },
          'Page 4 Z': {
            value: PAGE_Z_POSITIONS[3],
            min: -500,
            max: 500,
            step: 1,
          },
          'Page 5 Z': {
            value: PAGE_Z_POSITIONS[4],
            min: -500,
            max: 500,
            step: 1,
          },
          'Page 6 Z': {
            value: PAGE_Z_POSITIONS[5],
            min: -500,
            max: 500,
            step: 1,
          },
        },
        { collapsed: false }
      ),
    }),
  });

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
    const liveZ = [
      controls['Page 1 Z'],
      controls['Page 2 Z'],
      controls['Page 3 Z'],
      controls['Page 4 Z'],
      controls['Page 5 Z'],
      controls['Page 6 Z'],
    ];
    const targetZ = interpolate(liveZ, scrollProgress);
    if (ringMRef.current) {
      ringMRef.current.position.z = THREE.MathUtils.lerp(
        ringMRef.current.position.z,
        targetZ,
        0.1
      );
      ringMRef.current.position.y = controls.ringMY;
    }
    if (ringSRef.current) {
      const sOffset = interpolate(PAGE_OFFSETS_S, scrollProgress);
      ringSRef.current.position.z = THREE.MathUtils.lerp(
        ringSRef.current.position.z,
        targetZ + sOffset,
        0.1
      );
      ringSRef.current.position.y = controls.ringMY;
    }
    if (ringLRef.current) {
      const lOffset = interpolate(PAGE_OFFSETS_L, scrollProgress);
      ringLRef.current.position.z = THREE.MathUtils.lerp(
        ringLRef.current.position.z,
        targetZ + lOffset,
        0.1
      );
      ringLRef.current.position.y = controls.ringMY;
    }

    if (ringSRef.current) {
      ringSRef.current.rotation.z += controls.rotationSpeed / RADIUSES.ringS;
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
      ringMRef.current.rotation.z += controls.rotationSpeed / RADIUSES.ringM;
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
      ringLRef.current.rotation.z += controls.rotationSpeed / RADIUSES.ringL;
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
        .set(controls.lightX, controls.lightY, controls.lightZ)
        .normalize();
      materialRef.current.uniforms.uBaseOpacity.value = controls.baseOpacity;
      materialRef.current.uniforms.uFresnelPower.value = controls.fresnelPower;
      materialRef.current.uniforms.uFresnelStrength.value =
        controls.fresnelStrength;
      materialRef.current.uniforms.uFresnelBias.value = controls.fresnelBias;
      materialRef.current.uniforms.uFresnelColor.value.set(
        controls.fresnelColor
      );
      materialRef.current.uniforms.uBaseColor1.value.set(controls.baseColor1);
      materialRef.current.uniforms.uBaseColor2.value.set(controls.baseColor2);
    }
  });
  return (
    <>
      <group ref={ringsGroupRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          ref={ringSRef}
          scale={[RING_SCALES.ringS, RING_SCALES.ringS, RING_SCALES.ringS]}
          position={[
            0,
            controls.ringMY,
            PAGE_Z_POSITIONS[0] + PAGE_OFFSETS_S[0],
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
          position={[0, controls.ringMY, PAGE_Z_POSITIONS[0]]}
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
            0,
            controls.ringMY,
            PAGE_Z_POSITIONS[0] + PAGE_OFFSETS_L[0],
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
