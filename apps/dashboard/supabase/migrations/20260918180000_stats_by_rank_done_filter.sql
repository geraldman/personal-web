-- private.stats_by_rank was the only stats_* function not filtering on done_statuses (an A'.4
-- inconsistency, not intentional) -- on the same stats page, platform/tag/field charts count
-- finished records while the rank distribution counted everything, so the numbers didn't
-- reconcile for kinds where "finished" matters.
--
-- Whether that filter should apply genuinely differs by what `rank` MEANS on the kind, and the
-- capability string already says which -- this is a lookup, not a hardcoded slug:
-- - rank:difficulty (ctf) -- finished only, so the difficulty chart reconciles with every other
--   chart on the page.
-- - rank:confidence (skill) -- everything. Filtering to done_statuses would hide skills still
--   being learned, and a confidence chart that only shows what's already strong is worse than no
--   chart at all.
-- - rank:rating (resource) -- everything. You can rate something you've archived.
--
-- records re-checked at 0 immediately before writing this (Gerald has a dev server running and is
-- using the app -- standing rule since the LFS-kind removal is to check, never assume). This
-- migration doesn't touch a row regardless, but the check was still done.

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
  where r.owner_id = p_owner
    and k.slug = p_kind
    and r.rank is not null
    and (
      not ('rank:difficulty' = any (k.capabilities))
      or r.status = any (k.done_statuses)
    )
  group by r.rank
  order by r.rank;
$$;

comment on function private.stats_by_rank(uuid, text) is
  'Serves difficulty, confidence and rating (decision 1) -- which one is decided by the kind''s '
  'rank:* capability. Only rank:difficulty filters to done_statuses (the chart should reconcile '
  'with platform/tag/field, all finished-only); rank:confidence and rank:rating count every '
  'ranked record regardless of status -- a confidence/rating distribution that hides what is '
  'still in progress or archived is worse than no chart. Looked up from capabilities, not a '
  'hardcoded kind slug.';

revoke all on function private.stats_by_rank(uuid, text) from public;
grant execute on function private.stats_by_rank(uuid, text) to service_role;

-- Public wrapper's own grants are unchanged (only the private implementation was replaced), but
-- reasserted explicitly per the standing rule on anything this migration recreates.
revoke execute on function stats_by_rank(uuid, text) from anon, public;
grant execute on function stats_by_rank(uuid, text) to authenticated;
