create table entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform_id uuid not null references platforms(id),
  challenge_name text not null,
  category text not null check (category in ('swe', 'cyber')),
  difficulty text,
  difficulty_rank smallint check (difficulty_rank between 1 and 5),
  status text not null default 'solved' check (status in ('solved', 'in_progress', 'attempted')),
  date_completed date,
  tags text[] not null default '{}',
  problem_url text,
  notes text,
  portfolio_writeup text,
  writeup_model text,
  writeup_generated_at timestamptz,
  source text not null default 'manual' check (source in ('manual', 'sync', 'import')),
  external_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column entries.difficulty is
  'Platform''s own difficulty label, verbatim (e.g. "Hard", "6 kyu", "insane").';
comment on column entries.difficulty_rank is
  'Normalized 1-5 rank, mapped from difficulty by the manual form or the sync adapter, for cross-platform charts.';
comment on column entries.notes is
  'PRIVATE. Never exposed via public_entries, never sent to the LLM for writeup generation.';
comment on column entries.external_id is
  'Platform''s own id for this solve. Paired with platform_id as the sync dedupe/idempotency key.';

-- Dedupe key for sync: a platform+external_id pair can appear at most once.
-- Partial (not plain) unique index because manual/import entries have external_id = null
-- and must not collide with each other.
create unique index entries_platform_external_id_key
  on entries (platform_id, external_id)
  where external_id is not null;

create index entries_owner_id_idx on entries (owner_id);
create index entries_platform_id_idx on entries (platform_id);
create index entries_status_idx on entries (status);
create index entries_date_completed_idx on entries (date_completed);
create index entries_tags_idx on entries using gin (tags);

create trigger entries_set_updated_at
before update on entries
for each row execute function set_updated_at();
