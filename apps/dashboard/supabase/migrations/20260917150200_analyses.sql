create table analyses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  period text not null check (period in ('weekly', 'monthly', 'on_demand')),
  summary_text text not null,
  recommendations jsonb not null default '[]'::jsonb,
  stats_snapshot jsonb not null default '{}'::jsonb,
  provider text not null,
  model_used text not null,
  input_tokens int,
  output_tokens int,
  window_start date,
  window_end date,
  created_at timestamptz not null default now()
);

comment on column analyses.provider is 'LLM provider key, e.g. "gemini" or "anthropic".';
comment on column analyses.model_used is 'Exact model id used to generate this analysis.';

create index analyses_owner_id_idx on analyses (owner_id);
create index analyses_generated_at_idx on analyses (generated_at desc);
