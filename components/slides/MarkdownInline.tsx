'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { marked } from 'marked';

interface MarkdownInlineProps {
  /** Absolute URL served by Next (e.g. "/slides/<slug>/foo.md"). */
  src?: string;
  /** Alternative to `src` — raw markdown passed inline. */
  children?: string;
  /** Optional class on the wrapping <div>. */
  className?: string;
  /**
   * When true, the wrapper and any mermaid diagram card inside grow to
   * fill the parent element's box (drop the auto margin + max-width cap,
   * expand SVG to 100% × 100%). Use it when the slide gives this
   * component a flex-sized region and you want the diagram to fill it
   * edge-to-edge instead of sitting in a small centered card.
   */
  fill?: boolean;
}

/**
 * Render markdown INSIDE a `<Slide>` — as opposed to `@revealjs/react`'s
 * `<Markdown>`, which renders its own `<section>` (a whole slide) and
 * therefore can't sit next to `<h2>` inside one slide.
 *
 * Also runs a mermaid pass over any ` ```mermaid ` fenced blocks in the
 * parsed HTML so architecture diagrams etc. render as SVG rather than
 * raw source. The `mermaid` bundle is lazily imported so it only lands
 * on decks that actually use it.
 */
export default function MarkdownInline({
  src,
  children,
  className,
  fill = false,
}: MarkdownInlineProps) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '-');
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let source = children ?? '';
      if (src) {
        try {
          const res = await fetch(src);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          source = await res.text();
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : String(err));
            setHtml('');
          }
          return;
        }
      }
      const parsed = await marked.parse(source);
      if (!cancelled) {
        setError(null);
        setHtml(parsed);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, children]);

  useEffect(() => {
    if (!html || !containerRef.current) return;
    const root = containerRef.current;
    let cancelled = false;

    (async () => {
      // marked emits <pre><code class="language-mermaid"> for fenced blocks.
      const blocks = root.querySelectorAll<HTMLElement>(
        'code.language-mermaid, code.mermaid',
      );
      if (!blocks.length) return;
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });
      let i = 0;
      for (const codeEl of Array.from(blocks)) {
        if (cancelled) return;
        const pre = codeEl.closest('pre') ?? codeEl;
        const src = codeEl.textContent ?? '';
        try {
          const { svg } = await mermaid.render(`mmd-${id}-${i++}`, src);
          const wrap = document.createElement('div');
          // Card that sits centered on the slide with its own light
          // surface — otherwise the SVG's transparent whitespace lets
          // the deck background bleed between subgraphs and the diagram
          // reads as loose shapes rather than one artifact.
          Object.assign(wrap.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            boxSizing: 'border-box',
            ...(fill
              ? { width: '100%', height: '100%', margin: 0 }
              : { margin: '20px auto', maxWidth: '90%' }),
          });
          wrap.innerHTML = svg;
          const svgEl = wrap.querySelector('svg');
          if (svgEl) {
            if (fill) {
              // Let mermaid's SVG scale into the whole card, both axes.
              svgEl.style.width = '100%';
              svgEl.style.height = '100%';
              svgEl.style.maxWidth = '100%';
              svgEl.style.maxHeight = '100%';
              svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            } else {
              svgEl.style.maxWidth = '100%';
              svgEl.style.height = 'auto';
            }
          }
          pre.replaceWith(wrap);
        } catch (err) {
          // Leave the raw fence visible if mermaid can't parse it.
          console.error('mermaid render failed:', err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html, id]);

  if (error) {
    return (
      <pre style={{ color: '#c33', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
        Failed to load markdown: {error}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        fill
          ? {
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
            }
          : undefined
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
