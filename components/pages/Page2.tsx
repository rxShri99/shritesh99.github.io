import { about } from '@/data/portfolio';

export default function Page2() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          About Me
        </h2>
        <p className="text-base md:text-lg text-white/70 leading-relaxed">
          {about.bio}
        </p>
        <ul className="grid grid-cols-2 gap-3">
          {about.highlights.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm md:text-base text-white/60"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
