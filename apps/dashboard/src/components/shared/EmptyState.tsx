import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

// One component, different copy/props per call site — do not fork EntriesEmptyState,
// StatsEmptyState, etc.
export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-[var(--color-border)] p-10 text-center">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="min-h-[44px] rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
