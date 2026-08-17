'use client';

import { useEffect, useRef } from 'react';
import { experiences } from '@/data/portfolio';
import { PAGE_HEIGHTS_VH } from '@/constants';
import Parallax from '@/components/Parallax';

const PAGE_INDEX = 1;
// Entries light up when their dot crosses this fraction of the viewport
// height; the gradient line-fill tip tracks the same point.
const TRIGGER = 0.5;

export default function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The timeline scrolls naturally (no pinning); activation is measured from
  // the live viewport positions and written straight to the DOM.
  useEffect(() => {
    const update = () => {
      const list = listRef.current;
      const fill = fillRef.current;
      if (!list || !fill) return;
      const trigger = window.innerHeight * TRIGGER;
      const rect = list.getBoundingClientRect();
      fill.style.height = `${Math.max(0, Math.min(rect.height, trigger - rect.top))}px`;
      for (const el of itemRefs.current) {
        if (!el) continue;
        // Anchor on the dot (just below the entry top).
        const anchor = el.getBoundingClientRect().top + 14;
        el.style.opacity = anchor < trigger ? '1' : '0.25';
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section
      className="relative w-full"
      style={{ height: `${PAGE_HEIGHTS_VH[PAGE_INDEX]}vh` }}
      aria-label="Experience"
    >
      <div className="flex flex-col items-center px-6 pt-[14vh]">
        <div className="w-full max-w-3xl mb-[8vh]">
          <Parallax speed={0.35}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Experience
            </h2>
          </Parallax>
        </div>

        {/* Parallax wraps the whole timeline so the line, dots and entries
            drift together — activation is measured from live rects, so the
            light-up logic stays in sync. */}
        <Parallax speed={0.1} className="w-full max-w-3xl">
          <div ref={listRef} className="relative w-full">
          {/* Base line */}
          <div className="absolute top-1 bottom-0 left-[6.5rem] md:left-[14.5rem] w-px bg-white/10" />
          {/* Gradient fill chasing the activation point */}
          <div
            ref={fillRef}
            className="absolute top-1 left-[6.5rem] md:left-[14.5rem] w-px bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-600 shadow-[0_0_12px_rgba(67,97,238,0.9)]"
            style={{ height: 0 }}
          />

          {experiences.map((exp, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="grid grid-cols-[5.5rem_2rem_1fr] md:grid-cols-[13rem_3rem_1fr] items-start min-h-[42vh]"
              style={{ opacity: 0.25, transition: 'opacity 0.5s ease' }}
            >
              {/* Date — big, right-aligned against the line */}
              <p className="text-right text-base md:text-2xl font-bold tracking-tight text-white pt-0.5">
                {exp.period}
              </p>

              {/* Dot on the line (entry opacity dims it while inactive) */}
              <div className="flex justify-center pt-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
              </div>

              {/* Content — right of the line */}
              <div>
                <h3 className="text-base md:text-xl font-semibold leading-tight">
                  {exp.role}
                </h3>
                <p className="text-xs md:text-sm text-white/50 mb-2 md:mb-3">
                  {exp.company}
                </p>
                <ul className="space-y-1.5">
                  {exp.achievements.map((a, j) => (
                    <li
                      key={j}
                      className="text-xs md:text-sm text-white/60 leading-snug md:leading-relaxed pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-white/30"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          </div>
        </Parallax>
      </div>
    </section>
  );
}
