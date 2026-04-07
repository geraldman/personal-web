import Link from "next/link";
import { ProjectData } from "@/types";
import { TechIcon } from "@/components/ui/TechIcon";

interface ProjectCardProps {
  project: ProjectData;
}

const statusStyle: Record<ProjectData["status"], string> = {
  live: "text-[var(--color-success)]",
  "in-progress": "text-[var(--color-warning)]",
  archived: "text-[var(--color-text-muted)]",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const shownStack = project.stack.slice(0, 6);
  const hiddenCount = project.stack.length > 6 ? project.stack.length - 5 : 0;

  return (
    <article className="glass rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] hover:border-[var(--color-border-hover)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{project.title}</h3>
        <span className="font-mono text-xs uppercase tracking-wider">
          <span className={statusStyle[project.status]}>●</span> {project.status}
        </span>
      </div>

      <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{project.description}</p>

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
