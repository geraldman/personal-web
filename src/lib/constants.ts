import { NavLink, SocialLink } from "@/types";

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
  { label: "GitHub", href: "https://github.com/yourusername" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yourusername" },
  { label: "Email", href: "mailto:hello@gerald.dev" },
];

export const CATEGORY_LABELS = {
  "web-development": "Web Development",
  security: "Security",
  ctf: "CTF",
} as const;

export const STAT_TICKER = {
  projects: "10+",
  years: 2,
  commit: 0,
  certificates: 1 
} as const;
