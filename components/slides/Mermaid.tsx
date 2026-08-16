'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface MermaidProps {
  /** Raw mermaid source, e.g. "graph TD; A-->B" */
  chart: string;
  /** Optional mermaid theme override. Defaults to 'default'. */
  theme?: 'default' | 'dark' | 'neutral' | 'forest' | 'base';
  /** Extra class on the wrapping <div>. */
  className?: string;
}

/**
 * Render a mermaid diagram inside a reveal.js slide.
 *
 * Mermaid touches `document` at import time, so this component is a
 * client component and imports the library lazily — the `mermaid` bundle
 * stays out of the server chunk. Each instance renders to its own SVG
 * via `mermaid.render(uniqueId, chart)` so multiple diagrams per deck
 * don't collide.
 */
export default function Mermaid({
  chart,
  theme = 'default',
  className,
}: MermaidProps) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '-');
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'loose' });
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, theme, id]);

  if (error) {
    return (
      <pre style={{ color: '#c33', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
        Mermaid error: {error}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'flex', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
