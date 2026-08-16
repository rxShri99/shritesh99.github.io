import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllSlideSlugs, getSlideMeta } from '@/lib/slides';
import DeckLoader from '@/components/slides/DeckLoader';

interface PageProps {
  params: Promise<{ event: string }>;
}

export function generateStaticParams() {
  return getAllSlideSlugs().map((event) => ({ event }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { event } = await params;
  const meta = await getSlideMeta(event);
  return {
    title: meta?.title ?? event,
    description: meta?.event,
  };
}

export default async function SlideDeckPage({ params }: PageProps) {
  const { event } = await params;
  const meta = await getSlideMeta(event);
  if (!meta) notFound();

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'var(--r-background-color, #000)',
      }}
    >
      <DeckLoader slug={event} />
    </div>
  );
}
