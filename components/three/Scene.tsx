'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import Experience from './Experience';
import Ring from './Ring';
import Particles from './Particles';
import { useScroll } from '@/context/ScrollContext';
import { Preload } from '@react-three/drei';
import Loader from './Loader';

interface SceneProps {
  isDevMode?: boolean;
  /** Fired once the scene has drawn its first frame (shaders compiled). */
  onReady?: () => void;
  /** Gates the rings' entrance animation until the page loader hands off. */
  entranceReady?: boolean;
}

/** Calls onReady on the second frame — after the first draw completed, which
 *  is when the shaders have actually been compiled and rendered. */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 2) onReady?.();
  });
  return null;
}

export default function Scene({
  isDevMode,
  onReady,
  entranceReady,
}: SceneProps) {
  const { cameraY, scrollProgress } = useScroll();

  return (
    <Canvas
      // Keep MSAA: the rings' bright silhouette edges alias visibly without it.
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <Suspense fallback={<Loader />}>
        <Experience cameraY={cameraY} isDevMode={isDevMode}>
          <Ring scrollProgress={scrollProgress} entranceReady={entranceReady} />
          <Particles />
        </Experience>
        <Preload all />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
