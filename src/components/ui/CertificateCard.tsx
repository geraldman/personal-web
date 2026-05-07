"use client";

import Image from "next/image";
import { CertificateData } from "@/types";

interface CertificateCardProps {
  certificate: CertificateData;
  onOpenDetails?: (certificate: CertificateData) => void;
}

const statusTone: Record<CertificateData["status"], string> = {
  completed: "text-[var(--color-success)]",
  "in-progress": "text-[var(--color-warning)]",
  planned: "text-[var(--color-text-muted)]",
};

export function CertificateCard({ certificate, onOpenDetails }: CertificateCardProps) {
  const isInteractive = Boolean(onOpenDetails);

  const content = (
    <>
      <div className="mb-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]">
        <div className="relative aspect-[16/9] w-full">
          {certificate.previewImage ? (
            <Image
              src={certificate.previewImage}
              alt={`${certificate.title} document preview`}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-accent-dim)] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Document preview
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {certificate.issuer}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
            {certificate.title}
          </h3>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.12em]">
          <span className={statusTone[certificate.status]}>●</span> {certificate.status}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
        {certificate.summary}
      </p>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
        Target: {certificate.date}
      </p>
    </>
  );

  const handleOpenDetails = () => {
    onOpenDetails?.(certificate);
  };

  return (
    <article className="glass rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] hover:border-[var(--color-border-hover)]">
      {isInteractive ? (
        <button
          type="button"
          onClick={handleOpenDetails}
          className="w-full rounded-xl text-left outline-none focus-visible:outline-none"
          aria-label={`View details for ${certificate.title}`}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </article>
  );
}
