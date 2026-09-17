"use client";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { projects } from "@/data/projects";
import { techIcons } from "@/lib/techIcons";
import { useInView } from "framer-motion";
import { label } from "framer-motion/client";
import { useRef, type CSSProperties } from "react";
import { techItems, securityValues } from "@/data/techItems";

export function SkillsSection() {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(marqueeRef, { amount: 0.2 });

  const rows = [techItems.slice(0, 14), techItems.slice(14)];

  // Faster on mobile (shorter duration) so it still feels lively on small screens
  const trackStyles: CSSProperties[] = [
    { "--marquee-duration": "30s", "--marquee-duration-mobile": "20s" } as CSSProperties,
    { "--marquee-duration": "30s", "--marquee-duration-mobile": "20s" } as CSSProperties,
  ];

  return (
    <AnimatedSection id="skills" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width">
        <SectionHeader
          label="skills"
          title="The Architecture"
          description="The core technologies I use to build resilient systems and automate complex workflows."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,3fr)] lg:items-start xl:gap-8">
          <div ref={marqueeRef} className="min-w-0 space-y-4 sm:space-y-6">
            {rows.map((row, rowIndex) => (
              <div key={`skills-row-${rowIndex}`} className="marquee">
                <div
                  className="marquee-track"
                  data-direction={rowIndex % 2 === 1 ? "right" : "left"}
                  data-paused={isInView ? "false" : "true"}
                  style={trackStyles[rowIndex]}
                >
                  {[...row, ...row].map((item, itemIndex) => {
                    const iconEntry = techIcons[item.key];
                    const matchKeys = item.matchKeys ?? [item.key];
                    const relatedProjects = projects.filter((project) =>
                      matchKeys.some((key) => project.stack.includes(key))
                    );

                    return (
                      <div
                        key={`${item.key}-${itemIndex}`}
                        className="group relative marquee-item"
                      >
                        <button
                          type="button"
                          className="flex flex-col items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2"
                          aria-label={`Projects using ${item.label}`}
                        >
                          {/* Icon container — smaller on mobile */}
                          <span className="flex h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center">
                            {iconEntry ? (
                              <iconEntry.icon
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 transition-colors duration-200"
                                style={{ color: iconEntry.color }}
                              />
                            ) : (
                              <span className="px-1.5 text-center font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                                {item.badge ?? item.label}
                              </span>
                            )}
                          </span>

                          {/* Label — hidden on very small screens, visible from sm+ */}
                          <span className="hidden xs:block text-center font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition-colors duration-200 group-hover:text-[var(--color-text-primary)]">
                            {item.label}
                          </span>
                        </button>

                        {/* Tooltip — only shown on devices that support hover (non-touch) */}
                        <div className="pointer-events-none absolute left-1/2 top-0 z-20 w-52 sm:w-60 -translate-x-1/2 -translate-y-[calc(100%+0.75rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4 opacity-0 scale-95 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 hidden sm:block">
                          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                            Projects
                          </p>
                          {relatedProjects.length ? (
                            <ul className="mt-3 space-y-2">
                              {relatedProjects.map((project) => (
                                <li
                                  key={`${item.key}-${project.id}`}
                                  className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-dim)]"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">{project.title}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                              // no projects yet
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="glass rounded-2xl p-5 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              // security values
            </p>
            <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
              Principles that guide the work
            </h3>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] lg:text-base">
              Beyond the tools, these are the security lenses I apply to every build.
            </p>
            <ul className="mt-5 space-y-3">
              {securityValues.map((value) => (
                <li key={value} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                  <span
                    className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
                    aria-hidden="true"
                  />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </AnimatedSection>
  );
}