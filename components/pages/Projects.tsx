'use client';

import { type CSSProperties, type MouseEvent } from 'react';
import { projects } from '@/data/portfolio';
import Parallax from '@/components/Parallax';
import { useDevMode } from '@/hooks/useDevMode';

// Seconds for one full loop (one half of the track).
const MARQUEE_DURATION = 45;

export default function Projects() {
  const isDevMode = useDevMode();

  // Feed the cursor position (card-local px) to CSS vars for the glow spot /
  // lit border, and tilt the card toward the cursor (mouse parallax). Written
  // straight to the DOM — no re-renders. Dev mode drops the tilt (keeps the
  // glow) so cards don't lurch under the pointer while tuning.
  const handleCardMove = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
    if (isDevMode) {
      el.style.transform = '';
      return;
    }
    const nx = (x / r.width) * 2 - 1; // -1 .. 1 across the card
    const ny = (y / r.height) * 2 - 1;
    el.style.transform = `perspective(1100px) rotateX(${(-ny * 4).toFixed(2)}deg) rotateY(${(nx * 5).toFixed(2)}deg)`;
  };
  const handleCardLeave = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  return (
    <section
      className="relative w-full min-h-screen flex flex-col justify-center py-20"
      aria-label="Projects"
    >
      {/* Same heading position as the other pages: flex-centered column */}
      <div className="w-full flex justify-center px-6 mb-10 md:mb-14">
        <div className="max-w-2xl w-full">
          <Parallax speed={0.3}>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Projects
            </h2>
          </Parallax>
        </div>
      </div>

      {/* Infinite marquee: two identical halves so the -50% keyframe loops
          seamlessly. Pauses on hover so the cards stay readable/clickable. */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className="marquee-track flex w-max hover:[animation-play-state:paused]"
          style={
            { '--marquee-duration': `${MARQUEE_DURATION}s` } as CSSProperties
          }
        >
          {[0, 1].map((half) => (
            <div
              key={half}
              aria-hidden={half === 1}
              // The duplicate half is decoration — keep its links unfocusable.
              inert={half === 1 || undefined}
              className="flex gap-6 md:gap-8 pr-6 md:pr-8"
            >
              {projects.map((project) => {
                const primaryLink = project.live || project.github;
                const primaryLabel = project.live ? 'Explore' : 'View';
                return (
                  <article
                    key={project.title}
                    onMouseMove={handleCardMove}
                    onMouseLeave={handleCardLeave}
                    className="group relative shrink-0 w-[88vw] sm:w-[560px] md:w-[760px] h-[58vh] md:h-[60vh] rounded-[28px] overflow-hidden will-change-transform hover:-translate-y-2 hover:shadow-[0_0_80px_-20px_rgba(67,97,238,0.5)]"
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
                      className="absolute inset-0 rounded-[28px] bg-white/[0.04] backdrop-blur-xl md:backdrop-blur-[5px]"
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
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
