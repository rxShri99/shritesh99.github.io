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
// ring/camera should hold their pose while its sticky viewport stays pinned.
const PINNED_INDEX = 3;

// The pinned page's sticky viewport (h-screen) only pins for
// (sectionHeight - 100vh) of its scroll; the remaining tail is the sticky
// release, where the next page slides up. Same formula as Page4's
// STICKY_FRACTION so the carousel finishes exactly when the ring starts moving.
const PINNED_STICKY_FRACTION =
  (PAGE_HEIGHTS_VH[PINNED_INDEX] - 100) / PAGE_HEIGHTS_VH[PINNED_INDEX];

/**
 * Ring/camera-facing scroll progress:
 * - Pages 1-3 contribute 1/(N-1) each — normal.
 * - Page 4 (pinned) holds 3/5 = 0.6 (keyframe[3] pose) while the carousel
 *   consumes the pinned scroll, then plays the keyframe[3]→[4] transition
 *   across the sticky-release tail, reaching 0.8 exactly at the page-5
 *   boundary — progress stays continuous, no jump for the lerp to absorb.
 * - Page 5: 0.8 → 1.0 (keyframe[4] → keyframe[5], the page-6 pose).
 * - Page 6 holds at 1.0.
 */
function computeRingProgress(pageIndex: number, pageProgress: number): number {
  const denom = NUM_PAGES - 1; // 5
  if (pageIndex < PINNED_INDEX) {
    return (pageIndex + pageProgress) / denom;
  }
  if (pageIndex === PINNED_INDEX) {
    const tail =
      pageProgress <= PINNED_STICKY_FRACTION
        ? 0
        : (pageProgress - PINNED_STICKY_FRACTION) /
          (1 - PINNED_STICKY_FRACTION);
    return (PINNED_INDEX + tail) / denom; // 0.6 while pinned, → 0.8 by the boundary
  }
  if (pageIndex === PINNED_INDEX + 1) {
    // Page 5: 0.8 → 1.0 (single T5 transition, continuous with page 4's tail).
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
