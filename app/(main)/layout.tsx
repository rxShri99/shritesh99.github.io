import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { AppProvider } from '@/context/AppContext';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Site's decorative display font — applied to headings via globals.css.
const entanglement = localFont({
  src: '../../public/fonts/Andromeda-eR2n.ttf',
  variable: '--font-entanglement',
  weight: '400',
  display: 'swap',
});

// Available for regular use via the `font-bungee-hairline` utility or the
// `.bungee-hairline-regular` class.
const bungeeHairline = localFont({
  src: '../../public/fonts/Ballega-BL9EB.otf',
  variable: '--font-bungee-hairline',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Next.js 16 + React 19 + Three.js Portfolio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${entanglement.variable} ${bungeeHairline.variable} antialiased bg-black text-white`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
