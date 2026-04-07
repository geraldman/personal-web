"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 70;

export function useScrollNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
        let isScrolled = false;
        const handleScroll = () => {
            const currentScroll = window.scrollY > SCROLL_THRESHOLD;
            if (currentScroll !== isScrolled) {
                isScrolled = currentScroll;
                setIsScrolled(currentScroll);
            }
        };
        // Use passive: true to ensure the browser doesn't wait for JS
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return { isScrolled };
}
