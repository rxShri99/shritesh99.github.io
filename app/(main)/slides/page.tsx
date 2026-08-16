import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllSlides } from '@/lib/slides';
import SlideCards from '@/components/slides/SlideCards';

export const metadata: Metadata = {
  title: 'Slides',
  description: 'Talks and presentations, rendered with reveal.js.',
};

export default async function SlidesIndexPage() {
  const slides = await getAllSlides();

  return (
    <main className="min-h-screen px-6 py-24 md:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Slides
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Talks &amp; Presentations
          </h1>
        </header>

        {slides.length === 0 ? (
          <p className="text-white/60">No presentations yet.</p>
        ) : (
          <SlideCards slides={slides} />
        )}

        <Link
          href="/"
          className="inline-block text-sm text-white/50 hover:text-white transition-colors"
        >
          &larr; Back
        </Link>
      </div>
    </main>
  );
}
