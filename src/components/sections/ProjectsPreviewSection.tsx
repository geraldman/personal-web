import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/data/projects";

export function ProjectsPreviewSection() {
  const featured = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <AnimatedSection id="projects" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width">
        <SectionHeader
          label="projects"
          title="Selected builds and security work"
          description="A few representative projects across product engineering, security tooling, and CTF work."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

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
