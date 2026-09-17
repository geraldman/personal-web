# Gerald's Developer & Security Portfolio

Personal portfolio website for a full-stack developer and cybersecurity student. Built with a dark, precise, security-forward aesthetic.

## Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Framer Motion v12
- react-icons v5
- Resend for contact email (server action)

## Project Conventions

- Design and UI rules live in AGENTS.md. Follow them for colors, typography, motion, and layout.
- Geist Sans and Geist Mono are installed via the `geist` package (no next/font/google).
- Global tokens and utilities live in `src/app/globals.css`.
- Data sources live in `src/data` and types in `src/types`.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses Next.js font optimization with Geist installed from the `geist` package.

## Environment Variables

Create `.env.local` (do not commit) with:

```bash
RESEND_API_KEY=
CONTACT_EMAIL_TO=
NEXT_PUBLIC_SITE_URL=
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- https://nextjs.org/docs
- https://nextjs.org/learn

You can check out the Next.js GitHub repository at https://github.com/vercel/next.js.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform:
https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme

Check out the Next.js deployment documentation for more details:
https://nextjs.org/docs/app/building-your-application/deploying
