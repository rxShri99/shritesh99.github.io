import { hero } from '@/data/portfolio';

export default function Page1() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 pointer-events-none select-none">
        <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 font-light">
          {hero.title}
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
          {hero.name}
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-md mx-auto">
          {hero.tagline}
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
        <span className="text-xs uppercase tracking-widest text-white/30">
          Scroll
        </span>
        <svg
          className="w-5 h-5 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
