/**
 * Structured portfolio content
 * Edit this file to update all sections of the site.
 */

export const hero = {
  name: 'I am a passionate Developer!',
};

export const about = {
  bio: `I'm a full-stack engineer who loves building immersive, detail-obsessed web experiences — from scroll-driven 3D scenes to the infrastructure that ships them. When I'm not writing code, I'm probably at a hackathon, a meetup, or deep in a side project.`,
  highlights: [
    '5+ years building for the web',
    'Frontend, backend & cloud',
    '3D / WebGL experiences',
    'Blockchain & Web3 curious',
  ],
};

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'cloud' | 'blockchain';
}

export const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'Three.js', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'HTML / CSS', category: 'frontend' },
  { name: 'JavaScript', category: 'frontend' },
  { name: 'Redux', category: 'frontend' },
  { name: 'Vue.js', category: 'frontend' },
  { name: 'Svelte', category: 'frontend' },
  { name: 'Vite', category: 'frontend' },
  { name: 'Webpack', category: 'frontend' },
  { name: 'Sass', category: 'frontend' },
  { name: 'Framer Motion', category: 'frontend' },
  { name: 'GSAP', category: 'frontend' },
  { name: 'Storybook', category: 'frontend' },
  { name: 'Jest', category: 'frontend' },
  { name: 'Cypress', category: 'frontend' },
  { name: 'Figma', category: 'frontend' },
  { name: 'Astro', category: 'frontend' },
  // Backend
  { name: 'Node.js', category: 'backend' },
  { name: 'Python', category: 'backend' },
  { name: 'REST APIs', category: 'backend' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'MongoDB', category: 'backend' },
  { name: 'Express', category: 'backend' },
  { name: 'NestJS', category: 'backend' },
  { name: 'Django', category: 'backend' },
  { name: 'FastAPI', category: 'backend' },
  { name: 'Go', category: 'backend' },
  { name: 'Rust', category: 'backend' },
  { name: 'Redis', category: 'backend' },
  { name: 'MySQL', category: 'backend' },
  { name: 'Prisma', category: 'backend' },
  { name: 'Kafka', category: 'backend' },
  { name: 'RabbitMQ', category: 'backend' },
  { name: 'Elasticsearch', category: 'backend' },
  { name: 'Firebase', category: 'backend' },
  { name: 'Supabase', category: 'backend' },
  // DevOps
  { name: 'Docker', category: 'devops' },
  { name: 'Kubernetes', category: 'devops' },
  { name: 'CI/CD', category: 'devops' },
  { name: 'GitHub Actions', category: 'devops' },
  { name: 'Linux', category: 'devops' },
  { name: 'Git', category: 'devops' },
  { name: 'Terraform', category: 'devops' },
  { name: 'Ansible', category: 'devops' },
  { name: 'Jenkins', category: 'devops' },
  { name: 'GitLab', category: 'devops' },
  { name: 'Nginx', category: 'devops' },
  { name: 'Grafana', category: 'devops' },
  { name: 'Prometheus', category: 'devops' },
  { name: 'Helm', category: 'devops' },
  { name: 'Argo', category: 'devops' },
  { name: 'Bash', category: 'devops' },
  { name: 'Ubuntu', category: 'devops' },
  { name: 'Podman', category: 'devops' },
  { name: 'Vagrant', category: 'devops' },
  { name: 'GitHub', category: 'devops' },
  // Cloud
  { name: 'AWS', category: 'cloud' },
  { name: 'Google Cloud', category: 'cloud' },
  { name: 'Cloudflare', category: 'cloud' },
  { name: 'Vercel', category: 'cloud' },
  { name: 'Netlify', category: 'cloud' },
  { name: 'Serverless', category: 'cloud' },
  { name: 'DigitalOcean', category: 'cloud' },
  { name: 'Fly.io', category: 'cloud' },
  { name: 'Railway', category: 'cloud' },
  { name: 'Render', category: 'cloud' },
  { name: 'Fastly', category: 'cloud' },
  { name: 'OpenStack', category: 'cloud' },
  { name: 'Akamai', category: 'cloud' },
  { name: 'Alibaba Cloud', category: 'cloud' },
  { name: 'Hetzner', category: 'cloud' },
  { name: 'Vultr', category: 'cloud' },
  { name: 'Scaleway', category: 'cloud' },
  { name: 'OVH', category: 'cloud' },
  { name: 'Pulumi', category: 'cloud' },
  { name: 'UpCloud', category: 'cloud' },
  // Blockchain
  { name: 'Solidity', category: 'blockchain' },
  { name: 'Ethereum', category: 'blockchain' },
  { name: 'Hardhat', category: 'blockchain' },
  { name: 'Web3.js', category: 'blockchain' },
  { name: 'Smart Contracts', category: 'blockchain' },
  { name: 'IPFS', category: 'blockchain' },
  { name: 'Bitcoin', category: 'blockchain' },
  { name: 'Solana', category: 'blockchain' },
  { name: 'Polygon', category: 'blockchain' },
  { name: 'Chainlink', category: 'blockchain' },
  { name: 'Polkadot', category: 'blockchain' },
  { name: 'Binance', category: 'blockchain' },
  { name: 'Cardano', category: 'blockchain' },
  { name: 'OpenZeppelin', category: 'blockchain' },
  { name: 'WalletConnect', category: 'blockchain' },
  { name: 'NEAR', category: 'blockchain' },
  { name: 'Litecoin', category: 'blockchain' },
  { name: 'XRP', category: 'blockchain' },
  { name: 'Stellar', category: 'blockchain' },
  { name: 'Optimism', category: 'blockchain' },
];

export const skillCategories: Record<Skill['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps',
  cloud: 'Cloud',
  blockchain: 'Blockchain',
};

export interface Project {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

export const projects: Project[] = [
  {
    title: 'Portfolio Website',
    description:
      'An immersive personal portfolio built with Next.js, Three.js, and custom GLSL shaders featuring scroll-driven 3D ring animations.',
    tech: ['Next.js', 'Three.js', 'GLSL', 'Tailwind CSS'],
    github: 'https://github.com/Shritesh99/shritesh99.github.io',
    live: 'https://shritesh99.github.io',
  },
  {
    title: 'Project Two',
    description:
      'A full-stack application demonstrating modern development practices with real-time data synchronisation.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'WebSockets'],
    github: '#',
  },
  {
    title: 'Project Three',
    description:
      'A developer tool that streamlines workflow automation and improves team productivity.',
    tech: ['TypeScript', 'Python', 'Docker', 'REST API'],
    github: '#',
    live: '#',
  },
  {
    title: 'Project Four',
    description:
      'An open-source library providing reusable utilities for building interactive web experiences.',
    tech: ['TypeScript', 'WebGL', 'npm'],
    github: '#',
  },
];

export interface Experience {
  company: string;
  role: string;
  period: string;
  achievements: string[];
}

export const experiences: Experience[] = [
  {
    company: 'Company A',
    role: 'Senior Software Engineer',
    period: '2023 — Present',
    achievements: [
      'Led the migration of a legacy monolith to a micro-services architecture, reducing deploy times by 60%.',
      'Mentored a team of 4 junior engineers and established code-review best practices.',
    ],
  },
  {
    company: 'Company B',
    role: 'Software Engineer',
    period: '2021 — 2023',
    achievements: [
      'Built a real-time analytics dashboard serving 10k+ daily active users.',
      'Implemented CI/CD pipelines that cut release cycle time from 2 weeks to 2 days.',
    ],
  },
  {
    company: 'Company C',
    role: 'Junior Developer',
    period: '2019 — 2021',
    achievements: [
      'Developed and maintained RESTful APIs powering the core product.',
      'Improved API response times by 40% through query optimisation and caching.',
    ],
  },
  {
    company: 'Company D',
    role: 'Frontend Developer',
    period: '2018 — 2019',
    achievements: [
      'Shipped a component library adopted across three product teams.',
      'Cut bundle size by 35% through code-splitting and dependency audits.',
    ],
  },
  {
    company: 'Company E',
    role: 'Software Engineering Intern',
    period: '2017 — 2018',
    achievements: [
      'Automated regression test suites, freeing up a day of manual QA per release.',
      'Prototyped internal tooling that graduated into a production service.',
    ],
  },
  {
    company: 'Open Source',
    role: 'Contributor',
    period: '2016 — 2017',
    achievements: [
      'Contributed fixes and features to popular JavaScript visualisation libraries.',
      'Maintained documentation and triaged issues for a community of users.',
    ],
  },
];

export interface CommunityEvent {
  title: string;
  type: 'conference' | 'hackathon' | 'meetup' | 'talk';
  date: string;
  location?: string;
  description: string;
  link?: string;
  /** Photo shown in the horizontal slider — replace with real event photos */
  image: string;
}

export const communityEvents: CommunityEvent[] = [
  {
    title: 'Conference Talk',
    type: 'conference',
    date: '2025',
    location: 'City, Country',
    description:
      'Spoke about building immersive 3D experiences on the web with React Three Fiber.',
    link: '#',
    image: 'https://picsum.photos/seed/conference/1600/900',
  },
  {
    title: 'Hackathon — Winner',
    type: 'hackathon',
    date: '2024',
    location: 'City, Country',
    description:
      'Built a working prototype in 36 hours and took first place among 120 teams.',
    link: '#',
    image: 'https://picsum.photos/seed/hackathon/1600/900',
  },
  {
    title: 'Tech Meetup',
    type: 'meetup',
    date: '2024',
    location: 'City, Country',
    description:
      'Organised a local developer meetup on modern frontend tooling and performance.',
    image: 'https://picsum.photos/seed/meetup/1600/900',
  },
  {
    title: 'Lightning Talk',
    type: 'talk',
    date: '2023',
    location: 'Online',
    description:
      'Gave a lightning talk on GLSL shaders for designers and frontend engineers.',
    image: 'https://picsum.photos/seed/talk/1600/900',
  },
];

export const eventTypeLabels: Record<CommunityEvent['type'], string> = {
  conference: 'Conference',
  hackathon: 'Hackathon',
  meetup: 'Meetup',
  talk: 'Talk',
};

export const quote = {
  tagline: 'log(😅) = 💧log(😄)',
  text: 'When problems grows exponentially, solve them logarithmically.',
  author: 'Shri',
};

export const contact = {
  handle: '@rxShri99',
  email: 'hello@shritesh.dev',
  links: [
    { label: 'GitHub', url: 'https://github.com/Shritesh99', icon: 'github' },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/shritesh99',
      icon: 'linkedin',
    },
    {
      label: 'Twitter / X',
      url: 'https://twitter.com/shritesh99',
      icon: 'twitter',
    },
  ],
};
