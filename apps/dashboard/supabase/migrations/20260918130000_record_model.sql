-- Wave A'.1 -- the record model. Spec: docs/planning/RECORD-MODEL.md (decisions in §1.1).
--
-- `entries` is ALTERED AND RENAMED, not dropped and recreated (decision 2). Its RLS policies,
-- grants, indexes, FKs and triggers all follow the rename, so the single-owner security boundary
-- audited in Waves 1-2 is amended rather than rebuilt from zero. Verified precondition:
-- entries held 0 rows at apply time, which is the only reason this is cheap.
--
-- The two views over entries are dropped here and recreated in A'.3: `category` is being removed
-- (it becomes data->>'discipline'), and Postgres refuses to drop a column a view depends on.

drop view if exists public_entries;
drop view if exists tag_usage;

-- ---------------------------------------------------------------------------------------------
-- record_kinds -- a "mode" is a row. Adding a tracker must never need a migration.
-- ---------------------------------------------------------------------------------------------

create table record_kinds (
  id uuid primary key default gen_random_uuid(),
  -- default owner_id(), NOT auth.uid(): the seed runs as service_role through the Management API
  -- (ports 5432/6543 are blocked on the dev machine), where auth.uid() is NULL and this not-null
  -- column would fail the whole file.
  owner_id uuid not null default public.owner_id() references auth.users(id) on delete cascade,
  slug text not null,
  name text not null,
  plural_name text not null,
  icon text,
  -- A design token name (e.g. 'accent'), never a hex literal -- the UI refactor has to be able to
  -- restyle every kind from one place.
  color text,
  statuses text[] not null check (cardinality(statuses) > 0),
  default_status text not null,
  capabilities text[] not null default '{}',
  field_schema jsonb not null default '[]',
  is_system boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint record_kinds_owner_slug_key unique (owner_id, slug),
  constraint record_kinds_default_status_valid check (default_status = any (statuses)),
  constraint record_kinds_field_schema_is_array check (jsonb_typeof(field_schema) = 'array')
);

comment on table record_kinds is
  'One row per tracker kind (ctf, lfs_checkpoint, skill, ...). statuses, capabilities and '
  'field_schema drive the frontend entirely -- no kind is named in frontend code.';
comment on column record_kinds.statuses is
  'This kind''s own status vocabulary. Deliberately NOT a check constraint on records.status: '
  'each kind owns its vocabulary, so a table-level check could not express it and would have to '
  'be dropped the first time a kind is added. Enforced in private.validate_record() instead.';

create trigger record_kinds_set_updated_at
before update on record_kinds
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------------------------
-- entries -> records
-- ---------------------------------------------------------------------------------------------

alter table entries rename to records;

alter table records rename column challenge_name to title;
alter table records rename column difficulty to rank_label;
alter table records rename column difficulty_rank to rank;
alter table records rename column portfolio_writeup to body;
alter table records rename column problem_url to url;
alter table records rename column date_completed to completed_on;

-- status is validated per-kind by trigger from here on; category becomes data->>'discipline'.
alter table records drop constraint entries_status_check;
alter table records drop constraint entries_category_check;
alter table records drop column category;

alter table records rename constraint entries_difficulty_rank_check to records_rank_check;

alter table records
  add column kind_id uuid not null references record_kinds(id),
  add column parent_id uuid references records(id) on delete cascade,
  add column slug text,
  add column summary text,
  add column started_on date,
  add column minutes_spent int check (minutes_spent >= 0),
  add column data jsonb not null default '{}',
  add column is_public boolean not null default false,
  add column sort_order int not null default 0;

-- Nullable now: most kinds (lfs_*, skill, blog_post, resource, review) have no platform.
alter table records alter column platform_id drop not null;

alter table records add constraint records_data_is_object
  check (jsonb_typeof(data) = 'object');

comment on column records.rank is
  'Normalized 1-5. Serves difficulty, skill confidence AND resource rating -- which one is '
  'decided by the kind''s rank:* capability (decision 1). rank_label holds the source''s own '
  'words ("6 kyu", "Insane").';
comment on column records.notes is
  'PRIVATE. Never selected by public_records, never sent to the LLM.';
comment on column records.data is
  'Kind-specific fields, validated against the kind''s field_schema on write only (decision 7). '
  'A later field_schema edit never invalidates an existing row.';

-- Dedupe key keeps platform_id: two adapters can legitimately return the same numeric id for
-- different challenges. kind_id is added so a future non-platform kind with external ids cannot
-- collide with a CTF row.
drop index entries_platform_external_id_key;
create unique index records_kind_platform_external_id_key
  on records (kind_id, platform_id, external_id)
  where external_id is not null;

create index records_kind_id_idx on records (kind_id);
create index records_parent_id_idx on records (parent_id);
create index records_is_public_idx on records (is_public) where is_public;
create index records_data_idx on records using gin (data);

-- ---------------------------------------------------------------------------------------------
-- record_links -- every relationship. Replaces post_sources, entry_skills and competition
-- membership from the superseded seven-table design.
-- ---------------------------------------------------------------------------------------------

create table record_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  from_id uuid not null references records(id) on delete cascade,
  to_id uuid not null references records(id) on delete cascade,
  rel text not null,
  note text,
  created_at timestamptz not null default now(),
  constraint record_links_unique unique (from_id, to_id, rel),
  constraint record_links_no_self check (from_id <> to_id)
);

comment on table record_links is
  'parent_id handles containment (an lfs_issue belongs to one checkpoint); this handles '
  'association (a blog_post draws on four unrelated records). rel: source | skill | competition '
  '| resource | related.';

create index record_links_from_idx on record_links (from_id);
create index record_links_to_idx on record_links (to_id);
create index record_links_owner_idx on record_links (owner_id);

-- ---------------------------------------------------------------------------------------------
-- Validation -- write-only (decision 7), in the private schema so the Wave 2 anon-EXECUTE trap
-- (Supabase grants EXECUTE on new public functions to anon by default) cannot apply at all.
-- ---------------------------------------------------------------------------------------------

create or replace function private.validate_record()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  k record;
  def jsonb;
  key text;
  val jsonb;
  found_def boolean;
  expected text;
begin
  select * into k from record_kinds where id = new.kind_id;
  if not found then
    raise exception 'unknown kind_id %', new.kind_id;
  end if;

  if not (new.status = any (k.statuses)) then
    raise exception 'status % is not valid for kind % (allowed: %)',
      new.status, k.slug, array_to_string(k.statuses, ', ');
  end if;

  -- Every key present in data must be declared by the kind, and must type-check.
  for key, val in select * from jsonb_each(new.data) loop
    found_def := false;
    for def in select * from jsonb_array_elements(k.field_schema) loop
      if def->>'key' = key then
        found_def := true;
        if jsonb_typeof(val) <> 'null' then
          expected := case def->>'type'
            when 'number' then 'number'
            when 'bool' then 'boolean'
            when 'tags' then 'array'
            when 'multiselect' then 'array'
            when 'keyvalue' then 'object'
            else 'string'
          end;
          if jsonb_typeof(val) <> expected then
            raise exception 'field % on kind % expects % but got %',
              key, k.slug, expected, jsonb_typeof(val);
          end if;
          if def->>'type' = 'select'
             and def ? 'options'
             and not (val #>> '{}' in (select jsonb_array_elements_text(def->'options'))) then
            raise exception 'field % on kind % got % which is not one of its options',
              key, k.slug, val #>> '{}';
          end if;
        end if;
        exit;
      end if;
    end loop;
    if not found_def then
      raise exception 'field % is not declared in field_schema for kind %', key, k.slug;
    end if;
  end loop;

  -- Required keys must be present and non-null.
  for def in select * from jsonb_array_elements(k.field_schema) loop
    if coalesce((def->>'required')::boolean, false)
       and (not (new.data ? (def->>'key')) or jsonb_typeof(new.data -> (def->>'key')) = 'null') then
      raise exception 'field % is required for kind %', def->>'key', k.slug;
    end if;
  end loop;

  return new;
end;
$$;

comment on function private.validate_record() is
  'Fires BEFORE INSERT OR UPDATE only. Never re-validates rows it was not fired for, so editing '
  'a kind''s field_schema leaves existing records readable and editable (decision 7).';

revoke all on function private.validate_record() from public;

create trigger records_validate
before insert or update on records
for each row execute function private.validate_record();

-- ---------------------------------------------------------------------------------------------
-- RLS. records keeps the policies that followed it through the rename (entries_owner_*); the two
-- new tables get the same shape. auth.uid() = owner_id alone is NOT sufficient -- any
-- authenticated stranger's own rows satisfy it trivially -- so is_owner() is on every policy.
-- ---------------------------------------------------------------------------------------------

alter table record_kinds enable row level security;
alter table record_links enable row level security;

create policy record_kinds_owner_all
  on record_kinds for all
  using (auth.uid() = owner_id and is_owner())
  with check (auth.uid() = owner_id and is_owner());

create policy record_links_owner_all
  on record_links for all
  using (auth.uid() = owner_id and is_owner())
  with check (auth.uid() = owner_id and is_owner());

revoke all on record_kinds from anon;
revoke all on record_links from anon;
revoke all on records from anon;

grant select, insert, update, delete on record_kinds to authenticated;
grant select, insert, update, delete on record_links to authenticated;
