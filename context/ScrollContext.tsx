'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { PAGE_HEIGHTS_VH } from '@/constants';

const NUM_PAGES = PAGE_HEIGHTS_VH.length;
// Cumulative vh offsets: [0, 100, 200, 300, 600, 700, 800]
const CUMULATIVE_VH: readonly number[] = PAGE_HEIGHTS_VH.reduce<number[]>(
  (acc, h) => {
    acc.push((acc[acc.length - 1] ?? 0) + h);
    return acc;
  },
  [0]
);

// Index of the page whose scroll is "consumed" by an internal carousel — the
// ring/camera should hold their pose across this page's entire scroll range.
const PINNED_INDEX = 3;

/**
 * Ring/camera-facing scroll progress:
 * - Pages 1-3 contribute 1/(N-1) each — normal.
 * - Page 4 (pinned) locked at 3/5 = 0.6 → ring holds at keyframe[3] (page-4 pose).
 * - Page 5 starts at 4/5 = 0.8 (keyframe[4], page-5 pose) so it's visibly distinct from page 4
 *   the instant you enter, and ends at 1.0 (keyframe[5], page-6 pose). The keyframe[3]→[4] jump
 *   at the page-4/5 boundary is absorbed by the ring's own lerp smoothing (~500ms).
 * - Page 6 holds at 1.0.
 */
function computeRingProgress(pageIndex: number, pageProgress: number): number {
  const denom = NUM_PAGES - 1; // 5
  if (pageIndex < PINNED_INDEX) {
    return (pageIndex + pageProgress) / denom;
  }
  if (pageIndex === PINNED_INDEX) {
    return PINNED_INDEX / denom; // 0.6, locked
  }
  if (pageIndex === PINNED_INDEX + 1) {
    // Page 5: 0.8 → 1.0 (single T5 transition, but starts at distinct page-5 pose).
    return (PINNED_INDEX + 1 + pageProgress) / denom;
  }
  // Page 6 and beyond: hold at 1.0.
  return 1;
}

interface ScrollContextType {
  scrollProgress: number; // 0-1, locked during page 4 so ring/camera hold
  currentPage: number;
  pageProgress: number; // 0-1 fraction within the current page (respects non-uniform heights)
  scrollY: number;
  cameraY: number;
}

const ScrollContext = createContext<ScrollContextType>({
  scrollProgress: 0,
  currentPage: 0,
  pageProgress: 0,
  scrollY: 0,
  cameraY: 200,
});

export function useScroll() {
  return useContext(ScrollContext);
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScrollContextType>({
    scrollProgress: 0,
    currentPage: 0,
    pageProgress: 0,
    scrollY: 0,
    cameraY: 200,
  });
  const previousPageRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const vh = window.innerHeight;
      // PAGE_HEIGHTS_VH is in CSS vh units (100 = one viewport), so compare in the same units.
      const scrollVhCss = (scrollTop / vh) * 100;

      // Locate the current page using non-uniform heights.
      let pageIndex = NUM_PAGES - 1;
      let pageProgress = 1;
      for (let i = 0; i < NUM_PAGES; i++) {
        if (scrollVhCss < CUMULATIVE_VH[i + 1]) {
          pageIndex = i;
          pageProgress = Math.max(
            0,
            Math.min(1, (scrollVhCss - CUMULATIVE_VH[i]) / PAGE_HEIGHTS_VH[i])
          );
          break;
        }
      }

      const scrollProgress = computeRingProgress(pageIndex, pageProgress);
      const cameraY = 200 - scrollProgress * 400;

      if (pageIndex !== previousPageRef.current) {
        console.log(
          `📤 EXIT Page ${previousPageRef.current + 1} → 📥 ENTER Page ${pageIndex + 1}`
        );
        previousPageRef.current = pageIndex;
      }

      setState({
        scrollProgress,
        currentPage: pageIndex,
        pageProgress,
        scrollY: scrollTop,
        cameraY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={state}>{children}</ScrollContext.Provider>
  );
}
