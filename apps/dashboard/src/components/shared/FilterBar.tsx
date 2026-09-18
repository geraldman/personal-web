"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RANKS, humanizeStatus } from "@/lib/types";

interface PlatformOption {
  id: string;
  name: string;
}

interface FilterBarProps {
  platforms: PlatformOption[];
  /** The kind's own status vocabulary. Never a hardcoded list -- each kind owns its statuses. */
  statuses: string[];
  showPlatform?: boolean;
  /** "Difficulty" | "Confidence" | "Rating", or null when the kind has no rank capability. */
  rankLabel?: string | null;
}

// Filter/sort state lives entirely in the URL (searchParams), not component state, so it
// survives a back-navigation from /entries/[id].
export function FilterBar({ platforms, statuses, showPlatform, rankLabel }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(event) => setParam("q", event.target.value)}
        placeholder="Search..."
        className="min-h-[44px] rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
      />
      {showPlatform && (
      <select
        value={searchParams.get("platform") ?? ""}
        onChange={(event) => setParam("platform", event.target.value)}
        className="min-h-[44px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
      >
        <option value="">All platforms</option>
        {platforms.map((platform) => (
          <option key={platform.id} value={platform.id}>
            {platform.name}
          </option>
        ))}
      </select>
      )}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(event) => setParam("status", event.target.value)}
        className="min-h-[44px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
      >
        <option value="">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {humanizeStatus(status)}
          </option>
        ))}
      </select>
      {rankLabel && (
      <select
        value={searchParams.get("rank") ?? ""}
        onChange={(event) => setParam("rank", event.target.value)}
        className="min-h-[44px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
      >
        <option value="">All {rankLabel.toLowerCase()}</option>
        {RANKS.map((rank) => (
          <option key={rank} value={rank}>
            {rankLabel} {rank}
          </option>
        ))}
        <option value="unranked">Unranked</option>
      </select>
      )}
      <input
        type="text"
        defaultValue={searchParams.get("tag") ?? ""}
        onChange={(event) => setParam("tag", event.target.value)}
        placeholder="Tag"
        className="min-h-[44px] w-24 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
      />
      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(event) => setParam("sort", event.target.value)}
        className="min-h-[44px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        {rankLabel && <option value="rank">{rankLabel}</option>}
      </select>
      {searchParams.toString() && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="min-h-[44px] rounded-md border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
