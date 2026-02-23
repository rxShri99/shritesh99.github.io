'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { Leva } from 'leva';
import Experience from './Experience';
import Box from './Box';
import { sceneConfig } from '@/config';

function LoadingFallback() {
  return null;
}


export default function Scene() {
    useEffect(() => {
        console.log(sceneConfig.enableStats)
    }, []);
  return (
    <>
      {sceneConfig.enableStats && <Leva collapsed={false} />}
      <Canvas
        style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <Experience>
        <Suspense fallback={<LoadingFallback />}>
          <Box />
        </Suspense>
      </Experience>
      
    </Canvas>
    </>
  );
}
