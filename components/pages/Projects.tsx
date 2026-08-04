'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { projects } from '@/data/portfolio';
import { useScroll } from '@/context/ScrollContext';
import { PAGE_HEIGHTS_VH } from '@/constants';

const PAGE_INDEX = 2;
// Sticky element (h-screen = 100vh) only pins for (sectionHeight - 100vh) of scroll.
// So horizontal translation must complete within pageProgress ∈ [0, STICKY_FRACTION].
const STICKY_FRACTION =
  (PAGE_HEIGHTS_VH[PAGE_INDEX] - 100) / PAGE_HEIGHTS_VH[PAGE_INDEX];

export default function Projects() {
  const { currentPage, pageProgress } = useScroll();
  const trackRef = useRef<HTMLDivElement>(null);
  const [sidePad, setSidePad] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const firstCard = track?.children[0] as HTMLElement | undefined;
      if (!track || !firstCard) return;
      const vw = window.innerWidth;
      // Left pad = vw - cardWidth so card 1 starts on the right of the viewport.
      // No right pad — track ends with last card right-aligned to the viewport
      // (which is when we hand off to page 5).
      const pad = Math.max(0, vw - firstCard.offsetWidth);
      setSidePad(pad);
      requestAnimationFrame(() => {
        const total = track.getBoundingClientRect().width;
        setMaxTranslate(Math.max(0, total - vw));
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Feed the cursor position (card-local px) to CSS vars so the glow spot and
  // lit border ring track it. Written straight to the DOM — no re-renders.
  const handleGlowMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--glow-x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--glow-y', `${e.clientY - r.top}px`);
  };

  // Horizontal reveal must finish before the sticky container releases, otherwise
  // page 5 slides up while cards are only partway through their scroll.
  const local =
    currentPage < PAGE_INDEX
      ? 0
      : currentPage > PAGE_INDEX
        ? 1
        : Math.min(1, pageProgress / STICKY_FRACTION);
  const translateX = -local * maxTranslate;

  return (
    <section
      className="relative w-full"
      style={{ height: '300vh' }}
      aria-label="Projects"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-20">
        {/* Same heading position as the other pages: flex-centered max-w-2xl column */}
        <div className="w-full flex justify-center px-6 mb-10 md:mb-16">
          <div className="max-w-2xl w-full">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Projects
            </h2>
          </div>
        </div>

        <div className="relative w-full">
          <div
            ref={trackRef}
            className="flex gap-6 md:gap-8 w-max will-change-transform"
            style={{
              paddingLeft: sidePad,
              transform: `translate3d(${translateX}px, 0, 0)`,
              transition: 'transform 0.15s linear',
            }}
          >
            {projects.map((project) => {
              const primaryLink = project.live || project.github;
              const primaryLabel = project.live ? 'Explore' : 'View';
              return (
                <article
                  key={project.title}
                  onMouseMove={handleGlowMove}
                  className="group relative shrink-0 w-[340px] sm:w-[420px] md:w-[500px] h-[440px] md:h-[520px] rounded-[28px] overflow-hidden transition-[transform,box-shadow] duration-500 will-change-transform hover:-translate-y-2 hover:shadow-[0_0_80px_-20px_rgba(67,97,238,0.5)]"
                  aria-label={project.title}
                >
                  <div className="absolute inset-0 rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/10" />
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-500/[0.08] via-transparent to-purple-500/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Glow spot following the cursor inside the card */}
                  <div
                    className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(280px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(67, 97, 238, 0.2), transparent 65%)',
                    }}
                  />
                  {/* Border ring lit around the cursor: gradient masked to the 1px inset */}
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

                  <div className="relative h-full p-7 md:p-8 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-3.5 py-1.5 rounded-md bg-white/[0.08] backdrop-blur-md text-xs md:text-sm text-white/85 border border-white/10">
                        {project.tech[0]}
                      </span>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-sm md:text-base text-white/55 leading-relaxed">
                        {project.description}
                      </p>
                      {project.tech.length > 1 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {project.tech.slice(1).map((t) => (
                            <span
                              key={t}
                              className="text-[11px] md:text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/55 border border-white/10"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {primaryLink && (
                        <a
                          href={primaryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/60 border border-white/10 text-sm text-white hover:bg-black/80 hover:border-white/20 transition-colors"
                        >
                          {primaryLabel}
                          <span aria-hidden>&rarr;</span>
                        </a>
                      )}
                      {project.github && project.live && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
