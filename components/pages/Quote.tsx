import { quote } from '@/data/portfolio';
import Parallax from '@/components/Parallax';

export default function Quote() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-6 py-20"
      aria-label="Quote"
    >
      <figure className="max-w-3xl w-full text-center space-y-6">
        <Parallax speed={0.45}>
          <span
            aria-hidden
            className="block text-6xl md:text-7xl font-bold text-blue-400/40 leading-none select-none"
          >
            &ldquo;
          </span>
        </Parallax>
        <Parallax speed={0.25}>
          <blockquote className="text-2xl md:text-4xl font-medium tracking-tight leading-snug text-white/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            {quote.text}
          </blockquote>
        </Parallax>
        <Parallax speed={0.1}>
          <figcaption className="text-sm md:text-base uppercase tracking-widest text-white/50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            — {quote.author}
          </figcaption>
        </Parallax>
      </figure>
    </section>
  );
}
