import { PageHeader } from "@/components/shared/PageHeader";
import { DetailedAboutSection } from "@/components/sections/DetailedAboutSection";
import { LongSkillsSection } from "@/components/sections/LongSkillSection";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="about"
        title="About Gerald"
        description="Background, methods, and the approach behind my engineering and security work."
      />
      <DetailedAboutSection />
      <LongSkillsSection />
    </>
  );
}
