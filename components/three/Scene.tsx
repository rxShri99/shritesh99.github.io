'use client';
import { StrictMode, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from './Experience';
import { Leva } from 'leva';
import { sceneConfig } from '@/config';
import Box  from "./Box";

function LoadingFallback() {
  return <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
      Loading 3D Scene...
    </div>;
}

export default function Scene() {
  return (
    <StrictMode>
      {sceneConfig.enableControls && <Leva collapsed/>}  
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Experience>
            <Box />
          </Experience>
        </Suspense>
      </Canvas>
    </StrictMode>
  );
}
