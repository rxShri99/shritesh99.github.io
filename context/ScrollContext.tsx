'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

/** Continuous scroll values, updated every scroll tick without re-rendering. */
export interface ScrollSnapshot {
  scrollProgress: number;
  pageProgress: number;
  scrollY: number;
  cameraY: number;
  currentPage: number;
}

/** Listener signature for per-tick scroll updates. */
type ScrollListener = (snap: ScrollSnapshot) => void;

interface ScrollContextValue {
  /** Integer page index. Re-renders subscribers only when it flips — not
   *  60 times/second like the raw scroll position would. */
  currentPage: number;
  /** Read continuous scroll values inside a useFrame / rAF without triggering
   *  a re-render. Values are mutated in place on every scroll tick. */
  scrollRef: React.MutableRefObject<ScrollSnapshot>;
  /** Subscribe to per-tick scroll updates. Return the unsubscribe fn. Prefer
   *  this over reading `scrollRef.current` in JSX — reading a ref does not
   *  make React re-render when it changes. */
  subscribe: (listener: ScrollListener) => () => void;
}

const initialSnapshot: ScrollSnapshot = {
  scrollProgress: 0,
  pageProgress: 0,
  scrollY: 0,
  cameraY: 200,
  currentPage: 0,
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function useScroll(): ScrollContextValue {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error('useScroll must be used within ScrollProvider');
  return ctx;
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollSnapshot>({ ...initialSnapshot });
  const listenersRef = useRef<Set<ScrollListener>>(new Set());
  // Track the last emitted page in a ref so the scroll effect can stay
  // mounted for the lifetime of the provider — a state dep here would tear
  // the listener down and re-add it on every page flip.
  const lastEmittedPageRef = useRef(0);

  const subscribe = useMemo(
    () => (listener: ScrollListener) => {
      listenersRef.current.add(listener);
      // Prime the new subscriber with the current snapshot so it can render
      // correctly on first paint even mid-scroll.
      listener(scrollRef.current);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    []
  );

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

      // In-place mutation: subscribers read scrollRef.current inside their
      // own rAF/useFrame, so allocating a new object each tick would waste GC.
      const snap = scrollRef.current;
      snap.scrollProgress = scrollProgress;
      snap.pageProgress = pageProgress;
      snap.scrollY = scrollTop;
      snap.cameraY = cameraY;
      snap.currentPage = pageIndex;

      // Notify per-tick subscribers first (they typically write DOM styles or
      // read into useFrame refs — no React work).
      listenersRef.current.forEach((fn) => fn(snap));

      // Then commit page index to React state, ONLY on integer flip. This
      // is what used to fire ~60 times per second and cascade re-renders
      // through Scene, Skills, Community, Contact.
      if (pageIndex !== lastEmittedPageRef.current) {
        lastEmittedPageRef.current = pageIndex;
        setCurrentPage(pageIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const value = useMemo<ScrollContextValue>(
    () => ({ currentPage, scrollRef, subscribe }),
    [currentPage, subscribe]
  );

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  );
}
