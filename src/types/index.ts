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
  previewImages?: string[];
  previewGif?: string;
  previewVideo?: string;
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  writeupUrl?: string;
}

export type CertificateStatus = "completed" | "in-progress" | "planned";

export interface CertificateData {
  id: string;
  title: string;
  issuer: string;
  status: CertificateStatus;
  summary: string;
  date: string;
  previewImage?: string;
  credentialUrl?: string;
  badgeUrl?: string;
}

export type BlogCategory = "security" | "ctf" | "template";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  readTime: string;
  tags?: string[];
  toc?: Array<{ id: string; label: string }>;
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
