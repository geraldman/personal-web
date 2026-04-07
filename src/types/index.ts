export type ProjectCategory = "web-development" | "security" | "ctf";

export type ProjectStatus = "live" | "in-progress" | "archived";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  stack: string[];
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  writeupUrl?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}
