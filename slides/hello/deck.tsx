'use client';

import { Deck, Slide } from '@revealjs/react';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealNotes from 'reveal.js/plugin/notes';
import 'reveal.js/theme/black.css';

const config = {
  hash: true,
  controls: true,
  progress: true,
  slideNumber: 'c/t',
  transition: 'slide',
  backgroundTransition: 'fade',
  width: 1280,
  height: 720,
  controlsTutorial: false,
  embedded: false,
} as const;

const plugins = [RevealHighlight, RevealNotes];

export default function HelloDeck() {
  return (
    <Deck config={config} plugins={plugins} className="reveal-deck-root">
      <Slide><h1>Slide one</h1></Slide>
      <Slide><h1>Slide two</h1></Slide>
      <Slide><h1>Slide three</h1></Slide>
    </Deck>
  );
}
