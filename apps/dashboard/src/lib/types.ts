// Generated types.ts types CHECK-constrained columns as plain `string`, and types `field_schema`
// as `Json` — useless for rendering. These unions are the app's own source of truth for narrowing
// at call sites. See supabase/database.types.ts and docs/planning/RECORD-MODEL.md.

// ---------------------------------------------------------------------------------------------
// The record model contract.
//
// This file and private.validate_record() (migration 20260918130000) are two implementations of
// ONE contract, specified in docs/planning/RECORD-MODEL.md §5. They must agree on the field-type
// vocabulary, on `required` and on `private`.
//
// Do NOT add a field type here alone. The trigger rejects data it does not know about, and the
// failure is silent until an insert fails at runtime. Changes update the spec first.
// ---------------------------------------------------------------------------------------------

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "code"
  | "number"
  | "date"
  | "bool"
  | "url"
  | "select"
  | "multiselect"
  | "tags"
  | "keyvalue";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Never leaves the dashboard. Stripped server-side by public_records; also never render it
   *  on a public route. Two layers, as with `notes`. */
  private?: boolean;
  options?: string[];
  help?: string;
}

/** Feature switches. A capability turns on a column's UI and a component that already exists —
 *  nothing is invented per kind. `children:` and `links:` carry a target slug / relation name. */
export type Capability =
  | "dates"
  | "time"
  | "platform"
  | "rank:difficulty"
  | "rank:confidence"
  | "rank:rating"
  | "tags"
  | "writeup"
  | "analysis"
  | "public"
  | "external"
  | "assisted"
  | "prefill"
  | "body:markdown"
  | "body:code"
  | `children:${string}`
  | `links:${string}`;

export interface RecordKind {
  id: string;
  slug: string;
  name: string;
  plural_name: string;
  icon: string | null;
  /** A design token name, never a hex literal. */
  color: string | null;
  statuses: string[];
  default_status: string;
  /** Subset of statuses meaning finished. Every stats function filters on it, so "done" is
   *  defined per kind rather than hardcoded to the CTF word "solved". */
  done_statuses: string[];
  capabilities: Capability[];
  field_schema: FieldDef[];
  is_system: boolean;
  sort_order: number;
}

export type RankKind = "difficulty" | "confidence" | "rating";

/** The rank column serves three meanings (RECORD-MODEL.md decision 1); the capability decides
 *  which one, and therefore what the control is called. */
export function rankKindOf(capabilities: Capability[]): RankKind | null {
  const cap = capabilities.find((c) => c.startsWith("rank:"));
  return cap ? ((cap.split(":")[1] as RankKind) ?? null) : null;
}

export const RANK_LABELS: Record<RankKind, string> = {
  difficulty: "Difficulty",
  confidence: "Confidence",
  rating: "Rating",
};

export function has(capabilities: Capability[], cap: Capability): boolean {
  return capabilities.includes(cap);
}

/** `children:lfs_checkpoint` → `lfs_checkpoint` */
export function childKindSlugs(capabilities: Capability[]): string[] {
  return capabilities.filter((c) => c.startsWith("children:")).map((c) => c.split(":")[1]);
}

/** `links:skill` → `skill` */
export function linkRels(capabilities: Capability[]): string[] {
  return capabilities.filter((c) => c.startsWith("links:")).map((c) => c.split(":")[1]);
}

export type RecordData = Record<string, unknown>;

// ---------------------------------------------------------------------------------------------
// Non-record enums that are still CHECK-constrained in the schema.
// ---------------------------------------------------------------------------------------------

export type RecordSource = "manual" | "sync" | "import";

export type PlatformCategory = "swe" | "cyber" | "bugbounty";
export type IconKind = "react-icons" | "local-image" | "initial";

export type AnalysisPeriod = "weekly" | "monthly" | "on_demand";
export type SyncRunStatus = "running" | "success" | "partial" | "failed";
export type ImportBatchStatus = "parsed" | "confirmed" | "discarded";

export const RANKS = [1, 2, 3, 4, 5] as const;
export type Rank = (typeof RANKS)[number];

/** Status labels are derived, not enumerated: a kind's vocabulary is its own. This only
 *  prettifies the stored token for display. */
export function humanizeStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
