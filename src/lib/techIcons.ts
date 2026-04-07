import { IconType } from "react-icons";
import {
  SiDocker,
  SiElastic,
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
} from "react-icons/si";

export type TechIconConfig = {
  icon: IconType;
  label: string;
  color: string;
};

export const techIcons: Record<string, TechIconConfig> = {
  typescript: { icon: SiTypescript, label: "TypeScript", color: "var(--color-accent)" },
  nextjs: { icon: SiNextdotjs, label: "Next.js", color: "var(--color-text-primary)" },
  postgres: { icon: SiPostgresql, label: "PostgreSQL", color: "var(--color-accent-secondary)" },
  docker: { icon: SiDocker, label: "Docker", color: "var(--color-accent)" },
  react: { icon: SiReact, label: "React", color: "var(--color-accent-secondary)" },
  tailwind: { icon: SiTailwindcss, label: "Tailwind CSS", color: "var(--color-accent-secondary)" },
  node: { icon: SiNodedotjs, label: "Node.js", color: "var(--color-success)" },
  elastic: { icon: SiElastic, label: "Elastic", color: "var(--color-warning)" },
  markdown: { icon: SiMarkdown, label: "Markdown", color: "var(--color-text-secondary)" },
  python: { icon: SiPython, label: "Python", color: "var(--color-accent-secondary)" },
  linux: { icon: SiLinux, label: "Linux", color: "var(--color-text-primary)" },
  redis: { icon: SiRedis, label: "Redis", color: "var(--color-danger)" },
};
