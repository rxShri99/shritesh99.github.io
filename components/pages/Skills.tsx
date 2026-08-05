import { skills, skillCategories, type Skill } from '@/data/portfolio';
import type { IconType } from 'react-icons';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiThreedotjs,
  SiTailwindcss,
  SiHtml5,
  SiNodedotjs,
  SiPython,
  SiGraphql,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiKubernetes,
  SiGithubactions,
  SiLinux,
  SiGit,
  SiGooglecloud,
  SiCloudflare,
  SiVercel,
  SiNetlify,
  SiServerless,
  SiSolidity,
  SiEthereum,
  SiWeb3Dotjs,
  SiIpfs,
} from 'react-icons/si';
import { FaAws } from 'react-icons/fa';
import { LuHardHat } from 'react-icons/lu';
import { TbApi, TbInfinity, TbFileCode } from 'react-icons/tb';

// Logo per skill name. Simple Icons has no AWS (brand policy) or Hardhat, so
// those use Font Awesome / Lucide; generic concepts get fitting Tabler glyphs.
const SKILL_ICONS: Record<string, IconType> = {
  React: SiReact,
  'Next.js': SiNextdotjs,
  TypeScript: SiTypescript,
  'Three.js': SiThreedotjs,
  'Tailwind CSS': SiTailwindcss,
  'HTML / CSS': SiHtml5,
  'Node.js': SiNodedotjs,
  Python: SiPython,
  'REST APIs': TbApi,
  GraphQL: SiGraphql,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  Docker: SiDocker,
  Kubernetes: SiKubernetes,
  'CI/CD': TbInfinity,
  'GitHub Actions': SiGithubactions,
  Linux: SiLinux,
  Git: SiGit,
  AWS: FaAws,
  'Google Cloud': SiGooglecloud,
  Cloudflare: SiCloudflare,
  Vercel: SiVercel,
  Netlify: SiNetlify,
  Serverless: SiServerless,
  Solidity: SiSolidity,
  Ethereum: SiEthereum,
  Hardhat: LuHardHat,
  'Web3.js': SiWeb3Dotjs,
  'Smart Contracts': TbFileCode,
  IPFS: SiIpfs,
};

const ROW_ORDER = Object.keys(skillCategories) as Skill['category'][];
// Chips per category are few, so each half repeats them until it is
// comfortably wider than any viewport — the -50% loop then never shows a gap.
const REPEAT = 3;

function MarqueeRow({
  items,
  reverse,
  duration,
}: {
  items: Skill[];
  reverse: boolean;
  duration: number;
}) {
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div
        className="marquee-track flex w-max"
        data-reverse={reverse}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((half) => (
          <div
            key={half}
            aria-hidden={half === 1}
            className="flex gap-4 md:gap-6 pr-4 md:pr-6"
          >
            {Array.from({ length: REPEAT }).flatMap((_, r) =>
              items.map((skill) => {
                const Icon = SKILL_ICONS[skill.name];
                return (
                  <span
                    key={`${r}-${skill.name}`}
                    className="flex items-center gap-2.5 md:gap-3 whitespace-nowrap px-5 py-3 md:px-7 md:py-4 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-md backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] text-base md:text-xl text-white/80"
                  >
                    {Icon && (
                      <Icon
                        aria-hidden
                        className="w-5 h-5 md:w-6 md:h-6 text-white/90 shrink-0"
                      />
                    )}
                    {skill.name}
                  </span>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center py-20"
      aria-label="Skills"
    >
      {/* Same heading position as the other pages: flex-centered column */}
      <div className="w-full flex justify-center px-6 mb-10 md:mb-14">
        <div className="max-w-3xl w-full">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Skills &amp; Tech Stack
          </h2>
        </div>
      </div>

      <div className="w-full space-y-7 md:space-y-9">
        {ROW_ORDER.map((category, i) => (
          <div key={category} className="space-y-2.5">
            <div className="w-full flex justify-center px-6">
              <div className="max-w-3xl w-full">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  {skillCategories[category]}
                </p>
              </div>
            </div>
            <MarqueeRow
              items={skills.filter((s) => s.category === category)}
              reverse={i % 2 === 1}
              duration={26 + i * 5}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
