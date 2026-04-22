"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectDetailsOverlay } from "@/components/ui/ProjectDetailsOverlay";
import { ProjectCardSkeleton } from "@/components/ui/ProjectCardSkeleton";
import { projects } from "@/data/projects";
import { ProjectData } from "@/types";

export function ProjectsPreviewSection() {
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(cardsRef, { once: true, amount: 0.15 });
  const [shouldRenderCards, setShouldRenderCards] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (isInView) {
      setShouldRenderCards(true);
    }
  }, [isInView]);

  const featured = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <AnimatedSection id="projects" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width">
        <SectionHeader
          label="projects"
          title="Selected builds and security work"
          description="A few representative projects across product engineering, security tooling, and CTF work."
        />

        <div ref={cardsRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {shouldRenderCards
            ? featured.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  eagerImage={index === 0}
                  onOpenDetails={setActiveProject}
                />
              ))
            : Array.from({ length: 3 }).map((_, index) => (
                <ProjectCardSkeleton key={`projects-preview-skeleton-${index}`} />
              ))}
        </div>

        <ProjectDetailsOverlay project={activeProject} onClose={() => setActiveProject(null)} />

        <div className="mt-8">
          <Link
            href="/projects"
            className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
          >
            View all projects
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}
