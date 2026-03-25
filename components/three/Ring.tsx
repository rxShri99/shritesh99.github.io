'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { animated, useSpring } from '@react-spring/three';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';
import { useControls } from 'leva';

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

const RING_GROUP_WORLD_POSITION = new THREE.Vector3(0, 0, 0);
const Ring = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringSRef = useRef<THREE.Mesh>(null);
  const ringMRef = useRef<THREE.Mesh>(null);
  const ringLRef = useRef<THREE.Mesh>(null);
  const ringsGroupRef = useRef<THREE.Group>(null);

  const controls = useControls({
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
    ringSX: { value: 0, min: -20, max: 20, step: 0.1 },
    ringSY: { value: 0, min: -20, max: 20, step: 0.1 },
    ringSZ: { value: 3, min: -20, max: 20, step: 0.1 },
    ringMX: { value: 0, min: -20, max: 20, step: 0.1 },
    ringMY: { value: 0, min: -20, max: 20, step: 0.1 },
    ringMZ: { value: 0, min: -20, max: 20, step: 0.1 },
    ringLX: { value: 0, min: -20, max: 20, step: 0.1 },
    ringLY: { value: 0, min: -20, max: 20, step: 0.1 },
    ringLZ: { value: -3, min: -20, max: 20, step: 0.1 },
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

  const ringSIntroSpring = useSpring({
    from: {
      position: [controls.ringSX, controls.ringSY, controls.ringSZ] as [
        number,
        number,
        number,
      ],
    },
    to: {
      position: [controls.ringSX, controls.ringSY, controls.ringSZ - 6] as [
        number,
        number,
        number,
      ],
    },
    // loop: true,
    config: {
      // duration: controls.introDurationMs,
      mass: 5,
      tension: 10,
      friction: 5,
    },
  });

  const ringLIntroSpring = useSpring({
    from: {
      position: [controls.ringLX, controls.ringLY, controls.ringLZ] as [
        number,
        number,
        number,
      ],
    },
    to: {
      position: [controls.ringLX, controls.ringLY, controls.ringLZ + 6] as [
        number,
        number,
        number,
      ],
    },
    // loop: true,
    config: {
      // duration: controls.introDurationMs,
      mass: 5,
      tension: 10,
      friction: 5,
    },
  });

  useFrame((state) => {
    if (ringsGroupRef.current) {
      ringsGroupRef.current.getWorldPosition(RING_GROUP_WORLD_POSITION);
      state.camera.lookAt(RING_GROUP_WORLD_POSITION);
    }
    if (ringSRef.current) {
      ringSRef.current.rotation.z += controls.rotationSpeed / RADIUSES.ringS;
    }
    if (ringMRef.current) {
      ringMRef.current.rotation.z += controls.rotationSpeed / RADIUSES.ringM;
    }
    if (ringLRef.current) {
      ringLRef.current.rotation.z += controls.rotationSpeed / RADIUSES.ringL;
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
        <animated.mesh
          ref={ringSRef}
          scale={[RING_SCALES.ringS, RING_SCALES.ringS, RING_SCALES.ringS]}
          position={ringSIntroSpring.position}
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
        </animated.mesh>
        <animated.mesh
          ref={ringMRef}
          scale={[RING_SCALES.ringM, RING_SCALES.ringM, RING_SCALES.ringM]}
          position={[controls.ringMX, controls.ringMY, controls.ringMZ]}
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
        </animated.mesh>
        <animated.mesh
          ref={ringLRef}
          scale={[RING_SCALES.ringL, RING_SCALES.ringL, RING_SCALES.ringL]}
          position={ringLIntroSpring.position}
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
        </animated.mesh>
      </group>
    </>
  );
};

export default Ring;
