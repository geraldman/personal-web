"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { TimelineItem } from "@/types";

type ExperienceDetailsOverlayProps = {
  experience: TimelineItem | null;
  onClose: () => void;
};

export function ExperienceDetailsOverlay({ experience, onClose }: ExperienceDetailsOverlayProps) {
  useEffect(() => {
    if (!experience) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [experience, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {experience ? (
        <motion.div
          key={experience.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(5,5,8,0.78)] px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${experience.title} details`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="glass w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                {experience.period}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                aria-label="Close experience details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overlay-scrollbar max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-6">
              <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {experience.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{experience.org}</p>

              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {experience.highlights.map((highlight, index) => (
                  <li key={`${experience.id}-detail-${index}`} className="flex gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                      aria-hidden="true"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
