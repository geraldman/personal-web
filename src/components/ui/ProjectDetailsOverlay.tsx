"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiExternalLink, FiX } from "react-icons/fi";
import { TechIcon } from "@/components/ui/TechIcon";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ProjectData } from "@/types";

type ProjectDetailsOverlayProps = {
  project: ProjectData | null;
  onClose: () => void;
};

const statusStyle: Record<ProjectData["status"], string> = {
  live: "text-[var(--color-success)]",
  "in-progress": "text-[var(--color-warning)]",
  archived: "text-[var(--color-text-muted)]",
};

export function ProjectDetailsOverlay({ project, onClose }: ProjectDetailsOverlayProps) {
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [, setLoadedImageVersion] = useState(0);
  const loadedImageUrlsRef = useRef<Set<string>>(new Set());
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imageUrls = useMemo(() => {
    if (!project) {
      return [];
    }

    if (project.previewImages && project.previewImages.length > 0) {
      return project.previewImages.filter(Boolean);
    }

    return project.previewImage ? [project.previewImage] : [];
  }, [project]);

  const activeImage = imageUrls[activeImageIndex] ?? imageUrls[0];

  useEffect(() => {
    if (!project) {
      setIsFrameReady(false);
      return;
    }

    setIsFrameReady(false);
    const frameId = window.requestAnimationFrame(() => {
      setIsFrameReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [project]);

  useEffect(() => {
    if (!project) {
      return;
    }

    setActiveImageIndex(0);
  }, [project]);

  useEffect(() => {
    if (!project || imageUrls.length === 0) {
      return;
    }

    let cancelled = false;

    imageUrls.forEach((imageUrl) => {
      if (!imageUrl || loadedImageUrlsRef.current.has(imageUrl)) {
        return;
      }

      const preloadImage = new window.Image();
      preloadImage.src = imageUrl;
      preloadImage.onload = () => {
        if (cancelled) {
          return;
        }

        loadedImageUrlsRef.current.add(imageUrl);
        setLoadedImageVersion((version) => version + 1);
      };
      preloadImage.onerror = () => {
        if (cancelled) {
          return;
        }

        loadedImageUrlsRef.current.add(imageUrl);
        setLoadedImageVersion((version) => version + 1);
      };
    });

    return () => {
      cancelled = true;
    };
  }, [project, imageUrls]);

  const isImageReady = !activeImage || loadedImageUrlsRef.current.has(activeImage);
  const isOverlayLoading = Boolean(project) && (!isFrameReady || !isImageReady);

  useEffect(() => {
    if (!project) {
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
  }, [project, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {project ? (
        <motion.div
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(5,5,8,0.78)] px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} details`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="glass w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-border)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                {CATEGORY_LABELS[project.category]}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                aria-label="Close project details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overlay-scrollbar max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-6">
              {isOverlayLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-3/5 rounded bg-[var(--color-surface-hover)]" />
                  <div className="mt-3 h-4 w-full rounded bg-[var(--color-surface-hover)]" />
                  <div className="mt-2 h-4 w-11/12 rounded bg-[var(--color-surface-hover)]" />

                  <div className="mt-5 aspect-[16/9] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]" />

                  <div className="mt-5 h-4 w-32 rounded bg-[var(--color-surface-hover)]" />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`${project.id}-overlay-tech-skeleton-${index}`}
                        className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)]"
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="h-11 w-24 rounded-full bg-[var(--color-surface-hover)]" />
                    <div className="h-11 w-24 rounded-full bg-[var(--color-surface-hover)]" />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">{project.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {project.description}
                  </p>

                  {activeImage ? (
                    <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeImage}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={activeImage}
                            alt={`${project.title} preview`}
                            fill
                            sizes="(min-width: 1280px) 48rem, (min-width: 768px) 80vw, 100vw"
                            className="object-cover object-center"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : null}

                  {imageUrls.length > 1 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {imageUrls.map((imageUrl, index) => {
                        const isActive = index === activeImageIndex;

                        return (
                          <button
                            key={`${project.id}-preview-${index}`}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            aria-pressed={isActive}
                            aria-label={`Show preview image ${index + 1}`}
                            className={`relative h-14 w-24 overflow-hidden rounded-lg border transition-colors duration-150 ${
                              isActive
                                ? "border-[var(--color-border-hover)]"
                                : "border-[var(--color-border)]"
                            }`}
                          >
                            <Image
                              src={imageUrl}
                              alt={`${project.title} preview ${index + 1}`}
                              fill
                              sizes="96px"
                              className="object-cover object-center"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="mt-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                    <span className={statusStyle[project.status]}>●</span>
                    <span>{project.status}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <TechIcon key={`${project.id}-modal-${item}`} name={item} />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {project.githubUrl ? (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                      >
                        GitHub <FiExternalLink size={14} />
                      </Link>
                    ) : null}
                    {project.liveUrl ? (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                      >
                        Live <FiExternalLink size={14} />
                      </Link>
                    ) : null}
                    {project.writeupUrl ? (
                      <Link
                        href={project.writeupUrl}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                      >
                        Writeup <FiExternalLink size={14} />
                      </Link>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
