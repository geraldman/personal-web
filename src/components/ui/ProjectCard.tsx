"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ProjectData } from "@/types";
import { TechIcon } from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectData;
  eagerImage?: boolean;
  onOpenDetails?: (project: ProjectData) => void;
}

const statusStyle: Record<ProjectData["status"], string> = {
  live: "text-[var(--color-success)]",
  "in-progress": "text-[var(--color-warning)]",
  archived: "text-[var(--color-text-muted)]",
};

export function ProjectCard({ project, eagerImage = false, onOpenDetails }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shownStack = project.stack.slice(0, 6);
  const hiddenCount = project.stack.length > 6 ? project.stack.length - 5 : 0;
  const hasHoverMedia = Boolean(project.previewVideo || project.previewGif);

  const handleOpenDetails = () => {
    onOpenDetails?.(project);
  };

  const handlePreviewStart = () => {
    if (!project.previewVideo || !videoRef.current) {
      return;
    }

    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => {
      // Ignore autoplay failures; static preview remains visible.
    });
  };

  const handlePreviewStop = () => {
    if (!project.previewVideo || !videoRef.current) {
      return;
    }

    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <article className="group glass rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] hover:border-[var(--color-border-hover)]">
      <button
        type="button"
        onClick={handleOpenDetails}
        className="w-full text-left"
        aria-label={`View details for ${project.title}`}
      >
        <div className="mb-4 overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div
            className="relative aspect-[16/9] w-full bg-[var(--color-surface-hover)]"
            onMouseEnter={handlePreviewStart}
            onMouseLeave={handlePreviewStop}
            onFocus={handlePreviewStart}
            onBlur={handlePreviewStop}
          >
            {project.previewImage ? (
              <Image
                src={project.previewImage}
                alt={`${project.title} preview`}
                fill
                loading={eagerImage ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className={cn(
                  "object-cover object-center transition-opacity duration-300",
                  hasHoverMedia && "group-hover:opacity-0 group-focus-within:opacity-0",
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-accent-dim)] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                Preview
              </div>
            )}

            {project.previewGif && !project.previewVideo ? (
              <Image
                src={project.previewGif}
                alt={`${project.title} animated preview`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                unoptimized
                className="pointer-events-none object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              />
            ) : null}

            {project.previewVideo ? (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="metadata"
                poster={project.previewImage}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <source src={project.previewVideo} type="video/mp4" />
              </video>
            ) : null}
          </div>
        </div>

        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{project.title}</h3>
          <span className="font-mono text-xs uppercase tracking-wider">
            <span className={statusStyle[project.status]}>●</span> {project.status}
          </span>
        </div>

        <p className="line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {shownStack.slice(0, hiddenCount > 0 ? 5 : 6).map((item) => (
            <TechIcon key={`${project.id}-${item}`} name={item} />
          ))}
          {hiddenCount > 0 ? (
            <span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border)] px-2 font-mono text-[10px] text-[var(--color-text-secondary)]">
              +{hiddenCount} more
            </span>
          ) : null}
        </div>
      </button>

      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        {project.githubUrl ? (
          <Link
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
          >
            GitHub
          </Link>
        ) : null}
        {project.liveUrl ? (
          <Link
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
          >
            Live
          </Link>
        ) : null}
        {project.writeupUrl ? (
          <Link
            href={project.writeupUrl}
            className="text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
          >
            Writeup
          </Link>
        ) : null}
      </div>
    </article>
  );
}
