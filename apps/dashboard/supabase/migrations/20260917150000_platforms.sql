-- Shared trigger function: keeps updated_at current on every UPDATE.
-- Used by every table below that carries an updated_at column.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('swe', 'cyber', 'bugbounty')),
  url text not null,
  icon_kind text not null,
  icon_ref text not null,
  brand_color text not null,
  sync_adapter text,
  import_hint text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column platforms.sync_adapter is
  'Adapter key in the sync registry, or null for manual/assisted-import-only platforms.';
comment on column platforms.import_hint is
  'Guidance shown in the assisted-import UI for platforms with no sync adapter.';

create trigger platforms_set_updated_at
before update on platforms
for each row execute function set_updated_at();
