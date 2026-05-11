import Image from "next/image";
import Link from "next/link";
import { FiGitCommit } from "react-icons/fi";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const commitSha =
    process.env.NEXT_PUBLIC_GIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA;
  const shortSha = commitSha ? commitSha.slice(0, 7) : null;
  const commitHref = commitSha
    ? `https://github.com/geraldman/personal-web/commit/${commitSha}`
    : null;

  return (
    <footer className="border-t border-[var(--color-border)] px-4 py-8 md:px-6">
      <div className="container-width flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3 flex-col md:flex-row">
          <Image src="/assets/logo.png" alt="Gerald" width={35} height={35} />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Copyright {new Date().getFullYear()} Gerald. Made with passion.
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
          {commitHref && shortSha ? (
            <Link
              href={commitHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`View commit ${shortSha}`}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
            >
              <FiGitCommit className="h-4 w-4" aria-hidden="true" />
              {shortSha}
            </Link>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
