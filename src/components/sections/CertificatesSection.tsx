"use client";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/Button";
import { CertificateCard } from "@/components/ui/CertificateCard";
import { CertificateDetailsOverlay } from "@/components/ui/CertificateDetailsOverlay";
import { certificates } from "@/data/certificates";
import { useState } from "react";
import { CertificateData } from "@/types";
import { useOverlayHistory } from "@/hooks/useOverlayHistory";

export function CertificatesSection() {
  const previewCertificates = certificates.slice(0, 3);
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);

  const { handleCloseOverlay } = useOverlayHistory({
    activeItem: activeCertificate,
    setActiveItem: setActiveCertificate,
    paramName: "certificate",
  });

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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            The full certificates index will include issuers, verification links, and skill mapping.
          </p>
          <Button href="/certificates" variant="primary">
            View All Certificates
          </Button>
        </div>
      </div>

      <CertificateDetailsOverlay
        certificate={activeCertificate}
        onClose={handleCloseOverlay}
      />
    </AnimatedSection>
  );
}
