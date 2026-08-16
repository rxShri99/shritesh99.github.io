'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { SlideEntry } from '@/lib/slides';

/** How far outside a card the pointer can be before its glow dies out (px). */
const GLOW_REACH = 260;

interface SlideCardsProps {
  slides: SlideEntry[];
}

/**
 * The glow is driven from a single window-level pointer listener rather than
 * per-card enter/leave handlers: every card reads the same pointer position, so
 * neighbours light up as the cursor passes near them instead of only the one
 * being hovered. Each card gets `--glow-x/--glow-y` in its own coordinate space
 * plus a proximity-based `--glow-opacity`; the visuals live in `.glow-card`.
 */
export default function SlideCards({ slides }: SlideCardsProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Touch devices have no hover position to follow.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cards = Array.from(list.querySelectorAll<HTMLElement>('.glow-card'));
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frame = 0;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${pointerX - rect.left}px`);
        card.style.setProperty('--glow-y', `${pointerY - rect.top}px`);

        // Distance to the card's edge, 0 while the pointer is inside it.
        const gapX = Math.max(rect.left - pointerX, 0, pointerX - rect.right);
        const gapY = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom);
        const falloff = 1 - Math.hypot(gapX, gapY) / GLOW_REACH;
        card.style.setProperty('--glow-opacity', `${Math.max(falloff, 0)}`);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const dim = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      for (const card of cards) card.style.setProperty('--glow-opacity', '0');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', dim);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', dim);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [slides]);

  return (
    <ul ref={listRef} className="grid gap-5">
      {slides.map(({ slug, meta }) => (
        <li key={slug} className="glow-card">
          <Link
            href={`/slides/${slug}`}
            className="group relative block rounded-[inherit] p-6 md:p-8"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-white/50">
                  {meta.event}
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  {meta.title}
                </h2>
              </div>
              <time className="text-sm text-white/50 whitespace-nowrap md:text-right">
                {meta.date}
              </time>
            </div>

            {meta.description && (
              <p className="mt-3 text-white/60 leading-relaxed">
                {meta.description}
              </p>
            )}

            <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 transition-colors group-hover:text-white">
              View deck
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
