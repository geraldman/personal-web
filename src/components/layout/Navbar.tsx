"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  NAV_LINKS,
  NAVBAR_BOOT_DEBUG,
  NAVBAR_BOOT_DEBUG_MS,
} from "@/lib/constants";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<"loading" | "capsule" | "normal">(
    "loading",
  );
  const [hasBootWaitCompleted, setHasBootWaitCompleted] = useState(false);
  const initialCapsuleWidth = "min(360px, calc(100% - 32px))";
  const isLoadingPhase = bootPhase === "loading";
  const isCapsulePhase = bootPhase === "capsule";
  const isNormalPhase = bootPhase === "normal";
  const { isScrolled } = useScrollNavbar(isNormalPhase);
  const capsuleWidth = isScrolled ? "min(700px, calc(100% - 32px))" : "100%";
  const capsuleRadius = capsuleWidth === "100%" ? "0px" : "999px";

  useEffect(() => {
    let isMounted = true;

    const waitForAssets = () =>
      new Promise<void>((resolve) => {
        if (document.readyState === "complete") {
          resolve();
          return;
        }

        const onLoad = () => {
          resolve();
        };

        window.addEventListener("load", onLoad, { once: true });
      });

    const waitForDebugDelay = () =>
      new Promise<void>((resolve) => {
        if (!NAVBAR_BOOT_DEBUG) {
          resolve();
          return;
        }

        window.setTimeout(resolve, NAVBAR_BOOT_DEBUG_MS);
      });

    Promise.all([waitForAssets(), waitForDebugDelay()]).then(() => {
      if (isMounted) {
        setHasBootWaitCompleted(true);
        setBootPhase("capsule");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoadingPhase) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const prevRootOverflow = root.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const keepAtTop = () => {
      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    const blockScrollKeys = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        event.preventDefault();
      }
    };

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    keepAtTop();
    window.addEventListener("scroll", keepAtTop, { passive: true });
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", blockScrollKeys, { passive: false });

    return () => {
      window.removeEventListener("scroll", keepAtTop);
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", blockScrollKeys);
      root.style.overflow = prevRootOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isLoadingPhase]);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.appBootPhase = bootPhase;

    if (bootPhase === "capsule") {
      window.dispatchEvent(new Event("app:boot-capsule"));
    }

    if (isNormalPhase) {
      root.dataset.appBootReady = "true";
      window.dispatchEvent(new Event("app:boot-ready"));
      return;
    }

    root.dataset.appBootReady = "false";
  }, [bootPhase, isNormalPhase]);

  return (
    <motion.div className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.header
        initial={{
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          y: 0,
        }}
        transition={{
          width: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          height: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          borderRadius: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        }}
        animate={{
          width: !hasBootWaitCompleted
            ? "100vw"
            : isCapsulePhase
              ? initialCapsuleWidth
              : capsuleWidth,
          height: !hasBootWaitCompleted ? "100vh" : "var(--nav-height)",
          borderRadius: !hasBootWaitCompleted
            ? "0px"
            : isCapsulePhase
              ? "999px"
              : capsuleRadius,
          y: isLoadingPhase ? 0 : isNormalPhase && isScrolled ? 12 : 0,
        }}
        onAnimationComplete={() => {
          if (bootPhase === "capsule") {
            setBootPhase("normal");
          }
        }}
        className={cn(
          "relative mx-auto flex items-center justify-between overflow-hidden border",
          isLoadingPhase && "z-[70]",
          "border-[var(--color-border)] bg-[var(--color-surface)]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-150",
        )}
      >
        <AnimatePresence>
          {!isNormalPhase ? (
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -140 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            >
              <Image src="/logo.png" alt="Gerald" width={40} height={40} priority />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between",
            isScrolled
              ? "h-[var(--nav-height)] px-3 sm:px-4 md:px-5"
              : "h-[var(--nav-height)] px-4 md:px-6",
          )}
        >
          <motion.div
            initial={false}
            animate={{ opacity: isNormalPhase ? 1 : 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link href="/" className="inline-flex items-center" aria-label="Go to home">
            <Image src="/logo.png" alt="Gerald" width={40} height={40} priority
            className="ml-2" />
            </Link>
          </motion.div>

          <motion.nav
            initial={false}
            animate={{ opacity: isNormalPhase ? 1 : 0 }}
            transition={{ duration: 0.4, delay: isNormalPhase ? 0.1 : 0, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden items-center gap-2 lg:flex"
          >
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
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    ) : null}
                  </AnimatePresence>
                  {link.label}
                </Link>
              );
            })}
          </motion.nav>

          <motion.button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            initial={false}
            animate={{ opacity: isNormalPhase ? 1 : 0 }}
            transition={{ duration: 0.3, delay: isNormalPhase ? 0.1 : 0, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Menu</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileOpen && isNormalPhase ? (
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
    </motion.div>
  );
}
