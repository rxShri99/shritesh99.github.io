'use client';

import React from 'react';
import { StrictMode } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import Experience from './Experience';
import { Leva } from 'leva';
import { sceneConfig } from '@/config';
import Ring from './Ring';
import { useDevMode } from '@/hooks/useDevMode';
import { Text3D, Center } from '@react-three/drei';
import { FontLoader } from 'three/addons/loaders/FontLoader';
export default function Scene() {
  const isDevMode = useDevMode();
  const font = useLoader(FontLoader, '/fonts/Splash-Regular.json');

  return (
    <StrictMode>
      {(isDevMode || sceneConfig.enableControls) && <Leva collapsed />}
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <Experience isDevMode={isDevMode}>
          <Ring />
          {/* <Suspense fallback={null}> */}
          <Center>
            <Text3D font={font} size={0.8} height={0.2}>
              hello
              <meshStandardMaterial color="hotpink" />
            </Text3D>
          </Center>
          {/* </Suspense> */}
        </Experience>
      </Canvas>
    </StrictMode>
  );
}
