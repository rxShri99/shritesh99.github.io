/**
 * Advanced debugging utilities for Three.js scenes
 */

import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import * as THREE from 'three';

interface DebugMetrics {
  fps: number;
  renderTime: number;
  geometries: number;
  textures: number;
  programs: number;
}

/**
 * Hook to capture and track scene metrics.
 *
 * Returns a ref rather than the value: metrics update every frame, so binding
 * them to state would trigger a re-render at 60fps. Read via `.current` in
 * event handlers or effects, not during render.
 */
export function useSceneMetrics(): RefObject<DebugMetrics> {
  const metricsRef = useRef<DebugMetrics>({
    fps: 0,
    renderTime: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
  });

  useFrame(({ gl }) => {
    const info = gl.info;
    metricsRef.current = {
      fps: Math.round(1000 / 16.67), // Approximate for 60fps
      renderTime: info.render.frame,
      geometries: info.memory.geometries || 0,
      textures: info.memory.textures || 0,
      programs: info.programs?.length || 0,
    };
  });

  return metricsRef;
}

/**
 * Helper to toggle wireframe mode on all materials
 */
export function toggleWireframe(scene: THREE.Scene, enabled: boolean) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((mat) => {
        if (mat instanceof THREE.Material && 'wireframe' in mat) {
          (mat as THREE.MeshStandardMaterial).wireframe = enabled;
        }
      });
    }
  });
}

/**
 * Helper to visualize scene axes
 */
export function addAxesHelper(scene: THREE.Scene, size: number = 5) {
  const axes = new THREE.AxesHelper(size);
  scene.add(axes);
  return axes;
}

/**
 * Helper to visualize camera frustum
 */
export function addCameraHelper(scene: THREE.Scene, camera: THREE.Camera) {
  if (camera instanceof THREE.PerspectiveCamera) {
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);
    return helper;
  }
}
