import { PageHeader } from "@/components/shared/PageHeader";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="about"
        title="About Gerald"
        description="Background, methods, and the approach behind my engineering and security work."
      />
      <AboutSection />
      <SkillsSection />
    </>
  );
}
