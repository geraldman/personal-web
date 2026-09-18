"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { deleteRecords, setRecordsStatus } from "@/lib/actions/records";
import {
  has,
  humanizeStatus,
  rankKindOf,
  RANK_LABELS,
  type RecordData,
  type RecordKind,
} from "@/lib/types";

// Columns are derived from the kind's capabilities and field_schema, never declared per kind.
// A tenth kind gets a usable table with no code here.

export interface RecordRow {
  id: string;
  title: string;
  status: string;
  rank: number | null;
  rank_label: string | null;
  completed_on: string | null;
  started_on: string | null;
  minutes_spent: number | null;
  tags: string[];
  platform_id: string | null;
  is_public: boolean;
  data: RecordData;
}

interface PlatformOption {
  id: string;
  name: string;
  icon_kind: string;
  icon_ref: string;
  brand_color: string;
}

interface RecordsTableProps {
  kind: RecordKind;
  records: RecordRow[];
  platforms: PlatformOption[];
  showPlatform?: boolean;
}

export function RecordsTable({ kind, records, platforms, showPlatform }: RecordsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const caps = kind.capabilities;
  const rankKind = rankKindOf(caps);

  const platformById = useMemo(
    () => new Map(platforms.map((p) => [p.id, p])),
    [platforms]
  );

  const columns = useMemo<DataTableColumn<RecordRow>[]>(() => {
    const cols: DataTableColumn<RecordRow>[] = [
      {
        key: "title",
        header: "Title",
        render: (row) => (
          <span className="text-[var(--color-text-primary)]">{row.title}</span>
        ),
      },
    ];

    if (showPlatform) {
      cols.push({
        key: "platform",
        header: "Platform",
        render: (row) => {
          const platform = row.platform_id ? platformById.get(row.platform_id) : null;
          return platform ? (
            <PlatformIcon
              iconKind={platform.icon_kind}
              iconRef={platform.icon_ref}
              brandColor={platform.brand_color}
              name={platform.name}
            />
          ) : (
            <span className="text-[var(--color-text-tertiary)]">—</span>
          );
        },
      });
    }

    if (rankKind) {
      cols.push({
        key: "rank",
        header: RANK_LABELS[rankKind],
        render: (row) =>
          row.rank === null && !row.rank_label ? (
            <span className="text-[var(--color-text-tertiary)]">—</span>
          ) : (
            <DifficultyBadge rank={row.rank as never} label={row.rank_label ?? ""} />
          ),
      });
    }

    cols.push({
      key: "status",
      header: "Status",
      render: (row) => (
        <span className="text-[var(--color-text-secondary)]">{humanizeStatus(row.status)}</span>
      ),
    });

    // The first two `select` fields the kind declares earn a column. More than that and the
    // table stops being readable at phone width.
    for (const def of kind.field_schema.filter((f) => f.type === "select" && !f.private).slice(0, 2)) {
      cols.push({
        key: def.key,
        header: def.label,
        render: (row) => {
          const value = row.data?.[def.key];
          return value ? (
            <span className="text-[var(--color-text-secondary)]">{String(value)}</span>
          ) : (
            <span className="text-[var(--color-text-tertiary)]">—</span>
          );
        },
      });
    }

    if (has(caps, "dates")) {
      cols.push({
        key: "completed_on",
        header: "Completed",
        render: (row) => (
          <span className="text-[var(--color-text-secondary)]">{row.completed_on ?? "—"}</span>
        ),
      });
    }

    if (has(caps, "time")) {
      cols.push({
        key: "minutes_spent",
        header: "Time",
        render: (row) => (
          <span className="text-[var(--color-text-secondary)]">
            {row.minutes_spent === null ? "—" : `${row.minutes_spent}m`}
          </span>
        ),
      });
    }

    if (has(caps, "public")) {
      cols.push({
        key: "is_public",
        header: "Public",
        render: (row) => (
          <span className="text-[var(--color-text-tertiary)]">{row.is_public ? "yes" : "—"}</span>
        ),
      });
    }

    return cols;
  }, [caps, kind.field_schema, platformById, rankKind, showPlatform]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(records.map((r) => r.id)) : new Set());
  }

  function bulkStatus(status: string) {
    startTransition(async () => {
      await setRecordsStatus([...selected], status);
      setSelected(new Set());
      router.refresh();
    });
  }

  function bulkDelete() {
    if (!confirm(`Delete ${selected.size} record(s)? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteRecords([...selected]);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--color-text-secondary)]">{selected.size} selected</span>
          {/* Bulk status options come from the kind, like everywhere else. */}
          {kind.statuses.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isPending}
              onClick={() => bulkStatus(status)}
              className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
            >
              {humanizeStatus(status)}
            </button>
          ))}
          <button
            type="button"
            disabled={isPending}
            onClick={bulkDelete}
            className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-tertiary)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={records}
        getRowId={(row) => row.id}
        onRowClick={(row) => router.push(`/records/${kind.slug}/${row.id}`)}
        selectable
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
      />
    </div>
  );
}
