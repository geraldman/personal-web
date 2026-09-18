"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FieldInput, FIELD_LABEL_CLASS } from "./FieldInput";
import { getReviewPrefill, type ReviewPrefill } from "@/lib/actions/records";
import type { FieldDef, RecordData } from "@/lib/types";

// The `prefill` capability (RECORD-MODEL.md decision 8): pre-fill the FACTS, never the prose.
// Renders `period`/`window_start`/`window_end` (the fields the capability assumes, same as
// `dates` assumes started_on/completed_on) plus a read-only summary of minutes, closed records
// and any existing analysis for that window. It never writes into planned/done/adjustments --
// those stay empty textareas next to this, by design, not as a gap to fill in later.

const PANEL = "rounded-md border border-[var(--color-border)] p-4";
const SECTION_LABEL = "text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]";

interface PrefillPanelProps {
  fields: FieldDef[];
  data: RecordData;
  onFieldChange: (key: string, value: unknown) => void;
  disabled?: boolean;
  fieldErrors: Record<string, string>;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Last full Mon–Sun week, or last full calendar month -- a convenience offered next to the
 *  window fields, never forced. */
function lastFullWindow(period: string): { start: string; end: string } | null {
  const today = new Date();

  if (period === "weekly") {
    const daysSinceMonday = (today.getDay() + 6) % 7;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - daysSinceMonday);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);
    return { start: isoDate(lastMonday), end: isoDate(lastSunday) };
  }

  if (period === "monthly") {
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfPrevMonth = new Date(firstOfThisMonth);
    lastOfPrevMonth.setDate(0);
    const firstOfPrevMonth = new Date(lastOfPrevMonth.getFullYear(), lastOfPrevMonth.getMonth(), 1);
    return { start: isoDate(firstOfPrevMonth), end: isoDate(lastOfPrevMonth) };
  }

  return null;
}

export function PrefillPanel({ fields, data, onFieldChange, disabled, fieldErrors }: PrefillPanelProps) {
  const period = (data.period as string) ?? null;
  const windowStart = (data.window_start as string) ?? null;
  const windowEnd = (data.window_end as string) ?? null;

  const [prefill, setPrefill] = useState<ReviewPrefill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nothing to reset here: the render below checks windowStart/windowEnd before it ever reads
    // `prefill`, so a stale value from a previous complete window is never shown once the window
    // becomes incomplete again.
    if (!windowStart || !windowEnd) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      const result = await getReviewPrefill(windowStart, windowEnd);
      if (cancelled) return;
      setLoading(false);
      if (result.ok) setPrefill(result.data);
      else setError(result.error);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [windowStart, windowEnd]);

  const suggestion = period ? lastFullWindow(period) : null;
  const canSuggest = Boolean(suggestion) && (!windowStart || !windowEnd);

  return (
    <div className={`${PANEL} flex flex-col gap-4`}>
      <div className="flex flex-col gap-4">
        {fields.map((def) => (
          <FieldInput
            key={def.key}
            def={def}
            value={data[def.key] ?? null}
            onChange={(value) => onFieldChange(def.key, value)}
            disabled={disabled}
            error={fieldErrors[def.key]}
          />
        ))}

        {canSuggest && suggestion && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onFieldChange("window_start", suggestion.start);
              onFieldChange("window_end", suggestion.end);
            }}
            className="self-start rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
          >
            Fill last full {period}
          </button>
        )}
      </div>

      <div className={`${FIELD_LABEL_CLASS} border-t border-[var(--color-border)] pt-4`}>
        Prefilled facts
        {!windowStart || !windowEnd ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Set the window above to see minutes, closed records and any existing analysis.
          </p>
        ) : loading ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">Loading…</p>
        ) : error ? (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        ) : prefill ? (
          <div className="flex flex-col gap-3">
            <div>
              <h4 className={`${SECTION_LABEL} mb-1`}>Minutes by kind</h4>
              {Object.keys(prefill.minutes_by_kind).length === 0 ? (
                <p className="text-xs text-[var(--color-text-tertiary)]">No logged time in this window.</p>
              ) : (
                <ul className="flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
                  {Object.entries(prefill.minutes_by_kind).map(([kind, minutes]) => (
                    <li key={kind}>
                      {kind}: {minutes}m
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className={`${SECTION_LABEL} mb-1`}>Closed in this window</h4>
              {prefill.closed_records.length === 0 ? (
                <p className="text-xs text-[var(--color-text-tertiary)]">Nothing closed in this window.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-xs">
                  {prefill.closed_records.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/records/${r.kind}/${r.id}`}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        {r.title}
                      </Link>
                      <span className="text-[var(--color-text-tertiary)]"> — {r.kind}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className={`${SECTION_LABEL} mb-1`}>Existing analysis</h4>
              {prefill.analysis ? (
                <div className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)]">
                  <p>{prefill.analysis.summary_text}</p>
                  {prefill.analysis.recommendations.length > 0 && (
                    <ul className="list-disc pl-4">
                      {prefill.analysis.recommendations.map((rec) => (
                        <li key={rec}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  No analysis generated for this window yet.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
