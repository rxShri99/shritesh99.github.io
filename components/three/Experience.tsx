'use client';

import {
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { sceneConfig } from '@/config';
import { ReactNode, useRef, useEffect } from 'react';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';

interface ExperienceProps {
  children?: ReactNode;
  isDevMode?: boolean;
  cameraY: number;
}

function SceneSetup() {
  useEffect(() => {
    const currentUp = THREE.Object3D.DEFAULT_UP;
    if (currentUp.x !== 0 || currentUp.y !== 1 || currentUp.z !== 0) {
      THREE.Object3D.DEFAULT_UP.set(0, 1, 0);
    }
  }, []);

  return null;
}

export default function Experience({
  children,
  isDevMode,
  cameraY,
}: ExperienceProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const controls = useControls({
    cameraFov: {
      value: sceneConfig.CAMERA_FOV,
      min: 20,
      max: 120,
      step: 1,
    },
    ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
  });

  useFrame((state) => {
    const targetY = cameraY;
    const currentY = state.camera.position.y;
    const lerpFactor = 0.1;
    const newY = THREE.MathUtils.lerp(currentY, targetY, lerpFactor);

    state.camera.position.set(0, newY, 107.23);
    state.camera.lookAt(0, newY, 0);
  });
  return (
    <>
      <SceneSetup />
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        aspect={window.innerWidth / window.innerHeight}
        fov={controls.cameraFov}
        near={sceneConfig.CAMERA_NEAR}
        far={sceneConfig.CAMERA_FAR}
        position={[0, cameraY, 107.23]}
        up={[0, 1, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={controls.ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {(isDevMode || sceneConfig.enableControls) && (
        <>
          <Perf position="top-left" />
          <GizmoHelper alignment="top-left" margin={[80, 80]}>
            <GizmoViewport
              axisColors={['red', 'green', 'blue']}
              labelColor="white"
            />
          </GizmoHelper>
        </>
      )}
      {/* Scene Content */}
      {children}
    </>
  );
}
