'use client';

import { ScrollProvider } from '@/components/ScrollProvider';
import { ScrollProvider as ScrollContextProvider } from '@/context/ScrollContext';
import Scene from '@/components/three/Scene';
import Hero from '@/components/pages/Hero';
import Experience from '@/components/pages/Experience';
import Projects from '@/components/pages/Projects';
import Skills from '@/components/pages/Skills';
import About from '@/components/pages/About';
import Quote from '@/components/pages/Quote';
import Contact from '@/components/pages/Contact';
import { Leva } from 'leva';
import Cursor from '@/components/Cursor';
import { useDevMode } from '@/hooks/useDevMode';
import { sceneConfig } from '@/config';

export default function Home() {
  const isDevMode = useDevMode();

  return (
    <ScrollProvider>
      <ScrollContextProvider>
        <div className="relative">
          {/* Leva UI - positioned above everything.
              Must render unconditionally with `hidden` — omitting <Leva> causes it to auto-inject a default panel. */}
          <div className="fixed top-0 right-0 z-[999999] pointer-events-auto">
            <Leva
              collapsed
              hidden={!(isDevMode || sceneConfig.enableControls)}
            />
          </div>

          {/* Fixed Three.js Scene Background */}
          <div className="fixed inset-0 z-0">
            <Scene isDevMode={isDevMode} />
          </div>

          {/* Custom cursor — exclusion + blur circle trailing the pointer */}
          <Cursor />

          {/* Scrollable Content — order must match PAGE_HEIGHTS_VH in constants */}
          <div className="relative z-10 scroll-content pointer-events-none [&>*]:pointer-events-auto">
            <Hero />
            <Experience />
            <Projects />
            <Skills />
            <About />
            <Quote />
            <Contact />
          </div>
        </div>
      </ScrollContextProvider>
    </ScrollProvider>
  );
}
