import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Not found</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        This page does not exist, or you do not have access to it.
      </p>
      <Link href="/entries" className="text-sm text-[var(--color-accent)] underline">
        Back to entries
      </Link>
    </div>
  );
}
