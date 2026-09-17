-- All functions take an explicit owner uuid but re-check it against auth.uid() AND is_owner()
-- rather than trusting the argument, since they run security definer (needed so authenticated
-- callers can aggregate without a broader table grant). auth.uid() = owner alone is not enough:
-- any authenticated stranger could pass their own uid and have it pass trivially. is_owner()
-- closes that -- only the single designated GitHub identity ever passes.

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
set search_path = public
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;

  return query
  with solved_days as (
    select distinct date_completed as d
    from entries
    where owner_id = owner
      and status = 'solved'
      and date_completed is not null
  ),
  -- Classic island-grouping idiom: for consecutive dates, (date - row_number) is constant,
  -- so grouping on it clusters each run of consecutive solved days together.
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

comment on function stats_kpis(uuid) is
  'Current streak counts only if the most recent solved-day run ends today or yesterday '
  '(tolerant of not having logged today yet). Needs live-data verification once a project exists '
  '-- this could not be executed while offline.';

create or replace function stats_activity(owner uuid, bucket text, from_date date, to_date date)
returns table (bucket_start date, count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;
  if bucket not in ('day', 'week', 'month') then
    raise exception 'invalid bucket: %', bucket;
  end if;

  return query
  select date_trunc(bucket, date_completed)::date as bucket_start, count(*) as count
  from entries
  where owner_id = owner
    and status = 'solved'
    and date_completed between from_date and to_date
  group by 1
  order by 1;
end;
$$;

create or replace function stats_by_difficulty(owner uuid)
returns table (difficulty_rank smallint, count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;

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

create or replace function stats_by_platform(owner uuid)
returns table (platform_id uuid, platform_name text, count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;

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

create or replace function stats_by_tag(owner uuid, "limit" int default 20)
returns table (tag text, count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;

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

grant execute on function stats_kpis(uuid) to authenticated;
grant execute on function stats_activity(uuid, text, date, date) to authenticated;
grant execute on function stats_by_difficulty(uuid) to authenticated;
grant execute on function stats_by_platform(uuid) to authenticated;
grant execute on function stats_by_tag(uuid, int) to authenticated;
