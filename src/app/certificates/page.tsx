import { PageHeader } from "@/components/shared/PageHeader";

export default function CertificatesPage() {
  return (
    <>
      <PageHeader
        label="certificates"
        title="Certificates"
        description="This page is intentionally kept as a shell and will be populated with verifiable credentials."
      />
      <section className="section-padding pt-0">
        <div className="container-width rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {"// certificates content coming soon"}
          </p>
        </div>
      </section>
    </>
  );
}
