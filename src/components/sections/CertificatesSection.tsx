import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function CertificatesSection() {
  return (
    <AnimatedSection id="certificates">
      <div className="container-width">
        <SectionHeader
          label="certificates"
          title="Certifications and ongoing tracks"
          description="A growing set of credentials mapped to applied engineering and cybersecurity outcomes."
        />

        <div className="glass rounded-2xl p-6">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {"// certificates page is in progress"}
          </p>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            The full certificates index is being prepared and will include issuers, verification links, and skill mapping.
          </p>
          <Link
            href="/certificates"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
          >
            Open Certificates
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}
