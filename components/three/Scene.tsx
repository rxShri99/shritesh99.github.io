'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import Ring from './Ring';
import { useScroll } from '@/context/ScrollContext';
import { Preload } from '@react-three/drei';
import Loader from './Loader';

export default function Scene() {
  const { cameraY, currentPage, scrollProgress } = useScroll();

  return (
    <Canvas
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <Suspense fallback={<Loader />}>
        <Experience cameraY={cameraY}>
          <Ring currentPage={currentPage} scrollProgress={scrollProgress} />
        </Experience>
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
