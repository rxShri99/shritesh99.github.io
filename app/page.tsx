'use client';

import { ScrollProvider } from '@/components/ScrollProvider';
import { ScrollProvider as ScrollContextProvider } from '@/context/ScrollContext';
import Scene from '@/components/three/Scene';
import Page1 from '@/components/pages/Page1';
import Page2 from '@/components/pages/Page2';
import Page3 from '@/components/pages/Page3';
import Page4 from '@/components/pages/Page4';
import Page5 from '@/components/pages/Page5';
import { Leva } from 'leva';
import { useDevMode } from '@/hooks/useDevMode';
import { sceneConfig } from '@/config';

export default function Home() {
  const isDevMode = useDevMode();

  return (
    <ScrollProvider>
      <ScrollContextProvider>
        <div className="relative">
          {/* Leva UI - positioned above everything */}
          {(isDevMode || sceneConfig.enableControls) && (
            <div className="fixed top-0 right-0 z-50">
              <Leva collapsed />
            </div>
          )}

          {/* Fixed Three.js Scene Background */}
          <div className="fixed inset-0 z-0">
            <Scene />
          </div>

          {/* Scrollable Content */}
          <div className="relative z-10 scroll-content">
            <Page1 />
            <Page2 />
            <Page3 />
            <Page4 />
            <Page5 />
          </div>
        </div>
      </ScrollContextProvider>
    </ScrollProvider>
  );
}
