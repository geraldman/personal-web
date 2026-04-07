import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SOCIAL_LINKS } from "@/lib/constants";

export function ContactSection() {
  return (
    <AnimatedSection id="contact" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeader
            label="contact"
            title="Let us build something resilient"
            description="The full secure contact workflow with server action and Resend will be wired next."
          />

          <div className="glass rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              {"// contact form base initialized"}
            </p>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Reach out through socials for now while I finalize the hardened contact pipeline.
            </p>
          </div>
        </div>

        <aside className="glass rounded-2xl p-6">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {"// socials"}
          </p>
          <ul className="space-y-3">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AnimatedSection>
  );
}
