create table platform_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform_id uuid not null references platforms(id),
  handle text not null,
  credential_secret_name text,
  sync_enabled boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, platform_id)
);

comment on column platform_accounts.credential_secret_name is
  'NAME of a Supabase Vault secret holding this account''s credential, e.g. "codeforces_api_key". '
  'Never a token, cookie, or session value directly in this column.';

create trigger platform_accounts_set_updated_at
before update on platform_accounts
for each row execute function set_updated_at();
