"use client";

import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TopographyBackground } from "@/components/ui/reactBackground";

const heroEasing: [number, number, number, number] = [0, 0, 0.2, 1];
const STATUS_MESSAGES = ["Available for new opportunities", "Currently building Assetra"];
const STATUS_WIDTHS = ["clamp(14rem, 70vw, 45ch)", "clamp(12.5rem, 62vw, 37ch)"];
const EDITED_STATUS_WIDTHS = STATUS_WIDTHS.map(n => `${parseFloat(n) * 1.5}ch`);
// ["45ch", "39ch"]

export function HeroSection() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [isHeroReady, setIsHeroReady] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const phase = document.documentElement.dataset.appBootPhase;

    if (phase === "capsule" || phase === "normal") {
      setIsHeroReady(true);
      return;
    }

    const handleBootCapsule = () => {
      setIsHeroReady(true);
    };

    window.addEventListener("app:boot-capsule", handleBootCapsule);
    return () => {
      window.removeEventListener("app:boot-capsule", handleBootCapsule);
    };
  }, []);

  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <TopographyBackground
        className="pointer-events-none absolute inset-0 z-0 scale-[1.06]"
        lineCount={15}
        sampleStep={5}
        maxDpr={1.5}
        strokeWidth={1.5}
        lineColor="rgba(120, 120, 120, 0.5)"
        paused={!isHeroReady}
      />

      <div className="relative z-20 flex min-h-[100vh] items-center">
        <div className="container-width flex w-full flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
          <motion.p
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, ease: heroEasing }}
            className="mb-4 inline-flex w-fit items-center rounded-full border border-[var(--color-border)] bg-[var(--color-accent-dim)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent)] sm:px-4 sm:text-xs sm:tracking-[0.16em]"
          >
            <motion.span
              className="relative inline-flex h-[1.25rem] items-center overflow-hidden"
              animate={{ width: STATUS_WIDTHS[statusIndex] }}
              transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
            >
              <span className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap">
                <span className="h-2 w-2 px-1 animate-pulse rounded-full bg-[var(--color-success)]" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={STATUS_MESSAGES[statusIndex]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {STATUS_MESSAGES[statusIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.span>
          </motion.p>

          <motion.h1
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, delay: 0.12, ease: heroEasing }}
            className="text-gradient text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            Hi, I&apos;m Gerald
          </motion.h1>

          <motion.p
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, delay: 0.24, ease: heroEasing }}
            className="mt-5 max-w-2xl text-base text-[var(--color-text-secondary)] lg:text-xl"
          >
            Full-Stack Developer and Security Engineer.
          </motion.p>

          <motion.p
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, delay: 0.36, ease: heroEasing }}
            className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)] lg:text-base"
          >
            I build resilient and scalable systems, secure modern web stacks, and make sure they stay that way.
          </motion.p>

          <motion.div
            initial={false}
            animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, delay: 0.48, ease: heroEasing }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Button href="/#contact" variant="primary">
              Get in Touch
              
            </Button>
            <Button href="/cv/CV_Rev.3_Gerald-Manurung.pdf" variant="outlined" download>
              Download CV
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
