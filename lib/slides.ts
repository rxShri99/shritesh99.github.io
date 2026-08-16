import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export interface SlideMeta {
  /** Title shown in the index list and on the deck page. */
  title: string;
  /** Event this deck was presented at. */
  event: string;
  /** ISO date the deck was presented (or is scheduled for). */
  date: string;
  /** Optional one-liner shown in the index. */
  description?: string;
}

export interface SlideEntry {
  /** URL-safe slug — the `[event]` segment. Derived from the filename. */
  slug: string;
  meta: SlideMeta;
}

// Server-only: runs at build time inside RSC / generateStaticParams.
const SLIDES_DIR = path.join(process.cwd(), 'slides');

/**
 * Every event owns a folder named after its slug:
 *   slides/<slug>/deck.tsx    — the slides (client-only, has JSX)
 *   slides/<slug>/meta.ts     — SlideMeta (safe to import on the server)
 *   slides/<slug>/media/      — images and other assets for that talk
 *
 * Metadata lives in meta.ts because deck.tsx pulls in `@revealjs/react`,
 * which touches browser-only globals at module load and blows up in RSC.
 */
function listSlugs(): string[] {
  try {
    return readdirSync(SLIDES_DIR, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          existsSync(path.join(SLIDES_DIR, entry.name, 'meta.ts'))
      )
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

export async function getAllSlides(): Promise<SlideEntry[]> {
  const slugs = listSlugs();
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const mod = await import(`@/slides/${slug}/meta`);
      const meta = mod.meta as SlideMeta | undefined;
      if (!meta) {
        throw new Error(
          `slides/${slug}/meta.ts is missing a named \`meta\` export`
        );
      }
      return { slug, meta };
    })
  );
  // Newest first.
  return entries.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}

export async function getSlideMeta(slug: string): Promise<SlideMeta | null> {
  try {
    const mod = await import(`@/slides/${slug}/meta`);
    return (mod.meta as SlideMeta) ?? null;
  } catch {
    return null;
  }
}

export function getAllSlideSlugs(): string[] {
  return listSlugs();
}
