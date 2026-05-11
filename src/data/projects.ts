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
    featured: false,
    writeupUrl: "/blog",
  },
  {
    id: "bebas-qc",
    title: "Bebas QC",
    description:
      `Bebas QC is an AI-driven quality control solution designed to replace slow, manual inspections in high-speed manufacturing environments, such as those at Reckitt Benckiser. It is used as a prototype for submission at AI Open Innovation Challenge 2026.

By utilizing  computer vision and real-time sensor data, the system monitors production lines to detect physical defects like dents or misaligned labels within milliseconds. Unlike standard cameras, it functions as a "factory brain" that performs Root Cause Analysis (RCA), cross-referencing anomalies with machine vibrations or temperatures to diagnose exactly why a failure occurred and recommending immediate corrective actions.

The system streamlines industrial workflows by delivering high-severity alerts directly to operators via Telegram or WhatsApp, ensuring that issues are addressed before they escalate into costly downtime. Beyond immediate fixes, Bebas QC leverages historical data for predictive maintenance, identifying long-term patterns to prevent defects before they happen. By catching errors in seconds rather than hours, the platform helps manufacturers protect their bottom line and potentially saving millions in revenue typically lost to unplanned downtime and product waste.

This prototype features a centralized digital dashboard that provides real-time visibility into production line performance and anomaly detection. To demonstrate the system's capabilities, an IoT simulator injects high-fidelity fabricated data into the environment via an MQTT broker, simulating live industrial activity and stress-testing the detection algorithms.

When the system identifies a performance deviation or defect, it triggers an automated response sequence. Using n8n for seamless workflow orchestration, the system instantaneously pushes critical alerts to Telegram or WhatsApp. This ensures that the right personnel receive actionable intelligence the moment an anomaly is detected, bridging the gap between data perception and manual intervention.`,
    category: "web-development",
    status: "in-progress",
    stack: ["go", "redis", "vite", "postgres", "docker", "hivemq", "n8n", "nginx", "react", "tailwind"],
    previewImages: ["/images/bebasqc/bebasqc1.png", "/images/bebasqc/bebasqc2.png", "/images/bebasqc/bebasqc3.png", "/images/bebasqc/bebasqc4.png"],
    featured: true,
    githubUrl: "https://github.com/geraldman/bebas-qc",
  },
  // {
  //   id: "auth-attack-simulator",
  //   title: "Auth Attack Simulator",
  //   description:
  //     "Simulation suite for brute force, token replay, and MFA bypass defense testing.",
  //   category: "security",
  //   status: "archived",
  //   stack: ["python", "docker", "redis"],
  //   previewImage: "/assets/gerald.webp",
  //   githubUrl: "https://github.com/yourusername/auth-attack-simulator",
  // },
];
