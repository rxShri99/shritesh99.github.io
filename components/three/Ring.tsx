'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
// import { ringVertexShader, ringFragmentShader } from '@/lib/shaders';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';
import { useControls } from 'leva';

const Ring = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const controls = useControls({
    directionalIntensity: { value: 2, min: 0, max: 2, step: 0.1 },
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

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsedTime;
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
      <directionalLight
        position={[controls.lightX, controls.lightY, controls.lightZ]}
        intensity={controls.directionalIntensity}
      />
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* <mesh>
        <torusGeometry args={[10, 0.4, 16, 100]} />
      </mesh> */}
        <mesh position={[0, 0, 3]}>
          <torusGeometry args={[9, 0.15, 16, 100]} />
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
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[6, 0.15, 16, 100]} />
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
        <mesh position={[0, 0, -3]}>
          <torusGeometry args={[3, 0.15, 16, 100]} />
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
      </group>
    </>
  );
};

export default Ring;
