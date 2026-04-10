import { NavLink, SocialLink } from "@/types";
import { fetchGithubCommit } from "./github-commit-fetch";

export const OWNER_NAME = "Gerald";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gerald.dev";

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
  projects: "10+",
  years: 2,
  certificates: 1,
} as const;

const activateGithubStat = false; // replace true in prod

export async function getStatTicker() {
  
  
  const commitCount = activateGithubStat ? await fetchGithubCommit() : 100;

  return [
    `${STATIC_STATS.projects} shipped projects`,
    `${STATIC_STATS.years}+ years building production systems`,
    `${commitCount.toLocaleString()} total GitHub commits`,
    `${STATIC_STATS.certificates}+ security certificates`,
  ];
}
