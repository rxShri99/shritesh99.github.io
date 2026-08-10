'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

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
      // Initialize Lenis
      lenis = new Lenis({
        lerp: 0.15,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
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
