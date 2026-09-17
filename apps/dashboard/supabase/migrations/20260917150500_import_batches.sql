create table import_batches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform_id uuid not null references platforms(id),
  raw_input text not null,
  parsed jsonb,
  status text not null default 'parsed' check (status in ('parsed', 'confirmed', 'discarded')),
  model_used text,
  created_at timestamptz not null default now()
);

comment on column import_batches.raw_input is
  'What Gerald pasted from the platform''s own UI (his own account data, not scraped).';
comment on column import_batches.parsed is
  'Structured rows produced by parse-import via the LLM. Nothing here reaches entries until confirmed.';

create index import_batches_owner_id_idx on import_batches (owner_id);
create index import_batches_platform_id_idx on import_batches (platform_id);
