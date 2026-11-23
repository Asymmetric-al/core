# 0004. Prove the CRM note command on real tokens and amend the frozen suites for the retired merge-candidate table

**Status:** Recorded on 2026-11-23 with AL-2677 (WP4a, part 2b). Source
comments are banned since AL-2676
([#2751](https://github.com/Asymmetric-al/core/issues/2751)), so the reasons
that record D-18 of the implementation record would have put in each frozen
file are written here. It describes the code as it is and ratifies no product
intent. Accepted platform intent is in
[`docs/adr/`](../../../docs/adr/README.md).

## Context

WP4a's second part moves the one CRM write, creating a note, from the service
key to a human command of the command lane, `tenant_guard.create_crm_note`,
and drops the Twenty-era `public.crm_merge_candidates`
(`supabase/migrations/20261121030001_drop_crm_merge_candidates.sql`), which
CRM detail no longer reads. Several frozen real-stack suites named that table
as a live, kept or staff-only table. Record D-18 lets a change that
legitimately moves such a seam update the frozen suite in the same change, with
each old assertion replaced by one at least as strong.

## Decisions

1. **The note command's database suite drives calls with its own helper.**
   `tests/unit/acceptance/issue-2677/crm-note-command.realstack.acceptance.test.ts`
   emulates PostgREST as `issue-2674`'s `asRole` does, but keeps what a call
   wrote until the test's own transaction rolls back, because every case reads
   the note and log rows a call left, or proves there are none. Its catalog
   variants are made from the installed command's own definition
   (`pg_get_functiondef`), each changed in one place: a capability the registry
   lacks, no capability, a statement before the preamble, and a wrapper granted
   to the service key. So the checks that WP4a's first part added are proved
   against this command, not against a model of it.
2. **The note's HTTP cases sit in the CRM PostgREST suite.** The cases in
   `tests/unit/acceptance/issue-2677/crm-reads.postgrest.acceptance.test.ts`
   ("creating a note through the command on the caller's token") reuse its
   signed-in fixtures, its scope headers and its `getAdminClient` that throws,
   and run in the local-stack workflow's existing PostgREST step, so no
   workflow file changes.
3. **The drop is proved by running the migration's own body.**
   `tests/unit/acceptance/issue-2677/crm-merge-candidates-drop.realstack.acceptance.test.ts`
   plants a stand-in table with three rows, then a function, a view and a
   policy that name it, and runs the migration between `BEGIN;` and `COMMIT;`
   inside a rolled-back transaction: each dependent is named in a `2BP01`
   refusal, and with none left the notice reports the three rows and the table
   is gone.
4. **`issue-2251`: the dropped table leaves the posture lists.**
   `tests/unit/acceptance/issue-2251/harness.ts` takes
   `crm_merge_candidates` out of `F`, and
   `tests/unit/acceptance/issue-2251/static.acceptance.test.ts` pins the
   classified total at 141, down from 142. Every listed table must still be a
   live tenant table with its posture.
5. **`issue-2270`: the retired table is asserted gone.**
   `tests/unit/acceptance/issue-2270/authz-execute-grants.realstack.acceptance.test.ts`
   leaves the table out of the migration body it replays (its `ALTER POLICY`
   lines), of the hosted simulation's grants and of the read checks, and
   replaces its write-grant rows with an assertion that the table does not
   exist and no policy stands on it. The two CRM tables that stand keep every
   check.
6. **`issue-2674`: the table moves from kept to retired.**
   `tests/unit/acceptance/issue-2674/privileges-harness.ts` moves it from
   `KEPT_CRM_TABLES` to `RETIRED_CRM_TABLES`, and D09 in
   `tests/unit/acceptance/issue-2674/privileges-manifest.realstack.acceptance.test.ts`
   now requires it absent on both replays. The reads the apps rely on count
   `donor_merge_candidates`, which CRM detail reads since part 2a, in its
   place.
7. **`issue-2675`: the write refusal moves to the command log.**
   `tests/unit/acceptance/issue-2675/tenant-policy-migration.realstack.acceptance.test.ts`
   drops the table from `STAFF_ONLY`, and its Q7 and Q8 case proves a staff
   member's direct insert and update refused on `crm_command_logs`, whose
   write grants went in the same migration and which only the note command
   writes now.
8. **The service-key ceiling falls by the note handler's site.**
   `tests/unit/scripts/service-role-client-gate.test.ts` pins the ceiling's new
   digest and totals (114 rows, 108 files, 64 platform-wrapper sites) and
   asserts that no file under `packages/api/src/admin/crm` is in the allowlist
   or the ceiling.
9. **The screen's submission key is proved through both hooks.**
   `tests/unit/packages/database/crm-note-submission-key.test.tsx` drives the
   notes page's and the record drawer's hooks against a stubbed `fetch`: a
   retry after a failure sends the same key, and a success or a change of
   content starts a new one.
