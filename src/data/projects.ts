import { ProjectData } from "@/types";

export const projects: ProjectData[] = [
  {
    id: "WHISPXR",
    title: "WHISPXR",
    description: `WHISXPR is a security-focused, real-time messaging application built on a modern Next.js and Firebase stack, optimized for serverless deployment on Vercel. By leveraging Cloud Firestore's onSnapshot for streaming and Next.js Server Actions for backend logic, the app maintains a highly responsive, real-time user experience without the need for traditional, long-lived WebSocket servers. 
    
    The platform prioritizes privacy through Public and Private Key cryptography scheme (using Web Crypto API) and IndexedDB for local key management, implementing a unique ephemeral chat model where sessions expire after 10 minutes of inactivity. This expiration triggers a complete reset of the chat environment, rotating session keys to provide robust forward secrecy and ensuring that every conversation remains transient and secure.`,
    category: "security",
    status: "live",
    stack: ["react", "typescript", "nextjs", "firebase", "vercel", "tailwind"],
    previewImages: ["/images/whispxr/whispxr1.png", "/images/whispxr/whispxr2.png", "/images/whispxr/whispxr3.png", "/images/whispxr/whispxr4.png"],
    previewVideo: "/assets/videos/secure-api-gateway-preview.mp4",
    featured: true,
    githubUrl: "https://github.com/geraldman/whispxr",
    liveUrl: "https://whispxr.vercel.app",
  },
  {
    id: "assetra",
    title: "Assetra",
    description: `Assetra (formerly CyberRisk) is an AI-powered cybersecurity governance and auditing platform designed to unify web security audits and business risk assessments into a single, high-performance dashboard. Built on a modern Next.js and Supabase stack, the platform leverages real-time AI-driven intelligence to provide continuous risk scoring and URL integrity monitoring, effectively bridging the gap between technical vulnerabilities and executive-level decision-making. 

    Specifically engineered to align with the NIST Cybersecurity Framework (CSF) 2.0, Assetra automates the translation of complex compliance data into intuitive UI visualizations, allowing organizations to govern, identify, and protect their infrastructure against evolving digital threats with actionable, LLM-driven insights.`,
    category: "security",
    status: "in-progress",
    stack: ["react", "tailwind", "node", "express", "supabase", "nextjs"],
    previewImages: ["/images/assetra/assetra1.png", "/images/assetra/assetra2.png", "/images/assetra/assetra3.png"],
    previewGif: "/assets/images/threat-hunt-dashboard-preview.gif",
    featured: true,
    githubUrl: "https://github.com/richObhasaa/CyberRIsk",
  },
  {
    id: "ctf-lab-notes",
    title: "CTF Lab Notes",
    description:
      "Curated writeups for web, crypto, and binary exploitation tracks with defense counterpoints.",
    category: "ctf",
    status: "live",
    stack: ["markdown", "python", "linux"],
    previewImage: "/images/writeup-cover.png",
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
