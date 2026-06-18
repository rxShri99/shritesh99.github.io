/**
 * Structured portfolio content
 * Edit this file to update all sections of the site.
 */

export const hero = {
  name: 'Shritesh Jamulkar',
  title: 'Software Engineer',
  tagline: 'Building elegant solutions with modern web technologies.',
};

export const about = {
  bio: `I'm a passionate software engineer who loves crafting performant, visually stunning web experiences. With a strong foundation in full-stack development, I focus on writing clean, maintainable code and pushing the boundaries of what's possible on the web.`,
  highlights: [
    'Full-Stack Development',
    'Interactive 3D Web Experiences',
    'Performance Optimization',
    'Open Source Contributor',
  ],
};

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'tools';
}

export const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'Three.js', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'HTML / CSS', category: 'frontend' },
  // Backend
  { name: 'Node.js', category: 'backend' },
  { name: 'Python', category: 'backend' },
  { name: 'REST APIs', category: 'backend' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'MongoDB', category: 'backend' },
  // DevOps
  { name: 'Docker', category: 'devops' },
  { name: 'CI/CD', category: 'devops' },
  { name: 'AWS', category: 'devops' },
  { name: 'Linux', category: 'devops' },
  // Tools
  { name: 'Git', category: 'tools' },
  { name: 'VS Code', category: 'tools' },
  { name: 'Figma', category: 'tools' },
  { name: 'Jira', category: 'tools' },
];

export const skillCategories: Record<Skill['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps',
  tools: 'Tools',
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
];

export const contact = {
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
