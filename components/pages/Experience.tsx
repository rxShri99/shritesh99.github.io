'use client';

import { experiences } from '@/data/portfolio';
import { useScroll } from '@/context/ScrollContext';
import { PAGE_HEIGHTS_VH } from '@/constants';

const PAGE_INDEX = 1;
// Sticky element (h-screen = 100vh) only pins for (sectionHeight - 100vh) of
// scroll, so the timeline scrub must complete within pageProgress ∈ [0, STICKY_FRACTION].
const STICKY_FRACTION =
  (PAGE_HEIGHTS_VH[PAGE_INDEX] - 100) / PAGE_HEIGHTS_VH[PAGE_INDEX];

export default function Experience() {
  const { currentPage, pageProgress } = useScroll();

  // 0 → 1 across the pinned portion of this page's scroll.
  const local =
    currentPage < PAGE_INDEX
      ? 0
      : currentPage > PAGE_INDEX
        ? 1
        : Math.min(1, pageProgress / STICKY_FRACTION);

  const count = experiences.length;

  return (
    <section
      className="relative w-full"
      style={{ height: `${PAGE_HEIGHTS_VH[PAGE_INDEX]}vh` }}
      aria-label="Experience"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6 py-10 md:py-20">
        <div className="w-full max-w-3xl mb-6 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Experience
          </h2>
        </div>

        <div className="relative w-full max-w-3xl">
          {/* Base line */}
          <div className="absolute top-0 bottom-0 left-[6.5rem] md:left-[14.5rem] w-px bg-white/10" />
          {/* Scroll-filled gradient line */}
          <div
            className="absolute top-0 left-[6.5rem] md:left-[14.5rem] w-px bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-600 shadow-[0_0_12px_rgba(67,97,238,0.9)]"
            style={{
              height: `${local * 100}%`,
              transition: 'height 0.15s linear',
            }}
          />

          <div className="space-y-8 md:space-y-14">
            {experiences.map((exp, i) => {
              // Entry i reveals while local sweeps through [i/count, (i+1)/count].
              const reveal = Math.max(0, Math.min(1, local * count - i));
              const active = reveal > 0.05;
              return (
                <div
                  key={i}
                  className="grid grid-cols-[5.5rem_2rem_1fr] md:grid-cols-[13rem_3rem_1fr] items-start"
                  style={{
                    opacity: 0.25 + 0.75 * reveal,
                    transition: 'opacity 0.2s linear',
                  }}
                >
                  {/* Date — big, right-aligned against the line */}
                  <p className="text-right text-base md:text-2xl font-bold tracking-tight text-white pt-0.5">
                    {exp.period}
                  </p>

                  {/* Dot on the line */}
                  <div className="flex justify-center pt-2">
                    <span
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        active
                          ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]'
                          : 'bg-white/20'
                      }`}
                    />
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
