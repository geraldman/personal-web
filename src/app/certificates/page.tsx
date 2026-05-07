"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { CertificateCard } from "@/components/ui/CertificateCard";
import { CertificateDetailsOverlay } from "@/components/ui/CertificateDetailsOverlay";
import { certificates } from "@/data/certificates";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CertificateData } from "@/types";

export default function CertificatesPage() {
  const certificateList = certificates;
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);
  return (
    <>
      <PageHeader
        label="certificates"
        title="Certificates"
        description="This page is intentionally kept as a shell and will be populated with verifiable credentials."
      />
      <section className="section-padding pt-0">
        <div className="container-width">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {certificateList.map((slot) => (
                <CertificateCard
                  key={slot.id}
                  certificate={slot}
                  onOpenDetails={setActiveCertificate}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CertificateDetailsOverlay
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />
    </>
  );
}
