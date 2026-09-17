import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        label="projects"
        title="Projects"
        description="Web engineering, security tooling, and CTF work, organized by category."
      />
      <ProjectsGrid />
    </>
  );
}
