import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { PublicEntryCard } from "./PublicEntryCard";

// anon key, public_entries view ONLY — never entries, never a service-role client. The view
// has no `notes` column by construction, so this route can't leak private notes even via a
// bug here. No session check: this route is genuinely public.
export default async function PublicSolvedListPage() {
  const supabase = await createClient();

  const [{ data: entries, error }, { data: platforms }] = await Promise.all([
    supabase
      .from("public_entries")
      .select(
        "id, platform_id, challenge_name, category, difficulty, difficulty_rank, date_completed, tags, problem_url",
      )
      .order("date_completed", { ascending: false, nullsFirst: false }),
    supabase.from("platforms").select("id, name, icon_kind, icon_ref, brand_color"),
  ]);

  const platformById = new Map((platforms ?? []).map((platform) => [platform.id, platform]));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Gerald&apos;s Challenge Log
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Software engineering and security challenges, solved and tracked.
        </p>
      </header>

      {error && (
        <p className="text-sm text-[var(--color-danger)]">Could not load the challenge log right now.</p>
      )}

      {!error && entries && entries.length === 0 && (
        <EmptyState title="Nothing published yet" description="Check back soon." />
      )}

      {!error && entries && entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <PublicEntryCard
              key={entry.id}
              challengeName={entry.challenge_name ?? "Untitled challenge"}
              category={entry.category}
              difficulty={entry.difficulty}
              difficultyRank={entry.difficulty_rank}
              dateCompleted={entry.date_completed}
              tags={entry.tags}
              problemUrl={entry.problem_url}
              platform={entry.platform_id ? platformById.get(entry.platform_id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
