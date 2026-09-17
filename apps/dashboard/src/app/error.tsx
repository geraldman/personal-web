"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Something went wrong
      </h1>
      <button
        type="button"
        onClick={reset}
        className="min-h-[44px] rounded-md border border-[var(--color-border)] px-6 text-sm text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]"
      >
        Try again
      </button>
    </div>
  );
}
