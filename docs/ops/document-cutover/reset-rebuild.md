# Fresh reset/rebuild procedure — Phase 18 document cutover

**Procedure version:** 1
**Owner:** Phase 18 Generated Documents (`docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`, D17)
**Consumed by:** `scripts/document-cutover/assess-document-cutover.ts` (presence + digest verified; never executed by the gate)

This procedure documents how a pre-production environment is rebuilt from
scratch after the Phase 18 destructive document cutover. The environment
assertion (`P18-D17-ENV-GATE`) requires this document to be present and
version-pinned before any destructive plan can be approved. The gate verifies
the document; it never executes it.

## Preconditions

1. A `clean_preproduction_proof` exists for the exact environment and the exact
   destructive-plan digest being executed, recorded within the proof freshness
   bound.
2. The proof verifies (`--verify <proof.json>` exits 0).
3. The rollback procedure
   (`docs/ops/document-cutover/rollback-before-first-canonical-write.md`) is in
   place at the pinned version.

## Reset

1. Stop all app deployments targeting the environment (`vercel` pause or branch
   gate) so no writer races the reset.
2. Reset the database to the migration baseline:
   - Local: `supabase db reset` (applies `supabase/migrations` from scratch and
     re-seeds `supabase/seed.sql`).
   - Hosted pre-production: restore the project to a clean snapshot or recreate
     the branch database, then run `bun run db:migrate:hosted` (see
     `scripts/db-migrate-hosted.mjs`).
3. Remove any artifact objects referenced by the removed prototype tables from
   storage. The destructive plan enumerates the exact buckets/paths; delete
   only those.

## Rebuild

1. Apply the current migration set end-to-end and confirm the latest applied
   version matches the `schemaVersion` recorded in the proof, or newer only via
   the canonical migration chain.
2. Re-seed demo data with `bun run seed:demo:local` (or `seed:demo:hosted`;
   the hosted identity checks inside `scripts/seed-demo.sh` still apply).
3. Run `bun run check` and the supabase migration verify gate
   (`scripts/verify/supabase-migrations.mjs`) before reopening deployments.

## Verification

- `bun scripts/document-cutover/assess-document-cutover.ts` rerun after rebuild
  must reach the same clean evidence (all prototype surfaces absent or empty).
- Record the rebuild completion in the cutover evidence file for the Phase 18
  release proof pack.
