import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getKind, getKinds, chartsForKind } from "@/lib/kinds";
import { StatTile } from "@/components/shared/StatTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { ActivityChart } from "@/components/stats/ActivityChart";
import { DifficultyChart } from "@/components/stats/DifficultyChart";
import { PlatformChart } from "@/components/stats/PlatformChart";
import { TagChart } from "@/components/stats/TagChart";
import { rankKindOf, RANK_LABELS } from "@/lib/types";

// Charts are derived from the kind's capabilities (decision 10) -- this page never names a kind.
// Every chart reads a stats_* SQL function; none reduce rows in the browser.

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ kind?: string }>;
}

export default async function StatsPage({ searchParams }: PageProps) {
  const { kind: kindParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // With no ?kind= the page opens on the first kind by sort_order rather than a slug named here,
  // so reordering or reseeding kinds never needs a frontend edit.
  const allKinds = await getKinds();
  const kind = kindParam ? await getKind(kindParam) : (allKinds[0] ?? null);
  if (!kind) notFound();

  const charts = chartsForKind(kind.capabilities);
  const rankKind = rankKindOf(kind.capabilities);

  const owner = user.id;
  const today = new Date();
  const twelveWeeksAgo = new Date(today);
  twelveWeeksAgo.setDate(today.getDate() - 84);

  const [kpis, activity, byRank, byPlatform, byTag] = await Promise.all([
    supabase.rpc("stats_kpis", { owner, kind: kind.slug }),
    charts.includes("activity")
      ? supabase.rpc("stats_activity", {
          owner,
          kind: kind.slug,
          bucket: "week",
          from_date: isoDate(twelveWeeksAgo),
          to_date: isoDate(today),
        })
      : Promise.resolve({ data: [] }),
    charts.includes("rank")
      ? supabase.rpc("stats_by_rank", { owner, kind: kind.slug })
      : Promise.resolve({ data: [] }),
    charts.includes("platform")
      ? supabase.rpc("stats_by_platform", { owner, kind: kind.slug })
      : Promise.resolve({ data: [] }),
    charts.includes("tags")
      ? supabase.rpc("stats_by_tag", { owner, kind: kind.slug, limit: 15 })
      : Promise.resolve({ data: [] }),
  ]);

  // Breakdown charts come from the kind's own `select` fields, so a new kind gets one free.
  const breakdownFields = kind.field_schema.filter((f) => f.type === "select" && !f.private);
  const breakdowns = await Promise.all(
    breakdownFields.map(async (field) => ({
      field,
      rows:
        (await supabase.rpc("stats_by_field", { owner, kind: kind.slug, field: field.key })).data ??
        [],
    }))
  );

  const kpi = kpis.data?.[0];
  const rankData = (byRank.data ?? []).map((row: { rank: number | null; count: number }) => ({
    label: row.rank === null ? "Unranked" : `${rankKind ? RANK_LABELS[rankKind] : "Rank"} ${row.rank}`,
    count: row.count,
  }));

  const hasAny = (kpi?.total_done ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Stats</h1>
        <nav className="flex flex-wrap gap-2 text-sm">
          {allKinds.map((k) => (
            <Link
              key={k.id}
              href={`/stats?kind=${k.slug}`}
              className={
                k.slug === kind.slug
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              }
            >
              {k.plural_name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label={`Total ${kind.plural_name.toLowerCase()}`} value={kpi?.total_done ?? 0} />
        <StatTile label="Current streak" value={kpi?.current_streak ?? 0} hint="days" />
        <StatTile label="Longest streak" value={kpi?.longest_streak ?? 0} hint="days" />
        <StatTile label="This month" value={kpi?.done_this_month ?? 0} />
      </div>

      {!hasAny ? (
        <EmptyState
          title="No stats yet"
          description={`Log a ${kind.name.toLowerCase()} to see activity here.`}
          actionHref={`/records/${kind.slug}/new`}
          actionLabel={`Add a ${kind.name.toLowerCase()}`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {charts.includes("activity") && (
            <section className="rounded-md border border-[var(--color-border)] p-4">
              <h2 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Activity (last 12 weeks)
              </h2>
              <ActivityChart data={activity.data ?? []} />
            </section>
          )}

          {charts.includes("rank") && rankKind && (
            <section className="rounded-md border border-[var(--color-border)] p-4">
              <h2 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                {RANK_LABELS[rankKind]} distribution
              </h2>
              <DifficultyChart data={rankData} />
            </section>
          )}

          {charts.includes("platform") && (
            <section className="rounded-md border border-[var(--color-border)] p-4">
              <h2 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Per-platform counts
              </h2>
              <PlatformChart data={byPlatform.data ?? []} />
            </section>
          )}

          {breakdowns.map(({ field, rows }) =>
            rows.length === 0 ? null : (
              <section
                key={field.key}
                className="rounded-md border border-[var(--color-border)] p-4"
              >
                <h2 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  {field.label} split
                </h2>
                <div className="flex flex-wrap gap-4">
                  {rows.map((row: { value: string; count: number }) => (
                    <StatTile key={row.value} label={row.value} value={row.count} />
                  ))}
                </div>
              </section>
            )
          )}

          {charts.includes("tags") && (
            <section className="rounded-md border border-[var(--color-border)] p-4 lg:col-span-2">
              <h2 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Tag frequency
              </h2>
              <TagChart data={byTag.data ?? []} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
