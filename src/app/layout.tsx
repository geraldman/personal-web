import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { OWNER_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gerald Manurung | Full-Stack Developer and Security Engineer",
    template: "%s | Gerald",
  },
  description:
    "Portfolio of Gerald, a full-stack developer and security researcher focused on resilient web systems.",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "N4ko7eULRcSChLP4-vVMp88DVoMRqwV-A91XEBRoLUg",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Gerald Manurung | Full-Stack Developer and Security Engineer",
    description:
      "Modern engineering and security portfolio with focused projects and practical research.",
    url: SITE_URL,
    siteName: OWNER_NAME,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gerald Manurung",
    url: SITE_URL,
    image: new URL("/gerald.webp", SITE_URL).toString(),
    jobTitle: "Full-Stack Developer and Security Engineer",
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  });

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <Analytics/>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLd }}
        />
      </head>
      <body className="min-h-full bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
