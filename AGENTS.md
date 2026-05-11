<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

{
  "project": {
    "name": "Gerald's Developer & Security Portfolio",
    "description": "Personal portfolio website for a full-stack developer and cybersecurity student. Black, modern, sleek, and unique. Built to impress both dev and security recruiters.",
    "owner": "Gerald",
    "deployment": "Vercel",
    "repository": "github.com/yourusername/portfolio"
  },

  "stack": {
    "framework": "Next.js 15 (App Router)",
    "language": "TypeScript (strict mode)",
    "styling": "Tailwind CSS v4",
    "animation": "Framer Motion v12",
    "icons": "react-icons v5",
    "email": "Resend — npm install resend. The ONLY accepted email provider.",
    "utilities": ["clsx", "tailwind-merge"],
    "runtime": "Node.js",
    "package_manager": "npm"
  },

  "typography": {
    "installation": "Install Geist fonts via npm: 'npm i geist'. Do NOT use next/font/google or any CDN for Geist. Import directly from the 'geist' package.",
    "primary_font": "Geist Sans",
    "mono_font": "Geist Mono",
    "import_pattern": {
      "layout_tsx": "import { GeistSans } from 'geist/font/sans'; import { GeistMono } from 'geist/font/mono';",
      "apply_to_html": "Add GeistSans.variable and GeistMono.variable as className on <html>.",
      "globals_css": "Declare font-family in :root using the CSS variables exposed by the geist package: --font-geist-sans and --font-geist-mono.",
      "tailwind": "In globals.css @theme block (Tailwind v4), register --font-sans: var(--font-geist-sans) and --font-mono: var(--font-geist-mono)."
    },
    "usage_rules": {
      "Geist Sans": "All headings (h1-h4), body text, paragraph content, CTA button labels, page titles.",
      "Geist Mono": "Navigation links, badge/tag labels, code blocks, captions, metadata (dates, categories), section prefix labels (e.g. '// section-name'), terminal-style UI elements, filter tab labels."
    },
    "forbidden": [
      "Never import Geist from next/font/google.",
      "Never use Inter, Roboto, system-ui, Arial, or any other font family.",
      "Never hardcode font-family strings in component files — always use CSS variables."
    ]
  },

  "design_system": {
    "theme": "Dark only — no light mode, no theme toggle, no dark: Tailwind prefixes.",
    "aesthetic": "Black, modern, sleek, unique. Electric and precise. Think: high-end cybersecurity tooling UI crossed with a senior engineer's personal site. Not a bootcamp portfolio. Not purple gradients.",
    "personality": "Confident, technical, a little dangerous. The site of someone who builds secure systems and breaks them.",

    "colors": {
      "note": "Accent palette is electric blue + cyan + dark cyan. Purple has been fully removed. All values must be declared as CSS custom properties in /styles/globals.css and referenced as var(--color-*) everywhere.",
      "background": "#050508",
      "background_secondary": "#0a0a10",
      "surface": "#0d0d14",
      "surface_hover": "#12121c",
      "border": "rgba(0, 200, 255, 0.10)",
      "border_hover": "rgba(0, 200, 255, 0.28)",
      "accent": "#00c8ff",
      "accent_secondary": "#00e5ff",
      "accent_dark": "#006b7a",
      "accent_dim": "rgba(0, 200, 255, 0.12)",
      "accent_glow": "rgba(0, 200, 255, 0.35)",
      "text_primary": "#e8f8ff",
      "text_secondary": "#7a9aaa",
      "text_muted": "#3a5060",
      "success": "#00e5a0",
      "warning": "#f0b429",
      "danger": "#ff4d6a"
    },

    "globals_css_is_source_of_truth": {
      "rule": "/styles/globals.css is the SINGLE source of truth for all CSS custom properties, font-family declarations, utility class definitions, and base resets.",
      "what_goes_here": [
        ":root block with ALL --color-* variables",
        ":root block with --font-geist-sans and --font-geist-mono declarations",
        ":root block with layout tokens: --max-width, --nav-height",
        "@theme block (Tailwind v4) extending --font-sans and --font-mono",
        "@layer base: html, body, *, ::selection, scrollbar styles",
        "@layer utilities: .glass, .glow, .text-gradient, .section-padding, .container-width"
      ],
      "forbidden": [
        "Never redeclare --color-* variables in any component file.",
        "Never redeclare font-family in component inline styles.",
        "Never put design token values in tailwind.config.ts — use globals.css @theme for Tailwind v4.",
        "Never put utility class definitions in component files — they belong in globals.css @layer utilities."
      ]
    },

    "utility_classes": {
      "text-gradient": "Electric blue to cyan gradient text. Use on hero name, section highlights, and key accent words.",
      "glass": "Glassmorphism: rgba(13,13,20,0.75) bg + backdrop-blur(14px) + 1px border using --color-border. Use on cards, navbar (when scrolled), modals.",
      "glow": "box-shadow: 0 0 28px var(--color-accent-glow). Use sparingly — featured project cards, CTA primary button on hover.",
      "section-padding": "padding: 6rem 1.5rem. Standard for all page sections.",
      "container-width": "max-width: var(--max-width); margin-inline: auto. Apply on every section's inner wrapper div."
    },

    "motion_principles": {
      "philosophy": "Motion must feel professional, intentional, and earned. No decoration for decoration's sake. Every animation must serve a purpose: guiding attention, confirming interaction, or revealing hierarchy.",
      "easing": "Use custom cubic-bezier curves for professional feel. Standard easing: [0.25, 0.46, 0.45, 0.94] (ease-out-quad). Entrance easing: [0.0, 0.0, 0.2, 1.0] (ease-out-expo). Never use default linear or built-in 'easeIn'.",
      "duration_scale": {
        "micro": "100-150ms — button press, checkbox, toggle state changes",
        "fast": "200-250ms — hover color/border transitions, badge appearances",
        "standard": "350-450ms — card entrances, section reveals, modal open",
        "slow": "600-800ms — hero stagger sequence, page-level transitions",
        "forbidden": "Never use duration > 900ms for UI feedback. Never use duration < 80ms."
      },
      "entry_animations": {
        "pattern": "opacity: 0 to 1, y: 24 to 0 on mount or viewport entry. Use whileInView with once:true.",
        "stagger": "staggerChildren: 0.07 on container variants. Children inherit delay automatically.",
        "threshold": "viewport={{ once: true, amount: 0.15 }} — trigger when 15% of element is visible."
      },
      "hero_sequence": {
        "order": "Badge -> Name -> Tagline -> CTAs — each delayed 0.12s from previous.",
        "easing": "Use ease-out-expo ([0.0, 0.0, 0.2, 1.0]) for hero entrances. Feels snappy and premium.",
        "y_offset": "Start at y: 32, animate to y: 0."
      },
      "hover_states": {
        "cards": "scale: 1.02, border-color transitions to --color-border-hover. Duration: 250ms ease-out.",
        "buttons": "Primary: glow box-shadow appears on hover. Outlined: border brightens, text shifts to accent. Duration: 200ms.",
        "links": "Color transition only. Duration: 150ms. No scale on inline text links.",
        "nav_links": "Color transition 150ms. Active indicator uses Framer layoutId for smooth slide."
      },
      "page_transitions": "Wrap page content in AnimatePresence. Each page: opacity 0 to 1, y 8 to 0, duration 300ms ease-out.",
      "navbar_capsule_transition": "Animate max-width, border-radius, background, and backdrop-filter using Framer motion values tied to scroll state. Duration: 350ms ease-out-quad.",
      "forbidden": [
        "No spring with bounce > 0 on UI elements.",
        "No rotate or skew transforms on content elements.",
        "No looping animations on non-decorative elements.",
        "No simultaneous scale + opacity + position on the same element — pick max 2.",
        "No animation on text that is being read — only animate text as it enters.",
        "No CSS transition on elements that Framer Motion is already animating — pick one system."
      ]
    }
  },

  "navbar": {
    "behavior": {
      "at_top": "Full-width, flush with top of viewport. No border-radius. Background is transparent. Blends into the page.",
      "on_scroll_down": "Transforms into a floating capsule: centered, max-width ~700px, border-radius rounded-full, glass background activates, border appears using --color-border.",
      "back_at_top": "When scrollY returns to 0, capsule expands back to full-width flush state. Animate smoothly.",
      "scroll_threshold": "Activate capsule when scrollY > 80px."
    },
    "implementation": {
      "hook": "Create /hooks/useScrollNavbar.ts. Returns { isScrolled: boolean }. Uses useEffect with scroll event listener (passive: true).",
      "animation": "Use Framer Motion motion.header with animate prop. Animate: maxWidth, borderRadius, background, padding. Use layout prop for smooth resize.",
      "z_index": "Always z-50 or higher.",
      "mobile_capsule": "max-width becomes calc(100% - 32px) when scrolled on mobile — breathing room on sides.",
      "logo": "Use next/image src='/logo.png' width={32} height={32}. Always visible. Link to /."
    },
    "content": {
      "logo": "next/image of /public/logo.png. Never text.",
      "desktop_links": "Visible at lg+. Geist Mono font.",
      "mobile": "Hamburger at base/sm/md. AnimatePresence drawer. Min-h-[44px] per link.",
      "active_indicator": "Framer layoutId='nav-pill' on active route."
    }
  },

  "hero_layout": {
    "background": {
      "reactbits": "The hero uses a ReactBits animated background component. Implement as absolute-positioned z-0 layer. All hero content at z-10+. When ReactBits component is chosen, slot it in as the background layer of HeroSection.",
      "fallback": "Until ReactBits is integrated: radial-gradient(ellipse 70% 50% at 60% 0%, rgba(0,200,255,0.08) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(0,100,120,0.06) 0%, transparent 60%).",
      "performance": "Animated background must use CSS transforms/opacity only. Must not block pointer events on content."
    },
    "desktop_layout": {
      "trigger": "lg and above",
      "structure": "CSS Grid grid-cols-[55fr_45fr]. Full viewport height minus nav-height.",
      "left_panel": {
        "content": [
          "Status badge — Geist Mono, pulsing green dot, accent color",
          "Name — Geist Sans bold, text-gradient class, large display size",
          "Title — Developer & Security Researcher, text-secondary",
          "One-liner tagline — text-secondary",
          "CTAs: View Projects (primary filled), Download CV (outlined), Contact Me (outlined)"
        ],
        "alignment": "Left-aligned. Vertically centered.",
        "padding": "pl-16 to pl-20 on lg, pl-20 to pl-28 on xl."
      },
      "right_panel": {
        "image_file": "/public/gerald.webp — this file exists. Use this exact path.",
        "implementation": "next/image with fill={true} inside a relative positioned div spanning full panel height. priority={true}.",
        "object_position": "object-position: top center",
        "gradient_overlay": "Absolute div: background: linear-gradient(to right, var(--color-bg) 0%, transparent 40%). Blends image into left panel.",
        "style": "No border-radius. Edge-to-edge on the right of viewport."
      },
      "divider": "No visible line. Gradient handles transition."
    },
    "mobile_layout": {
      "trigger": "Below lg",
      "image": "Centered, w-40 h-40 sm:w-52 sm:h-52, rounded-2xl, object-cover object-top. Below text.",
      "ctas": "flex-wrap gap-3. Buttons inline-sized."
    }
  },

  "projects": {
    "filter_tabs": {
      "categories": ["All", "Web Development", "Security", "CTF"],
      "data_binding": "Filter tabs must be generated dynamically from /data/projects.ts — derive unique categories from the data, do not hardcode tab labels in the component.",
      "category_label_map": "CATEGORY_LABELS in /lib/constants.ts maps data values to display labels: { 'web-development': 'Web Development', 'security': 'Security', 'ctf': 'CTF' }.",
      "active_state": "Filled accent background + accent text. Inactive: outlined. Framer layoutId for active pill.",
      "empty_state": "'// no projects in this category yet' in Geist Mono, text-muted, centered."
    },
    "project_card": {
      "required_fields": ["title", "description", "category", "status", "stack"],
      "optional_fields": ["githubUrl", "liveUrl", "writeupUrl", "featured"],
      "tech_logos": {
        "purpose": "Each card displays small tech/framework/language logos from the stack array.",
        "implementation": "Row of icons (w-4 h-4 or w-5 h-5) with tooltip on hover showing tech name.",
        "data_source": "stack[] in /data/projects.ts. Each string maps to a key in /lib/techIcons.ts.",
        "techIcons_file": "Create /lib/techIcons.ts. Export: Record<string, { icon: IconType, label: string, color: string }>. Color is used to tint icon on hover.",
        "fallback": "If no icon mapping, display a small text pill badge with the tech name.",
        "limit": "Max 6 icons per card. If more, show 5 icons + '+N more' badge."
      },
      "status_badge": {
        "live": "Green dot + 'live'",
        "in-progress": "Yellow dot + 'in progress'",
        "archived": "Muted dot + 'archived'"
      },
      "layout": "Title + status badge -> description (line-clamp-2) -> tech logo row -> action links."
    },
    "data_file": {
      "path": "/data/projects.ts",
      "category_values": "'web-development' | 'security' | 'ctf'"
    },
    "loading_skeleton": {
      "component": "/components/ui/ProjectCardSkeleton.tsx",
      "when": "During filter tab switches or initial data load.",
      "design": "animate-pulse, surface-colored blocks matching real card shape. Show 6 skeletons."
    }
  },

  "contact_form": {
    "architecture": {
      "pattern": "RPC-style Next.js Server Action. NOT an API route.",
      "file": "/lib/mailer.ts — marked 'use server' at the top of the file.",
      "function": "export async function sendContactEmail(data: ContactFormData): Promise<{ success: boolean, error?: string }>",
      "usage": "Import sendContactEmail in ContactSection.tsx. Call via useTransition or useFormState.",
      "no_api_route": "Do NOT use /app/api/contact/route.ts for the contact form."
    },
    "email_provider": {
      "provider": "Resend only.",
      "install": "npm install resend",
      "env_var": "RESEND_API_KEY",
      "implementation": "import { Resend } from 'resend'; const resend = new Resend(process.env.RESEND_API_KEY);"
    },
    "fields": {
      "name": { "required": true, "max_length": 80 },
      "email": { "required": true, "max_length": 120, "validation": "RFC 5322 email regex" },
      "subject": { "required": false, "max_length": 120 },
      "message": { "required": true, "max_length": 2000, "min_length": 10 },
      "website": "Honeypot field — hidden via CSS (position absolute, opacity 0, height 0, NOT display:none). Bots fill it; humans do not."
    },
    "security_pipeline": {
      "order": [
        "1. Check honeypot — if filled, silently return { success: true } without sending.",
        "2. Check rate limit — max 3 submissions per 10 minutes per IP or name+email hash. Return error if exceeded.",
        "3. Sanitize — trim all strings, strip HTML tags, remove null bytes and control characters, normalize unicode NFC.",
        "4. Enforce length constraints — return error if any field violates min/max.",
        "5. Validate email format with regex — return error if invalid.",
        "6. Check injection patterns — reject if any field contains: <script, javascript:, onerror=, onload= (case-insensitive).",
        "7. Send via Resend.",
        "8. Return { success: true } or { success: false, error: string }."
      ],
      "sanitize_html": "Use sanitize-html package (npm install sanitize-html) or a simple tag-stripping regex.",
      "honeypot_css": "position: absolute; opacity: 0; height: 0; width: 0; pointer-events: none; tab-index: -1;"
    },
    "client_ux": {
      "hook": "/hooks/useContactForm.ts — field state, validation errors, char count, submission state (idle|submitting|success|error).",
      "char_counter": "'X / 2000' below message textarea. Accent color when > 1800. Danger color at limit.",
      "success": "Replace form with '// message sent. i will get back to you soon.' in Geist Mono. Animate in.",
      "error": "Show error above submit button. Do not reset form — preserve user input.",
      "inline_errors": "Below each field on blur or submit attempt. text-danger, Geist Mono, text-xs."
    }
  },

  "logo_and_favicon": {
    "source": "/public/logo.png — file exists. Use for all logo references.",
    "favicon": {
      "app_router": "Place a copy of logo.png at /app/icon.png — Next.js App Router auto-serves this as favicon.",
      "metadata": "In /app/layout.tsx Metadata: icons: { icon: '/logo.png', apple: '/logo.png' }."
    },
    "navbar_logo": "next/image src='/logo.png' width={32} height={32} alt='Gerald'. Wrapped in Link to /.",
    "footer_logo": "Optional: next/image src='/logo.png' width={40} height={40}."
  },

  "assets": {
    "hero_photo": "/public/gerald.webp — EXISTS. Use this exact path in HeroSection right panel and mobile avatar.",
    "logo": "/public/logo.png — EXISTS. Use for favicon and navbar.",
    "cv": "/public/cv/gerald-cv.pdf — place CV PDF here. Download CV button links here.",
    "tech_icons": "/public/assets/icons/ — custom SVG logos not in react-icons.",
    "images": "/public/assets/images/ — additional screenshots or images."
  },

  "loading_skeletons": {
    "when_to_use": "Add skeleton loaders for components with async data or noticeable render delay.",
    "required_components": [
      "ProjectCardSkeleton — /components/ui/ProjectCardSkeleton.tsx — for ProjectsGrid filter transitions",
      "BlogPostSkeleton — /components/ui/BlogPostSkeleton.tsx — for blog index load"
    ],
    "design": {
      "base_color": "var(--color-surface)",
      "shimmer": "var(--color-surface-hover) via animate-pulse or custom shimmer keyframe in globals.css",
      "shape": "Must match real component dimensions exactly — same border-radius, height, grid columns.",
      "count": "Show 6 skeleton cards in ProjectsGrid. Show 4 rows in BlogPage."
    }
  },

  "responsiveness": {
    "approach": "Mobile-first. Build for mobile by default, enhance at larger breakpoints. Never desktop-first.",

    "breakpoints": {
      "base": "0px+ — single column, stacked",
      "sm": "640px+ — large phones, spacing tweaks",
      "md": "768px+ — tablets, 2-column grids begin",
      "lg": "1024px+ — desktop, hero split, full nav, capsule navbar",
      "xl": "1280px+ — wide desktop, max-width container fully constrains"
    },

    "per_component_rules": {
      "Navbar": {
        "base": "Logo + hamburger only.",
        "lg": "Logo + all nav links inline. Hamburger hidden.",
        "at_top": "Full-width, transparent, no radius — all breakpoints.",
        "scrolled": "Capsule: max-width 700px (lg+) or calc(100% - 32px) (mobile), rounded-full, glass bg.",
        "drawer": "AnimatePresence dropdown. Full-width. Min-h-[44px] per link. Closes on link click."
      },
      "HeroSection": {
        "base": "Single column. Badge -> Name -> Tagline -> CTAs -> Image avatar below.",
        "base_image": "w-40 h-40 rounded-2xl object-cover object-top. Centered.",
        "base_font_sizes": "Name: text-4xl sm:text-5xl. Tagline: text-base.",
        "lg": "CSS Grid grid-cols-[55fr_45fr]. Full viewport height. Left text centered. Right gerald.webp fill.",
        "lg_font_sizes": "Name: text-7xl xl:text-8xl. Tagline: text-xl.",
        "forbidden": "No split grid below lg. No full-bleed image on mobile."
      },
      "AboutSection": {
        "base": "Single column.",
        "lg": "grid-cols-5. Bio col-span-3. Facts col-span-2."
      },
      "SkillsSection": {
        "base": "2-column grid.",
        "md": "3-column.",
        "lg": "4-column or grouped by category."
      },
      "ProjectsPreviewSection": {
        "base": "1 column.",
        "md": "2 columns.",
        "lg": "3 columns."
      },
      "ProjectsGrid": {
        "base": "1 column. Filter tabs overflow-x-auto, scrollbar hidden.",
        "md": "2 columns.",
        "lg": "3 columns."
      },
      "CertificatesSection": {
        "base": "2-column grid.",
        "lg": "4-5 columns."
      },
      "ContactSection": {
        "base": "1 column. Form full width. Socials below.",
        "lg": "2 columns. Form left. Socials right."
      },
      "Footer": {
        "base": "Stacked, center-aligned.",
        "md": "Side-by-side. Copyright left. Socials right."
      },
      "BlogPage": { "all": "Single column max-w-3xl centered." },
      "BlogPostPage": { "all": "Single column max-w-3xl centered. text-base (base) to text-lg (lg)." }
    },

    "typography_scaling": {
      "hero_name": "text-4xl (base) -> text-5xl (sm) -> text-7xl (lg) -> text-8xl (xl)",
      "page_titles": "text-3xl (base) -> text-4xl (md) -> text-5xl (lg)",
      "section_headings": "text-2xl (base) -> text-3xl (md) -> text-4xl (lg)",
      "card_headings": "text-lg (base) -> text-xl (lg)",
      "body_text": "text-sm (base) -> text-base (lg)",
      "mono_labels": "text-xs at all breakpoints — never scale up"
    },

    "spacing_scaling": {
      "section_padding": "py-16 px-4 (base) -> py-20 px-6 (md) -> py-24 px-6 (lg)",
      "card_padding": "p-4 (base) -> p-6 (lg)",
      "grid_gap": "gap-4 (base) -> gap-6 (lg)"
    },

    "touch_targets": "All interactive elements: min 44x44px. Use min-h-[44px] and py-3 px-4 minimum.",

    "overflow_rules": {
      "page": "No horizontal overflow at any breakpoint. Test at 320px minimum.",
      "exception": "Filter tabs may use overflow-x-auto with hidden scrollbar.",
      "forbidden": "No fixed pixel widths on layout elements."
    },

    "forbidden_patterns": [
      "Do not hide entire sections on any breakpoint.",
      "Do not use hover-only interactions to reveal required information.",
      "Do not use hero split grid below lg.",
      "Do not use text-9xl at any breakpoint.",
      "Do not use fixed pixel widths on layout elements."
    ]
  },

  "file_structure": {
    "app": {
      "layout.tsx": "Root layout. Imports GeistSans and GeistMono from 'geist/font/sans' and 'geist/font/mono'. Applies both .variable classNames to <html>. Sets favicon via metadata icons pointing to /logo.png. Imports /styles/globals.css.",
      "icon.png": "Copy of logo.png. Next.js App Router auto-serves as favicon.",
      "(root)/layout.tsx": "Wraps children with Navbar and Footer.",
      "(root)/page.tsx": "Home: HeroSection, AboutSection, SkillsSection, ProjectsPreviewSection, CertificatesSection, ContactSection.",
      "(root)/projects/page.tsx": "Header + ProjectsGrid with dynamic filter tabs.",
      "(root)/certificates/page.tsx": "TBA shell. Do not delete.",
      "(root)/about/page.tsx": "Bio, skills, education timeline.",
      "(root)/blog/page.tsx": "Blog index from /data/blog.ts.",
      "(root)/blog/[slug]/page.tsx": "Dynamic post with generateStaticParams."
    },
    "components": {
      "layout/Navbar.tsx": "Scroll-aware. Uses useScrollNavbar. Framer motion.header. Logo is logo.png image.",
      "layout/Footer.tsx": "Copyright + socials. Logo image.",
      "sections/HeroSection.tsx": "Split hero. ReactBits bg (z-0). Content z-10+. gerald.webp in right panel.",
      "sections/AboutSection.tsx": "Bio + quick facts.",
      "sections/SkillsSection.tsx": "Grouped tech cards.",
      "sections/ProjectsPreviewSection.tsx": "3 featured cards + see all CTA.",
      "sections/ProjectsGrid.tsx": "Dynamic filter + full grid. ProjectCardSkeleton during transitions.",
      "sections/CertificatesSection.tsx": "Badge teaser linking to /certificates.",
      "sections/ContactSection.tsx": "Form using useContactForm + sendContactEmail server action. Honeypot field included.",
      "ui/Button.tsx": "Variants: primary, outlined, ghost. Sizes: sm, md, lg.",
      "ui/Badge.tsx": "Status and category badges.",
      "ui/ProjectCard.tsx": "Card with tech logos, status badge, description, links.",
      "ui/ProjectCardSkeleton.tsx": "animate-pulse skeleton matching ProjectCard.",
      "ui/BlogPostSkeleton.tsx": "animate-pulse skeleton matching blog post row.",
      "ui/TechIcon.tsx": "Renders icon from techIcons.ts by key. Tooltip on hover.",
      "shared/AnimatedSection.tsx": "Reusable whileInView wrapper with standard entry animation.",
      "shared/SectionHeader.tsx": "Mono prefix label + heading + optional subtext.",
      "shared/PageHeader.tsx": "Page-level header for inner pages.",
      "shared/ScrollIndicator.tsx": "Animated scroll indicator at hero bottom."
    },
    "lib": {
      "mailer.ts": "'use server'. Exports sendContactEmail. Full security pipeline: honeypot -> rate limit -> sanitize -> validate -> Resend send. Returns { success, error? }.",
      "techIcons.ts": "Record<string, { icon: IconType, label: string, color: string }>. Maps tech strings to react-icons + brand colors.",
      "utils.ts": "cn() from clsx + tailwind-merge.",
      "constants.ts": "SITE_URL, OWNER_NAME, NAV_LINKS, SOCIAL_LINKS, CATEGORY_LABELS."
    },
    "hooks": {
      "useScrollNavbar.ts": "Returns { isScrolled: boolean }. scrollY > 80 threshold. passive scroll listener. Cleanup on unmount.",
      "useContactForm.ts": "Field state, validation, char count, submission state. Calls sendContactEmail via useTransition."
    },
    "data": {
      "projects.ts": "ProjectData[]. Fields: id, title, description, category ('web-development'|'security'|'ctf'), status ('live'|'in-progress'|'archived'), stack (string[]), featured?, githubUrl?, liveUrl?, writeupUrl?.",
      "blog.ts": "BlogPost[]. Fields: slug, title, excerpt, date, category, content?.",
      "skills.ts": "SkillGroup[]. Each: { label: string, skills: { name: string, iconKey?: string }[] }.",
      "certificates.ts": "Certificate[]. Fields: title, issuer, date, credentialUrl?, badgeUrl?."
    },
    "types": {
      "index.ts": "All interfaces: ProjectData, BlogPost, Skill, SkillGroup, Certificate, NavLink, SocialLink, ContactFormState, ContactFormData."
    },
    "styles": {
      "globals.css": "SINGLE SOURCE OF TRUTH. Contains: @import tailwindcss, @theme block with font tokens, :root with all --color-* and layout vars, @layer base (html/body/scrollbar/selection), @layer utilities (.glass/.glow/.text-gradient/.section-padding/.container-width)."
    },
    "public": {
      "logo.png": "EXISTS. Use for favicon and navbar.",
      "gerald.webp": "EXISTS. Use in HeroSection right panel and mobile avatar.",
      "cv/gerald-cv.pdf": "Place CV here. Download CV button links here.",
      "assets/icons/": "Custom SVG tech logos.",
      "assets/images/": "Additional images."
    }
  },

  "environment_variables": {
    "file": ".env.local — never commit",
    "variables": {
      "RESEND_API_KEY": "Required. API key from resend.com.",
      "CONTACT_EMAIL_TO": "Email address receiving contact form submissions.",
      "NEXT_PUBLIC_SITE_URL": "Full deployed URL, e.g. https://gerald.dev. Used for OG metadata."
    }
  },

  "seo": {
    "metadata": "Defined per-page via Next.js Metadata API. Defaults in /app/layout.tsx.",
    "favicon": "metadata.icons in layout.tsx -> /logo.png. Also /app/icon.png for App Router auto-favicon.",
    "opengraph": "og:title, og:description, og:type, og:url per page.",
    "robots": "index: true, follow: true globally.",
    "sitemap": "Create /app/sitemap.ts before deploying.",
    "performance": "next/image for all images. priority={true} on hero. Font display: swap (handled by geist package)."
  },

  "commands": {
    "install": "npm install",
    "install_geist": "npm i geist",
    "install_resend": "npm install resend",
    "install_sanitize": "npm install sanitize-html && npm install --save-dev @types/sanitize-html",
    "dev": "npm run dev",
    "build": "npm run build",
    "start": "npm run start",
    "lint": "npm run lint",
    "type_check": "npx tsc --noEmit"
  },

  "pages": {
    "/": {
      "title": "Gerald | Developer & Security Researcher",
      "sections_in_order": [
        "HeroSection — split desktop, stacked mobile, ReactBits bg placeholder",
        "AboutSection — bio + quick facts",
        "SkillsSection — grouped tech stack",
        "ProjectsPreviewSection — 3 featured projects + see all CTA",
        "CertificatesSection — badge teaser + link to /certificates",
        "ContactSection — RPC server action form + socials"
      ]
    },
    "/projects": {
      "title": "Projects | Gerald",
      "filter_categories": ["All", "Web Development", "Security", "CTF"],
      "note": "Tabs generated from data. Cards show tech logos."
    },
    "/certificates": { "title": "Certificates | Gerald", "status": "TBA — keep shell." },
    "/about": { "title": "About | Gerald" },
    "/blog": { "title": "Blog & Writeups | Gerald" },
    "/blog/[slug]": { "title": "Dynamic from blogPosts data." }
  },

  "agent_rules": {
    "before_writing_any_code": [
      "Re-read design_system, typography, and globals_css_is_source_of_truth.",
      "Check whether the component needs 'use client'. Prefer server components.",
      "Use cn() from /lib/utils.ts for all className merging.",
      "Use var(--color-*) for all colors. No hardcoded hex in components.",
      "Define TypeScript interfaces in /types/index.ts before new data shapes.",
      "Check if a skeleton loader is needed per the loading_skeletons section."
    ],
    "forbidden": [
      "Do not install Geist from next/font/google — use 'npm i geist' and import from 'geist/font/sans' and 'geist/font/mono'.",
      "Do not use any font other than Geist Sans and Geist Mono.",
      "Do not hardcode hex color values in component files.",
      "Do not use purple, violet, or any color outside the electric blue/cyan/dark-cyan palette.",
      "Do not add a light mode or theme toggle.",
      "Do not add external UI libraries (shadcn, MUI, Chakra, Radix standalone, etc.).",
      "Do not create an API route for the contact form — use RPC server action in /lib/mailer.ts.",
      "Do not remove the /certificates page.",
      "Do not use bounce or spring overshoot in animations.",
      "Do not use lorem ipsum or placeholder text unrelated to Gerald's background.",
      "Do not commit .env.local.",
      "Do not use display:none to hide the honeypot field — use the CSS opacity/position technique.",
      "Do not reference any hero image other than /public/gerald.webp.",
      "Do not reference any logo other than /public/logo.png.",
      "Do not hardcode filter tab labels — derive them from /data/projects.ts via CATEGORY_LABELS.",
      "Do not skip the security pipeline steps in mailer.ts — all 8 steps are required in order."
    ],
    "when_adding_a_new_section": [
      "Create in /components/sections/.",
      "Use AnimatedSection wrapper or whileInView with once:true directly.",
      "Apply .section-padding and .container-width on inner wrapper.",
      "Add Geist Mono prefix label above heading (e.g., '// section-name').",
      "Compose into the relevant page.tsx."
    ],
    "when_adding_a_new_project": [
      "Add to /data/projects.ts with all required fields.",
      "Use category: 'web-development' | 'security' | 'ctf'.",
      "Populate stack[] with keys matching /lib/techIcons.ts.",
      "Set status: 'live' | 'in-progress' | 'archived'.",
      "No new page per project unless explicitly instructed."
    ],
    "when_adding_a_blog_post": [
      "Add to /data/blog.ts.",
      "Slug: lowercase, hyphens, no spaces.",
      "generateStaticParams in /blog/[slug]/page.tsx picks it up automatically."
    ],
    "when_touching_the_navbar": [
      "Never break scroll-to-capsule behavior.",
      "Always use logo.png image, never text.",
      "Test at-top and scrolled-capsule states.",
      "Ensure mobile drawer closes on navigation."
    ],
    "when_touching_the_contact_form": [
      "All 8 security steps in security_pipeline.order must remain in order.",
      "Never remove the honeypot field.",
      "Never bypass server-side validation.",
      "Never switch from Resend without updating this document."
    ]
  },

  "work_log": [
    {
      "date": "2026-05-11",
      "summary": "Drafted a detailed About page template and experience timeline (sections + data model).",
      "status": "reverted",
      "notes": "Scaffold files were reverted by the user; no active changes remain in the repo."
    }
  ]
}

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
