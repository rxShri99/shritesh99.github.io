/**
 * Three.js related utilities
 */

import { Vector3 } from 'three';

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Create a random Vector3
 */
export function randomVector3(scale: number = 1): Vector3 {
  return new Vector3(
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale
  );
}

/**
 * Create a random color in hex format
 */
export function randomColor(): number {
  return Math.floor(Math.random() * 16777215);
}

/**
 * Piecewise-linear interpolation across evenly spaced keyframes,
 * with progress in [0, 1] spanning the whole track.
 */
export function interpolateKeyframes(
  keyframes: number[],
  progress: number
): number {
  const scaled = progress * (keyframes.length - 1);
  const idx = Math.floor(scaled);
  const t = scaled - idx;
  const from = keyframes[Math.min(idx, keyframes.length - 1)];
  const to = keyframes[Math.min(idx + 1, keyframes.length - 1)];
  return from + (to - from) * t;
}
