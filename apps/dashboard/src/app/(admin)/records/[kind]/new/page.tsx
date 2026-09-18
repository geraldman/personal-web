import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKind } from "@/lib/kinds";
import { RecordForm } from "@/components/records/RecordForm";

interface PageProps {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ parent?: string }>;
}

export default async function NewRecordPage({ params, searchParams }: PageProps) {
  const { kind: kindSlug } = await params;
  const { parent } = await searchParams;

  const kind = await getKind(kindSlug);
  if (!kind) notFound();

  const supabase = await createClient();
  const [{ data: platforms }, { data: tags }] = await Promise.all([
    supabase.from("platforms").select("id, name").order("sort_order"),
    supabase.from("tag_usage").select("tag").limit(50),
  ]);

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
