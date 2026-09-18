-- Wave A'.3 -- public views. Spec: docs/planning/RECORD-MODEL.md §7.
--
-- Two gates, both required: the row's is_public toggle AND the kind carrying the `public`
-- capability. Removing `public` from a kind takes the whole tracker dark regardless of row
-- toggles -- which is how lfs_* and competition stay private (decision 6).
--
-- security_invoker = off, and the owner lookup is INLINED as a subquery rather than calling
-- owner_id(). This is the B6.1 regression, proven live in Wave 2: security_invoker = off changes
-- whose privileges are checked for TABLE access inside a view, but NOT which role's EXECUTE
-- grant is checked for a FUNCTION called in the view body -- that is always the querying role.
-- Re-granting anon EXECUTE on owner_id() would reopen the leak that migration closed.

create view public_records
with (security_invoker = off) as
select
  r.id,
  r.kind_id,
  k.slug as kind,
  k.name as kind_name,
  r.parent_id,
  r.title,
  r.slug,
  r.summary,
  r.body,
  r.url,
  r.tags,
  r.rank,
  r.rank_label,
  r.platform_id,
  r.started_on,
  r.completed_on,
  -- Private fields are stripped here, server-side, rather than trusted to the UI. Keys marked
  -- "private": true in the kind's field_schema never reach an anonymous reader even if a row is
  -- published by mistake.
  r.data - coalesce(
    (select array_agg(f->>'key')
       from jsonb_array_elements(k.field_schema) f
      where coalesce((f->>'private')::boolean, false)),
    '{}'::text[]
  ) as data
from records r
join record_kinds k on k.id = r.kind_id
where r.is_public
  and 'public' = any (k.capabilities)
  and r.owner_id = (
    select i.user_id
    from auth.identities i
    where i.provider = 'github'
      and i.provider_id = (select value from private.app_config where key = 'owner_github_id')
    limit 1
  );

comment on view public_records is
  'The only table-derived object anon may read. notes, minutes_spent, owner_id, source, '
  'external_id and every field_schema entry marked private are ABSENT from the select list, not '
  'filtered by a where -- absent cannot leak. Do not add them.';

-- Compatibility view: the portfolio page, its audited anon grant and sitemap.ts all point at
-- public_entries. Keeping it as a thin projection means none of that needs re-auditing.
create view public_entries
with (security_invoker = off) as
select
  id,
  platform_id,
  title as challenge_name,
  data->>'discipline' as category,
  rank_label as difficulty,
  rank as difficulty_rank,
  completed_on as date_completed,
  tags,
  url as problem_url,
  body as portfolio_writeup
from public_records
where kind = 'ctf';

-- Tag autocomplete for the entry form. security_invoker = on: runs as the querying user, so RLS
-- on records applies; the owner_id filter is redundant with that but kept for defence in depth.
create view tag_usage
with (security_invoker = on) as
select t.tag, count(*) as usage_count
from records r, unnest(r.tags) as t(tag)
where r.owner_id = auth.uid()
group by t.tag
order by usage_count desc, t.tag asc;

comment on view tag_usage is
  'Distinct tags + usage counts for the calling user, powering the form tag autocomplete. '
  'Spans every kind deliberately -- tags are cross-kind.';

grant select on public_records to anon, authenticated;
grant select on public_entries to anon, authenticated;
grant select on tag_usage to authenticated;
