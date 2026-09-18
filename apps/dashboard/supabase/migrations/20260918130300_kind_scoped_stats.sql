-- Wave A'.4 -- kind-scoped stats. Spec: docs/planning/RECORD-MODEL.md §9.1.
--
-- The A'.1 rename left six functions pointing at a table that no longer exists. They are
-- rewritten here against `records`, each taking a kind so one implementation serves every
-- tracker -- a new kind gets charts from its capabilities with no new SQL (decision 10).
--
-- Old signatures are DROPPED rather than replaced: adding a defaulted `kind` argument to an
-- existing arity would make a 4-argument call ambiguous between the two overloads.

-- ---------------------------------------------------------------------------------------------
-- done_statuses -- which of a kind's statuses mean "finished".
--
-- Not in the original spec, and needed the moment stats stopped being CTF-only: `status =
-- 'solved'` is meaningless for an lfs_issue (resolved, workaround) or a blog_post (published).
-- Each kind declares its own terminal statuses, exactly as it already declares its vocabulary.
-- ---------------------------------------------------------------------------------------------

alter table record_kinds add column if not exists done_statuses text[] not null default '{}';

update record_kinds set done_statuses = case slug
  when 'ctf'            then array['solved']
  when 'lfs_build'      then array['complete']
  when 'lfs_checkpoint' then array['done']
  when 'lfs_issue'      then array['resolved', 'workaround']
  when 'skill'          then array['comfortable', 'strong']
  when 'competition'    then array['complete']
  when 'blog_post'      then array['published']
  when 'resource'       then array['using']
  when 'review'         then array['final']
  else done_statuses
end
where is_system;

alter table record_kinds add constraint record_kinds_done_statuses_subset
  check (done_statuses <@ statuses);

comment on column record_kinds.done_statuses is
  'Subset of statuses meaning finished. Every stats function filters on it, so "done" is defined '
  'per kind rather than hardcoded to the CTF word "solved".';

-- ---------------------------------------------------------------------------------------------
-- Drop the CTF-only generation.
-- ---------------------------------------------------------------------------------------------

drop function if exists public.stats_kpis(uuid);
drop function if exists public.stats_activity(uuid, text, date, date);
drop function if exists public.stats_by_difficulty(uuid);
drop function if exists public.stats_by_platform(uuid);
drop function if exists public.stats_by_tag(uuid, int);
drop function if exists public.stats_by_category(uuid);
drop function if exists private.stats_kpis(uuid);
drop function if exists private.stats_by_difficulty(uuid);
drop function if exists private.stats_by_platform(uuid);
drop function if exists private.stats_by_tag(uuid, int);
drop function if exists private.stats_by_category(uuid);

-- ---------------------------------------------------------------------------------------------
-- private.* do the work. They live in the private schema because Supabase grants EXECUTE on new
-- public-schema functions to anon by default and `revoke ... from public` does not remove it --
-- that is the exact hole found in Wave 2, where anon could call owner_id() then
-- compute_stats_snapshot(). Only the thin public wrappers below are reachable, and only by
-- authenticated, and only after re-checking is_owner().
-- ---------------------------------------------------------------------------------------------

create or replace function private.stats_kpis(p_owner uuid, p_kind text)
returns table (total_done bigint, current_streak int, longest_streak int, done_this_month bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with k as (
    select id, done_statuses from record_kinds where slug = p_kind and owner_id = p_owner
  ),
  done as (
    select r.completed_on as d
    from records r join k on k.id = r.kind_id
    where r.owner_id = p_owner
      and r.status = any (k.done_statuses)
      and r.completed_on is not null
  ),
  days as (select distinct d from done),
  -- Island grouping: for consecutive dates (d - row_number()) is constant, so grouping on it
  -- clusters each run of consecutive days.
  spine as (select d, d - (row_number() over (order by d))::int as grp from days),
  runs as (select grp, count(*) as run_length, max(d) as run_end from spine group by grp)
  select
    (select count(*) from done) as total_done,
    coalesce((
      select run_length from runs
      where run_end >= current_date - 1
      order by run_end desc limit 1
    ), 0)::int as current_streak,
    coalesce((select max(run_length) from runs), 0)::int as longest_streak,
    (select count(*) from done where d >= date_trunc('month', current_date)::date) as done_this_month;
$$;

comment on function private.stats_kpis(uuid, text) is
  'Current streak counts only if the most recent run ends today or yesterday -- tolerant of not '
  'having logged today yet.';

create or replace function private.stats_activity(
  p_owner uuid, p_kind text, p_bucket text, p_from date, p_to date
)
returns table (bucket_start date, count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select date_trunc(p_bucket, r.completed_on)::date as bucket_start, count(*) as count
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = p_owner
    and k.slug = p_kind
    and r.status = any (k.done_statuses)
    and r.completed_on between p_from and p_to
  group by 1
  order by 1;
$$;

-- Serves difficulty, confidence and rating -- which one is decided by the kind's rank:*
-- capability (decision 1). One function, one chart component, three meanings.
create or replace function private.stats_by_rank(p_owner uuid, p_kind text)
returns table (rank smallint, count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select r.rank, count(*)
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = p_owner and k.slug = p_kind and r.rank is not null
  group by r.rank
  order by r.rank;
$$;

create or replace function private.stats_by_platform(p_owner uuid, p_kind text)
returns table (platform_id uuid, platform_name text, count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id, p.name, count(r.id)
  from records r
  join record_kinds k on k.id = r.kind_id
  join platforms p on p.id = r.platform_id
  where r.owner_id = p_owner
    and k.slug = p_kind
    and r.status = any (k.done_statuses)
  group by p.id, p.name
  order by count(r.id) desc;
$$;

create or replace function private.stats_by_tag(p_owner uuid, p_kind text, p_limit int default 20)
returns table (tag text, count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select t.tag, count(*)
  from records r
  join record_kinds k on k.id = r.kind_id,
  unnest(r.tags) as t(tag)
  where r.owner_id = p_owner
    and k.slug = p_kind
    and r.status = any (k.done_statuses)
  group by t.tag
  order by count(*) desc
  limit p_limit;
$$;

-- Generic: buckets a kind by any of its `select` fields. Replaces the hardcoded
-- stats_by_category, and gives every future kind a breakdown chart for free.
create or replace function private.stats_by_field(p_owner uuid, p_kind text, p_field text)
returns table (value text, count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select r.data->>p_field as value, count(*)
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = p_owner
    and k.slug = p_kind
    and r.status = any (k.done_statuses)
    and r.data->>p_field is not null
  group by 1
  order by 2 desc;
$$;

revoke all on function private.stats_kpis(uuid, text) from public;
revoke all on function private.stats_activity(uuid, text, text, date, date) from public;
revoke all on function private.stats_by_rank(uuid, text) from public;
revoke all on function private.stats_by_platform(uuid, text) from public;
revoke all on function private.stats_by_tag(uuid, text, int) from public;
revoke all on function private.stats_by_field(uuid, text, text) from public;
grant execute on function private.stats_kpis(uuid, text) to service_role;
grant execute on function private.stats_activity(uuid, text, text, date, date) to service_role;
grant execute on function private.stats_by_rank(uuid, text) to service_role;
grant execute on function private.stats_by_platform(uuid, text) to service_role;
grant execute on function private.stats_by_tag(uuid, text, int) to service_role;
grant execute on function private.stats_by_field(uuid, text, text) to service_role;

-- ---------------------------------------------------------------------------------------------
-- public wrappers. `kind` defaults to 'ctf' so PostgREST calls that omit it keep working.
-- Each re-checks the caller: owner <> auth.uid() alone is not enough, since any authenticated
-- stranger could pass their own uid and satisfy it trivially -- is_owner() is what restricts
-- this to the single designated GitHub identity.
-- ---------------------------------------------------------------------------------------------

create or replace function stats_kpis(owner uuid, kind text default 'ctf')
returns table (total_done bigint, current_streak int, longest_streak int, done_this_month bigint)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_kpis(owner, kind);
end;
$$;

create or replace function stats_activity(
  owner uuid, bucket text, from_date date, to_date date, kind text default 'ctf'
)
returns table (bucket_start date, count bigint)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  if bucket not in ('day', 'week', 'month') then
    raise exception 'invalid bucket: %', bucket;
  end if;
  return query select * from private.stats_activity(owner, kind, bucket, from_date, to_date);
end;
$$;

create or replace function stats_by_rank(owner uuid, kind text default 'ctf')
returns table (rank smallint, count bigint)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_rank(owner, kind);
end;
$$;

create or replace function stats_by_platform(owner uuid, kind text default 'ctf')
returns table (platform_id uuid, platform_name text, count bigint)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_platform(owner, kind);
end;
$$;

create or replace function stats_by_tag(owner uuid, kind text default 'ctf', "limit" int default 20)
returns table (tag text, count bigint)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_tag(owner, kind, "limit");
end;
$$;

create or replace function stats_by_field(owner uuid, field text, kind text default 'ctf')
returns table (value text, count bigint)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_field(owner, kind, field);
end;
$$;

-- The explicit revoke is the point: Supabase's DEFAULT privileges have already granted EXECUTE
-- on each of these to anon by the time this line runs, and `revoke ... from public` would not
-- remove it. This is where the Wave 2 leak happened.
revoke execute on function stats_kpis(uuid, text) from anon, public;
revoke execute on function stats_activity(uuid, text, date, date, text) from anon, public;
revoke execute on function stats_by_rank(uuid, text) from anon, public;
revoke execute on function stats_by_platform(uuid, text) from anon, public;
revoke execute on function stats_by_tag(uuid, text, int) from anon, public;
revoke execute on function stats_by_field(uuid, text, text) from anon, public;
grant execute on function stats_kpis(uuid, text) to authenticated;
grant execute on function stats_activity(uuid, text, date, date, text) to authenticated;
grant execute on function stats_by_rank(uuid, text) to authenticated;
grant execute on function stats_by_platform(uuid, text) to authenticated;
grant execute on function stats_by_tag(uuid, text, int) to authenticated;
grant execute on function stats_by_field(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- The weekly pg_cron analysis job calls this. Same signature, so the job and its Vault
-- credential keep working untouched.
-- ---------------------------------------------------------------------------------------------

create or replace function public.compute_stats_snapshot(owner uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'kpis', (select to_jsonb(k) from private.stats_kpis(owner, 'ctf') k),
    'by_rank', (select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb) from private.stats_by_rank(owner, 'ctf') d),
    'by_platform', (select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from private.stats_by_platform(owner, 'ctf') p),
    'by_discipline', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from private.stats_by_field(owner, 'ctf', 'discipline') c),
    'by_ctf_category', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from private.stats_by_field(owner, 'ctf', 'ctf_category') c),
    'top_tags', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from private.stats_by_tag(owner, 'ctf', 10) t)
  );
$$;

revoke all on function public.compute_stats_snapshot(uuid) from public, anon;
grant execute on function public.compute_stats_snapshot(uuid) to service_role;
