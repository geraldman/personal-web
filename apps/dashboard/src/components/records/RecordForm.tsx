"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/shared/TagInput";
import { DifficultyPicker } from "@/components/shared/DifficultyBadge";
import { FieldInput, FIELD_CONTROL_CLASS, FIELD_LABEL_CLASS } from "./FieldInput";
import {
  createRecord,
  deleteRecord,
  updateRecord,
  type RecordFormInput,
} from "@/lib/actions/records";
import {
  has,
  humanizeStatus,
  rankKindOf,
  RANK_LABELS,
  type FieldDef,
  type RecordData,
  type RecordKind,
} from "@/lib/types";

// The renderer. It reads the kind and renders: the shared spine (whatever the capabilities turn
// on), then field_schema in order. No kind is named anywhere in this file — adding a tenth kind
// must need no change here.

interface PlatformOption {
  id: string;
  name: string;
}

interface RecordFormProps {
  mode: "create" | "edit";
  kind: RecordKind;
  recordId?: string;
  parentId?: string | null;
  platforms: PlatformOption[];
  tagSuggestions: string[];
  initialValues?: Partial<RecordFormInput>;
}

export function RecordForm({
  mode,
  kind,
  recordId,
  parentId,
  platforms,
  tagSuggestions,
  initialValues,
}: RecordFormProps) {
  const router = useRouter();
  const caps = kind.capabilities;
  const rankKind = rankKindOf(caps);

  const [values, setValues] = useState<RecordFormInput>({
    kindId: kind.id,
    parentId: parentId ?? null,
    title: "",
    status: kind.default_status,
    tags: [],
    data: {},
    isPublic: false,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof RecordFormInput>(key: K, value: RecordFormInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateData(key: string, value: unknown) {
    setValues((prev) => {
      const next: RecordData = { ...(prev.data ?? {}) };
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return { ...prev, data: next };
    });
  }

  // Mirrors private.validate_record(), it does not replace it. The database is the boundary;
  // this is the courtesy that avoids a round trip.
  function validate(): boolean {
    const errors: Record<string, string> = {};
    for (const def of kind.field_schema) {
      if (!def.required) continue;
      const value = values.data?.[def.key];
      if (value === undefined || value === null || value === "") {
        errors[def.key] = `${def.label} is required.`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    startTransition(async () => {
      const result =
        mode === "create" ? await createRecord(values) : await updateRecord(recordId!, values);

      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      router.push(mode === "create" ? `/records/${result.id}` : `/records/${recordId}`);
    });
  }

  function handleDelete() {
    if (!recordId) return;
    if (!confirm(`Delete this ${kind.name.toLowerCase()}? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteRecord(recordId);
      if (!result.ok) {
        setError(result.error ?? "Delete failed.");
        return;
      }
      router.push(`/records/${kind.slug}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      {error && (
        <p className="rounded-md border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <label className={FIELD_LABEL_CLASS}>
        <span>
          Title <span className="text-[var(--color-danger)]">*</span>
        </span>
        <input
          required
          className={FIELD_CONTROL_CLASS}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </label>

      {/* Status options come from the kind, never a hardcoded list. */}
      <label className={FIELD_LABEL_CLASS}>
        Status
        <select
          className={FIELD_CONTROL_CLASS}
          value={values.status}
          onChange={(e) => update("status", e.target.value)}
        >
          {kind.statuses.map((status) => (
            <option key={status} value={status}>
              {humanizeStatus(status)}
            </option>
          ))}
        </select>
      </label>

      {has(caps, "platform") && (
        <label className={FIELD_LABEL_CLASS}>
          Platform
          <select
            className={FIELD_CONTROL_CLASS}
            value={values.platformId ?? ""}
            onChange={(e) => update("platformId", e.target.value || null)}
          >
            <option value="">—</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* One control, three meanings — the capability decides the label (decision 1). */}
      {rankKind && (
        <div className={FIELD_LABEL_CLASS}>
          {RANK_LABELS[rankKind]}
          <DifficultyPicker
            rank={(values.rank ?? null) as never}
            label={values.rankLabel ?? ""}
            onRankChange={(rank: number | null) => update("rank", rank)}
            onLabelChange={(label: string) => update("rankLabel", label || null)}
          />
        </div>
      )}

      {has(caps, "dates") && (
        <div className="flex gap-3">
          <label className={`${FIELD_LABEL_CLASS} flex-1`}>
            Started
            <input
              type="date"
              className={FIELD_CONTROL_CLASS}
              value={values.startedOn ?? ""}
              onChange={(e) => update("startedOn", e.target.value || null)}
            />
          </label>
          <label className={`${FIELD_LABEL_CLASS} flex-1`}>
            Completed
            <input
              type="date"
              className={FIELD_CONTROL_CLASS}
              value={values.completedOn ?? ""}
              onChange={(e) => update("completedOn", e.target.value || null)}
            />
          </label>
        </div>
      )}

      {has(caps, "time") && (
        <label className={FIELD_LABEL_CLASS}>
          Minutes spent
          <input
            type="number"
            min={0}
            className={FIELD_CONTROL_CLASS}
            value={values.minutesSpent ?? ""}
            onChange={(e) =>
              update("minutesSpent", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </label>
      )}

      {has(caps, "tags") && (
        <div className={FIELD_LABEL_CLASS}>
          Tags
          <TagInput
            tags={values.tags ?? []}
            onChange={(tags) => update("tags", tags)}
            suggestions={tagSuggestions}
          />
        </div>
      )}

      <label className={FIELD_LABEL_CLASS}>
        Link
        <input
          type="url"
          className={FIELD_CONTROL_CLASS}
          value={values.url ?? ""}
          onChange={(e) => update("url", e.target.value || null)}
        />
      </label>

      {/* Kind-specific fields, in the order the kind declares them. */}
      {kind.field_schema.map((def: FieldDef) => (
        <FieldInput
          key={def.key}
          def={def}
          value={values.data?.[def.key] ?? null}
          onChange={(value) => updateData(def.key, value)}
          disabled={isPending}
          error={fieldErrors[def.key]}
        />
      ))}

      {(has(caps, "body:markdown") || has(caps, "body:code")) && (
        <label className={FIELD_LABEL_CLASS}>
          Body
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Public-safe. Anything private belongs in Notes.
          </span>
          <textarea
            rows={8}
            className={FIELD_CONTROL_CLASS}
            value={values.body ?? ""}
            onChange={(e) => update("body", e.target.value || null)}
          />
        </label>
      )}

      <label className={FIELD_LABEL_CLASS}>
        <span className="flex items-center gap-2">
          Notes
          <span className="rounded-full border border-[var(--color-border)] px-1.5 text-[10px] uppercase tracking-wide">
            private
          </span>
        </span>
        <span className="text-xs text-[var(--color-text-tertiary)]">
          Never published, never sent to the model.
        </span>
        <textarea
          rows={4}
          className={FIELD_CONTROL_CLASS}
          value={values.notes ?? ""}
          onChange={(e) => update("notes", e.target.value || null)}
        />
      </label>

      {/* Only appears when the kind may publish at all. The database enforces the same gate. */}
      {has(caps, "public") && (
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <input
            type="checkbox"
            checked={values.isPublic ?? false}
            onChange={(e) => update("isPublic", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Publish to the public page
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text-primary)] disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "create" ? `Create ${kind.name}` : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-tertiary)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
