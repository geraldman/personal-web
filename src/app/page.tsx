import { AboutSection } from "@/components/sections/AboutSection";
import { CertificatesSection } from "@/components/sections/CertificatesSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsPreviewSection } from "@/components/sections/ProjectsPreviewSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProjectsPreviewSection />
      <AboutSection />
      <SkillsSection />
      <CertificatesSection />
      <ContactSection />
    </>
  );
}
