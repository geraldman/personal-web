import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { OWNER_NAME, SITE_URL } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gerald | Developer and Security Researcher",
    template: "%s | Gerald",
  },
  description:
    "Portfolio of Gerald, a full-stack developer and security researcher focused on resilient web systems.",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "Gerald | Full-Stack Developer and Security Engineer",
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
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <meta name="google-site-verification" content="N4ko7eULRcSChLP4-vVMp88DVoMRqwV-A91XEBRoLUg" />
      <body className="min-h-full bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
