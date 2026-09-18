-- B6.1: real leak found live by the orchestrator. Supabase grants EXECUTE on every new
-- public-schema function to anon and authenticated by default, and that role grant survives
-- `revoke ... from public` -- PUBLIC and the anon/authenticated roles are separate grantees.
-- Every function created in Phase 1/6 needs its anon grant explicitly revoked; authenticated
-- keeps whatever it actually needs.
--
-- is_owner() MUST keep EXECUTE for authenticated: it is called inside RLS policy expressions on
-- entries/analyses/platform_accounts/import_batches/sync_runs, and policies evaluate as the
-- querying role. Revoking it from authenticated would turn every authenticated query into
-- "permission denied for function is_owner", not a clean RLS rejection.
revoke execute on function public.is_owner() from anon;

-- owner_id() keeps EXECUTE for authenticated: the analyze Edge Function's manual ("Regenerate
-- insights") path calls it through the caller's own JWT-scoped client to confirm the caller IS
-- the owner, before anything else happens. public_entries itself needs no grant here at all --
-- it is security_invoker = off, so it runs as the view owner, not as anon.
revoke execute on function public.owner_id() from anon;

-- compute_stats_snapshot is purely internal to the analyze Edge Function's service-role path --
-- no UI ever calls it (the dashboard reads the individual stats_* functions instead). service_role
-- only.
revoke execute on function public.compute_stats_snapshot(uuid) from anon, authenticated;

-- The stats_* functions already reject anon functionally (they raise before returning anything),
-- but they carry the same leaked default grant. Revoking it is pure hygiene -- closes the same
-- systemic hole at its root instead of only where it happened to be caught.
revoke execute on function public.stats_kpis(uuid) from anon;
revoke execute on function public.stats_activity(uuid, text, date, date) from anon;
revoke execute on function public.stats_by_difficulty(uuid) from anon;
revoke execute on function public.stats_by_platform(uuid) from anon;
revoke execute on function public.stats_by_tag(uuid, int) from anon;

-- worker-a: stats_by_difficulty silently dropped unranked entries (difficulty_rank is not null),
-- contradicting dashboard-ui-spec.md's rule that unranked solves must be an explicit bucket, not
-- excluded-with-count. Group also captures the null difficulty_rank as its own row -- Postgres
-- groups NULLs together, so this needs no CASE/COALESCE, just removing the filter.
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
  group by entries.difficulty_rank
  order by entries.difficulty_rank nulls last;
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

-- worker-a: no per-category (swe/cyber) aggregate existed, so two separate count queries were
-- used instead. Same core/wrapper split as every other stats_* function.
create or replace function private.stats_by_category(owner uuid)
returns table (category text, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select entries.category, count(*)
  from entries
  where entries.owner_id = owner
    and entries.status = 'solved'
  group by entries.category
  order by entries.category;
end;
$$;

revoke all on function private.stats_by_category(uuid) from public;
grant execute on function private.stats_by_category(uuid) to service_role;

create or replace function stats_by_category(owner uuid)
returns table (category text, count bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if owner <> auth.uid() or not is_owner() then
    raise exception 'not authorized';
  end if;
  return query select * from private.stats_by_category(owner);
end;
$$;

revoke execute on function stats_by_category(uuid) from anon;
grant execute on function stats_by_category(uuid) to authenticated;

-- compute_stats_snapshot's jsonb also gains the fixed by_difficulty shape and the new
-- by_category bucket for free the next time it's called (no signature change needed elsewhere).
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
    'by_category', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from private.stats_by_category(owner) c),
    'top_tags', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from private.stats_by_tag(owner, 10) t)
  );
$$;

revoke all on function public.compute_stats_snapshot(uuid) from public;
grant execute on function public.compute_stats_snapshot(uuid) to service_role;
