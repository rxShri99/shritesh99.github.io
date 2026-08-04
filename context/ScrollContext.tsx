'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { PAGE_HEIGHTS_VH } from '@/constants';

const NUM_PAGES = PAGE_HEIGHTS_VH.length;
// Cumulative vh offsets: [0, 100, 350, 650, 750, 850, 950, 1050]
const CUMULATIVE_VH: readonly number[] = PAGE_HEIGHTS_VH.reduce<number[]>(
  (acc, h) => {
    acc.push((acc[acc.length - 1] ?? 0) + h);
    return acc;
  },
  [0]
);

/**
 * Ring/camera-facing scroll progress.
 *
 * Pages taller than 100vh pin a sticky h-screen viewport for the first
 * (height - 100vh) of their scroll (an internal scrub — carousel, timeline).
 * While pinned, the ring holds its pose; the keyframe transition to the next
 * page then plays across the sticky-release tail, reaching (i+1)/(N-1) exactly
 * at the page boundary — progress stays continuous, no jump for the lerp to
 * absorb. For plain 100vh pages the sticky fraction is 0 and the transition
 * spans the whole page. The last page holds at 1.
 */
function computeRingProgress(pageIndex: number, pageProgress: number): number {
  const denom = NUM_PAGES - 1;
  const height = PAGE_HEIGHTS_VH[pageIndex];
  const stickyFraction = (height - 100) / height;
  const tail =
    pageProgress <= stickyFraction
      ? 0
      : (pageProgress - stickyFraction) / (1 - stickyFraction);
  return Math.min(1, (pageIndex + tail) / denom);
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
