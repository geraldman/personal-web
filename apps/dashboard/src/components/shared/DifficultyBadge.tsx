import { cn } from "@/lib/utils";
import { RANKS, type Rank } from "@/lib/types";

interface DifficultyBadgeProps {
  rank: number | null;
  label?: string | null;
  className?: string;
}

// Unranked is a real, distinct state (Codewars et al. don't return a per-entry rank) — it
// must always render as its own visible bucket, never dropped or folded into rank 1.
export function DifficultyBadge({ rank, label, className }: DifficultyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]",
        className,
      )}
      title={label ?? undefined}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: rank
            ? `color-mix(in srgb, var(--color-accent) ${20 + rank * 16}%, transparent)`
            : "var(--color-text-muted)",
        }}
        aria-hidden
      />
      {rank ? `Rank ${rank}` : "Unranked"}
    </span>
  );
}

interface DifficultyPickerProps {
  rank: Rank | null;
  label: string;
  onRankChange: (rank: Rank | null) => void;
  onLabelChange: (label: string) => void;
}

export function DifficultyPicker({ rank, label, onRankChange, onLabelChange }: DifficultyPickerProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        value={label}
        onChange={(event) => onLabelChange(event.target.value)}
        placeholder="Platform's verbatim label (e.g. 6 kyu, Medium)"
        className="min-h-[44px] flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
      />
      <select
        value={rank ?? ""}
        onChange={(event) =>
          onRankChange(event.target.value ? (Number(event.target.value) as Rank) : null)
        }
        className="min-h-[44px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
      >
        <option value="">Unranked</option>
        {RANKS.map((value) => (
          <option key={value} value={value}>
            Rank {value}
          </option>
        ))}
      </select>
    </div>
  );
}
