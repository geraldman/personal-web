export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-3">
          <div className="h-4 w-full animate-pulse rounded bg-[var(--color-surface-hover)]" />
        </td>
      ))}
    </tr>
  );
}

export function FormFieldSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-surface-hover)]" />
      <div className="h-11 w-full animate-pulse rounded-md bg-[var(--color-surface-hover)]" />
    </div>
  );
}
