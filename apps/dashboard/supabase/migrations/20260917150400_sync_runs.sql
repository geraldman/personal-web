-- owner_id added per orchestrator amendment to MASTER-PLAN section 4 (the original spec omitted
-- it, unlike the otherwise-identical import_batches). Writes still come only from the
-- sync-platform Edge Function via the service role key, which bypasses RLS -- so this wasn't a
-- live leak either way, but keeps the per-account tables uniform against a future multi-user or
-- shared-view change.
create table sync_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform_id uuid not null references platforms(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'partial', 'failed')),
  entries_created int not null default 0,
  entries_updated int not null default 0,
  error_text text
);

create index sync_runs_owner_id_idx on sync_runs (owner_id);
create index sync_runs_platform_id_idx on sync_runs (platform_id);
create index sync_runs_started_at_idx on sync_runs (started_at desc);
