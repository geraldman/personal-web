import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashboard.geraldmanurung.site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gerald's Challenge Log",
    template: "%s | Gerald's Challenge Log",
  },
  description: "Solved software engineering and security challenges, tracked publicly.",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Gerald's Challenge Log",
    description: "Solved software engineering and security challenges, tracked publicly.",
    url: SITE_URL,
    type: "website",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>;
}
