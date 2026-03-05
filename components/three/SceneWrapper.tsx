'use client';

import dynamic from 'next/dynamic';

const SceneNoSSR = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-black flex items-center justify-center text-white">Loading 3D Scene...</div>
});

export default function SceneWrapper() {
  return <SceneNoSSR />;
}