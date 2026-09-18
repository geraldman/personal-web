-- Live regression from the previous migration in this batch: revoking anon's EXECUTE on
-- owner_id() broke `public_entries` for anon ("permission denied for function owner_id").
-- Proven live, not assumed: `security_invoker = off` on a view changes whose privileges are
-- checked for the TABLE access inside it (which is exactly why anon can already read
-- entries-derived rows through this view with zero grant on `entries` itself) -- but it does
-- NOT change which role's EXECUTE grant is checked for a function called inside the view body.
-- That check always uses the actual querying role, regardless of the view's owner or
-- security_invoker setting. So the view can never call a function anon isn't separately allowed
-- to invoke -- and re-granting anon EXECUTE on owner_id() would reopen the exact leak this
-- migration exists to close (anon could call rpc/owner_id directly again).
--
-- Fix: the view no longer calls owner_id() at all. It inlines the identical lookup as a plain
-- subquery against auth.identities/private.app_config. Neither is granted to anon directly, but
-- table access inside a security_invoker=off view IS checked against the view's owner -- the
-- same mechanism that already lets this view read `entries` -- so this works without any new
-- grant to anon.
create or replace view public_entries
with (security_invoker = off) as
select
  id,
  platform_id,
  challenge_name,
  category,
  difficulty,
  difficulty_rank,
  date_completed,
  tags,
  problem_url,
  portfolio_writeup
from entries
where status = 'solved'
  and owner_id = (
    select i.user_id
    from auth.identities i
    where i.provider = 'github'
      and i.provider_id = (select value from private.app_config where key = 'owner_github_id')
    limit 1
  );
