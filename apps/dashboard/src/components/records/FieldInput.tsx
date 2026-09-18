"use client";

import { useState } from "react";
import { TagInput } from "@/components/shared/TagInput";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { cn } from "@/lib/utils";
import type { FieldDef } from "@/lib/types";

// One renderer per field type from RECORD-MODEL.md §5. No component here knows which kind it is
// inside — that is the whole point. Styling lives in the two constants below so the coming UI
// refactor has a single seam, per EXECUTION-PLAN.md §6.

const CONTROL =
  "rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm " +
  "text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-strong)]";
const LABEL = "flex flex-col gap-1.5 text-sm text-[var(--color-text-secondary)]";

interface FieldInputProps {
  def: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string | null;
}

export function FieldInput({ def, value, onChange, disabled, error }: FieldInputProps) {
  return (
    <label className={LABEL}>
      <span className="flex items-center gap-2">
        {def.label}
        {def.required && <span className="text-[var(--color-danger)]">*</span>}
        {def.private && (
          <span
            className="rounded-full border border-[var(--color-border)] px-1.5 text-[10px] uppercase tracking-wide"
            title="Never leaves the dashboard — stripped from public views server-side."
          >
            private
          </span>
        )}
      </span>

      <Control def={def} value={value} onChange={onChange} disabled={disabled} />

      {def.help && <span className="text-xs text-[var(--color-text-tertiary)]">{def.help}</span>}
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </label>
  );
}

function Control({ def, value, onChange, disabled }: Omit<FieldInputProps, "error">) {
  const common = { disabled, className: CONTROL };

  switch (def.type) {
    case "textarea":
      return (
        <textarea
          {...common}
          rows={4}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    // A preview follows from the type, not the kind (RECORD-MODEL.md §5) -- any kind that
    // declares a markdown field gets one, with no per-kind code.
    case "markdown":
      return (
        <MarkdownEditor
          value={(value as string) ?? ""}
          onChange={(v) => onChange(v || null)}
          disabled={disabled}
        />
      );

    case "code":
      return (
        <textarea
          {...common}
          rows={8}
          spellCheck={false}
          className={cn(CONTROL, "font-[family-name:var(--font-mono)] text-xs")}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case "number":
      return (
        <input
          {...common}
          type="number"
          value={value === null || value === undefined ? "" : String(value)}
          // Empty string must become null, not NaN: the trigger type-checks jsonb and would
          // reject a NaN as a non-number.
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );

    case "date":
      return (
        <input
          {...common}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case "bool":
      return (
        <input
          type="checkbox"
          disabled={disabled}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 self-start accent-[var(--color-accent)]"
        />
      );

    case "url":
      return (
        <input
          {...common}
          type="url"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case "select":
      return (
        <select
          {...common}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">—</option>
          {(def.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {(def.options ?? []).map((option) => {
            const on = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(on ? selected.filter((s) => s !== option) : [...selected, option])
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs",
                  on
                    ? "border-[var(--color-border-strong)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    case "tags":
      return (
        <TagInput
          tags={Array.isArray(value) ? (value as string[]) : []}
          onChange={(tags) => onChange(tags)}
        />
      );

    case "keyvalue":
      return <KeyValueInput value={value} onChange={onChange} disabled={disabled} />;

    case "text":
    default:
      return (
        <input
          {...common}
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
  }
}

/** The one genuinely new widget. Used for kernel flags, ./configure switches, package versions —
 *  key sets that differ per record and would never be queried relationally. */
function KeyValueInput({
  value,
  onChange,
  disabled,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, string>;
  const entries = Object.entries(obj);
  const [draftKey, setDraftKey] = useState("");
  const [draftValue, setDraftValue] = useState("");

  function setPair(key: string, val: string) {
    onChange({ ...obj, [key]: val });
  }

  function removePair(key: string) {
    const next = { ...obj };
    delete next[key];
    onChange(Object.keys(next).length ? next : {});
  }

  function addPair() {
    const key = draftKey.trim();
    if (!key) return;
    setPair(key, draftValue.trim());
    setDraftKey("");
    setDraftValue("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex gap-1.5">
          <input
            readOnly
            value={key}
            className={cn(CONTROL, "w-1/3 text-[var(--color-text-secondary)]")}
          />
          <input
            disabled={disabled}
            value={val}
            onChange={(e) => setPair(key, e.target.value)}
            className={cn(CONTROL, "flex-1")}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => removePair(key)}
            className="px-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]"
          >
            remove
          </button>
        </div>
      ))}
      <div className="flex gap-1.5">
        <input
          disabled={disabled}
          placeholder="key"
          value={draftKey}
          onChange={(e) => setDraftKey(e.target.value)}
          className={cn(CONTROL, "w-1/3")}
        />
        <input
          disabled={disabled}
          placeholder="value"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPair();
            }
          }}
          className={cn(CONTROL, "flex-1")}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={addPair}
          className="px-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          add
        </button>
      </div>
    </div>
  );
}

export { CONTROL as FIELD_CONTROL_CLASS, LABEL as FIELD_LABEL_CLASS };
