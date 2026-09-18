-- Weekly analyze trigger. pg_cron runs inside Postgres and cannot read Vercel/Edge Function env
-- vars, so it reaches the analyze Edge Function over HTTP via pg_net, authenticating with a
-- credential that must live in Vault -- never typed as literal text into the job definition,
-- where it would sit in plain view in cron.job. The Edge Function URL is similarly read from
-- private.app_config (populated at apply time), not hard-coded per-project into this file.
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function private.trigger_weekly_analysis()
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  service_key text;
  function_url text;
begin
  select decrypted_secret into service_key
  from vault.decrypted_secrets
  where name = 'edge_function_cron_key'
  limit 1;

  select value into function_url
  from private.app_config
  where key = 'analyze_function_url';

  if service_key is null or function_url is null then
    raise warning 'trigger_weekly_analysis: missing vault secret or function url, skipping';
    return;
  end if;

  perform net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('trigger', 'cron')
  );
end;
$$;

revoke all on function private.trigger_weekly_analysis() from public;

select cron.schedule(
  'weekly-analysis',
  '0 6 * * 1',
  $$select private.trigger_weekly_analysis();$$
);
