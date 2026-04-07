"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useScrollNavbar } from "@/hooks/useScrollNavbar";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { isScrolled } = useScrollNavbar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const capsuleWidth = isScrolled ? "min(700px, calc(100% - 32px))" : "100%";
  const capsuleRadius = capsuleWidth === "100%" ? "0px" : "999px";

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.header
        initial={false}
        transition={{
          width: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          borderRadius: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        }}
        animate={{
          width: capsuleWidth,
          borderRadius: capsuleRadius,
          y: isScrolled ? 12 : 0,
        }}
        className={cn(
          "mx-auto flex items-center justify-between overflow-hidden border",
          "border-[var(--color-border)] bg-[var(--color-surface)]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-150",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between",
            isScrolled
              ? "h-[var(--nav-height)] px-3 sm:px-4 md:px-5"
              : "h-[var(--nav-height)] px-4 md:px-6",
          )}
        >
          <Link href="/" className="inline-flex items-center" aria-label="Go to home">
            <Image src="/logo.png" alt="Gerald" width={40} height={40} priority
            className="ml-2" />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]",
                    active && "text-[var(--color-text-primary)]",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {active ? (
                      <motion.span
                        key="nav-pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 -z-10 rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)]"
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    ) : null}
                  </AnimatePresence>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Menu</span>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-2 px-4 pb-4 lg:hidden"
            >
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex min-h-[44px] items-center rounded-2xl border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]",
                      active && "border-[var(--color-border-hover)] text-[var(--color-accent)]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
