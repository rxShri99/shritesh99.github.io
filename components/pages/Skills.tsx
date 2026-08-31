import { skills, skillCategories, type Skill } from '@/data/portfolio';
import Parallax from '@/components/Parallax';
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

// Each brand's canonical Simple-Icons hex, with monochrome-on-black brands
// (Next.js, Three.js, Vercel, Ethereum) lifted to white so they don't vanish
// against the dark chip. Generic Tabler glyphs stay white too — they aren't
// brand marks.
const SKILL_COLORS: Record<string, string> = {
  React: '#61DAFB',
  'Next.js': '#FFFFFF',
  TypeScript: '#3178C6',
  'Three.js': '#FFFFFF',
  'Tailwind CSS': '#06B6D4',
  'HTML / CSS': '#E34F26',
  'Node.js': '#5FA04E',
  Python: '#3776AB',
  GraphQL: '#E10098',
  PostgreSQL: '#4169E1',
  MongoDB: '#47A248',
  Docker: '#2496ED',
  Kubernetes: '#326CE5',
  'GitHub Actions': '#2088FF',
  Linux: '#FCC624',
  Git: '#F05032',
  AWS: '#FF9900',
  'Google Cloud': '#4285F4',
  Cloudflare: '#F38020',
  Vercel: '#FFFFFF',
  Netlify: '#00C7B7',
  Serverless: '#FD5750',
  Solidity: '#AAB6BC',
  Ethereum: '#FFFFFF',
  Hardhat: '#F0D50C',
  'Web3.js': '#F16822',
  IPFS: '#65C2CB',
};
const FALLBACK_ICON_COLOR = 'rgba(255,255,255,0.9)';

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
                    className="flex items-center gap-2.5 md:gap-3 whitespace-nowrap px-5 py-3 md:px-7 md:py-4 rounded-full border border-white/20 bg-[#12121a] md:bg-white/[0.08] md:backdrop-blur-md md:backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] text-base md:text-xl text-white/80"
                  >
                    {Icon && (
                      <Icon
                        aria-hidden
                        className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                        style={{
                          color:
                            SKILL_COLORS[skill.name] ?? FALLBACK_ICON_COLOR,
                        }}
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
          <Parallax speed={0.35}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Skills &amp; Tech Stack
            </h2>
          </Parallax>
        </div>
      </div>

      <div className="w-full space-y-7 md:space-y-9">
        {ROW_ORDER.map((category, i) => (
          <Parallax key={category} speed={0.1 + i * 0.05} className="space-y-2.5">
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
          </Parallax>
        ))}
      </div>
    </section>
  );
}
