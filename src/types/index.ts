export type ProjectCategory = "web-development" | "security" | "ctf";

export type ProjectStatus = "live" | "in-progress" | "archived";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  stack: string[];
  previewImage?: string;
  previewGif?: string;
  previewVideo?: string;
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

export type StatTickerIcon = "projects" | "years" | "commits" | "certificates";

export interface StatTickerItem {
  id: string;
  value: string;
  description: string;
  icon: StatTickerIcon;
}
