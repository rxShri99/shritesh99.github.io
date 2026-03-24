'use client';

import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { sceneConfig } from '@/config';
import {
  ReactNode,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
} from 'react';
import { Perf } from 'r3f-perf';

interface ExperienceProps {
  children?: ReactNode;
  isDevMode?: boolean;
}

type LightProps = {
  lightX?: number;
  lightY?: number;
  lightZ?: number;
};

export default function Experience({ children, isDevMode }: ExperienceProps) {
  // Leva debug controls
  const controls = useControls({
    // Camera controls
    cameraFov: {
      value: sceneConfig.CAMERA_FOV,
      min: 20,
      max: 120,
      step: 1,
    },
    cameraX: {
      value: sceneConfig.CAMERA_POSITION[0],
      min: -30,
      max: 30,
      step: 0.1,
    },
    cameraY: {
      value: sceneConfig.CAMERA_POSITION[1],
      min: -30,
      max: 30,
      step: 0.1,
    },
    cameraZ: {
      value: sceneConfig.CAMERA_POSITION[2],
      min: -30,
      max: 30,
      step: 0.1,
    },
    // Lighting controls
    // ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
  });
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        fov={controls.cameraFov}
        near={0.1}
        far={1000}
        position={[controls.cameraX, controls.cameraY, controls.cameraZ]}
      />

      {/* Lighting */}
      {/* <ambientLight intensity={controls.ambientIntensity} /> */}

      {/* Controls */}
      {/* {sceneConfig.enableControls && <OrbitControls />} */}

      {(isDevMode || sceneConfig.enableControls) && (
        <Perf position="top-left" />
      )}
      {/* Scene Content */}
      {children}
    </>
  );
}
