/**
 * Application-wide constants
 */

export const APP_NAME = 'Portfolio';
export const APP_VERSION = '1.0.0';

/**
 * Development mode toggle
 */
export const NEXT_PUBLIC_DEV_MODE_KEY =
  process.env.NEXT_PUBLIC_DEV_MODE_KEY || 'h';
export const DEV_MODE_MODIFIER_KEYS = ['shift', 'meta', 'ctrl'] as const;

/**
 * Colour theme constants
 * Use in CSS (hex), React (e.g. style={{ color: COLOR_THEME.primary }}), and Three.js (new THREE.Color(COLOR_THEME.primary))
 */
export const COLOR_THEME = {
  background: '#000000',
  foreground: '#ffffff',
  primary: '#0066ff',
  secondary: '#4d00ff',
  accent: '#ff3366',
  muted: '#6b7280',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
} as const;

/** RGB [0–1] for shaders / Three.js materials (primary, secondary, accent) */
export const COLOR_THEME_RGB = {
  primary: [0, 0.4, 1] as [number, number, number],
  secondary: [0.3, 0, 1] as [number, number, number],
  accent: [1, 0.2, 0.4] as [number, number, number],
} as const;

/**
 * Height of each page section in vh units.
 * - Page 4 is 3x — horizontal card carousel with sticky pinning needs the extra scroll.
 * - Page 5 is 2x — page 4's lock stole one ring transition, so page 5 has to cover
 *   two keyframe transitions; 200vh keeps the per-transition pace matching pages 1-3.
 */
export const PAGE_HEIGHTS_VH = [100, 100, 100, 300, 200, 100] as const;

/**
 * Three.js scene constants
 */
export const SCENE_CONFIG = {
  BACKGROUND_COLOR: 0x000000,
  CAMERA_FOV: 50,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
} as const;

/**
 * Animation constants
 */
export const ANIMATION_DURATION = 0.6;
export const ANIMATION_EASE = 'easeInOutQuad';

/**
 * Performance constants
 */
export const PIXEL_RATIO =
  typeof window !== 'undefined' ? window.devicePixelRatio : 1;
export const MAX_PIXEL_RATIO = 2;
