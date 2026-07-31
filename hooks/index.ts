/**
 * Custom React hooks
 */

import { useEffect, useState, useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * Hook to detect if component is mounted (for SSR compatibility)
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/**
 * Hook to handle window resize events
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Hook to detect if device prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(MOTION_QUERY);
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false
  );
}
