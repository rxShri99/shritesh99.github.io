'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import { useControls } from 'leva';
import { usePrefersReducedMotion } from '@/hooks';
import type { Handwriting } from '@/data/handwriting';

/** The path data is drawn on a 1000-unit em, same as the source font. */
const UNITS_PER_EM = 1000;

/**
 * Give every stroke a slice of the total time proportional to its length, and
 * a delay that queues it behind the ones before it.
 */
function buildTimeline(handwriting: Handwriting, durationMs: number) {
  let elapsed = 0;
  return handwriting.strokes.map((stroke) => {
    const delay = Math.round(elapsed * durationMs);
    elapsed += stroke.share;
    return {
      d: stroke.d,
      delay,
      duration: Math.round(stroke.share * durationMs),
    };
  });
}

interface HandwrittenTextProps {
  handwriting: Handwriting;
  className?: string;
  /**
   * Rendered size in px, read the same way as font-size: the height of the
   * font's em, not of this particular word. Overridable from Leva in dev.
   */
  fontSize?: number;
  /** Nudge up (negative) or down the page, in px. Overridable from Leva. */
  offsetY?: number;
  /** ms for the whole word to be written. */
  durationMs?: number;
  /** Pen width, in the path data's own units (em = 1000). */
  strokeWidth?: number;
  /** Fraction of the element on screen before it starts writing. */
  threshold?: number;
}

/**
 * Writes its text on with a pen, Apple-ident style: each stroke is a real
 * centreline, so animating stroke-dashoffset traces it in the direction a hand
 * would move — including upstrokes and retraced loops, which a left-to-right
 * reveal can't do.
 *
 * Strokes run one after another, each given a slice of `durationMs`
 * proportional to its length, so the pen keeps an even speed instead of
 * rushing the long strokes.
 *
 * Stays fully drawn until the browser has measured every stroke, so a failure
 * to measure (or no JS at all) leaves readable text rather than nothing.
 */
export default function HandwrittenText({
  handwriting,
  className,
  fontSize = 300,
  offsetY = 40,
  durationMs = 2400,
  strokeWidth = 46,
  threshold = 0.2,
}: HandwrittenTextProps) {
  const ref = useRef<SVGSVGElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  // Tuning controls — the panel itself is gated by dev mode in page.tsx.
  const ctl = useControls('Handwriting', {
    fontSize: { value: fontSize, min: 80, max: 480, step: 1 },
    offsetY: { value: offsetY, min: -300, max: 300, step: 1 },
  });

  // Measure, hide, then write — all on the DOM node. The dash length has to be
  // each path's own length: `pathLength` would normalise that away, but it
  // rescales *every* distance on the element. Rendering starts at `ready` and
  // only flips to `pending` once the lengths are in, so a browser that can't
  // measure keeps showing readable text.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    for (const path of el.querySelectorAll('path')) {
      path.style.setProperty('--stroke-length', `${path.getTotalLength()}`);
    }
    el.dataset.state = 'pending';

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.dataset.state = 'writing';
        observer.disconnect();
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handwriting, reduceMotion, threshold]);

  const timeline = buildTimeline(handwriting, durationMs);
  // Pin the box from the viewBox rather than leaning on intrinsic SVG sizing,
  // which is the classic way one of these ends up 0px tall. Width comes from
  // the font size so the control behaves like type: the box is however many
  // ems wide the word happens to be.
  const [, , boxWidth, boxHeight] = handwriting.viewBox.split(' ').map(Number);

  return (
    <svg
      ref={ref}
      className={className ? `handwritten ${className}` : 'handwritten'}
      data-state="ready"
      style={{
        width: `${(ctl.fontSize * boxWidth) / UNITS_PER_EM}px`,
        aspectRatio: `${boxWidth} / ${boxHeight}`,
        // Translate rather than margin: the word slides off its centred
        // position without dragging the socials below it along with it.
        transform: ctl.offsetY ? `translateY(${ctl.offsetY}px)` : undefined,
      }}
      viewBox={handwriting.viewBox}
      role="img"
      aria-label={handwriting.text}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {timeline.map((stroke, i) => (
        <path
          key={i}
          d={stroke.d}
          style={
            {
              '--stroke-delay': `${stroke.delay}ms`,
              '--stroke-duration': `${stroke.duration}ms`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}
