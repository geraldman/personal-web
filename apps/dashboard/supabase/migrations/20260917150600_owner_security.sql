-- B1.0: closes the non-owner write/read hole. Any GitHub account that completes OAuth gets a
-- Supabase user and a valid JWT (the app signs them out only *after* the user row exists), so
-- auth.uid() = owner_id alone does not restrict this app to a single owner -- a stranger's own
-- rows satisfy that check trivially. This migration adds a database-level, single-owner boundary
-- that does not depend on anything the client sends.
--
-- private schema: no grants to anon/authenticated, ever. Holds only the owner's GitHub identity,
-- inserted post-apply from DASHBOARD_OWNER_GITHUB_ID (see B1.3) -- never hard-coded here.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

create table private.app_config (
  key text primary key,
  value text not null
);
revoke all on private.app_config from public, anon, authenticated;
grant select, insert, update on private.app_config to service_role;

comment on table private.app_config is
  'Single-owner config, e.g. key=''owner_github_id''. Populated at apply time, never in a migration.';

-- Resolves the owner's auth.users id by their GitHub identity's provider_id -- never by
-- user_metadata, which an authenticated user can edit on themselves. security definer so it can
-- read auth.identities and private.app_config despite neither being grantable to anon/authenticated.
create or replace function public.owner_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select i.user_id
  from auth.identities i
  where i.provider = 'github'
    and i.provider_id = (select value from private.app_config where key = 'owner_github_id')
  limit 1;
$$;

-- coalesce(..., false), not a bare equality: when no GitHub identity has ever signed in yet,
-- owner_id() is NULL, and `auth.uid() = NULL` evaluates to SQL NULL, not false. A bare NULL
-- passed into a PL/pgSQL `if not is_owner() then raise exception` silently fails to raise --
-- NULL is not TRUE, so the guard is skipped -- which would reopen exactly the hole B1.0 closes.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(auth.uid() = public.owner_id(), false);
$$;

comment on function public.is_owner() is
  'True only for the single designated owner (matched via auth.identities, provider=github), '
  'never trusting user_metadata. Required, alongside auth.uid() = owner_id, on every owner policy '
  'and every stats function -- closes the hole where any authenticated stranger''s own rows would '
  'otherwise pass an auth.uid() = owner_id check trivially.';

revoke all on function public.owner_id() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.owner_id() to authenticated, anon, service_role;
grant execute on function public.is_owner() to authenticated, service_role;
