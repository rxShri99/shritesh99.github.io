'use client';

import { type MouseEvent } from 'react';
import { projects } from '@/data/portfolio';
import { useScroll } from '@/context/ScrollContext';
import { PAGE_HEIGHTS_VH } from '@/constants';

const PAGE_INDEX = 2;
const SECTION_VH = PAGE_HEIGHTS_VH[PAGE_INDEX];
// Each card owns a 100vh scroll slot (its wrapper); whatever the section has
// beyond N*100vh is settle room where the finished stack rests before the
// sticky release. Card i+1 covers card i while the scroll sweeps its slot.
const SLOT_VH = 100;

export default function Projects() {
  const { currentPage, pageProgress } = useScroll();

  // Feed the cursor position (card-local px) to CSS vars for the glow spot /
  // lit border, and tilt the card toward the cursor (mouse parallax). Written
  // straight to the DOM — no re-renders.
  const handleCardMove = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
    const nx = (x / r.width) * 2 - 1; // -1 .. 1 across the card
    const ny = (y / r.height) * 2 - 1;
    el.style.transform = `perspective(1100px) rotateX(${(-ny * 4).toFixed(2)}deg) rotateY(${(nx * 5).toFixed(2)}deg)`;
  };
  const handleCardLeave = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  // Scroll depth into this section, in vh units.
  const scrollVh =
    (currentPage < PAGE_INDEX
      ? 0
      : currentPage > PAGE_INDEX
        ? 1
        : pageProgress) * SECTION_VH;

  return (
    <section
      className="relative w-full"
      style={{ height: `${SECTION_VH}vh` }}
      aria-label="Projects"
    >
      {projects.map((project, i) => {
        const primaryLink = project.live || project.github;
        const primaryLabel = project.live ? 'Explore' : 'View';
        // How far the NEXT card has slid up over this one (0 → 1).
        const covered =
          i < projects.length - 1
            ? Math.max(0, Math.min(1, scrollVh / SLOT_VH - i))
            : 0;
        return (
          <div
            key={project.title}
            className="sticky top-0 h-screen flex items-center justify-center px-6"
          >
            {/* Heading rides the first wrapper — it stays pinned beneath the
                stack since later wrappers are transparent outside their card */}
            {i === 0 && (
              <div className="absolute top-0 inset-x-0 pt-14 md:pt-20 flex justify-center px-6">
                <div className="max-w-2xl w-full">
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Projects
                  </h2>
                </div>
              </div>
            )}

            {/* Covered cards ease back and dim as the next one slides over */}
            {/* NO filter here — an ancestor filter (even identity) forms a
                backdrop root that blinds the card's backdrop-blur. Dimming is
                done by a veil inside the card instead. */}
            <div
              className="will-change-transform"
              style={{
                transform: `scale(${1 - 0.06 * covered})`,
                transition: 'transform 0.15s linear',
              }}
            >
              <article
                onMouseMove={handleCardMove}
                onMouseLeave={handleCardLeave}
                className="group relative w-[88vw] sm:w-[560px] md:w-[760px] h-[58vh] md:h-[60vh] rounded-[28px] overflow-hidden will-change-transform hover:-translate-y-2 hover:shadow-[0_0_80px_-20px_rgba(67,97,238,0.5)]"
                style={{
                  // Snappy tilt; lazier hover lift + glow (translate is a
                  // separate property from transform in Tailwind v4).
                  transition:
                    'transform 0.18s ease-out, translate 0.5s ease, box-shadow 0.5s ease',
                }}
                aria-label={project.title}
              >
                {/* Glass backdrop — light tint + soft blur, no border. */}
                <div
                  className="absolute inset-0 rounded-[28px] bg-white/[0.04] backdrop-blur-[5px]"
                  style={{ WebkitBackdropFilter: 'blur(10px)' }}
                />
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/5 via-transparent to-transparent" />
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

                <div className="relative h-full p-7 md:p-10 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3.5 py-1.5 rounded-md bg-white/[0.08] backdrop-blur-md text-xs md:text-sm text-white/85 border border-white/10">
                      {project.tech[0]}
                    </span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-sm md:text-lg text-white/55 leading-relaxed max-w-2xl">
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
            </div>
          </div>
        );
      })}
      {/* Settle room: the finished stack rests here before the sticky release */}
      <div style={{ height: `${SECTION_VH - projects.length * SLOT_VH}vh` }} />
    </section>
  );
}
