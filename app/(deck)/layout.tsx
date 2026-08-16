import type { Metadata } from 'next';

/**
 * Second root layout for reveal.js deck routes. Deliberately does NOT
 * import `globals.css`, register the site fonts, or wrap children in
 * `AppProvider` — decks bring their own reveal.js theme + CSS and must
 * not inherit the portfolio's typography/color/cursor overrides. Pages
 * under this group (`/slides/[event]`) still override title/description
 * via their own `generateMetadata`.
 */
export const metadata: Metadata = {
  title: 'Slides',
};

export default function DeckRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--r-background-color, #000)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
