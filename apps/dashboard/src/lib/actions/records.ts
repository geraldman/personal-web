"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/supabase/owner";
import { toJson } from "@/lib/json";
import type { RecordData } from "@/lib/types";

// One create/update/delete path for every kind. If a conditional on a kind slug ever appears in
// this file, the record model has been defeated — see docs/planning/RECORD-MODEL.md.

// Server Functions are not gated by the proxy matcher chain, so auth is re-checked here rather
// than trusted from the (admin) layout alone.
async function requireOwnerClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isOwner(user)) {
    redirect("/auth/login");
  }

  return supabase;
}

export interface RecordFormInput {
  kindId: string;
  parentId?: string | null;
  title: string;
  status: string;
  summary?: string | null;
  body?: string | null;
  notes?: string | null;
  url?: string | null;
  tags?: string[];
  rank?: number | null;
  rankLabel?: string | null;
  platformId?: string | null;
  startedOn?: string | null;
  completedOn?: string | null;
  minutesSpent?: number | null;
  isPublic?: boolean;
  data?: RecordData;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function toRow(input: RecordFormInput) {
  return {
    kind_id: input.kindId,
    parent_id: input.parentId ?? null,
    title: input.title,
    status: input.status,
    summary: input.summary ?? null,
    body: input.body ?? null,
    notes: input.notes ?? null,
    url: input.url ?? null,
    tags: input.tags ?? [],
    rank: input.rank ?? null,
    rank_label: input.rankLabel ?? null,
    platform_id: input.platformId || null,
    started_on: input.startedOn ?? null,
    completed_on: input.completedOn ?? null,
    minutes_spent: input.minutesSpent ?? null,
    is_public: input.isPublic ?? false,
    data: toJson(input.data ?? {}),
  };
}

// The database validates `data` against the kind's field_schema and `status` against the kind's
// vocabulary (private.validate_record). Its errors are already specific — "field symptom is
// required for kind lfs_issue" — so they are surfaced verbatim rather than flattened.
function fail(error: { message: string }): ActionResult {
  return { ok: false, error: error.message };
}

export async function createRecord(input: RecordFormInput): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { data, error } = await supabase
    .from("records")
    .insert({ ...toRow(input), source: "manual" })
    .select("id")
    .single();

  if (error) return fail(error);

  revalidatePath("/records");
  return { ok: true, id: data.id };
}

export async function updateRecord(id: string, input: RecordFormInput): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase.from("records").update(toRow(input)).eq("id", id);
  if (error) return fail(error);

  revalidatePath("/records");
  revalidatePath(`/records/${id}`);
  return { ok: true, id };
}

export async function deleteRecord(id: string): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) return fail(error);

  revalidatePath("/records");
  return { ok: true };
}

export async function deleteRecords(ids: string[]): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase.from("records").delete().in("id", ids);
  if (error) return fail(error);

  revalidatePath("/records");
  return { ok: true };
}

export async function setRecordsStatus(ids: string[], status: string): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase.from("records").update({ status }).in("id", ids);
  if (error) return fail(error);

  revalidatePath("/records");
  return { ok: true };
}

/** Publish toggle. Note this is only one of the two gates: the kind must also carry the `public`
 *  capability, which is enforced in public_records and cannot be overridden from here. */
export async function setRecordPublic(id: string, isPublic: boolean): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase.from("records").update({ is_public: isPublic }).eq("id", id);
  if (error) return fail(error);

  revalidatePath(`/records/${id}`);
  return { ok: true };
}

export async function linkRecords(
  fromId: string,
  toId: string,
  rel: string,
  note?: string | null
): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase
    .from("record_links")
    .insert({ from_id: fromId, to_id: toId, rel, note: note ?? null });

  if (error) return fail(error);

  revalidatePath(`/records/${fromId}`);
  return { ok: true };
}

export async function unlinkRecords(linkId: string, fromId: string): Promise<ActionResult> {
  const supabase = await requireOwnerClient();

  const { error } = await supabase.from("record_links").delete().eq("id", linkId);
  if (error) return fail(error);

  revalidatePath(`/records/${fromId}`);
  return { ok: true };
}
