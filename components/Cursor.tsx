'use client';

import { useEffect, useRef } from 'react';

const SIZE = 50;
// Trailing factor per frame — lower = lazier follow.
const LERP = 0.18;

/**
 * Custom cursor: a circle that inverts (mix-blend exclusion) and blurs
 * (backdrop-filter) whatever is beneath it, trailing the pointer with a lerp.
 * Only activates for fine pointers; the native cursor is hidden via the
 * `custom-cursor` body class while active.
 */
export default function Cursor() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const node = el.current;
    if (!node) return;

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let seen = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        // Snap to the first position so the circle doesn't fly in from a corner.
        seen = true;
        pos.x = target.x;
        pos.y = target.y;
        node.style.opacity = '1';
      }
    };
    const onLeave = () => {
      seen = false;
      node.style.opacity = '0';
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * LERP;
      pos.y += (target.y - pos.y) * LERP;
      node.style.transform = `translate3d(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.body.classList.add('custom-cursor');

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  return (
    <div
      ref={el}
      aria-hidden
      className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full bg-white mix-blend-exclusion backdrop-blur-[6px] blur-[20px] opacity-0 transition-opacity duration-200"
      style={{ width: SIZE, height: SIZE }}
    />
  );
}
