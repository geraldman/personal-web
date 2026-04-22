"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectDetailsOverlay } from "@/components/ui/ProjectDetailsOverlay";
import { ProjectCardSkeleton } from "@/components/ui/ProjectCardSkeleton";
import { projects } from "@/data/projects";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ProjectCategory, ProjectData } from "@/types";

type FilterValue = "all" | ProjectCategory;

const categories = [
  "all",
  ...Array.from(new Set(projects.map((project) => project.category))),
] as FilterValue[];

export function ProjectsGrid() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(gridRef, { once: true, amount: 0.15 });
  const [shouldRenderCards, setShouldRenderCards] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (isInView) {
      setShouldRenderCards(true);
    }
  }, [isInView]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") {
      return projects;
    }

    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter]);

  return (
    <section className="section-padding pt-0">
      <div className="container-width">
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {categories.map((category) => {
              const active = activeFilter === category;
              const label =
                category === "all"
                  ? "All"
                  : CATEGORY_LABELS[category as ProjectCategory];

              return (
                <button
                  key={category}
                  type="button"
                  className="relative min-h-[44px] rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
                  onClick={() => setActiveFilter(category)}
                >
                  {active ? (
                    <motion.span
                      layoutId="project-filter-pill"
                      className="absolute inset-0 -z-10 rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)]"
                      transition={{ duration: 0.2 }}
                    />
                  ) : null}
                  <span className={active ? "text-[var(--color-accent)]" : undefined}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            ref={gridRef}
            key={activeFilter}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {shouldRenderCards
              ? filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    eagerImage={index === 0}
                    onOpenDetails={setActiveProject}
                  />
                ))
              : Array.from({ length: 6 }).map((_, index) => (
                  <ProjectCardSkeleton key={`projects-grid-skeleton-${index}`} />
                ))}
          </motion.div>
        </AnimatePresence>

        <ProjectDetailsOverlay project={activeProject} onClose={() => setActiveProject(null)} />

        {filteredProjects.length === 0 ? (
          <p className="mt-8 text-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {"// no projects in this category yet"}
          </p>
        ) : null}
      </div>
    </section>
  );
}
