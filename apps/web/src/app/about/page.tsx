import { PageHeader } from "@/components/shared/PageHeader";
import { DetailedAboutSection } from "@/components/sections/DetailedAboutSection";
import { LongSkillsSection } from "@/components/sections/LongSkillSection";

export default function AboutPage() {
  return (
    <>
      <DetailedAboutSection />
      <LongSkillsSection />
    </>
  );
}
