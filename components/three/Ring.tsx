'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { gsap } from 'gsap';
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

interface RingProps {
  currentPage: number;
}

const Ring = ({ currentPage }: RingProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringSRef = useRef<THREE.Mesh>(null);
  const ringMRef = useRef<THREE.Mesh>(null);
  const ringLRef = useRef<THREE.Mesh>(null);
  const ringsGroupRef = useRef<THREE.Group>(null);
  const previousPageRef = useRef(0);

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
    ringMY: { value: 10, min: -300, max: 300, step: 1 },
    ringMZ: { value: 245, min: -300, max: 300, step: 1 },
  });

  const ringSIntroSpring = useSpring({
    from: {
      position: [0, controls.ringMY, controls.ringMZ] as [
        number,
        number,
        number,
      ],
    },
    to: {
      position: [0, controls.ringMY, controls.ringMZ - 3] as [
        number,
        number,
        number,
      ],
    },
    config: {
      mass: 5,
      tension: 10,
      friction: 5,
    },
  });

  const ringLIntroSpring = useSpring({
    from: {
      position: [0, controls.ringMY, controls.ringMZ] as [
        number,
        number,
        number,
      ],
    },
    to: {
      position: [0, controls.ringMY, controls.ringMZ + 3] as [
        number,
        number,
        number,
      ],
    },
    config: {
      mass: 5,
      tension: 10,
      friction: 5,
    },
  });

  const scrollBasedPositions = useMemo(() => {
    const yPos = controls.ringMY;
    const xPos = 0;
    const zPos = controls.ringMZ;

    return {
      ringS: [xPos, yPos, zPos - 3] as [number, number, number],
      ringM: [xPos, yPos, zPos] as [number, number, number],
      ringL: [xPos, yPos, zPos + 3] as [number, number, number],
    };
  }, [controls.ringMY, controls.ringMZ]);

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

  // Animate middle ring Y position when page changes
  useEffect(() => {
    if (ringMRef.current && currentPage !== previousPageRef.current) {
      // Calculate target Y position based on current page
      // You can adjust these values to control the Y position for each page
      const pageYPositions = [10, 30, 50, 70, 90]; // Y positions for pages 0-4
      const targetY = pageYPositions[currentPage] || controls.ringMY;

      // Animate to the new Y position using GSAP
      gsap.to(ringMRef.current.position, {
        y: targetY,
        duration: 1.5, // Animation duration in seconds
        ease: 'power2.inOut', // Smooth easing function
        onUpdate: () => {
          // Optional: Update controls to reflect the new position
          controls.ringMY = ringMRef.current!.position.y;
        },
      });

      previousPageRef.current = currentPage;
    }
  }, [currentPage, controls]);

  useFrame(() => {
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
          position={scrollBasedPositions.ringM}
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
