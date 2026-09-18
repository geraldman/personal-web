-- Wave A'.6 -- import_batches needs to carry a kind for assisted capture (decision 4), not only a
-- platform. The table was built for platform-paste imports (platform_id not null); LFS assisted
-- capture has no platform at all. Relax platform_id and add kind_id rather than adding a second
-- table -- same provenance/audit shape, same RLS, same status lifecycle either way.

alter table import_batches
  alter column platform_id drop not null,
  add column kind_id uuid references record_kinds(id);

alter table import_batches
  add constraint import_batches_platform_or_kind
  check (platform_id is not null or kind_id is not null);

comment on column import_batches.kind_id is
  'Set for assisted-capture batches (decision 4: paste -> Gemini proposes rows -> reviewed before '
  'insert). Exactly one of platform_id/kind_id is expected per row in practice, though either or '
  'both being set is not itself invalid.';

create index import_batches_kind_id_idx on import_batches (kind_id);
