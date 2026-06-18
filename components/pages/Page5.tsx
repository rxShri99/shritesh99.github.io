import { experiences } from '@/data/portfolio';

export default function Page5() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full space-y-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Experience
        </h2>

        {/* Timeline */}
        <div className="relative border-l border-white/10 pl-8 space-y-12">
          {experiences.map((exp, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <span className="absolute -left-[calc(2rem+4.5px)] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-black" />

              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">
                {exp.period}
              </p>
              <h3 className="text-lg font-semibold">{exp.role}</h3>
              <p className="text-sm text-white/50 mb-3">{exp.company}</p>
              <ul className="space-y-1.5">
                {exp.achievements.map((a, j) => (
                  <li
                    key={j}
                    className="text-sm text-white/60 leading-relaxed pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-white/30"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
