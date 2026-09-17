import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("mb-10", className)}>
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        {`// ${label}`}
      </p>
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)] lg:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
