-- Phase 6 needs an aggregate stats read for the analyze Edge Function, from two contexts that
-- have no owner JWT at all: the weekly pg_cron trigger, and (defensively) any future system job.
-- The existing public.stats_* functions are correctly gated by `owner = auth.uid() and
-- is_owner()` for the dashboard UI -- but that same check means they unconditionally reject a
-- service_role caller (auth.uid() is null outside a user JWT), even one that already resolved
-- and trusts the right owner. So the authorization check and the aggregate logic are split:
-- the real logic moves to a `private` core function with no auth.uid() check at all (its only
-- gate is that private has no grant to anon/authenticated -- only service_role can call it), and
-- the public function becomes a thin, unchanged-behavior wrapper that checks authorization first.

create or replace function private.stats_kpis(owner uuid)
returns table (
  total_solved bigint,
  current_streak int,
  longest_streak int,
  solved_this_month bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  with solved_days as (
    select distinct date_completed as d
    from entries
    where owner_id = owner
      and status = 'solved'
      and date_completed is not null
  ),
  spine as (
    select d, d - (row_number() over (order by d))::int as grp
    from solved_days
  ),
  runs as (
    select grp, count(*) as run_length, max(d) as run_end
    from spine
    group by grp
  )
  select
    (select count(*) from entries where owner_id = owner and status = 'solved') as total_solved,
    coalesce((
      select run_length from runs
      where run_end >= current_date - 1
      order by run_end desc
      limit 1
    ), 0)::int as current_streak,
    coalesce((select max(run_length) from runs), 0)::int as longest_streak,
    (
      select count(*) from entries
      where owner_id = owner and status = 'solved'
        and date_completed >= date_trunc('month', current_date)::date
    ) as solved_this_month;
end;
$$;

create or replace function private.stats_by_difficulty(owner uuid)
returns table (difficulty_rank smallint, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select entries.difficulty_rank, count(*)
  from entries
  where entries.owner_id = owner
    and entries.status = 'solved'
    and entries.difficulty_rank is not null
  group by entries.difficulty_rank
  order by entries.difficulty_rank;
end;
$$;

create or replace function private.stats_by_platform(owner uuid)
returns table (platform_id uuid, platform_name text, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select p.id, p.name, count(e.id)
  from entries e
  join platforms p on p.id = e.platform_id
  where e.owner_id = owner
    and e.status = 'solved'
  group by p.id, p.name
  order by count(e.id) desc;
end;
$$;

create or replace function private.stats_by_tag(owner uuid, "limit" int default 20)
returns table (tag text, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select t.tag, count(*)
  from entries e, unnest(e.tags) as t(tag)
  where e.owner_id = owner
    and e.status = 'solved'
  group by t.tag
  order by count(*) desc
  limit "limit";
end;
$$;

revoke all on function private.stats_kpis(uuid) from public;
revoke all on function private.stats_by_difficulty(uuid) from public;
revoke all on function private.stats_by_platform(uuid) from public;
revoke all on function private.stats_by_tag(uuid, int) from public;
grant execute on function private.stats_kpis(uuid) to service_role;
grant execute on function private.stats_by_difficulty(uuid) to service_role;
grant execute on function private.stats_by_platform(uuid) to service_role;
grant execute on function private.stats_by_tag(uuid, int) to service_role;

-- Public wrappers: identical external signature and behavior as before (same authorization
-- check, same grant to authenticated), now delegating to the private core.
create or replace function stats_kpis(owner uuid)
returns table (
  total_solved bigint,
  current_streak int,
  longest_streak int,
  solved_this_month bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_kpis(owner);
end;
$$;

create or replace function stats_by_difficulty(owner uuid)
returns table (difficulty_rank smallint, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_difficulty(owner);
end;
$$;

create or replace function stats_by_platform(owner uuid)
returns table (platform_id uuid, platform_name text, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_platform(owner);
end;
$$;

create or replace function stats_by_tag(owner uuid, "limit" int default 20)
returns table (tag text, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_tag(owner, "limit");
end;
$$;

-- Single jsonb snapshot for analyses.stats_snapshot, service_role only. Combines the private
-- core functions -- never the public ones, which would reject a service_role caller outright.
create or replace function private.compute_stats_snapshot(owner uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'kpis', (select to_jsonb(k) from private.stats_kpis(owner) k),
    'by_difficulty', (select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb) from private.stats_by_difficulty(owner) d),
    'by_platform', (select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from private.stats_by_platform(owner) p),
    'top_tags', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from private.stats_by_tag(owner, 10) t)
  );
$$;

revoke all on function private.compute_stats_snapshot(uuid) from public;
grant execute on function private.compute_stats_snapshot(uuid) to service_role;
