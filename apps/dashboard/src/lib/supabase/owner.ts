import type { User } from "@supabase/supabase-js";

/**
 * True only when `user` signed in via the GitHub provider and that identity's
 * provider-side user id matches DASHBOARD_OWNER_GITHUB_ID.
 *
 * @supabase/auth-js's UserIdentity type has no `provider_id` field — the
 * provider's own user id is `identity.id` (`identity_id` is the internal
 * auth.identities row id). Do not read `user.user_metadata`: it is
 * user-editable and must never be trusted for this check.
 */
export function isOwner(user: User): boolean {
  const ownerId = process.env.DASHBOARD_OWNER_GITHUB_ID;
  if (!ownerId) return false;

  const githubIdentity = user.identities?.find((identity) => identity.provider === "github");
  return githubIdentity?.id === ownerId;
}
