-- Form audit, both authorized by Gerald. Combined into one migration since they're one audit's
-- findings, not independent decisions.
--
-- records count re-verified at 0 immediately before writing this (Gerald is now using the app;
-- the standing rule from the LFS-kind removal is to check, never assume). Neither fix here
-- touches a row regardless -- one drops a capability string, the other replaces two functions --
-- but the check was still done, not skipped because "should be safe".

-- ---------------------------------------------------------------------------------------------
-- Fix 1 -- review asked for the same date range twice: `dates` renders started_on/completed_on
-- while window_start/window_end (required data fields) already say the same thing more
-- precisely. Drop `dates` from review's capabilities; keep the window fields, which is what
-- review_prefill actually keys on. "When I wrote it" is created_at, not a fourth date input.
--
-- Knock-on, deliberately accepted: review's done_statuses = {final}, and after this review rows
-- will never carry completed_on. Fix 2 makes that harmless -- private.stats_kpis/stats_activity
-- now fall back to started_on/created_at for anything date-bucketed, and total_done no longer
-- depends on a date at all.
-- ---------------------------------------------------------------------------------------------

update record_kinds
set capabilities = array_remove(capabilities, 'dates')
where slug = 'review';

-- ---------------------------------------------------------------------------------------------
-- Fix 2 -- skill/resource stats read 0 forever, because neither kind carries `dates`, so
-- completed_on is never set, and stats_kpis/stats_activity required it. Verified live (via
-- pg_get_functiondef) before writing this that stats_by_rank/stats_by_platform/stats_by_tag/
-- stats_by_field do NOT filter on completed_on at all -- only status = any(done_statuses) -- so
-- they were never actually broken by this; only the two functions below needed a fix.
--
-- Two concerns, previously conflated, now separated:
-- - Counts (total_done) filter on status = any(done_statuses) ONLY. A finished record is
--   finished whether or not it carries a date.
-- - Anything time-bucketed (streaks, done_this_month, stats_activity's buckets) needs a date, and
--   uses coalesce(completed_on, started_on, created_at::date) -- the same fallback time_rollup
--   already uses, so there is one definition of "when a record happened" in this codebase, not
--   two. created_at is NOT NULL, so the coalesce can never be null.
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
    select coalesce(r.completed_on, r.started_on, r.created_at::date) as d
    from records r join k on k.id = r.kind_id
    where r.owner_id = p_owner
      and r.status = any (k.done_statuses)
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
  'total_done counts every status = any(done_statuses) record regardless of date -- a finished '
  'record is finished whether or not it carries completed_on (skill/resource never do). Streaks '
  'and done_this_month use coalesce(completed_on, started_on, created_at::date), same fallback as '
  'time_rollup, since those genuinely need a date to bucket by. Current streak counts only if the '
  'most recent run ends today or yesterday.';

create or replace function private.stats_activity(
  p_owner uuid, p_kind text, p_bucket text, p_from date, p_to date
)
returns table (bucket_start date, count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    date_trunc(p_bucket, coalesce(r.completed_on, r.started_on, r.created_at::date))::date as bucket_start,
    count(*) as count
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = p_owner
    and k.slug = p_kind
    and r.status = any (k.done_statuses)
    and coalesce(r.completed_on, r.started_on, r.created_at::date) between p_from and p_to
  group by 1
  order by 1;
$$;

comment on function private.stats_activity(uuid, text, text, date, date) is
  'Buckets by coalesce(completed_on, started_on, created_at::date), same fallback as time_rollup '
  'and stats_kpis -- a kind with no `dates` capability (skill, resource) still shows real '
  'activity instead of an empty chart.';

revoke all on function private.stats_kpis(uuid, text) from public;
revoke all on function private.stats_activity(uuid, text, text, date, date) from public;
grant execute on function private.stats_kpis(uuid, text) to service_role;
grant execute on function private.stats_activity(uuid, text, text, date, date) to service_role;

-- Public wrapper signatures are unchanged (only the private implementations were replaced), and
-- CREATE OR REPLACE on the private functions doesn't touch the wrappers' own grants -- but
-- reasserting them here is cheap and matches the standing rule of an explicit revoke/grant on
-- anything this migration recreates.
revoke execute on function stats_kpis(uuid, text) from anon, public;
revoke execute on function stats_activity(uuid, text, date, date, text) from anon, public;
grant execute on function stats_kpis(uuid, text) to authenticated;
grant execute on function stats_activity(uuid, text, date, date, text) to authenticated;
