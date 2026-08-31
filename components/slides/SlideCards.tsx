'use client';

import Link from 'next/link';
import { type MouseEvent } from 'react';
import type { SlideEntry } from '@/lib/slides';

interface SlideCardsProps {
  slides: SlideEntry[];
}

/**
 * Slide cards borrow the glass + cursor-glow language from the Projects
 * section — same backdrop, same lit border ring, same tilt-on-hover — so the
 * /slides listing reads as part of the same site, not a bolted-on page.
 */
export default function SlideCards({ slides }: SlideCardsProps) {
  const handleCardMove = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
    const nx = (x / r.width) * 2 - 1;
    const ny = (y / r.height) * 2 - 1;
    el.style.transform = `perspective(1100px) rotateX(${(-ny * 3).toFixed(2)}deg) rotateY(${(nx * 4).toFixed(2)}deg)`;
  };
  const handleCardLeave = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  return (
    <ul className="grid gap-8">
      {slides.map(({ slug, meta }) => (
        <li key={slug}>
          <Link
            href={`/slides/${slug}`}
            aria-label={meta.title}
            className="block"
          >
            <article
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              className="group relative w-full rounded-[28px] overflow-hidden will-change-transform hover:-translate-y-2 hover:shadow-[0_0_80px_-20px_rgba(67,97,238,0.5)]"
              style={{
                transition:
                  'transform 0.18s ease-out, translate 0.5s ease, box-shadow 0.5s ease',
              }}
            >
              {/* Glass backdrop */}
              <div
                className="absolute inset-0 rounded-[28px] bg-white/[0.04] backdrop-blur-xl md:backdrop-blur-[5px]"
                style={{ WebkitBackdropFilter: 'blur(10px)' }}
              />
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-500/[0.08] via-transparent to-purple-500/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Cursor-following glow spot */}
              <div
                className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(280px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(67, 97, 238, 0.2), transparent 65%)',
                }}
              />
              {/* Lit border ring around the cursor */}
              <div
                className="absolute inset-0 rounded-[28px] p-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(125, 155, 255, 0.9), transparent 70%)',
                  WebkitMask:
                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
              />

              <div className="relative p-7 md:p-10 flex flex-col gap-6 md:gap-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-block px-3.5 py-1.5 rounded-md bg-white/[0.08] backdrop-blur-md text-xs md:text-sm text-white/85 border border-white/10">
                    {meta.event}
                  </span>
                  <time className="text-xs md:text-sm text-white/50 whitespace-nowrap">
                    {meta.date}
                  </time>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                    {meta.title}
                  </h2>
                  {meta.description && (
                    <p className="text-sm md:text-lg text-white/55 leading-relaxed max-w-2xl">
                      {meta.description}
                    </p>
                  )}
                </div>

                <div className="flex">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/60 border border-white/10 text-sm text-white transition-colors group-hover:bg-black/80 group-hover:border-white/20">
                    View deck
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
