'use client';

import dynamic from 'next/dynamic';

// SlideScene mounts a WebGL canvas that touches browser globals at module
// load; deferring it here keeps it off the Next server prerender. This wrapper
// exists so a server component (the /slides page) can drop the background in
// as a plain child — `dynamic({ ssr: false })` is only allowed from client
// code.
const SlideScene = dynamic(() => import('./SlideScene'), { ssr: false });

export default function SlideBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <SlideScene />
    </div>
  );
}
