# Rollback procedure — before the first canonical write

**Procedure version:** 1
**Owner:** Phase 18 Generated Documents (`docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`, D17)
**Consumed by:** `scripts/document-cutover/assess-document-cutover.ts` (presence + digest verified; never executed by the gate)

This procedure documents how a destructive Phase 18 document cutover is rolled
back **before the first canonical Generated Document write** lands in the
environment. After the first canonical write, rollback is no longer a
procedure — a failed environment is rebuilt with the fresh reset/rebuild
procedure instead. The environment assertion requires this document to be
present and version-pinned; it never executes it.

## Scope

Applies only in the window between:

1. execution start of an approved destructive plan (dropping prototype
   document tables, objects, routes, jobs, configuration, and tests), and
2. the first successful canonical write (first row in any canonical Generated
   Document table).

## Rollback steps

1. Halt the cutover execution immediately; the executor must be resumable and
   idempotent, never half-committed.
2. Restore the schema state by re-applying the pre-cutover migration chain:
   the destructive plan runs as reversible migration commits, so `git revert`
   of the cutover migration commit plus a clean `supabase db reset` (local) or
   snapshot restore (hosted pre-production) returns the environment to the
   assessed state.
3. Restore removed routes/configuration/tests by reverting the cutover code
   commit(s) on the working branch. No data restore is required: the clean
   proof already established that the prototype surfaces carried zero rows,
   objects, or external reliance at assessment time.
4. Rerun `bun scripts/document-cutover/assess-document-cutover.ts` and confirm
   the environment matches the pre-cutover proof (same plan digest, clean
   evidence).

## Invariants

- Rollback never fabricates or backfills document history.
- If any evidence indicates data appeared between the proof and the rollback,
  stop and re-groom; do not proceed on assumptions.
