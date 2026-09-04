'use client';

import {
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  StatsGl,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls, buttonGroup } from 'leva';
import { sceneConfig } from '@/config';
import { PAGE_HEIGHTS_VH } from '@/constants';
import { ReactNode, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { ScrollSnapshot } from '@/context/ScrollContext';

interface ExperienceProps {
  children?: ReactNode;
  isDevMode?: boolean;
  /** Read scrollRef.current.cameraY each frame — no per-tick React props. */
  scrollRef: React.MutableRefObject<ScrollSnapshot>;
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
  // PAGE_HEIGHTS_VH values are in CSS vh units (100 = one viewport),
  // so divide by 100 to convert to pixels.
  let offsetVhCss = 0;
  for (let i = 0; i < pageIndex; i++) offsetVhCss += PAGE_HEIGHTS_VH[i];
  const target = (offsetVhCss / 100) * vh;
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
  scrollRef,
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
      '8': () => scrollToPage(7),
    }),
  });

  useFrame((state) => {
    const targetY = scrollRef.current.cameraY;
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
        position={[0, 200, 107.23]}
        up={[0, 1, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={CAMERA.ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {(isDevMode || sceneConfig.enableControls) && (
        <>
          <StatsGl trackGPU className="stats-gl" />
        </>
      )}
      {/* Scene Content */}
      {children}
    </>
  );
}
