-- Gerald's call: remove the three LFS kinds (lfs_build, lfs_checkpoint, lfs_issue). A new
-- migration rather than an edit to 20260918130100_record_kinds_seed.sql -- that file is already
-- applied and committed, and a replay of this repo's history should show the honest
-- add-then-remove sequence, not a seed that silently never included them.
--
-- Safe: `records` and `import_batches` are both at 0 rows (verified before writing this, not
-- assumed), and both FKs to record_kinds (records_kind_id_fkey, import_batches_kind_id_fkey) are
-- NO ACTION -- if either table held a referencing row, this delete would fail loudly rather than
-- cascading silently. No surviving kind's capabilities array contains a `children:` or `links:`
-- entry pointing at any of the three removed slugs (verified against a live select of every
-- kind's capabilities before writing this migration) -- capabilities are plain text, not FKs, so
-- nothing else would have caught a dangling reference.
--
-- Deliberately NOT touching parse-import or the `assisted` capability: removing these three kinds
-- leaves zero kinds carrying `assisted`, making that function unreachable until a kind adopts it
-- again. That's Gerald's call, not folded into this cleanup -- the function stays deployed and
-- import_batches.kind_id stays in place.

delete from record_kinds where slug in ('lfs_build', 'lfs_checkpoint', 'lfs_issue');
