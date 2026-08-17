import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched URLs. With multiple root layouts (route groups),
 * a top-level app/not-found.tsx has no layout to render in — this route
 * claims everything unmatched and triggers the (main) group's not-found
 * boundary instead, so the 404 page gets the site fonts and styles.
 */
export default function CatchAll() {
  notFound();
}
