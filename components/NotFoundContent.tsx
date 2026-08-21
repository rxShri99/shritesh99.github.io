'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Leva } from 'leva';
import NotFoundScene from '@/components/three/NotFoundScene';
import Cursor from '@/components/Cursor';
import { useDevMode } from '@/hooks/useDevMode';
import { sceneConfig } from '@/config';

export default function NotFoundContent() {
  // Empty span in the middle of "4_4" — the scene pins the small ring to it,
  // so the ring reads as the zero.
  const slotRef = useRef<HTMLSpanElement>(null);
  const isDevMode = useDevMode();

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-black overflow-hidden">
      {/* Leva UI — same gating as the home page (hotkey dev mode or dev env).
          Must render unconditionally with `hidden` — omitting <Leva> makes it
          auto-inject a default panel. */}
      <div className="fixed top-0 right-0 z-[999999] pointer-events-auto">
        <Leva collapsed hidden={!(isDevMode || sceneConfig.enableControls)} />
      </div>

      {/* Soft blue glow behind the number, matching the site's accent */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(600px circle at 50% 42%, rgba(67, 97, 238, 0.16), transparent 70%)',
        }}
      />

      {/* Rings + particles — the small ring tracks the slot in the heading */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <NotFoundScene slotRef={slotRef} />
      </div>

      <div className="relative z-10 text-center space-y-8">
        <h1
          aria-label="404"
          className="flex items-center justify-center text-[150px] md:text-[260px] font-bold leading-none tracking-tight"
        >
          <span aria-hidden>4</span>
          {/* the small ring renders here as the "0" */}
          <span
            ref={slotRef}
            aria-hidden
            className="inline-block w-[0.6em] h-[0.74em] mx-[0.08em]"
          />
          <span aria-hidden>4</span>
        </h1>

        <div className="space-y-3">
          <p className="text-xl md:text-2xl font-medium text-white/85">
            You&rsquo;ve drifted off the orbit.
          </p>
        </div>

        {/* <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-colors"
        >
          <span aria-hidden>&larr;</span>
          Back to home
        </Link> */}
      </div>

      {/* Rocket cursor — same Leva "Cursor" folder as the home page */}
      <Cursor />
    </main>
  );
}
