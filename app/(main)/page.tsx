'use client';

import { useCallback, useRef, useState } from 'react';
import { ScrollProvider } from '@/components/ScrollProvider';
import { ScrollProvider as ScrollContextProvider } from '@/context/ScrollContext';
import Scene from '@/components/three/Scene';
import Hero from '@/components/pages/Hero';
import Experience from '@/components/pages/Experience';
import Projects from '@/components/pages/Projects';
import Skills from '@/components/pages/Skills';
import Community from '@/components/pages/Community';
import About from '@/components/pages/About';
import Quote from '@/components/pages/Quote';
import Contact from '@/components/pages/Contact';
import { Leva } from 'leva';
import Cursor from '@/components/Cursor';
import WrapMenu from '@/components/WrapMenu';
import AppLoader from '@/components/AppLoader';
import { useDevMode } from '@/hooks/useDevMode';
import { sceneConfig } from '@/config';

export default function Home() {
  const isDevMode = useDevMode();
  const wrapRef = useRef<HTMLDivElement>(null);
  // Flips when the WebGL scene has drawn its first frame; dismisses the
  // loader and releases the rings' entrance animation.
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  return (
    <ScrollProvider>
      <ScrollContextProvider>
        {/* Wrapped page — WrapMenu clips/scales this whole tree into a card.
            Needs its own bg + z above the menu layer. */}
        <div ref={wrapRef} className="relative z-10 bg-black">
          {/* Leva UI - positioned above everything.
              Must render unconditionally with `hidden` — omitting <Leva> causes it to auto-inject a default panel. */}
          <div className="fixed top-0 right-0 z-[999999] pointer-events-auto">
            <Leva
              collapsed
              hidden={!(isDevMode || sceneConfig.enableControls)}
            />
          </div>

          {/* Fixed Three.js Scene Background (data-wrap-fixed: WrapMenu
              re-anchors it while the page is wrapped) */}
          <div data-wrap-fixed className="fixed inset-0 z-0">
            <Scene
              isDevMode={isDevMode}
              onReady={handleSceneReady}
              entranceReady={sceneReady}
            />
          </div>

          {/* Scrollable Content — order must match PAGE_HEIGHTS_VH in constants */}
          <div className="relative z-10 scroll-content pointer-events-none [&>*]:pointer-events-auto">
            <Hero />
            <Experience />
            <Projects />
            <Skills />
            <Community />
            <About />
            <Quote />
            <Contact />
          </div>
        </div>

        {/* Outside the wrapped tree so they never clip/scale with the card */}
        <AppLoader ready={sceneReady} />
        <WrapMenu wrapRef={wrapRef} />

        {/* Custom cursor — rocket drifting after the pointer (or the
            exclusion/blur circle). Toggles live in the Leva "Cursor" folder,
            but dev mode force-reverts to the native cursor so tuning gestures
            aren't chased by the comet trail. */}
        {!isDevMode && <Cursor />}
      </ScrollContextProvider>
    </ScrollProvider>
  );
}
