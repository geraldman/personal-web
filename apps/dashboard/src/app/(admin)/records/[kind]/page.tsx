import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKind } from "@/lib/kinds";
import { EmptyState } from "@/components/shared/EmptyState";
import { RecordsTable, type RecordRow } from "@/components/records/RecordsTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { has, humanizeStatus, rankKindOf, RANK_LABELS } from "@/lib/types";

// One list page for every kind. Columns, filters and the status vocabulary all come from the
// kind — there is no per-kind branch here.

interface PageProps {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{
    q?: string;
    platform?: string;
    status?: string;
    rank?: string;
    tag?: string;
    sort?: string;
  }>;
}

export default async function RecordsListPage({ params, searchParams }: PageProps) {
  const { kind: kindSlug } = await params;
  const sp = await searchParams;

  const kind = await getKind(kindSlug);
  if (!kind) notFound();

  const rankKind = rankKindOf(kind.capabilities);
  const supabase = await createClient();

  const { data: platforms } = await supabase
    .from("platforms")
    .select("id, name, icon_kind, icon_ref, brand_color")
    .order("sort_order");

  let query = supabase
    .from("records")
    .select(
      "id, title, status, rank, rank_label, completed_on, started_on, minutes_spent, tags, platform_id, is_public, data"
    )
    .eq("kind_id", kind.id)
    // Children are listed on their parent's detail page, not mixed into the top-level list.
    .is("parent_id", null);

  if (sp.q) query = query.ilike("title", `%${sp.q}%`);
  if (sp.platform) query = query.eq("platform_id", sp.platform);
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.rank === "unranked") query = query.is("rank", null);
  else if (sp.rank) query = query.eq("rank", Number(sp.rank));
  if (sp.tag) query = query.contains("tags", [sp.tag]);

  if (sp.sort === "oldest") {
    query = query.order("completed_on", { ascending: true, nullsFirst: false });
  } else if (sp.sort === "rank") {
    query = query.order("rank", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("completed_on", { ascending: false, nullsFirst: false });
  }

  const { data: records, error } = await query;

  const hasAnyFilter = Boolean(sp.q || sp.platform || sp.status || sp.rank || sp.tag);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {kind.plural_name}
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {kind.statuses.map(humanizeStatus).join(" · ")}
          </p>
        </div>
        <Link
          href={`/records/${kind.slug}/new`}
          className="rounded-md border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
        >
          New {kind.name}
        </Link>
      </div>

      <FilterBar
        platforms={platforms ?? []}
        statuses={kind.statuses}
        showPlatform={has(kind.capabilities, "platform")}
        rankLabel={rankKind ? RANK_LABELS[rankKind] : null}
      />

      {error && (
        <div className="rounded-md border border-[var(--color-danger)] p-4 text-sm text-[var(--color-danger)]">
          Failed to load: {error.message}
        </div>
      )}

      {!error && records && records.length === 0 && (
        <EmptyState
          title={hasAnyFilter ? `No ${kind.plural_name.toLowerCase()} match these filters` : `No ${kind.plural_name.toLowerCase()} yet`}
          description={hasAnyFilter ? "Try clearing a filter." : undefined}
          actionHref={hasAnyFilter ? undefined : `/records/${kind.slug}/new`}
          actionLabel={hasAnyFilter ? undefined : `Add a ${kind.name.toLowerCase()}`}
        />
      )}

      {!error && records && records.length > 0 && (
        <RecordsTable
          kind={kind}
          records={records as RecordRow[]}
          platforms={platforms ?? []}
          showPlatform={has(kind.capabilities, "platform")}
        />
      )}
    </div>
  );
}
