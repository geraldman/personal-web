import { ProjectData } from "@/types";

export const projects: ProjectData[] = [
  {
    id: "secure-api-gateway",
    title: "Secure API Gateway",
    description:
      "Hardened gateway with JWT validation, anomaly detection, and request provenance controls.",
    category: "security",
    status: "live",
    stack: ["typescript", "nextjs", "postgres", "docker"],
    featured: true,
    githubUrl: "https://github.com/yourusername/secure-api-gateway",
  },
  {
    id: "threat-hunt-dashboard",
    title: "Threat Hunt Dashboard",
    description:
      "Telemetry-first dashboard that correlates auth, network, and endpoint signals for triage.",
    category: "web-development",
    status: "in-progress",
    stack: ["react", "tailwind", "node", "elastic"],
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
    githubUrl: "https://github.com/yourusername/auth-attack-simulator",
  },
];
