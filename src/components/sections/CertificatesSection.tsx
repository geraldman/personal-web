"use client";

import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { CertificateCard } from "@/components/ui/CertificateCard";
import { CertificateDetailsOverlay } from "@/components/ui/CertificateDetailsOverlay";
import { certificates } from "@/data/certificates";
import { useState } from "react";
import { CertificateData } from "@/types";

export function CertificatesSection() {
  const previewCertificates = certificates.slice(0, 3);
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);

  return (
    <AnimatedSection id="certificates">
      <div className="container-width">
        <SectionHeader
          label="certificates"
          title="Certifications and ongoing tracks"
          description="A growing set of credentials mapped to applied engineering and cybersecurity outcomes."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {previewCertificates.map((slot) => (
            <CertificateCard
              key={slot.id}
              certificate={slot}
              onOpenDetails={setActiveCertificate}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            The full certificates index will include issuers, verification links, and skill mapping.
          </p>
          <Link
            href="/certificates"
            className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
          >
            Open Certificates
          </Link>
        </div>
      </div>

      <CertificateDetailsOverlay
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />
    </AnimatedSection>
  );
}
