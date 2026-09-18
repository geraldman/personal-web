interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="rounded-md border border-[var(--color-border)] p-4">
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div className="rounded-md border border-[var(--color-border)] p-4">
      <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-surface-hover)]" />
      <div className="mt-2 h-7 w-12 animate-pulse rounded bg-[var(--color-surface-hover)]" />
    </div>
  );
}
