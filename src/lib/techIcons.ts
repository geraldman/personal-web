import { IconType } from "react-icons";
import {
  SiBurpsuite,
  SiCplusplus,
  SiDocker,
  SiExpress,
  SiElastic,
  SiFirebase,
  SiGit,
  SiGnubash,
  SiLaravel,
  SiLinux,
  SiMarkdown,
  SiMysql,
  SiNginx,
  SiN8N,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenjdk,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiWireshark,
  SiHtml5,
  SiCss,
  SiJavascript,
  SiVite,
  SiGo,
  SiHivemq,
} from "react-icons/si";

import {
  FiDatabase
} from "react-icons/fi";

import {
  FaJava
} from "react-icons/fa";

export type TechIconConfig = {
  icon: IconType;
  label: string;
  color: string;
};

export const techIcons: Record<string, TechIconConfig> = {
  cplusplus: { icon: SiCplusplus, label: "C++", color: "var(--brand-cplusplus)" },
  typescript: { icon: SiTypescript, label: "TypeScript", color: "var(--brand-typescript)" },
  nextjs: { icon: SiNextdotjs, label: "Next.js", color: "var(--brand-nextjs)" },
  postgres: { icon: SiPostgresql, label: "PostgreSQL", color: "var(--brand-postgresql)" },
  docker: { icon: SiDocker, label: "Docker", color: "var(--brand-docker)" },
  "docker-compose": { icon: SiDocker, label: "Docker Compose", color: "var(--brand-docker)" },
  react: { icon: SiReact, label: "React", color: "var(--brand-react)" },
  tailwind: { icon: SiTailwindcss, label: "Tailwind CSS", color: "var(--brand-tailwindcss)" },
  node: { icon: SiNodedotjs, label: "Node.js", color: "var(--brand-nodejs)" },
  express: { icon: SiExpress, label: "Express", color: "var(--brand-express)" },
  laravel: { icon: SiLaravel, label: "Laravel", color: "var(--brand-laravel)" },
  nginx: { icon: SiNginx, label: "Nginx", color: "var(--brand-nginx)" },
  n8n: { icon: SiN8N, label: "n8n", color: "var(--brand-n8n)" },
  vite: { icon: SiVite, label: "Vite", color: "var(--brand-vite)" },
  go: { icon: SiGo, label: "Go", color: "var(--brand-go)" },
  elastic: { icon: SiElastic, label: "Elastic", color: "var(--brand-elastic)" },
  markdown: { icon: SiMarkdown, label: "Markdown", color: "var(--brand-markdown)" },
  python: { icon: SiPython, label: "Python", color: "var(--brand-python)" },
  bash: { icon: SiGnubash, label: "Bash", color: "var(--brand-bash)" },
  java: { icon: FaJava, label: "Java", color: "var(--brand-java)" },
  php: { icon: SiPhp, label: "PHP", color: "var(--brand-php)" },
  mysql: { icon: SiMysql, label: "MySQL", color: "var(--brand-mysql)" },
  git: { icon: SiGit, label: "Git", color: "var(--brand-git)" },
  linux: { icon: SiLinux, label: "Linux", color: "var(--brand-linux)" },
  redis: { icon: SiRedis, label: "Redis", color: "var(--brand-redis)" },
  firebase: { icon: SiFirebase, label: "Firebase", color: "var(--brand-firebase)" },
  vercel: { icon: SiVercel, label: "Vercel", color: "var(--brand-vercel)" },
  supabase: { icon: SiSupabase, label: "Supabase", color: "var(--brand-supabase)"},
  wireshark: { icon: SiWireshark, label: "Wireshark", color: "var(--brand-wireshark)" },
  burpsuite: { icon: SiBurpsuite, label: "Burp Suite", color: "var(--brand-burpsuite)" },
  hivemq: { icon: SiHivemq, label: "HiveMQTT", color: "var(--brand-hivemq)" },
  sql: { icon: FiDatabase, label: "SQL", color: "var(--color-accent)"},
  html: { icon: SiHtml5, label: "HTML", color: "var(--brand-html)"},
  css: { icon: SiCss, label: "CSS", color: "var(--brand-css)"},
  javascript: { icon: SiJavascript, label: "Javascript", color: "var(--brand-javascript)"},
};
