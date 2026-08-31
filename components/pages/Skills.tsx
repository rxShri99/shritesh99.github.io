'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useControls } from 'leva';
import { skills, skillCategories, type Skill } from '@/data/portfolio';
import { usePrefersReducedMotion } from '@/hooks';
import { useScroll } from '@/context/ScrollContext';
import { PAGE_HEIGHTS_VH } from '@/constants';
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
  SiJavascript,
  SiRedux,
  SiVuedotjs,
  SiSvelte,
  SiVite,
  SiWebpack,
  SiSass,
  SiFramer,
  SiGreensock,
  SiStorybook,
  SiJest,
  SiCypress,
  SiFigma,
  SiAstro,
  SiExpress,
  SiNestjs,
  SiDjango,
  SiFastapi,
  SiGo,
  SiRust,
  SiRedis,
  SiMysql,
  SiPrisma,
  SiApachekafka,
  SiRabbitmq,
  SiElasticsearch,
  SiFirebase,
  SiSupabase,
  SiTerraform,
  SiAnsible,
  SiJenkins,
  SiGitlab,
  SiNginx,
  SiGrafana,
  SiPrometheus,
  SiHelm,
  SiArgo,
  SiGnubash,
  SiUbuntu,
  SiPodman,
  SiVagrant,
  SiGithub,
  SiDigitalocean,
  SiFlydotio,
  SiRailway,
  SiRender,
  SiFastly,
  SiOpenstack,
  SiAkamai,
  SiAlibabacloud,
  SiHetzner,
  SiVultr,
  SiScaleway,
  SiOvh,
  SiPulumi,
  SiUpcloud,
  SiBitcoin,
  SiSolana,
  SiPolygon,
  SiChainlink,
  SiPolkadot,
  SiBinance,
  SiCardano,
  SiOpenzeppelin,
  SiWalletconnect,
  SiNear,
  SiLitecoin,
  SiRipple,
  SiStellar,
  SiOptimism,
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
  JavaScript: SiJavascript,
  Redux: SiRedux,
  'Vue.js': SiVuedotjs,
  Svelte: SiSvelte,
  Vite: SiVite,
  Webpack: SiWebpack,
  Sass: SiSass,
  'Framer Motion': SiFramer,
  GSAP: SiGreensock,
  Storybook: SiStorybook,
  Jest: SiJest,
  Cypress: SiCypress,
  Figma: SiFigma,
  Astro: SiAstro,
  Express: SiExpress,
  NestJS: SiNestjs,
  Django: SiDjango,
  FastAPI: SiFastapi,
  Go: SiGo,
  Rust: SiRust,
  Redis: SiRedis,
  MySQL: SiMysql,
  Prisma: SiPrisma,
  Kafka: SiApachekafka,
  RabbitMQ: SiRabbitmq,
  Elasticsearch: SiElasticsearch,
  Firebase: SiFirebase,
  Supabase: SiSupabase,
  Terraform: SiTerraform,
  Ansible: SiAnsible,
  Jenkins: SiJenkins,
  GitLab: SiGitlab,
  Nginx: SiNginx,
  Grafana: SiGrafana,
  Prometheus: SiPrometheus,
  Helm: SiHelm,
  Argo: SiArgo,
  Bash: SiGnubash,
  Ubuntu: SiUbuntu,
  Podman: SiPodman,
  Vagrant: SiVagrant,
  GitHub: SiGithub,
  DigitalOcean: SiDigitalocean,
  'Fly.io': SiFlydotio,
  Railway: SiRailway,
  Render: SiRender,
  Fastly: SiFastly,
  OpenStack: SiOpenstack,
  Akamai: SiAkamai,
  'Alibaba Cloud': SiAlibabacloud,
  Hetzner: SiHetzner,
  Vultr: SiVultr,
  Scaleway: SiScaleway,
  OVH: SiOvh,
  Pulumi: SiPulumi,
  UpCloud: SiUpcloud,
  Bitcoin: SiBitcoin,
  Solana: SiSolana,
  Polygon: SiPolygon,
  Chainlink: SiChainlink,
  Polkadot: SiPolkadot,
  Binance: SiBinance,
  Cardano: SiCardano,
  OpenZeppelin: SiOpenzeppelin,
  WalletConnect: SiWalletconnect,
  NEAR: SiNear,
  Litecoin: SiLitecoin,
  XRP: SiRipple,
  Stellar: SiStellar,
  Optimism: SiOptimism,
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
  JavaScript: '#F7DF1E',
  Redux: '#764ABC',
  'Vue.js': '#4FC08D',
  Svelte: '#FF3E00',
  Vite: '#646CFF',
  Webpack: '#8DD6F9',
  Sass: '#CC6699',
  'Framer Motion': '#0055FF',
  GSAP: '#88CE02',
  Storybook: '#FF4785',
  Jest: '#C21325',
  Cypress: '#69D3A7',
  Figma: '#F24E1E',
  Astro: '#BC52EE',
  Express: '#FFFFFF',
  NestJS: '#E0234E',
  Django: '#44B78B',
  FastAPI: '#009688',
  Go: '#00ADD8',
  Rust: '#FFFFFF',
  Redis: '#FF4438',
  MySQL: '#4479A1',
  Prisma: '#FFFFFF',
  Kafka: '#FFFFFF',
  RabbitMQ: '#FF6600',
  Elasticsearch: '#00BFB3',
  Firebase: '#FFCA28',
  Supabase: '#3FCF8E',
  Terraform: '#844FBA',
  Ansible: '#EE0000',
  Jenkins: '#D24939',
  GitLab: '#FC6D26',
  Nginx: '#009639',
  Grafana: '#F46800',
  Prometheus: '#E6522C',
  Helm: '#5B8DEF',
  Argo: '#EF7B4D',
  Bash: '#4EAA25',
  Ubuntu: '#E95420',
  Podman: '#892CA0',
  Vagrant: '#1868F2',
  GitHub: '#FFFFFF',
  DigitalOcean: '#0080FF',
  'Fly.io': '#FFFFFF',
  Railway: '#FFFFFF',
  Render: '#FFFFFF',
  Fastly: '#FF282D',
  OpenStack: '#ED1944',
  Akamai: '#0096D6',
  'Alibaba Cloud': '#FF6A00',
  Hetzner: '#D50C2D',
  Vultr: '#007BFC',
  Scaleway: '#7A2FF2',
  OVH: '#4A90E2',
  Pulumi: '#B44BD6',
  UpCloud: '#9B4DFF',
  Bitcoin: '#F7931A',
  Solana: '#9945FF',
  Polygon: '#8247E5',
  Chainlink: '#375BD2',
  Polkadot: '#E6007A',
  Binance: '#F0B90B',
  Cardano: '#3468D1',
  OpenZeppelin: '#4E5EE4',
  WalletConnect: '#3B99FC',
  NEAR: '#FFFFFF',
  Litecoin: '#D3D3D3',
  XRP: '#00AAE4',
  Stellar: '#FFFFFF',
  Optimism: '#FF0420',
};
const FALLBACK_ICON_COLOR = 'rgba(255,255,255,0.9)';

const ROW_ORDER = Object.keys(skillCategories) as Skill['category'][];

const PAGE_INDEX = 3;
const SECTION_VH = PAGE_HEIGHTS_VH[PAGE_INDEX];
// Same stacking rhythm as Projects: each card owns a 100vh scroll slot;
// whatever the section has beyond N*100vh is settle room.
const SLOT_VH = 100;

// Icons sit half outside the sphere radius; keep them inside the box.
const ICON_MARGIN = 26;
// Repeat the sphere's icons until it carries at least this many (with the
// core-10 slice below this is a no-op — 10 unique icons, no repeats).
const MIN_POINTS = 10;
// Only the core skills per category ride the sphere (data lists them first).
const CORE_PER_CATEGORY = 10;
/** Shared drag offsets — one gesture rotates every layer of the stack. */
interface SphereDrag {
  angle: number;
  tilt: number;
  /** 1 = spheres tumble on their own axes; 0 = the cursor owns rotation. */
  baseScale: number;
}

// "I am a <role>" centre title — one role unlocks per stack layer.
const ROLES = (Object.keys(skillCategories) as Skill['category'][]).map(
  (c) => `${skillCategories[c]} Engineer`
);
const SWAP_EVERY_MS = 2400;
const LETTER_MS = 500;
const STAGGER_MS = 32;
const LETTER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function TitleLetters({ word, out }: { word: string; out?: boolean }) {
  return (
    <>
      {word.split('').map((ch, i) => (
        <span
          key={i}
          className="inline-block will-change-transform andromeda-regular"
          style={{
            animation: `${out ? 'xtitle-out' : 'xtitle-in'} ${LETTER_MS}ms ${LETTER_EASE} ${i * STAGGER_MS}ms both`,
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}

/**
 * Exchange-title: static "I am a" prefix + a role word whose letters roll out
 * upward while the next role's letters roll in from below, staggered. Only
 * the roles unlocked by the stack so far take part; with one unlocked role
 * the word just sits still.
 */
function ExchangeTitle({ activeCount }: { activeCount: number }) {
  // leaving === -1 → no exit animation (initial state, layer one).
  const [state, setState] = useState({ current: 0, leaving: -1 });

  // A newly unlocked layer swaps its role in immediately.
  useEffect(() => {
    const target = activeCount - 1;
    // Async: effects must not set state synchronously.
    const raf = requestAnimationFrame(() =>
      setState((s) =>
        s.current === target ? s : { current: target, leaving: s.current }
      )
    );
    return () => cancelAnimationFrame(raf);
  }, [activeCount]);

  // Cycle through everything unlocked so far.
  useEffect(() => {
    if (activeCount < 2) return;
    const id = setInterval(() => {
      setState((s) => ({
        current: (s.current + 1) % activeCount,
        leaving: s.current,
      }));
    }, SWAP_EVERY_MS);
    return () => clearInterval(id);
  }, [activeCount]);

  const { current, leaving } = state;
  return (
    <div
      className="flex items-baseline justify-center gap-[0.4em] text-3xl md:text-5xl font-bold tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]"
      aria-label={`I am a ${ROLES.slice(0, activeCount).join(', ')}`}
    >
      <span className="text-white/60 andromeda-regular">I am a</span>
      <span
        aria-hidden
        className="relative inline-flex overflow-hidden py-[0.1em]"
      >
        <span key={`in-${current}`} className="inline-flex whitespace-pre">
          {/* No roll-in on the very first render */}
          {leaving === -1 ? (
            ROLES[current]
          ) : (
            <TitleLetters word={ROLES[current]} />
          )}
        </span>
        {leaving >= 0 && leaving !== current && (
          <span
            key={`out-${leaving}-${current}`}
            className="absolute left-0 top-0 inline-flex whitespace-pre py-[0.1em]"
          >
            <TitleLetters word={ROLES[leaving]} out />
          </span>
        )}
      </span>
    </div>
  );
}

// --- Tiny 3x3 rotation-matrix toolkit (row-major) --------------------------
type Mat3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** Rodrigues rotation matrix around a unit axis. */
function axisAngle(ax: number, ay: number, az: number, angle: number): Mat3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  return [
    t * ax * ax + c,
    t * ax * ay - s * az,
    t * ax * az + s * ay,
    t * ax * ay + s * az,
    t * ay * ay + c,
    t * ay * az - s * ax,
    t * ax * az - s * ay,
    t * ay * az + s * ax,
    t * az * az + c,
  ];
}

function mat3Mul(a: Mat3, b: Mat3): Mat3 {
  const out = new Array(9) as Mat3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out[r * 3 + c] =
        a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
    }
  }
  return out;
}

/** Deterministic PRNG so the per-sphere random axis is render-pure. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Spinning icon sphere: items distributed on a Fibonacci sphere, tumbling
 * around its own RANDOM axis from a random starting orientation (kept as an
 * orientation matrix, so drags leave the axis wherever the fling ends instead
 * of snapping back to a fixed one). Depth drives scale/opacity/stacking,
 * projected straight to DOM transforms each frame — no canvas.
 */

function IconSphere({
  items,
  speed,
  reverse,
  radiusScale = 1,
  drag,
}: {
  items: Skill[];
  /** Spin rate in rad/s. */
  speed: number;
  reverse: boolean;
  /** Multiplier on the box-fitted radius (>1 spills past the box). */
  radiusScale?: number;
  /** Section-level drag offsets, applied on top of the base spin. */
  drag: RefObject<SphereDrag>;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduceMotion = usePrefersReducedMotion();

  // Repeat the category's icons until the sphere carries >= MIN_POINTS.
  const cloud = useMemo(() => {
    const repeats = Math.max(1, Math.ceil(MIN_POINTS / items.length));
    return Array.from(
      { length: items.length * repeats },
      (_, i) => items[i % items.length]
    );
  }, [items]);

  // Evenly spread unit-sphere points (golden-angle spiral).
  const points = useMemo(() => {
    const n = cloud.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: n }, (_, i) => {
      const y = n === 1 ? 0 : 1 - (2 * i) / (n - 1);
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      return [Math.cos(golden * i) * r, y, Math.sin(golden * i) * r] as const;
    });
  }, [cloud.length]);

  // Per-sphere random spin axis + starting orientation (seeded so it's
  // render-pure and stable across re-renders, but different per sphere).
  const spin = useMemo(() => {
    const rand = mulberry32(
      items.length * 7919 + Math.round(speed * 1000) + (reverse ? 131 : 17)
    );
    // Random unit axis (uniform-ish on the sphere).
    const z = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const axis = [Math.cos(theta) * r, z, Math.sin(theta) * r] as const;
    // Random starting orientation around another random axis.
    const z2 = rand() * 2 - 1;
    const t2 = rand() * Math.PI * 2;
    const r2 = Math.sqrt(Math.max(0, 1 - z2 * z2));
    const m0 = axisAngle(
      Math.cos(t2) * r2,
      z2,
      Math.sin(t2) * r2,
      rand() * Math.PI * 2
    );
    return { axis, m0 };
  }, [items.length, speed, reverse]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let radius = 0;
    const measure = () => {
      radius = Math.max(0, (box.clientWidth / 2 - ICON_MARGIN) * radiusScale);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);

    // Own orientation, accumulated as a matrix — the spin axis is this
    // sphere's random one, and drags leave the orientation wherever it lands.
    let m = spin.m0;

    const layout = () => {
      // Section-wide drag rides on top as free world-space rotation, so a
      // gesture swings every visible layer in the same direction.
      const dragRot = mat3Mul(
        axisAngle(1, 0, 0, drag.current.tilt),
        axisAngle(0, 1, 0, drag.current.angle)
      );
      const t = mat3Mul(dragRot, m);
      points.forEach(([x, y, z], i) => {
        const el = iconRefs.current[i];
        if (!el) return;
        const rx = t[0] * x + t[1] * y + t[2] * z;
        const ry = t[3] * x + t[4] * y + t[5] * z;
        const rz = t[6] * x + t[7] * y + t[8] * z;
        const depth = (rz + 1) / 2; // 0 = back, 1 = front
        el.style.transform = `translate(-50%, -50%) translate3d(${
          rx * radius
        }px, ${-ry * radius}px, 0) scale(${0.55 + 0.45 * depth})`;
        el.style.opacity = `${0.25 + 0.75 * depth}`;
        el.style.zIndex = `${Math.round(depth * 100)}`;
      });
    };

    if (reduceMotion) {
      layout();
      return () => ro.disconnect();
    }

    // Fixed small base spin around the random axis.
    const base = speed * (reverse ? -1 : 1);
    const [ax, ay, az] = spin.axis;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // The base tumble fades out while the cursor is steering the stack.
      m = mat3Mul(axisAngle(ax, ay, az, base * drag.current.baseScale * dt), m);
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [points, spin, speed, reverse, reduceMotion, radiusScale, drag]);

  return (
    <div ref={boxRef} className="relative w-full aspect-square select-none">
      {cloud.map((skill, i) => {
        const Icon = SKILL_ICONS[skill.name];
        // Repeats are decoration; only the first pass is named for a11y.
        const firstPass = i < items.length;
        return (
          <span
            key={`${skill.name}-${i}`}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            title={skill.name}
            aria-hidden={!firstPass}
            className="absolute left-1/2 top-1/2 will-change-transform"
          >
            {Icon && (
              <Icon
                aria-hidden
                className="w-8 h-8 md:w-10 md:h-10"
                style={{
                  color: SKILL_COLORS[skill.name] ?? FALLBACK_ICON_COLOR,
                }}
              />
            )}
            {firstPass && <span className="sr-only">{skill.name}</span>}
          </span>
        );
      })}
    </div>
  );
}

export default function Skills() {
  const { currentPage, pageProgress } = useScroll();
  const sectionRef = useRef<HTMLElement>(null);
  // Shared drag offsets, read by every sphere each frame — a gesture spins
  // the whole visible stack, not just the top layer.
  const dragRef = useRef<SphereDrag>({ angle: 0, tilt: 0, baseScale: 1 });
  const reduceMotion = usePrefersReducedMotion();

  // Sphere radius as a multiplier on the box fit — >1 spills the icons past
  // the box so the field drifts among the rings like an asteroid belt.
  const { radius } = useControls('Skills Sphere', {
    radius: { value: 1.35, min: 0.5, max: 1.8, step: 0.01 },
  });

  // Section-level drag: pointer gestures anywhere on the section rotate the
  // shared offsets, with momentum that eases out after release.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduceMotion) return;
    const state = dragRef.current;

    const DRAG_RAD_PER_PX = 0.011;
    // Cursor parallax: rad/s with the cursor at the viewport edge; the
    // rotation is zero (stopped) with the cursor dead-centre on the sphere
    // and steers OPPOSITE the cursor's offset — a 3D mouse-parallax feel.
    const PARALLAX_MAX = 0.9;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const hover = { x: 0, y: 0, inside: false };
    let hoverVelA = 0;
    let hoverVelT = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velA = 0;
    let velT = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velA = 0;
      velT = 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // pointer capture is best-effort
      }
    };
    const enter = () => {
      hover.inside = true;
    };
    const leave = () => {
      hover.inside = false;
    };
    const move = (e: PointerEvent) => {
      hover.x = e.clientX;
      hover.y = e.clientY;
      hover.inside = true;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      state.angle += dx * DRAG_RAD_PER_PX;
      state.tilt -= dy * DRAG_RAD_PER_PX;
      // Momentum from gesture speed (~60Hz sampling), clamped.
      velA = Math.max(-7, Math.min(7, dx * DRAG_RAD_PER_PX * 60));
      velT = Math.max(-7, Math.min(7, -dy * DRAG_RAD_PER_PX * 60));
    };
    const up = () => {
      dragging = false;
    };

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) {
        state.angle += velA * dt;
        state.tilt += velT * dt;
        const k = Math.min(1, 1.2 * dt);
        velA -= velA * k;
        velT -= velT * k;

        // Cursor steering: velocity ∝ offset from the sphere centre (the
        // viewport centre — the spheres are flex-centred in the pinned
        // viewport), opposite the cursor's direction, zero at dead centre.
        const steering = finePointer && hover.inside;
        const nx = steering
          ? (hover.x - window.innerWidth / 2) / (window.innerWidth / 2)
          : 0;
        const ny = steering
          ? (hover.y - window.innerHeight / 2) / (window.innerHeight / 2)
          : 0;
        const s = Math.min(1, 6 * dt);
        hoverVelA += (-nx * PARALLAX_MAX - hoverVelA) * s;
        hoverVelT += (ny * PARALLAX_MAX - hoverVelT) * s;
        state.angle += hoverVelA * dt;
        state.tilt += hoverVelT * dt;

        // Hand rotation ownership to the cursor while it steers; the base
        // tumble eases back in once it leaves.
        const baseTarget = steering ? 0 : 1;
        state.baseScale += (baseTarget - state.baseScale) * Math.min(1, 3 * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [reduceMotion]);

  // Scroll depth into this section, in vh units.
  const scrollVh =
    (currentPage < PAGE_INDEX
      ? 0
      : currentPage > PAGE_INDEX
        ? 1
        : pageProgress) * SECTION_VH;

  // Roles unlocked so far: layer i counts once its sphere is half slid in.
  const activeCount = Math.min(
    ROW_ORDER.length,
    Math.floor(scrollVh / SLOT_VH + 0.5) + 1
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full select-none"
      // Horizontal drags spin the stack; vertical swipes still scroll.
      style={{ height: `${SECTION_VH}vh`, touchAction: 'pan-y' }}
      aria-label="Skills"
    >
      {ROW_ORDER.map((category, i) => {
        // How far the NEXT card has slid up over this one (0 → 1).
        const covered =
          i < ROW_ORDER.length - 1
            ? Math.max(0, Math.min(1, scrollVh / SLOT_VH - i))
            : 0;
        return (
          <div
            key={category}
            className="sticky top-0 h-screen flex items-center justify-center px-6"
          >
            {/* Centre title rides the first wrapper (outside the scaled div,
                so it never dims) and stays pinned across the whole stack. */}
            {i === 0 && (
              <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none z-10">
                <ExchangeTitle activeCount={activeCount} />
              </div>
            )}

            {/* Transparent "card" — no glass, no title. Covered spheres ease
                back but stay visible behind the incoming one, so the stack
                reads as skills compounding. */}
            <div
              className="will-change-transform"
              style={{
                transform: `scale(${1 - 0.12 * covered})`,
                opacity: 1 - 0.3 * covered,
                transition: 'transform 0.15s linear, opacity 0.15s linear',
              }}
            >
              <div
                className="relative h-[66vh] md:h-[70vh] max-h-[90vw] aspect-square"
                aria-label={skillCategories[category]}
              >
                <IconSphere
                  items={skills
                    .filter((s) => s.category === category)
                    .slice(0, CORE_PER_CATEGORY)}
                  speed={0.22 + i * 0.03}
                  reverse={i % 2 === 1}
                  radiusScale={radius}
                  drag={dragRef}
                />
              </div>
            </div>
          </div>
        );
      })}
      {/* Settle room: the finished stack rests here before the sticky release */}
      <div style={{ height: `${SECTION_VH - ROW_ORDER.length * SLOT_VH}vh` }} />
    </section>
  );
}
