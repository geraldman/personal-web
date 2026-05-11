import { NavLink, SocialLink, StatTickerItem } from "@/types";
import { fetchGithubCommit } from "./github-commit-fetch";

export const OWNER_NAME = "Gerald";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://geraldmanurung.site";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Certificates", href: "/certificates" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/geraldman" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gerald-dj-manurung" },
  { label: "Email", href: "mailto:g3rald.dj@gmail.com" },
];

export const CATEGORY_LABELS = {
  "web-development": "Web Development",
  security: "Security",
  ctf: "CTF",
} as const;

export const NAVBAR_BOOT_DEBUG =
  process.env.NEXT_PUBLIC_NAVBAR_BOOT_DEBUG === "true";

export const NAVBAR_BOOT_DEBUG_MS = 5000;

const STATIC_STATS = {
  projects: "7+",
  years: 2,
  certificates: "99%",
} as const;

const activateGithubStat = true; // replace true in prod

export async function getStatTicker() {
  const commitCount = activateGithubStat ? await fetchGithubCommit() : 100;

  return [
    {
      id: "projects",
      value: STATIC_STATS.projects,
      description: "Shipped projects",
      icon: "projects",
    },
    {
      id: "years",
      value: `${STATIC_STATS.years}+`,
      description: "Years building production systems",
      icon: "years",
    },
    {
      id: "commits",
      value: commitCount.toLocaleString(),
      description: "Total GitHub commits",
      icon: "commits",
    },
    {
      id: "certificates",
      value: `${STATIC_STATS.certificates}`,
      description: "Performance uptime",
      icon: "certificates",
    },
  ] satisfies StatTickerItem[];
}

export const skillGroups = [
  {
    title: "Engineering",
    items: ["TypeScript", "Next.js", "Node.js", "PostgreSQL"],
  },
  {
    title: "Security",
    items: ["Threat Modeling", "AppSec", "Authentication", "Hardening"],
  },
  {
    title: "Operations",
    items: ["Docker", "Linux", "Monitoring", "CI/CD"],
  },
  {
    title: "Workflow",
    items: ["Architecture", "Code Review", "Automation", "Testing"],
  },
];