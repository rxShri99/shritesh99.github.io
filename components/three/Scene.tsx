'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import Ring from './Ring';
import { useScroll } from '@/context/ScrollContext';
import { Preload } from '@react-three/drei';
import Loader from './Loader';

interface SceneProps {
  isDevMode?: boolean;
}

export default function Scene({ isDevMode }: SceneProps) {
  const { cameraY, currentPage, scrollProgress } = useScroll();

  return (
    <Canvas
      // The rings are soft additive gradients — MSAA buys nothing visible and
      // costs bandwidth, which matters on phones at devicePixelRatio 2.
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <Suspense fallback={<Loader />}>
        <Experience cameraY={cameraY} isDevMode={isDevMode}>
          <Ring currentPage={currentPage} scrollProgress={scrollProgress} />
        </Experience>
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
