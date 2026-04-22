import { ProjectData } from "@/types";

export const projects: ProjectData[] = [
  {
    id: "WHISPXR",
    title: "WHISPXR",
    description: `A secure, end-to-end encrypted real-time messaging web application built for private, low-latency, and reliable communication.

Key focus: robust session handling, message confidentiality, and production-grade realtime performance.`,
    category: "security",
    status: "live",
    stack: ["typescript", "nextjs", "firebase", "vercel"],
    previewImage: "/assets/gerald.webp",
    previewVideo: "/assets/videos/secure-api-gateway-preview.mp4",
    featured: true,
    githubUrl: "https://github.com/yourusername/secure-api-gateway",
  },
  {
    id: "threat-hunt-dashboard",
    title: "Threat Hunt Dashboard",
    description: `Telemetry-first dashboard that correlates auth, network, and endpoint signals for triage.

Designed to reduce analyst fatigue with faster pivoting, cleaner evidence trails, and actionable alerts.`,
    category: "web-development",
    status: "in-progress",
    stack: ["react", "tailwind", "node", "elastic"],
    previewImage: "/assets/",
    previewGif: "/assets/images/threat-hunt-dashboard-preview.gif",
    featured: true,
    githubUrl: "https://github.com/yourusername/threat-hunt-dashboard",
  },
  {
    id: "ctf-lab-notes",
    title: "CTF Lab Notes",
    description:
      "Curated writeups for web, crypto, and binary exploitation tracks with defense counterpoints.",
    category: "ctf",
    status: "live",
    stack: ["markdown", "python", "linux"],
    previewImage: "/assets/gerald.webp",
    featured: true,
    writeupUrl: "/blog",
  },
  {
    id: "auth-attack-simulator",
    title: "Auth Attack Simulator",
    description:
      "Simulation suite for brute force, token replay, and MFA bypass defense testing.",
    category: "security",
    status: "archived",
    stack: ["python", "docker", "redis"],
    previewImage: "/assets/gerald.webp",
    githubUrl: "https://github.com/yourusername/auth-attack-simulator",
  },
];
