import { skills, skillCategories, type Skill } from '@/data/portfolio';

const categoryOrder: Skill['category'][] = [
  'frontend',
  'backend',
  'devops',
  'tools',
];

export default function Skills() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-3xl w-full space-y-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Skills &amp; Tech Stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {categoryOrder.map((cat) => (
            <div key={cat} className="space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-white/40">
                {skillCategories[cat]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills
                  .filter((s) => s.category === cat)
                  .map((s) => (
                    <span
                      key={s.name}
                      className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 hover:border-blue-400/50 hover:text-white transition-colors"
                    >
                      {s.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
