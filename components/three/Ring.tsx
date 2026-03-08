'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
// import { ringVertexShader, ringFragmentShader } from '@/lib/shaders';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';
import { MeshTransmissionMaterial } from '@react-three/drei';

const Ring = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsedTime;
    }
  });
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[10, 0.4, 16, 100]} />
      </mesh>
      <mesh>
        <torusGeometry args={[10, 0.15, 16, 100]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={ringVertexShader}
          fragmentShader={ringFragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          depthWrite={false}
          transparent={true}
          uniforms={{
            uTime: { value: 0 },
          }}
        />
      </mesh>
    </group>
  );
};

export default Ring;
