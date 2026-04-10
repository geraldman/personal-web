"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 70;

export function useScrollNavbar(enabled = true) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsScrolled(false);
      return;
    }

    let prevScrolled = false;
    const handleScroll = () => {
      const currentScroll = window.scrollY > SCROLL_THRESHOLD;
      if (currentScroll !== prevScrolled) {
        prevScrolled = currentScroll;
        setIsScrolled(currentScroll);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled]);

  return { isScrolled };
}
