-- Public safety here is structural, not policy-based: anon has no grant on entries at all
-- (nothing to revoke-bypass), notes is not a column of this view, and the view additionally
-- restricts to the single owner's rows via owner_id = public.owner_id() -- so a non-owner's
-- solved rows (which can now only exist if is_owner() somehow failed to block the insert) still
-- could never surface here. Do not add notes here, do not grant anon anything on entries
-- directly, and do not drop the owner_id filter.
create view public_entries
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
  and owner_id = public.owner_id();

revoke all on entries from anon;
grant select on public_entries to anon;
grant select on public_entries to authenticated;

-- platforms is the one base table anon needs directly: the public view joins platform_id to
-- render platform name/icon/url, and it holds nothing private.
grant select on platforms to anon;
