import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKinds } from "@/lib/kinds";
import { RecordForm } from "@/components/records/RecordForm";

interface PageProps {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ parent?: string }>;
}

export default async function NewRecordPage({ params, searchParams }: PageProps) {
  const { kind: kindSlug } = await params;
  const { parent } = await searchParams;

  const supabase = await createClient();
  // Deduped with the (admin) layout's getKinds() call -- kind lookup, platforms and tags all run
  // in parallel instead of the kind check blocking the other two.
  const [kinds, { data: platforms }, { data: tags }] = await Promise.all([
    getKinds(),
    supabase.from("platforms").select("id, name").order("sort_order"),
    supabase.from("tag_usage").select("tag").limit(50),
  ]);
  const kind = kinds.find((k) => k.slug === kindSlug) ?? null;
  if (!kind) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        New {kind.name}
      </h1>
      <RecordForm
        mode="create"
        kind={kind}
        parentId={parent ?? null}
        platforms={platforms ?? []}
        tagSuggestions={(tags ?? []).map((t) => t.tag as string)}
      />
    </div>
  );
}
