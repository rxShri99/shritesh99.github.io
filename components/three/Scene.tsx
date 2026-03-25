'use client';

import React, { Suspense } from 'react';
import { StrictMode } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import { Leva } from 'leva';
import { sceneConfig } from '@/config';
import Ring from './Ring';
import { useDevMode } from '@/hooks/useDevMode';
import { Text, Center, Preload } from '@react-three/drei';
import Loader from './Loader';
import { animated, useSpring } from '@react-spring/three';

const AnimatedText = animated(Text);

export default function Scene() {
  const isDevMode = useDevMode();
  const fontSizeSpring = useSpring({
    from: {
      fontSize: 2
    },
    to: {
      fontSize: 3,
    },
    config: {
      mass: 5,
      tension: 10,
      friction: 5,
    },
  });
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
        <Suspense fallback={<Loader />}>
          <Experience isDevMode={isDevMode}>
            <Ring />
              <AnimatedText position={[0, 2, 0]}
                font="/fonts/Splash-Regular.ttf"
                color="white"
                fontSize={fontSizeSpring.fontSize}
              >
                I am a Passionate Developer!
              </AnimatedText>
          </Experience>
          <Preload all />
        </Suspense>
      </Canvas>
    </StrictMode>
  );
}
