'use client';

import { StrictMode, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from './Experience';
import { Leva } from 'leva';
import { sceneConfig } from '@/config';
import Ring from './Ring';
import { useDevMode } from '@/hooks/useDevMode';

function LoadingFallback() {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
      Loading 3D Scene...
    </div>
  );
}

export default function Scene() {
  const isDevMode = useDevMode();

  return (
    <StrictMode>
      {(isDevMode || sceneConfig.enableControls) && <Leva />}
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Experience isDevMode={isDevMode}>
            <Ring />
          </Experience>
        </Suspense>
      </Canvas>
    </StrictMode>
  );
}
