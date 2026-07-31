/**
 * Utility functions for common operations
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

/**
 * Normalize a value between min and max to 0-1 range
 */
export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Check if device supports WebGL
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/**
 * Debounce a function
 */
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => unknown,
  delay: number
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: TArgs) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<TArgs extends unknown[]>(
  func: (...args: TArgs) => unknown,
  limit: number
): (...args: TArgs) => void {
  let inThrottle = false;
  return (...args: TArgs) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
