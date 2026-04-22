import { IconType } from "react-icons";
import {
  SiDocker,
  SiElastic,
  SiFirebase,
  SiLinux,
  SiMarkdown,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

export type TechIconConfig = {
  icon: IconType;
  label: string;
  color: string;
};

export const techIcons: Record<string, TechIconConfig> = {
  typescript: { icon: SiTypescript, label: "TypeScript", color: "var(--brand-typescript)" },
  nextjs: { icon: SiNextdotjs, label: "Next.js", color: "var(--brand-nextjs)" },
  postgres: { icon: SiPostgresql, label: "PostgreSQL", color: "var(--brand-postgresql)" },
  docker: { icon: SiDocker, label: "Docker", color: "var(--brand-docker)" },
  react: { icon: SiReact, label: "React", color: "var(--brand-react)" },
  tailwind: { icon: SiTailwindcss, label: "Tailwind CSS", color: "var(--brand-tailwindcss)" },
  node: { icon: SiNodedotjs, label: "Node.js", color: "var(--brand-nodejs)" },
  elastic: { icon: SiElastic, label: "Elastic", color: "var(--brand-elastic)" },
  markdown: { icon: SiMarkdown, label: "Markdown", color: "var(--brand-markdown)" },
  python: { icon: SiPython, label: "Python", color: "var(--brand-python)" },
  linux: { icon: SiLinux, label: "Linux", color: "var(--brand-linux)" },
  redis: { icon: SiRedis, label: "Redis", color: "var(--brand-redis)" },
  firebase: { icon: SiFirebase, label: "Firebase", color: "var(--brand-firebase)" },
  vercel: { icon: SiVercel, label: "Vercel", color: "var(--brand-vercel)" },
};
