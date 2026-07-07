"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { CertificateCard } from "@/components/ui/CertificateCard";
import { CertificateDetailsOverlay } from "@/components/ui/CertificateDetailsOverlay";
import { certificates } from "@/data/certificates";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CertificateCategory, CertificateData } from "@/types";
import { useOverlayHistory } from "@/hooks/useOverlayHistory";

type FilterValue = "all" | CertificateCategory;

const CATEGORY_LABELS: Record<CertificateCategory, string> = {
  web: "Web Development",
  security: "Security",
  community: "Community and Leadership",
};

export default function CertificatesPage() {
  const certificateList = certificates;
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);

  const { handleCloseOverlay } = useOverlayHistory({
    activeItem: activeCertificate,
    setActiveItem: setActiveCertificate,
    paramName: "certificate",
  });

  const categoryFilters = useMemo(
    () => ["all", ...Array.from(new Set(certificateList.map((item) => item.category)))] as FilterValue[],
    [certificateList],
  );

  const filteredCertificates = useMemo(() => {
    if (activeFilter === "all") {
      return certificateList;
    }

    return certificateList.filter((item) => item.category === activeFilter);
  }, [activeFilter, certificateList]);
  return (
    <>
      <PageHeader
        label="certificates"
        title="Certificates"
        description="Verifiable credentials across web development, security, and community leadership, filterable by category."
      />
      <section className="section-padding pt-0">
        <div className="container-width">
          <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {categoryFilters.map((category) => {
                const active = activeFilter === category;
                const label = category === "all" ? "All" : CATEGORY_LABELS[category];

                return (
                  <button
                    key={category}
                    type="button"
                    className="relative min-h-[44px] rounded-full border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
                    onClick={() => setActiveFilter(category)}
                  >
                    {active ? (
                      <motion.span
                        layoutId="certificate-filter-pill"
                        className="absolute inset-0 -z-10 rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)]"
                        transition={{ duration: 0.2 }}
                      />
                    ) : null}
                    <span className={active ? "text-[var(--color-accent)]" : undefined}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              key={activeFilter}
            >
              {filteredCertificates.map((slot) => (
                <CertificateCard
                  key={slot.id}
                  certificate={slot}
                  onOpenDetails={setActiveCertificate}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredCertificates.length === 0 ? (
            <p className="mt-8 text-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              {"// no certificates in this category yet"}
            </p>
          ) : null}
        </div>
      </section>

      <CertificateDetailsOverlay
        certificate={activeCertificate}
        onClose={handleCloseOverlay}
      />
    </>
  );
}
