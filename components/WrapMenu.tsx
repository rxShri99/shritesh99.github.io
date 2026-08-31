'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PAGE_HEIGHTS_VH } from '@/constants';

const LINKS = [
  { label: 'Home', page: 0 },
  { label: 'Experience', page: 1 },
  { label: 'Projects', page: 2 },
  { label: 'Skills', page: 3 },
  { label: 'Community', page: 4 },
  { label: 'About', page: 5 },
  { label: 'Contact', page: 7 },
];
const TAGLINE = 'log(😅) = 💧log(😄)';
const ANIM_MS = 700;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Wrap menu: opening clips the page to the current viewport (rounded card),
 * scales it down and slides it toward the bottom, revealing the menu layer
 * behind. The page keeps rendering live inside the card.
 */
export default function WrapMenu({
  wrapRef,
}: {
  wrapRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const savedY = useRef(0);

  const wrap = useCallback(
    (next: boolean) => {
      const el = wrapRef.current;
      if (!el) return;
      const canvasBox = el.querySelector<HTMLElement>('[data-wrap-fixed]');
      const vh = window.innerHeight;
      const docH = el.scrollHeight;

      if (next) {
        const y = window.scrollY;
        savedY.current = y;
        // Re-anchor the fixed canvas to the frozen viewport region — inside a
        // transformed ancestor, `fixed; inset: 0` would otherwise resolve to
        // the full document height.
        if (canvasBox) {
          canvasBox.style.position = 'absolute';
          canvasBox.style.top = `${y}px`;
          canvasBox.style.height = '100vh';
        }
        document.documentElement.style.overflow = 'hidden';
        // Halt Lenis too — it scrolls programmatically, so overflow:hidden
        // alone would still let wheel/touch input move the frozen page.
        window.__lenis?.stop();
        // Clip to the exact viewport region first (no transition)…
        el.style.transition = 'none';
        el.style.clipPath = `inset(${y}px 0px ${docH - y - vh}px 0px round 0px)`;
        el.style.transformOrigin = `50% ${y + vh / 2}px`;
        // …then animate into the wrapped card.
        requestAnimationFrame(() => {
          el.style.transition = `transform ${ANIM_MS}ms ${EASE}, clip-path ${ANIM_MS}ms ${EASE}`;
          el.style.clipPath = `inset(${y}px 20px ${docH - y - vh + 20}px 20px round 28px)`;
          el.style.transform = `translateY(${Math.round(vh * 0.3)}px) scale(0.9)`;
        });
      } else {
        const y = savedY.current;
        el.style.clipPath = `inset(${y}px 0px ${docH - y - vh}px 0px round 0px)`;
        el.style.transform = 'none';
        window.setTimeout(() => {
          el.style.transition = 'none';
          el.style.clipPath = 'none';
          el.style.transform = '';
          el.style.transformOrigin = '';
          if (canvasBox) {
            canvasBox.style.position = '';
            canvasBox.style.top = '';
            canvasBox.style.height = '';
          }
          document.documentElement.style.overflow = '';
          window.__lenis?.start();
        }, ANIM_MS + 30);
      }
    },
    [wrapRef]
  );

  const toggle = useCallback(() => {
    setOpen((prev) => {
      wrap(!prev);
      return !prev;
    });
  }, [wrap]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggle]);

  // Scrolling down while the menu is open takes you back to the page.
  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 10) toggle();
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      // Finger moving up = scrolling down.
      if (touchStartY - e.touches[0].clientY > 24) toggle();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [open, toggle]);

  const go = (page: number) => {
    if (!open) return;
    toggle();
    const targetVh = PAGE_HEIGHTS_VH.slice(0, page).reduce((a, b) => a + b, 0);
    // Navigate once the un-wrap animation has finished and scroll is unlocked.
    window.setTimeout(() => {
      window.scrollTo({
        top: (targetVh * window.innerHeight) / 100,
        behavior: 'smooth',
      });
    }, ANIM_MS + 60);
  };

  return (
    <>
      {/* Burger / close button — outside the wrapped page so it never clips */}
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={toggle}
        className="fixed top-5 right-5 md:top-7 md:right-8 z-[100000] w-11 h-11 flex flex-col items-center justify-center gap-[7px]"
      >
        <span
          className={`block w-7 h-[2px] bg-white transition-transform duration-300 ${
            open ? 'translate-y-[4.5px] rotate-45' : ''
          }`}
        />
        <span
          className={`block w-7 h-[2px] bg-white transition-transform duration-300 ${
            open ? '-translate-y-[4.5px] -rotate-45' : ''
          }`}
        />
      </button>

      {/* Menu layer revealed behind the wrapped page card */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[1] bg-[#15151a] transition-opacity duration-500 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="pt-16 md:pt-20 flex flex-wrap justify-center gap-x-8 gap-y-3 md:gap-x-12 px-6">
          {LINKS.map((link, i) => (
            <button
              key={link.label}
              onClick={() => go(link.page)}
              tabIndex={open ? 0 : -1}
              className={`text-lg md:text-2xl font-semibold text-white/60 hover:text-white transition-all duration-500 ${
                open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
              }`}
              style={{ transitionDelay: open ? `${150 + i * 60}ms` : '0ms' }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Strikethrough tagline marquee, reference-style */}
        <div className="mt-8 md:mt-12 overflow-hidden">
          <div
            className="marquee-track flex w-max"
            style={{ '--marquee-duration': '32s' } as React.CSSProperties}
          >
            {[0, 1].map((half) => (
              <div key={half} aria-hidden className="flex">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="whitespace-nowrap px-8 text-2xl md:text-4xl font-semibold text-white/30"
                  >
                    {TAGLINE}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
