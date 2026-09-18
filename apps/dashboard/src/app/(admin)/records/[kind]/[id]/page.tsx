import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKinds } from "@/lib/kinds";
import { RecordForm } from "@/components/records/RecordForm";
import { childKindSlugs, humanizeStatus, type RecordData } from "@/lib/types";

// Detail + edit. The child lists below come from `children:<slug>` capabilities, so LFS gets its
// build → checkpoint → issue hierarchy without this file knowing what LFS is.

interface PageProps {
  params: Promise<{ kind: string; id: string }>;
}

export default async function RecordDetailPage({ params }: PageProps) {
  const { kind: kindSlug, id } = await params;

  const supabase = await createClient();
  // Deduped with the (admin) layout's getKinds() call -- the single getKind(kindSlug) round trip
  // this page used to make on top of allKinds is gone; kind is derived from the same list.
  const [{ data: record }, { data: platforms }, { data: tags }, allKinds] = await Promise.all([
    supabase.from("records").select("*").eq("id", id).maybeSingle(),
    supabase.from("platforms").select("id, name").order("sort_order"),
    supabase.from("tag_usage").select("tag").limit(50),
    getKinds(),
  ]);

  const kind = allKinds.find((k) => k.slug === kindSlug) ?? null;
  if (!kind) notFound();
  if (!record) notFound();

  const childSlugs = childKindSlugs(kind.capabilities);
  const childKinds = allKinds.filter((k) => childSlugs.includes(k.slug));

  const { data: children } = childKinds.length
    ? await supabase
        .from("records")
        .select("id, title, status, kind_id")
        .eq("parent_id", id)
        .order("sort_order")
    : { data: [] };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <Link
            href={`/records/${kind.slug}`}
            className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            {kind.plural_name}
          </Link>
          <span className="text-[var(--color-text-tertiary)]">/</span>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {record.title}
          </h1>
        </div>

        <RecordForm
          mode="edit"
          kind={kind}
          recordId={record.id}
          platforms={platforms ?? []}
          tagSuggestions={(tags ?? []).map((t) => t.tag as string)}
          initialValues={{
            kindId: kind.id,
            parentId: record.parent_id,
            title: record.title,
            status: record.status,
            summary: record.summary,
            body: record.body,
            notes: record.notes,
            url: record.url,
            tags: record.tags ?? [],
            rank: record.rank,
            rankLabel: record.rank_label,
            platformId: record.platform_id,
            startedOn: record.started_on,
            completedOn: record.completed_on,
            minutesSpent: record.minutes_spent,
            isPublic: record.is_public,
            data: (record.data ?? {}) as RecordData,
          }}
        />
      </div>

      {childKinds.map((childKind) => {
        const rows = (children ?? []).filter((c) => c.kind_id === childKind.id);
        return (
          <section key={childKind.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
                {childKind.plural_name}
              </h2>
              <Link
                href={`/records/${childKind.slug}/new?parent=${record.id}`}
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Add {childKind.name}
              </Link>
            </div>

            {rows.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No {childKind.plural_name.toLowerCase()} yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
                {rows.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/records/${childKind.slug}/${child.id}`}
                      className="flex min-h-[44px] items-center justify-between px-3 text-sm hover:bg-[var(--color-surface-hover)]"
                    >
                      <span className="text-[var(--color-text-primary)]">{child.title}</span>
                      <span className="text-[var(--color-text-tertiary)]">
                        {humanizeStatus(child.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
