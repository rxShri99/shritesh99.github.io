/**
 * Application-wide constants
 */

export const APP_NAME = 'Portfolio';
export const APP_VERSION = '1.0.0';

/**
 * Development mode toggle
 */
export const NEXT_PUBLIC_DEV_MODE_KEY = process.env.NEXT_PUBLIC_DEV_MODE_KEY || 'h';
export const DEV_MODE_MODIFIER_KEYS = ['shift', 'meta', 'ctrl'] as const;

/**
 * Three.js scene constants
 */
export const SCENE_CONFIG = {
  BACKGROUND_COLOR: 0x000000,
  CAMERA_FOV: 75,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
  CAMERA_POSITION: [0, 0, 5] as [number, number, number],
} as const;

/**
 * Animation constants
 */
export const ANIMATION_DURATION = 0.6;
export const ANIMATION_EASE = 'easeInOutQuad';

/**
 * Performance constants
 */
export const PIXEL_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
export const MAX_PIXEL_RATIO = 2;
