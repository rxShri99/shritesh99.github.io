import { projects } from '@/data/portfolio';

export default function Page4() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full space-y-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 space-y-4 hover:border-blue-400/30 transition-colors"
            >
              <h3 className="text-xl font-semibold">{project.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 pt-1">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    GitHub &rarr;
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    Live Demo &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
