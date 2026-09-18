-- Fix for 20260918140000_time_rollup_review_prefill.sql, found by the orchestrator's independent
-- re-verification (read via pg_get_viewdef, not just re-run): occurred_on was r.completed_on
-- alone, filtered by `occurred_on is not null`. A record with logged minutes but still in
-- progress (completed_on null -- the common case mid-build, not the exception) silently
-- contributed zero to the rollup. That under-reports exactly the weeks with the most work, which
-- defeats the view's purpose.
--
-- occurred_on becomes coalesce(completed_on, started_on, created_at::date). created_at is
-- NOT NULL, so the coalesce can never be null and the `occurred_on is not null` filter is dropped
-- as unreachable. Deliberately not updated_at -- it moves on every edit, so historical time would
-- drift between weekly reviews each time an old record is touched; created_at is stable once set.

create or replace view time_rollup
with (security_invoker = on) as
select kind, occurred_on, minutes
from (
  select
    k.slug as kind,
    coalesce(r.completed_on, r.started_on, r.created_at::date) as occurred_on,
    r.minutes_spent as minutes
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = auth.uid()

  union all

  select
    'lfs_debug' as kind,
    coalesce(r.completed_on, r.started_on, r.created_at::date) as occurred_on,
    case
      when r.data ->> 'time_lost_minutes' ~ '^[0-9]+$'
      then (r.data ->> 'time_lost_minutes')::int
      else null
    end as minutes
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = auth.uid()
    and k.slug = 'lfs_issue'
) t
where minutes is not null;

comment on view time_rollup is
  'kind, occurred_on, minutes -- one row per record with logged time. occurred_on is '
  'coalesce(completed_on, started_on, created_at::date) so in-progress work (the common case '
  'mid-build) still counts -- completed_on alone silently dropped unfinished weeks. lfs_issue rows '
  'appear once under their own kind (minutes_spent) and again under the standalone ''lfs_debug'' '
  'kind (data->>''time_lost_minutes'') so build time and debugging time never merge.';

create or replace function private.review_prefill(p_owner uuid, p_window_start date, p_window_end date)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'minutes_by_kind', (
      select coalesce(jsonb_object_agg(kind, total_minutes), '{}'::jsonb)
      from (
        select kind, sum(minutes)::int as total_minutes
        from (
          select
            k.slug as kind,
            coalesce(r.completed_on, r.started_on, r.created_at::date) as occurred_on,
            r.minutes_spent as minutes
          from records r
          join record_kinds k on k.id = r.kind_id
          where r.owner_id = p_owner

          union all

          select
            'lfs_debug' as kind,
            coalesce(r.completed_on, r.started_on, r.created_at::date) as occurred_on,
            case
              when r.data ->> 'time_lost_minutes' ~ '^[0-9]+$'
              then (r.data ->> 'time_lost_minutes')::int
              else null
            end as minutes
          from records r
          join record_kinds k on k.id = r.kind_id
          where r.owner_id = p_owner
            and k.slug = 'lfs_issue'
        ) rollup
        where minutes is not null
          and occurred_on between p_window_start and p_window_end
        group by kind
      ) sums
    ),
    'closed_records', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', r.id, 'kind', k.slug, 'title', r.title, 'completed_on', r.completed_on
          )
          order by r.completed_on
        ),
        '[]'::jsonb
      )
      from records r
      join record_kinds k on k.id = r.kind_id
      where r.owner_id = p_owner
        and r.status = any (k.done_statuses)
        and r.completed_on between p_window_start and p_window_end
    ),
    'analysis', (
      select to_jsonb(a) - 'owner_id'
      from analyses a
      where a.owner_id = p_owner
        and a.window_start = p_window_start
        and a.window_end = p_window_end
      order by a.generated_at desc
      limit 1
    )
  );
$$;

comment on function private.review_prefill(uuid, date, date) is
  'Facts only for a review kind''s pre-fill: minutes_by_kind (same occurred_on coalesce as '
  'time_rollup, owner-parameterized), closed_records (status in the kind''s own done_statuses, '
  'never a hardcoded word), and the most recent analyses row matching the exact window, or null. '
  'No prose, no recommendations -- Gerald writes those.';
