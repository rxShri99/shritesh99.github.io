'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import Ring from './Ring';
import { useScroll } from '@/context/ScrollContext';
import { Preload, Text } from '@react-three/drei';
import Loader from './Loader';
import { animated, useSpring } from '@react-spring/three';
import { useControls } from 'leva';

const AnimatedText = animated(Text);

function AnimatedTextComponent() {
  const fontSizeSpring = useSpring({
    from: {
      fontSize: 2,
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

  const controls = useControls({
    y: {
      value: 275,
      min: -300,
      max: 300,
      step: 1,
    },
    z: {
      value: -80,
      min: -300,
      max: 300,
      step: 1,
    },
  });

  const position = useMemo<[number, number, number]>(() => {
    return [0, controls.y, controls.z];
  }, [controls.y, controls.z]);

  return (
    <AnimatedText
      position={position}
      font="/fonts/Splash-Regular.ttf"
      color="white"
      fontSize={fontSizeSpring.fontSize}
    >
      I am a Passionate Developer!
    </AnimatedText>
  );
}

export default function Scene() {
  const { cameraY, currentPage } = useScroll();

  return (
    // <StrictMode>
    <Canvas
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <Suspense fallback={<Loader />}>
        <Experience cameraY={cameraY}>
          <Ring currentPage={currentPage} />
          <AnimatedTextComponent />
        </Experience>
        <Preload all />
      </Suspense>
    </Canvas>
    // </StrictMode>
  );
}
