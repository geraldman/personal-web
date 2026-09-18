import { createClient } from "@/lib/supabase/server";
import type { Capability, FieldDef, RecordKind } from "@/lib/types";

// record_kinds rows come back with field_schema as Json and capabilities as string[]. This is the
// one place that casts them to the contract in lib/types.ts — see RECORD-MODEL.md §5.

type KindRow = {
  id: string;
  slug: string;
  name: string;
  plural_name: string;
  icon: string | null;
  color: string | null;
  statuses: string[];
  default_status: string;
  done_statuses: string[];
  capabilities: string[];
  field_schema: unknown;
  is_system: boolean;
  sort_order: number;
};

function toKind(row: KindRow): RecordKind {
  return {
    ...row,
    capabilities: (row.capabilities ?? []) as Capability[],
    field_schema: (Array.isArray(row.field_schema) ? row.field_schema : []) as FieldDef[],
  };
}

export async function getKinds(): Promise<RecordKind[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("record_kinds")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => toKind(row as KindRow));
}

export async function getKind(slug: string): Promise<RecordKind | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("record_kinds").select("*").eq("slug", slug).maybeSingle();

  return data ? toKind(data as KindRow) : null;
}

/** Charts are derived from capabilities, never configured per kind (decision 10). A new kind gets
 *  sensible charts the moment a capability is switched on. */
export function chartsForKind(capabilities: Capability[]): Array<"activity" | "rank" | "tags" | "platform"> {
  const charts: Array<"activity" | "rank" | "tags" | "platform"> = [];
  if (capabilities.includes("dates")) charts.push("activity");
  if (capabilities.some((c) => c.startsWith("rank:"))) charts.push("rank");
  if (capabilities.includes("tags")) charts.push("tags");
  if (capabilities.includes("platform")) charts.push("platform");
  return charts;
}
