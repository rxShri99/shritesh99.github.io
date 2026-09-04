'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// Scroll feel. Multipliers scale how far each wheel tick / touch flick
// travels; lerp is the glide laziness (lower = smoother, longer settle).
const SCROLL_DEFAULTS = {
  lerp: 0.1,
  wheelMultiplier: 0.2,
  touchMultiplier: 0.8,
};

declare global {
  interface Window {
    /** Exposed so overlays (WrapMenu) can lock scrolling via lenis.stop() */
    __lenis?: Lenis;
  }
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let lenis: Lenis | null = null;

    try {
      lenis = new Lenis({
        ...SCROLL_DEFAULTS,
        infinite: false,
        smoothWheel: true
      });

      lenisRef.current = lenis;
      window.__lenis = lenis;

      // Connect GSAP ScrollTrigger to Lenis
      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time: number) => {
        lenis!.raf(time);
        requestAnimationFrame(raf);
      };

      requestAnimationFrame(raf);
    } catch (error) {
      console.error('Lenis initialization failed:', error);
      // Fallback: ensure ScrollTrigger still works without Lenis
      ScrollTrigger.addEventListener('refreshInit', () => {
        ScrollTrigger.refresh();
      });
    }

    // Refresh ScrollTrigger after a short delay to ensure all elements are rendered
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup
    return () => {
      if (lenis) {
        lenis.destroy();
        delete window.__lenis;
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
