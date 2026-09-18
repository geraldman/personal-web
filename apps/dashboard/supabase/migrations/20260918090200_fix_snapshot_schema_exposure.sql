-- Bug found live: PostgREST only exposes the `public` schema by default, so the analyze Edge
-- Function's supabase-js service client cannot reach `private.compute_stats_snapshot` via
-- `.schema('private').rpc(...)` -- that call fails with "Invalid schema: private" before it
-- ever touches the database. The gate for a service-role-only *function* has to be the grant,
-- same as public.is_owner()/public.owner_id() already are, not the schema -- schema-hiding only
-- works for things nothing needs to call over the API (tables, the raw stats_kpis etc., which
-- stay in `private` since only compute_stats_snapshot calls them, at the SQL level, not via
-- REST). Move compute_stats_snapshot itself into `public`, gated purely by grant.
drop function if exists private.compute_stats_snapshot(uuid);

create or replace function public.compute_stats_snapshot(owner uuid)
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

revoke all on function public.compute_stats_snapshot(uuid) from public;
grant execute on function public.compute_stats_snapshot(uuid) to service_role;
