export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse">
      <div className="mb-4 overflow-hidden rounded-xl border border-[var(--color-border)]">
        <div className="aspect-[16/9] w-full bg-[var(--color-surface-hover)]" />
      </div>
      <div className="mb-4 h-6 w-2/3 rounded bg-[var(--color-surface-hover)]" />
      <div className="h-4 w-full rounded bg-[var(--color-surface-hover)]" />
      <div className="mt-2 h-4 w-5/6 rounded bg-[var(--color-surface-hover)]" />
      <div className="mt-5 flex gap-2">
        <div className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)]" />
        <div className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)]" />
        <div className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)]" />
      </div>
      <div className="mt-5 h-4 w-1/2 rounded bg-[var(--color-surface-hover)]" />
    </div>
  );
}
