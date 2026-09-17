alter table platforms enable row level security;
alter table entries enable row level security;
alter table analyses enable row level security;
alter table platform_accounts enable row level security;
alter table sync_runs enable row level security;
alter table import_batches enable row level security;

-- platforms: readable by any authenticated user (and, via the next migration, by anon too — the
-- public tracker view needs platform names/icons to render). No insert/update/delete policy for
-- any role, so writes only happen via migrations/seed run as the service role, which bypasses RLS.
create policy platforms_select_all
  on platforms for select
  using (true);

-- entries: full CRUD restricted to the single owning user. auth.uid() = owner_id alone is not
-- enough -- any authenticated stranger's own rows satisfy it trivially -- so every policy also
-- requires is_owner(), which is true only for the GitHub identity in private.app_config. anon
-- gets no grant on this table at all (see next migration) -- these policies are a second layer,
-- not the only one.
create policy entries_owner_select
  on entries for select
  using (auth.uid() = owner_id and is_owner());

create policy entries_owner_insert
  on entries for insert
  with check (auth.uid() = owner_id and is_owner());

create policy entries_owner_update
  on entries for update
  using (auth.uid() = owner_id and is_owner())
  with check (auth.uid() = owner_id and is_owner());

create policy entries_owner_delete
  on entries for delete
  using (auth.uid() = owner_id and is_owner());

-- analyses: owner only, no update (analyses are regenerated as new rows, not edited).
create policy analyses_owner_select
  on analyses for select
  using (auth.uid() = owner_id and is_owner());

create policy analyses_owner_insert
  on analyses for insert
  with check (auth.uid() = owner_id and is_owner());

create policy analyses_owner_delete
  on analyses for delete
  using (auth.uid() = owner_id and is_owner());

-- platform_accounts: owner only.
create policy platform_accounts_owner_all
  on platform_accounts for all
  using (auth.uid() = owner_id and is_owner())
  with check (auth.uid() = owner_id and is_owner());

-- import_batches: owner only.
create policy import_batches_owner_all
  on import_batches for all
  using (auth.uid() = owner_id and is_owner())
  with check (auth.uid() = owner_id and is_owner());

-- sync_runs: owner only, matching the other per-account tables.
create policy sync_runs_owner_select
  on sync_runs for select
  using (auth.uid() = owner_id and is_owner());
