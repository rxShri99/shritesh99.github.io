'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks';
import type { Handwriting } from '@/data/handwriting';

/** The path data is drawn on a 1000-unit em, same as the source font. */
const UNITS_PER_EM = 1000;

/**
 * Viewport width the px sizes were tuned at (MacBook Air — the reference
 * composition). Below it, size and offset scale linearly with the viewport
 * so every screen keeps the same proportions; above it they stay fixed.
 */
const REFERENCE_VW = 1440;

/** CSS: `px * min(100vw, REFERENCE_VW) / REFERENCE_VW` — scales a tuned px
 *  value down with the viewport, capped at its reference size. */
const scaled = (px: number) =>
  `calc(min(100vw, ${REFERENCE_VW}px) / ${REFERENCE_VW} * ${px})`;

/**
 * offsetY tuned per device, keyed by viewport WIDTH (aspect ratio can't
 * tell these devices apart — iPhone 14 Pro and Pixel 7 Pro share ~0.461).
 * Values are the Leva panel numbers, so they pass through `scaled()` the
 * same way they did while tuning.
 */
const OFFSET_Y_KNOTS = [
  [393, 300], // iPhone 14 Pro
  [430, 247], // iPhone 14 Pro Max
  [480, 247], // Pixel 7 Pro
  [520, 100], // iPad Air
  [1559, 65], // MacBook Air
] as const;

/** Piecewise-linear interpolation over OFFSET_Y_KNOTS, clamped at both ends. */
function offsetYForWidth(w: number): number {
  const k = OFFSET_Y_KNOTS;
  if (w <= k[0][0]) return k[0][1];
  if (w >= k[k.length - 1][0]) return k[k.length - 1][1];
  for (let i = 0; i < k.length - 1; i++) {
    if (w <= k[i + 1][0]) {
      const t = (w - k[i][0]) / (k[i + 1][0] - k[i][0]);
      return Math.round(k[i][1] + (k[i + 1][1] - k[i][1]) * t);
    }
  }
  return k[k.length - 1][1];
}

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
   * font's em, not of this particular word.
   */
  fontSize?: number;
  /**
   * Nudge up (negative) or down the page, in px. Initial/SSR value only —
   * replaced on mount by the per-device OFFSET_Y_KNOTS fit.
   */
  offsetY?: number;
  /** ms for the whole word to be written. */
  durationMs?: number;
  /** Pen width, in the path data's own units (em = 1000). */
  strokeWidth?: number;
  /** Fraction of the element on screen before it starts writing. */
  threshold?: number;
  /**
   * Controlled trigger. Omit for the default behavior (write once when
   * scrolled into view). When provided: false hides the strokes, and each
   * false → true flip writes the word again from the start — so the caller
   * can replay it every time its moment comes around.
   */
  play?: boolean;
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
  play,
}: HandwrittenTextProps) {
  const ref = useRef<SVGSVGElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  // Per-device offsetY fit, applied on mount and viewport resizes. Starts
  // from the prop (SSR-safe) and settles on the fitted value on the next
  // frame (async — effects must not set state synchronously).
  const [fitOffsetY, setFitOffsetY] = useState(offsetY);
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setFitOffsetY(offsetYForWidth(window.innerWidth))
      );
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', apply);
    };
  }, []);

  // Measure, hide, then write — all on the DOM node. The dash length has to be
  // each path's own length: `pathLength` would normalise that away, but it
  // rescales *every* distance on the element. Rendering starts at `ready` and
  // only flips to `pending` once the lengths are in, so a browser that can't
  // measure keeps showing readable text.
  const controlled = play !== undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    for (const path of el.querySelectorAll('path')) {
      path.style.setProperty('--stroke-length', `${path.getTotalLength()}`);
    }
    el.dataset.state = 'pending';

    // Controlled mode: the `play` effect below owns the state from here on.
    if (controlled) return;

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
  }, [handwriting, reduceMotion, threshold, controlled]);

  // Controlled mode: `pending` resets every stroke's dash, so each flip back
  // to true re-runs the CSS animations — the word writes itself again.
  useEffect(() => {
    const el = ref.current;
    if (!controlled || !el || reduceMotion) return;
    el.dataset.state = play ? 'writing' : 'pending';
  }, [play, controlled, reduceMotion]);

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
        width: scaled((fontSize * boxWidth) / UNITS_PER_EM),
        aspectRatio: `${boxWidth} / ${boxHeight}`,
        // Translate rather than margin: the word slides off its centred
        // position without dragging the socials below it along with it.
        transform: fitOffsetY
          ? `translateY(${scaled(fitOffsetY)})`
          : undefined,
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
