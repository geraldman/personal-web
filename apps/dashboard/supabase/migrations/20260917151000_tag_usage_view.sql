-- security_invoker = on: runs as the querying user, so RLS on entries applies. The owner_id
-- filter below is redundant with that RLS but kept explicit for clarity and defense in depth.
create view tag_usage
with (security_invoker = on) as
select t.tag, count(*) as usage_count
from entries e, unnest(e.tags) as t(tag)
where e.owner_id = auth.uid()
group by t.tag
order by usage_count desc, t.tag asc;

comment on view tag_usage is
  'Distinct tags + usage counts for the calling user, powering the entry-form tag autocomplete.';

grant select on tag_usage to authenticated;
