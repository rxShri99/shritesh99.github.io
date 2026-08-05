'use client';

import { useEffect, useRef, useState } from 'react';
import { communityEvents, eventTypeLabels } from '@/data/portfolio';
import { useScroll } from '@/context/ScrollContext';
import { PAGE_HEIGHTS_VH } from '@/constants';

const PAGE_INDEX = 4;
// Sticky element (h-screen = 100vh) only pins for (sectionHeight - 100vh) of
// scroll, so the slider must complete within pageProgress ∈ [0, STICKY_FRACTION].
const STICKY_FRACTION =
  (PAGE_HEIGHTS_VH[PAGE_INDEX] - 100) / PAGE_HEIGHTS_VH[PAGE_INDEX];
// Finish the scrub before the sticky releases so the last panel rests fully
// on screen for a beat (and any transform smoothing catches up) before the
// next page slides in.
const SCRUB_END = STICKY_FRACTION * 0.85;

// Inner-image drift per px of panel distance from the viewport centre — the
// photo slides gently inside its frame as the panel crosses the screen.
const PARALLAX_FACTOR = 0.12;

// Gap between the last panel and the viewport edge at the end of the scrub.
const EDGE_MARGIN = 24;

export default function Community() {
  const { currentPage, pageProgress } = useScroll();
  const trackRef = useRef<HTMLDivElement>(null);
  const [sidePad, setSidePad] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [panelStep, setPanelStep] = useState(0); // panel width + gap
  const [panelWidth, setPanelWidth] = useState(0);
  const [vw, setVw] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const first = track?.children[0] as HTMLElement | undefined;
      const second = track?.children[1] as HTMLElement | undefined;
      if (!track || !first) return;
      const width = window.innerWidth;
      setVw(width);
      setPanelWidth(first.offsetWidth);
      setPanelStep(
        second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
      );
      // Left pad so the first panel starts viewport-centred. The right end only
      // gets EDGE_MARGIN — the scrub finishes as soon as the last panel is
      // fully on screen, not when it reaches the centre.
      const pad = Math.max(0, (width - first.offsetWidth) / 2);
      setSidePad(pad);
      // Compute the track width arithmetically instead of measuring the DOM —
      // a DOM read here could race React committing the new padding on resize.
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const count = track.children.length;
      const total =
        pad + count * first.offsetWidth + (count - 1) * gap + EDGE_MARGIN;
      setMaxTranslate(Math.max(0, total - width));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 0 → 1 across the pinned portion of this page's scroll.
  const local =
    currentPage < PAGE_INDEX
      ? 0
      : currentPage > PAGE_INDEX
        ? 1
        : Math.min(1, pageProgress / SCRUB_END);
  const translateX = -local * maxTranslate;

  return (
    <section
      className="relative w-full"
      style={{ height: `${PAGE_HEIGHTS_VH[PAGE_INDEX]}vh` }}
      aria-label="Community"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-20">
        {/* Same heading position as the other pages: flex-centered max-w-2xl column */}
        <div className="w-full flex justify-center px-6 mb-10 md:mb-14">
          <div className="max-w-2xl w-full">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Community
            </h2>
          </div>
        </div>

        <div className="relative w-full">
          <div
            ref={trackRef}
            className="flex gap-6 md:gap-8 w-max will-change-transform"
            style={{
              paddingLeft: sidePad,
              paddingRight: EDGE_MARGIN,
              transform: `translate3d(${translateX}px, 0, 0)`,
              transition: 'transform 0.15s linear',
            }}
          >
            {communityEvents.map((event, i) => {
              // Panel centre in viewport coords → inner-image parallax shift.
              const centerX =
                sidePad + i * panelStep + panelWidth / 2 + translateX;
              const shift = vw ? (centerX - vw / 2) * -PARALLAX_FACTOR : 0;
              return (
                <figure
                  key={event.title}
                  className="relative shrink-0 w-[82vw] sm:w-[560px] md:w-[720px] aspect-video rounded-[28px] overflow-hidden border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-y-0 left-1/2 h-full w-[130%] max-w-none object-cover"
                    style={{
                      transform: `translateX(calc(-50% + ${shift}px))`,
                      transition: 'transform 0.15s linear',
                    }}
                  />
                  {/* Scrim so the overlaid text stays readable */}
                  <div className="absolute inset-0 bg-black/35" />

                  {/* Big centred label, reference-style */}
                  <figcaption className="absolute inset-0 flex items-center justify-center px-6">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold italic tracking-tight text-white text-center drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]">
                      {event.title}
                    </span>
                  </figcaption>

                  {/* Meta strip */}
                  <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white/85">
                      {eventTypeLabels[event.type]}
                    </span>
                    <span className="text-xs text-white/70">
                      {event.date}
                      {event.location ? ` · ${event.location}` : ''}
                    </span>
                  </div>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
