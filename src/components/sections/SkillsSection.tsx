"use client";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { skillGroups } from "@/lib/constants";

export function SkillsSection() {

  const skillsGroup = skillGroups;
  
  return (
    <AnimatedSection id="skills">
      <div className="container-width">
        <SectionHeader
          label="skills"
          title="Tooling, systems, and security craft"
          description="A practical stack tuned for shipping secure software quickly."
        />

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {skillsGroup.map((group) => (
            <article key={group.title} className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
