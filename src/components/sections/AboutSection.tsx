import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getStatTicker } from "@/lib/constants";
import Image from "next/image";

export async function AboutSection() {
  const statTicker = await getStatTicker();

  return (
    <AnimatedSection id="about" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionHeader
            label="about"
            title="Engineer first. Security always."
          />
          <p className="max-w-2xl text-sm text-[var(--color-text-secondary)] lg:text-base mb-5">
            My approach is simple: ship value quickly, but never at the expense of trust. I like hard problems where architecture, usability, and security all compete for space.
          </p>
          <p className="max-w-2xl text-sm text-[var(--color-text-secondary)] lg:text-base mb-5">
            I combine product-minded development with offensive and defensive security thinking to design systems that are fast, maintainable, and hard to exploit.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {statTicker.map((fact) => (
            <div key={fact} className="glass rounded-2xl p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                
              </p>
            </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="relative mb-6 overflow-hidden rounded-3xl border border-[var(--color-border)] transition-colors duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-[var(--color-text-primary)]">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/gerald.webp"
                alt="Gerald portrait"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
