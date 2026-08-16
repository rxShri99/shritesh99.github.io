'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { Rings } from 'react-loader-spinner';
import dynamic from 'next/dynamic';

// reveal.js's `highlight` plugin touches `window` at module load, which
// crashes during Next.js prerender. Deferring the whole RevealDeck import
// to the client is simpler than lazy-loading each plugin.
const RevealDeck = dynamic(
  () => import('@/components/slides/RevealDeck'),
  { ssr: false }
);

/**
 * Shown while the MDX deck chunk is being fetched. Matches AppLoader so the
 * transition from portfolio → deck reads as the same brand.
 */
function DeckLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Rings
        height={120}
        width={120}
        color="#4361EE"
        radius={6}
        ariaLabel="Loading deck"
      />
    </div>
  );
}

// Statically pre-registered decks — one entry per slides/<slug>/deck.tsx. The
// import factories are only called from the client-side effect below, which
// keeps the reveal.js bundle off the server (it touches browser globals at
// module load and breaks RSC prerender). Add a new entry alongside each new
// slides/<slug>/ folder.
const deckImports: Record<string, () => Promise<{ default: ComponentType }>> = {
  hello: () => import('@/slides/hello/deck'),
  hermes: () => import('@/slides/hermes/deck'),
};

interface DeckLoaderProps {
  slug: string;
}

/**
 * Loads the MDX chunk first, then mounts <RevealDeck> with the loaded content
 * already as children. That order matters — reveal.js scans `.slides > section`
 * once inside its init effect, so the sections must exist BEFORE the Deck
 * mounts. If we swapped children in later, reveal.js would boot with 0 slides.
 */
export default function DeckLoader({ slug }: DeckLoaderProps) {
  const [Content, setContent] = useState<ComponentType | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const factory = deckImports[slug];
    if (!factory) {
      setNotFound(true);
      return;
    }
    let cancelled = false;
    factory()
      .then((mod) => {
        if (!cancelled) setContent(() => mod.default);
      })
      .catch((err) => {
        console.error(`Failed to load deck '${slug}':`, err);
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        Deck not found.
      </div>
    );
  }
  if (!Content) return <DeckLoading />;
  return (
    <RevealDeck>
      <Content />
    </RevealDeck>
  );
}
