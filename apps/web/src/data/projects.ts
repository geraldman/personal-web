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
    // previewVideo: "/assets/videos/secure-api-gateway-preview.mp4",
    featured: false,
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
    id: "panen-pas",
    title: "Panen Pas",
    description:
      `🏆 3rd Place — Agriculture & Food Systems, Garuda Hacks 7.0 (Universitas Multimedia Nusantara)

Panen Pas is a Telegram bot, Agria, that tells Indonesian chili farmers exactly when to sell their harvest — catching local oversupply before it crashes prices, in a way that provincial price data alone can't see.

The problem: Existing agritech tools (PIHPS, TaniHub, MyAgri, etc.) all answer "what is the price?" at a provincial level. But oversupply is a local phenomenon — when several farmers in the same district harvest the same crop within days of each other, the local market floods and prices crash locally, even while the provincial average still looks fine. A farmer checking a price app sees "stable" and sells on their normal schedule, right into the glut.

The insight: Agria combines two signals — real price-trend data (sourced from Bank Indonesia's PIHPS) and a local harvest-cluster detector (how many nearby farmers are harvesting the same crop within a ±2-day window) — through a deterministic rule engine to produce one of three plain recommendations: SELL NOW, HOLD, or WAIT. The signature case is flat price + local glut → SELL NOW — the exact scenario a plain price ticker gets wrong, because it market with whattheir neighbors are doing right now.

Why chili: Cabai Rawit Merah (red bird's-eye chili) has a coefficient of variation of 32-37.5% (Bank Indonesia's own "High Volatility" label) and a shelf life of ~5 days — making it the crop where mistiming a sale is most costly. The approach is grounded in World Bank research ("Coordinate or Perish: Can Cell
Phones Help Farmewhich foundphone-based harvest-timing coordination measurably raises perishable-crop farmer income.

How it works end to end: A farmer chats with Agria on Telegram — crop, district, days to harvest, quantity, phone — and gets    back a recommenda the real priceand the reason (e.g., "5 petani panen cabai rawit merah di Garut dalam waktu berdekatan"). On a SELL recommendation, Agria automatically creates a match offer to an anchor buyer, who can accept/decline individual offers or bulk-buy across multiple farmers via an earliest-harvest-first fill algorithm (/panen).

Architecture: A clean separation between a thin Telegram adapter (conversation flow, message formatting) and a channel-agnostic core (rule engineyer matching) — so the same logic could move to WhatsApp (the real deployment    target, given ~90 a rewrite. Builtwith Python, python-telegram-bot, PostgreSQL/Supabase, Docker Compose, and 54 unit tests covering the engine independent of any bot.`,
    category: "web-development",
    status: "archived",
    stack: ["python", "python-telegram-bot", "postgresql", "supabase", "psycopg", "docker", "docker-compose", "nginx", "vite", "react", "tailwindcss", "typescript"],
    previewImages: ["/images/panen-pas/panen-pas-cover.jpeg", "/images/panen-pas/panen-pas-web.png",],
    featured: true,
    githubUrl: "https://github.com/geraldman/panen-pas",
    liveUrl: "https://panen-pas.vercel.app",
    devpostUrl: "https://devpost.com/software/panen-pas",
  },
  {
    id: "bebas-qc",
    title: "Bebas QC",
    description:
      `Bebas QC is an AI-driven quality control solution designed to replace slow, manual inspections in high-speed manufacturing environments, such as those at Reckitt Benckiser. It is used as a prototype for submission at AI Open Innovation Challenge 2026. The deployment runs on Google Cloud.

By utilizing  computer vision and real-time sensor data, the system monitors production lines to detect physical defects like dents or misaligned labels within milliseconds. Unlike standard cameras, it functions as a "factory brain" that performs Root Cause Analysis (RCA), cross-referencing anomalies with machine vibrations or temperatures to diagnose exactly why a failure occurred and recommending immediate corrective actions.

The system streamlines industrial workflows by delivering high-severity alerts directly to operators via Telegram or WhatsApp, ensuring that issues are addressed before they escalate into costly downtime. Beyond immediate fixes, Bebas QC leverages historical data for predictive maintenance, identifying long-term patterns to prevent defects before they happen. By catching errors in seconds rather than hours, the platform helps manufacturers protect their bottom line and potentially saving millions in revenue typically lost to unplanned downtime and product waste.

This prototype features a centralized digital dashboard that provides real-time visibility into production line performance and anomaly detection. To demonstrate the system's capabilities, an IoT simulator injects high-fidelity fabricated data into the environment via an MQTT broker, simulating live industrial activity and stress-testing the detection algorithms.

When the system identifies a performance deviation or defect, it triggers an automated response sequence. Using n8n for seamless workflow orchestration, the system instantaneously pushes critical alerts to Telegram or WhatsApp. This ensures that the right personnel receive actionable intelligence the moment an anomaly is detected, bridging the gap between data perception and manual intervention.`,
    category: "web-development",
    status: "archived",
    stack: ["go", "redis", "vite", "postgres", "googlecloud", "docker", "hivemq", "n8n", "nginx", "react", "tailwind"],
    previewImages: ["/images/bebasqc/bebasqc1.png", "/images/bebasqc/bebasqc2.png", "/images/bebasqc/bebasqc3.png", "/images/bebasqc/bebasqc4.png"],
    featured: true,
    githubUrl: "https://github.com/geraldman/bebas-qc",
    liveUrl: "https://bebasqc.geraldmanurung.site",
  },
  {
    id: "crowdflow",
    title: "CrowdFlow",
    description:
      `CrowdFlow is a full-stack event ticketing and venue-management platform built as a team project: a Go REST API, a Next.js web app, and an Nginx reverse-proxy gateway running together as a Dockerized monorepo.

It covers the full organizer-to-attendee lifecycle: event creation and publishing gates, a custom seat-map venue editor with per-seat tiering, checkout backed by a live seat-hold timer, and Midtrans payment integration. Platform-side, it runs RBAC across organizer/auditor/admin/super-admin roles, an auditor-verified KYC document gate before events can be submitted, JWT auth with refresh tokens plus Google OAuth, and a payout pipeline built on real order data instead of mocked figures.

The backend evolved through 30+ numbered Postgres migrations as features landed — seat tiering replaced an earlier section-based model, ticket vaults and document gates arrived mid-flight — with every route tracked in a synced swagger spec and cut over to a versioned /api/v1 surface. Storage is split across public and private S3-compatible buckets for KYC documents and event assets, with a MinIO-to-R2 swap that's purely environment-driven, and Redis backs both auth sessions and seat-hold locks during checkout.

A recurring thread through the build was closing gaps a live ticketing platform can't ship with: a mixed-tier seat-selection bug that let buyers manipulate prices across tiers, payout totals that were structurally zero because ticket sales were never written back to the row revenue read from, and a Midtrans sandbox/production key mismatch fixed by deriving the environment from the key's own prefix instead of a hardcoded flag.

My contribution centered on the auditor and admin consoles, RBAC and delegation flows, the venue and seat-tiering system, and a series of security and data-integrity audits across the buy flow and payouts pipeline.`,
    category: "web-development",
    status: "in-progress",
    stack: ["go", "nextjs", "react", "typescript", "tailwindcss", "postgresql", "redis", "midtrans", "r2", "docker", "nginx"],
    featured: true,
    githubUrl: "https://github.com/magar-pu/CrowdFlow",
  },
  {
    id: "project-guardian",
    title: "Project GUARDIAN",
    description:
      `Project GUARDIAN is a self-contained SOC/SIEM system built for a President University Cyber Security Bootcamp course, simulating a security-observability retrofit for a fictional FinTech processing 5M+ transactions/day with no existing security monitoring.

A synthetic API generates realistic, attack-laced traffic that flows async and out-of-band through a capture agent into Redpanda (Kafka-API compatible), gets normalized and enriched by Vector, and lands in OpenSearch behind a single-pane SIEM dashboard — the full mandatory pipeline from the assignment brief, reproducible end to end with one docker-compose up.

On top of that sits the GUARDIAN detection triad: ARGUS (per-entity z-scores plus Isolation Forest / k-NN for transaction-rate and payload anomalies), SENTINEL (Drain3 template mining and windowed XGBoost for malicious log content), and CASSANDRA (per-entity CUSUM control charts for low-and-slow exfiltration). A fusion service folds all three into one decayed threat state with corroboration boosting and Slack/Discord alerting, surfaced live on a Next.js "Guardian Pulse" HUD with per-model heartbeats and one-click incident PDF snapshots.

Two of the three models needed a rethink beyond their original spec. SENTINEL moved from classifying raw log lines to template-mining plus windowed features, since a single line rarely carries enough context to tell one failed login from fifty in ten seconds. CASSANDRA moved from per-call reconstruction error to aggregated daily feature vectors with CUSUM as the primary detector, since low-and-slow exfiltration is only abnormal in aggregate over days, not per request. Both were then validated against real external ground truth — the AIT Log Data Set v2.0 for SENTINEL, the CERT Insider Threat dataset for CASSANDRA — rather than only the self-labeled synthetic traffic they trained on.

Two deliberate stack deviations kept the build feasible on a laptop under a one-week-per-checkpoint schedule: Redpanda in place of Kafka for its single-binary footprint, and a lightweight capture agent in place of true kernel-level eBPF mirroring, deferred to a Linux VPS deployment where it's a better fit than a fragile Docker Desktop workaround. Built roughly two and a half weeks ahead of schedule, the project added an 8-scenario offline validation harness and a load test toward the brief's 5M-events/day scalability target.`,
    category: "security",
    status: "in-progress",
    stack: ["python", "nextjs", "react", "typescript", "redpanda", "opensearch", "docker", "docker-compose"],
    featured: true,
    githubUrl: "https://github.com/geraldman/project-guardian",
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
