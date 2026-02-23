'use client';

import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useControls, Leva } from 'leva';
import { sceneConfig } from '@/config';
import { ReactNode, useEffect } from 'react';
import { Perf } from 'r3f-perf';

interface ExperienceProps {
  children?: ReactNode;
}

/**
 * Experience component - Master scene setup
 * Handles camera, lights, controls, and debug tools
 * All scene content should be nested inside this component
 */
export default function Experience({ children }: ExperienceProps) {
  // Leva debug controls
  const controls = useControls({
    // Camera controls
    cameraFov: { value: 75, min: 20, max: 120, step: 1 },
    cameraX: { value: sceneConfig.CAMERA_POSITION[0], min: -10, max: 10, step: 0.1 },
    cameraY: { value: sceneConfig.CAMERA_POSITION[1], min: -10, max: 10, step: 0.1 },
    cameraZ: { value: sceneConfig.CAMERA_POSITION[2], min: -20, max: 20, step: 0.1 },
    // Lighting controls
    ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    directionalIntensity: { value: 1, min: 0, max: 2, step: 0.1 },
    lightX: { value: 10, min: -20, max: 20, step: 1 },
    lightY: { value: 10, min: -20, max: 20, step: 1 },
    lightZ: { value: 5, min: -20, max: 20, step: 1 },
  });
  useEffect(() => {
    console.log(children);
  }, []);

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
      <ambientLight intensity={controls.ambientIntensity} />
      <directionalLight
        position={[controls.lightX, controls.lightY, controls.lightZ]}
        intensity={controls.directionalIntensity}
        castShadow
      />
      <pointLight position={[0, 5, 5]} intensity={0.5} />

      {/* Controls */}
      {sceneConfig.enableControls && <OrbitControls />}

      {/* Scene Content */}
      {sceneConfig.enableStats && <Perf position="top-left" />}
      
      {children}
    </>
  );
}
