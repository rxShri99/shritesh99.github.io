'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxProps {
  children: React.ReactNode;
  /**
   * Drift strength: y sweeps from +speed*100px to -speed*100px while the
   * trigger crosses the viewport. Higher = faster than the page; negative
   * reverses the direction. Mixing speeds within a section creates depth.
   */
  speed?: number;
  /**
   * 'self' animates against the element's own viewport traversal.
   * 'section' scrubs across the closest <section> instead — use this for
   * elements inside sticky/pinned layouts, where the element itself never
   * moves through the viewport.
   */
  trigger?: 'self' | 'section';
  className?: string;
}

export default function Parallax({
  children,
  speed = 0.25,
  trigger = 'self',
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const triggerEl =
      trigger === 'section' ? (el.closest('section') ?? el) : el;
    const distance = speed * 100;

    const tween = gsap.fromTo(
      el,
      { y: distance },
      {
        y: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed, trigger]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
