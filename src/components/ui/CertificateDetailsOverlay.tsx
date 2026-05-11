"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiExternalLink, FiX } from "react-icons/fi";
import { CertificateData } from "@/types";

type CertificateDetailsOverlayProps = {
  certificate: CertificateData | null;
  onClose: () => void;
};

const statusTone: Record<CertificateData["status"], string> = {
  completed: "text-[var(--color-success)]",
  "in-progress": "text-[var(--color-warning)]",
  planned: "text-[var(--color-text-muted)]",
  web: "",
  security: "",
  community: "",
};

export function CertificateDetailsOverlay({ certificate, onClose }: CertificateDetailsOverlayProps) {
  useEffect(() => {
    if (!certificate) {
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
  }, [certificate, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {certificate ? (
        <motion.div
          key={certificate.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(5,5,8,0.78)] px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${certificate.title} details`}
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
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                {certificate.issuer}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                aria-label="Close certificate details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overlay-scrollbar max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-6">
              <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {certificate.title}
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {certificate.summary}
              </p>

              {certificate.previewImage ? (
                <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]">
                  <Image
                    src={certificate.previewImage}
                    alt={`${certificate.title} document preview`}
                    fill
                    sizes="(min-width: 1280px) 42rem, (min-width: 768px) 80vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                <span className={statusTone[certificate.status]}>●</span>
                <span>{certificate.status}</span>
                <span className="text-[var(--color-text-muted)]">|</span>
                <span>{certificate.date}</span>
              </div>

              {certificate.credentialUrl ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={certificate.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                  >
                    View credential <FiExternalLink size={14} />
                  </Link>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
