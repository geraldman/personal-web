-- Wave A'.7 -- time_rollup + review_prefill. Spec: docs/planning/RECORD-MODEL.md §9 (A'.7 row),
-- decision 8 (review pre-fill: hours + activity, never prose). Ordered ahead of A'.6 per the
-- orchestrator: pure SQL, no Edge Function in the path, and unblocks worker-a's A'.11.
--
-- Returns facts only -- no summary text, no recommendations. Gerald writes the review prose; the
-- LLM assists per-field on demand from the UI, never as a pre-fill.

-- ---------------------------------------------------------------------------------------------
-- time_rollup -- one row per record with logged minutes, kind-labelled.
--
-- security_invoker = on (the tag_usage pattern, not the public_records pattern): this view is
-- read directly by the authenticated owner via PostgREST, never by anon, so it runs as the
-- querying role and RLS on records (auth.uid() = owner_id and is_owner()) already restricts it.
-- No owner_id()/is_owner() call needed in the view body -- filtering on auth.uid() is enough and
-- keeps this off the "view calls a function anon might not hold EXECUTE on" trap from B6.1.
--
-- lfs_issue rows can contribute to BOTH buckets: their own kind bucket ('lfs_issue', from
-- minutes_spent -- lfs_issue carries the `time` capability) AND a separate 'lfs_debug' bucket
-- (from data->>'time_lost_minutes'). That separation is the entire point -- it is what lets a
-- reviewer see how much of the LFS budget went to debugging versus the checkpoint itself, and it
-- must never collapse into a single 'lfs_issue' or 'lfs' number.
--
-- data->>'time_lost_minutes' is text (jsonb has no numeric subtype distinct from `number` at the
-- JSON level, and the column is validated only on write -- see decision 7). A non-numeric or
-- missing value must not error the whole view, so the cast is regex-guarded rather than a bare
-- ::int.
create view time_rollup
with (security_invoker = on) as
select kind, occurred_on, minutes
from (
  select k.slug as kind, r.completed_on as occurred_on, r.minutes_spent as minutes
  from records r
  join record_kinds k on k.id = r.kind_id
  where r.owner_id = auth.uid()

  union all

  select
    'lfs_debug' as kind,
    r.completed_on as occurred_on,
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
where minutes is not null
  and occurred_on is not null;

comment on view time_rollup is
  'kind, occurred_on, minutes -- one row per record with logged time. lfs_issue rows appear once '
  'under their own kind (minutes_spent) and again under the standalone ''lfs_debug'' kind '
  '(data->>''time_lost_minutes'') so build time and debugging time never merge. Never returns a '
  'row with a null or non-numeric minutes value -- garbage in data is silently excluded, not '
  'errored.';

grant select on time_rollup to authenticated;

-- ---------------------------------------------------------------------------------------------
-- review_prefill -- facts for the review kind's form: minutes by kind, records closed in the
-- window (via each kind's own done_statuses, never a hardcoded status string), and the analyses
-- row already generated for that window, if any.
--
-- private.* does the work (security definer, takes an explicit p_owner -- same split as every
-- stats_* function in 20260918130300_kind_scoped_stats.sql). It re-derives the time_rollup union
-- itself rather than selecting from the view: the view is auth.uid()-scoped for the authenticated
-- caller, this function is owner-parameterized for the security-definer/service path, and every
-- other private.stats_* function in this codebase already duplicates its own owner-scoped query
-- rather than depending on an RLS-scoped view -- kept consistent rather than introducing a new
-- dependency shape for this one function.
-- ---------------------------------------------------------------------------------------------

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
          select k.slug as kind, r.completed_on as occurred_on, r.minutes_spent as minutes
          from records r
          join record_kinds k on k.id = r.kind_id
          where r.owner_id = p_owner

          union all

          select
            'lfs_debug' as kind,
            r.completed_on as occurred_on,
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
  'Facts only for a review kind''s pre-fill: minutes_by_kind (from the same union as '
  'time_rollup, owner-parameterized), closed_records (status in the kind''s own done_statuses, '
  'never a hardcoded word), and the most recent analyses row matching the exact window, or null. '
  'No prose, no recommendations -- Gerald writes those.';

revoke all on function private.review_prefill(uuid, date, date) from public;
grant execute on function private.review_prefill(uuid, date, date) to service_role;

create or replace function review_prefill(owner uuid, window_start date, window_end date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not coalesce(is_owner(), false) then
    raise exception 'not authorized';
  end if;
  return private.review_prefill(owner, window_start, window_end);
end;
$$;

comment on function review_prefill(uuid, date, date) is
  'Public wrapper: re-checks auth.uid() = owner and is_owner() (owner alone is not enough -- any '
  'authenticated stranger could pass their own uid), then delegates to private.review_prefill.';

-- Default privileges have already granted anon EXECUTE on this function by the time this line
-- runs, and `revoke ... from public` does not remove it -- the exact B6.1 leak. authenticated is
-- the only role with any legitimate reason to call this.
revoke execute on function review_prefill(uuid, date, date) from anon, public;
grant execute on function review_prefill(uuid, date, date) to authenticated;
