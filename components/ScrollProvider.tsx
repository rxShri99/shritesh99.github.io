'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { useControls } from 'leva';

gsap.registerPlugin(ScrollTrigger);

// Scroll feel. Multipliers scale how far each wheel tick / touch flick
// travels; lerp is the glide laziness (lower = smoother, longer settle).
const SCROLL_DEFAULTS = {
  lerp: 0.1,
  wheelMultiplier: 0.65,
  touchMultiplier: 1.4,
};

declare global {
  interface Window {
    /** Exposed so overlays (WrapMenu) can lock scrolling via lenis.stop() */
    __lenis?: Lenis;
  }
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  // Tuning controls — the panel itself is gated by dev mode in page.tsx.
  const scrollCtl = useControls('Scroll', {
    lerp: { value: SCROLL_DEFAULTS.lerp, min: 0.02, max: 0.3, step: 0.005 },
    wheelMultiplier: {
      value: SCROLL_DEFAULTS.wheelMultiplier,
      min: 0.2,
      max: 2,
      step: 0.05,
    },
    touchMultiplier: {
      value: SCROLL_DEFAULTS.touchMultiplier,
      min: 0.5,
      max: 3,
      step: 0.1,
    },
  });

  // Apply live. `lerp` is read from options every frame; the multipliers are
  // copied into the internal VirtualScroll at construction, so write there —
  // recreating Lenis instead would tear down every ScrollTrigger.
  useEffect(() => {
    // Neither `options` nor `virtualScroll` are in Lenis's public types.
    const lenis = lenisRef.current as unknown as {
      options?: { lerp: number };
      virtualScroll?: { wheelMultiplier: number; touchMultiplier: number };
    } | null;
    if (!lenis) return;
    if (lenis.options) lenis.options.lerp = scrollCtl.lerp;
    if (lenis.virtualScroll) {
      lenis.virtualScroll.wheelMultiplier = scrollCtl.wheelMultiplier;
      lenis.virtualScroll.touchMultiplier = scrollCtl.touchMultiplier;
    }
  }, [scrollCtl.lerp, scrollCtl.wheelMultiplier, scrollCtl.touchMultiplier]);

  useEffect(() => {
    let lenis: Lenis | null = null;

    try {
      // Initialize Lenis (see SCROLL_DEFAULTS; live-tunable from Leva).
      lenis = new Lenis({
        ...SCROLL_DEFAULTS,
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
