import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";

interface PublicEntryCardProps {
  challengeName: string;
  category: string | null;
  difficulty: string | null;
  difficultyRank: number | null;
  dateCompleted: string | null;
  tags: string[] | null;
  problemUrl: string | null;
  platform?: { name: string; icon_kind: string; icon_ref: string; brand_color: string };
}

// Deliberately its own component, not a reuse of the admin DataTable — read-only,
// recruiter-facing surface with a different shape than a data-entry table row.
export function PublicEntryCard({
  challengeName,
  category,
  difficulty,
  difficultyRank,
  dateCompleted,
  tags,
  problemUrl,
  platform,
}: PublicEntryCardProps) {
  const content = (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {platform && (
            <PlatformIcon
              iconKind={platform.icon_kind}
              iconRef={platform.icon_ref}
              name={platform.name}
              brandColor={platform.brand_color}
            />
          )}
          <span className="text-sm text-[var(--color-text-secondary)]">{platform?.name}</span>
        </div>
        {dateCompleted && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {new Date(dateCompleted).toLocaleDateString()}
          </span>
        )}
      </div>
      <h2 className="text-base font-medium text-[var(--color-text-primary)]">{challengeName}</h2>
      <div className="flex flex-wrap items-center gap-2">
        {category && (
          <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
            {category}
          </span>
        )}
        <DifficultyBadge rank={difficultyRank} label={difficulty} />
      </div>
      {tags && tags.length > 0 && (
        <p className="text-xs text-[var(--color-text-muted)]">{tags.join(" · ")}</p>
      )}
    </div>
  );

  if (!problemUrl) return content;

  return (
    <a href={problemUrl} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}
