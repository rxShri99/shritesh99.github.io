'use client';

import { useEffect, useState } from 'react';
import { contact } from '@/data/portfolio';
import { handwrittenHandle } from '@/data/handwriting';
import HandwrittenText from '@/components/HandwrittenText';
import { useScroll } from '@/context/ScrollContext';

// The rings' pose target reaches its final Contact keyframe exactly when
// scrollProgress hits 1; they then lerp into place over ~1s. Hold the pen
// until they've settled.
const RING_SETTLE_MS = 800;

const iconPaths: Record<string, string> = {
  github:
    'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  twitter:
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
};

// The Contact section is fully off-screen once the scroll is back above the
// Quote page (it only starts sliding in during page 6). Resetting there — not
// the moment the rings leave their final pose — gives the trigger hysteresis:
// small scrolls within/near the contact page never blank the word.
const EXIT_PAGE = 6;

export default function Contact() {
  // Write the handle once the rings settle into their final position; keep
  // it drawn through small scrolls, and only reset after fully exiting the
  // section so the next arrival writes it again.
  const { scrollProgress, currentPage } = useScroll();
  const ringsAtFinal = scrollProgress >= 1;
  const fullyExited = currentPage < EXIT_PAGE;
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!ringsAtFinal) return;
    const timer = setTimeout(() => setPlay(true), RING_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [ringsAtFinal]);

  useEffect(() => {
    if (!fullyExited) return;
    // Async: effects must not set state synchronously.
    const raf = requestAnimationFrame(() => setPlay(false));
    return () => cancelAnimationFrame(raf);
  }, [fullyExited]);

  return (
    <div className="relative min-h-screen flex flex-col items-center px-6">
      {/* The handle holds the middle of the section, written on by hand once
          the rings settle into their final pose. */}
      <div className="flex-1 flex items-center justify-center">
        <h2 className="w-full">
          <HandwrittenText
            handwriting={handwrittenHandle}
            durationMs={2400}
            play={play}
          />
        </h2>
      </div>

      {/* Socials + footer ride the bottom edge — this is the last section, so
          they land at the very bottom of the page. */}
      <div className="w-full max-w-xl text-center space-y-8 pb-10">
        {/* Social Links */}
        <div className="flex items-center justify-center gap-6">
          {contact.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-400/10 transition-all">
                <svg
                  className="w-5 h-5 fill-white/70 group-hover:fill-blue-400 transition-colors"
                  viewBox="0 0 24 24"
                >
                  <path d={iconPaths[link.icon] ?? ''} />
                </svg>
              </span>
              <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">
                {link.label}
              </span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <p className="text-white/20 text-sm">
          &copy; {new Date().getFullYear()} Shritesh Jamulkar. All rights
          reserved.
          <br />
          <br />
          Made with ❤️ from London, UK 🇬🇧
        </p>
      </div>
    </div>
  );
}
