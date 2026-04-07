import { PageHeader } from "@/components/shared/PageHeader";

export default function BlogPage() {
  return (
    <>
      <PageHeader
        label="blog"
        title="Blog and Writeups"
        description="Technical notes, lessons learned, and security deep dives are being prepared."
      />
      <section className="section-padding pt-0">
        <div className="container-width rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {"// no posts published yet"}
          </p>
        </div>
      </section>
    </>
  );
}
