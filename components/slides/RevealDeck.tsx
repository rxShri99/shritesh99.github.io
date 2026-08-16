'use client';

import { type ReactNode } from 'react';
import 'reveal.js/reveal.css';
import 'reveal.js/plugin/highlight/monokai.css';

/**
 * CSS-only shell for slide routes. Every deck now owns its own <Deck>
 * (native react style — see https://revealjs.com/react/) and picks its own
 * `reveal.js/theme/*.css`, so this wrapper only loads the framework CSS
 * and the highlight-plugin theme (both theme-agnostic).
 */
export default function RevealDeck({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
