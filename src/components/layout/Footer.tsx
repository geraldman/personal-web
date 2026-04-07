import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] px-4 py-8 md:px-6">
      <div className="container-width flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Gerald" width={28} height={28} />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Copyright {new Date().getFullYear()} Gerald. Built for secure systems.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
