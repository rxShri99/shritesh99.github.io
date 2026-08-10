'use client';

import { useEffect, useState } from 'react';
import { Rings } from 'react-loader-spinner';

/**
 * Full-page loader shown while the WebGL scene compiles its shaders and draws
 * its first frame. Fades out once `ready`, then unmounts entirely.
 */
export default function AppLoader({ ready }: { ready: boolean }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setHidden(true), 550);
    return () => window.clearTimeout(t);
  }, [ready]);

  if (hidden) return null;

  return (
    <div
      aria-hidden={ready}
      className={`fixed inset-0 z-[1000000] bg-black flex items-center justify-center transition-opacity duration-500 ${
        ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Rings
        height={120}
        width={120}
        color="#4361EE"
        radius={6}
        ariaLabel="Loading"
      />
    </div>
  );
}
