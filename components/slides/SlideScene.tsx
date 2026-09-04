'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Ring from '@/components/three/Ring';
import Particles from '@/components/three/Particles';
import { PAGE_HEIGHTS_VH, SCENE_CONFIG } from '@/constants';
import type { ScrollSnapshot } from '@/context/ScrollContext';

// Lock the rings to the Community page pose (page index 4 of 8 on the main
// site). scrollProgress and cameraY here mirror what ScrollContext would emit
// at the top of that section, so the ring keyframes settle on the same layout.
const COMMUNITY_PAGE_INDEX = 4;
const NUM_PAGES = PAGE_HEIGHTS_VH.length;
const COMMUNITY_PROGRESS = COMMUNITY_PAGE_INDEX / (NUM_PAGES - 1);
const COMMUNITY_CAMERA_Y = 200 - COMMUNITY_PROGRESS * 400;
const CAMERA_ROT_X = 0.35;

// Hold the camera tilt every frame. Experience.tsx does the same on the main
// site; doing it here matches the ring pose and works around lint's rule
// against mutating the useThree() camera outside a frame callback.
function CameraHold() {
  useFrame((state) => {
    state.camera.rotation.x = CAMERA_ROT_X;
  });
  return null;
}

export default function SlideScene() {
  // Static snapshot: Ring's useFrame reads scrollRef.current, and here the
  // pose is locked to Community — no scroll to track.
  const scrollRef = useRef<ScrollSnapshot>({
    scrollProgress: COMMUNITY_PROGRESS,
    pageProgress: 0,
    scrollY: 0,
    cameraY: COMMUNITY_CAMERA_Y,
    currentPage: COMMUNITY_PAGE_INDEX,
  });

  return (
    <Canvas
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      camera={{
        position: [0, COMMUNITY_CAMERA_Y, 107.23],
        fov: SCENE_CONFIG.CAMERA_FOV,
        near: SCENE_CONFIG.CAMERA_NEAR,
        far: SCENE_CONFIG.CAMERA_FAR,
      }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Suspense fallback={null}>
        <CameraHold />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Ring scrollRef={scrollRef} entranceReady />
        <Particles />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
