interface PageHeaderProps {
  label: string;
  title: string;
  description: string;
}

export function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <header className="section-padding pb-10 pt-[calc(var(--nav-height)+3rem)]">
      <div className="container-width">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {`// ${label}`}
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-[var(--color-text-secondary)] lg:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}
