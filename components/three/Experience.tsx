'use client';

import {
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls, buttonGroup } from 'leva';
import { sceneConfig } from '@/config';
import { PAGE_HEIGHTS_VH } from '@/constants';
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

function scrollToPage(pageIndex: number) {
  const vh = window.innerHeight;
  let offsetVh = 0;
  for (let i = 0; i < pageIndex; i++) offsetVh += PAGE_HEIGHTS_VH[i];
  const target = offsetVh * vh;
  if (Math.abs(window.scrollY - target) < 2) {
    window.scrollTo({ top: target + 1 });
    requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }
}

export default function Experience({
  children,
  isDevMode,
  cameraY,
}: ExperienceProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const CAMERA = {
    fov: sceneConfig.CAMERA_FOV,
    ambientIntensity: 0.5,
    rotX: 0.35,
  };

  useControls('Navigate', {
    ' ': buttonGroup({
      '1': () => scrollToPage(0),
      '2': () => scrollToPage(1),
      '3': () => scrollToPage(2),
      '4': () => scrollToPage(3),
      '5': () => scrollToPage(4),
      '6': () => scrollToPage(5),
      '7': () => scrollToPage(6),
    }),
  });

  useFrame((state) => {
    const targetY = cameraY;
    const currentY = state.camera.position.y;
    const lerpFactor = 0.1;
    const newY = THREE.MathUtils.lerp(currentY, targetY, lerpFactor);

    state.camera.position.set(0, newY, 107.23);
    // state.camera.lookAt(0, newY, 0);
    state.camera.rotation.x = CAMERA.rotX;
  });
  return (
    <>
      <SceneSetup />
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        aspect={window.innerWidth / window.innerHeight}
        fov={CAMERA.fov}
        near={sceneConfig.CAMERA_NEAR}
        far={sceneConfig.CAMERA_FAR}
        position={[0, cameraY, 107.23]}
        up={[0, 1, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={CAMERA.ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {(isDevMode || sceneConfig.enableControls) && (
        <>
          <Perf position="top-left" />
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
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
