'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';

interface ScrollContextType {
  scrollProgress: number;
  currentPage: number;
  scrollY: number;
  cameraY: number;
}

const ScrollContext = createContext<ScrollContextType>({
  scrollProgress: 0,
  currentPage: 0,
  scrollY: 0,
  cameraY: 200,
});

export function useScroll() {
  return useContext(ScrollContext);
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [cameraY, setCameraY] = useState(200);
  const previousPageRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? scrollTop / documentHeight : 0;

      setScrollProgress(progress);
      setScrollY(scrollTop);

      // Calculate current page (0-5 for 6 pages)
      const page = Math.min(Math.floor(progress * 6), 5);

      // Calculate smooth camera Z position based on continuous scroll progress
      // Maps scroll progress (0-1) to camera Z position (200 to -200)
      const cameraZPosition = 200 - progress * 400; // Smooth: 200 → -200
      setCameraY(cameraZPosition);

      // Detect page transitions and log them
      if (page !== previousPageRef.current) {
        // Log page exit
        console.log(
          `📤 EXIT Page ${previousPageRef.current + 1} - Scroll: ${progress.toFixed(3)}, Y: ${scrollTop}px`
        );

        // Log page enter
        console.log(
          `📥 ENTER Page ${page + 1} - Scroll: ${progress.toFixed(3)}, Y: ${scrollTop}px`
        );

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        previousPageRef.current = page;
      }

      setCurrentPage(page);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollContext.Provider
      value={{ scrollProgress, currentPage, scrollY, cameraY }}
    >
      {children}
    </ScrollContext.Provider>
  );
}
