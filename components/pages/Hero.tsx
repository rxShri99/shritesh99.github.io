'use client';

import { hero } from '@/data/portfolio';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 pointer-events-none select-none translate-y-[-135px] min-[375px]:translate-y-[calc(-135px+(-175px+135px)*(100vw-375px)/53)] min-[428px]:translate-y-[calc(-175px+(-110px+175px)*(100vw-428px)/153)] min-[581px]:translate-y-[-110px]">
        <h1 className="font-bold tracking-tight leading-none text-[40px] min-[375px]:text-[calc(40px+5*(100vw-375px)/53)] min-[428px]:text-[calc(45px+5*(100vw-428px)/153)] min-[581px]:text-[calc(50px+50*(100vw-581px)/1018)] min-[1599px]:text-[100px]">
          {hero.name}
        </h1>
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
