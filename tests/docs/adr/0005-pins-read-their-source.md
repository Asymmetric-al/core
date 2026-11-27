# 0005. Pins read their source: retire restated counts and hashes, and check the service-key ceiling against the base branch

**Status:** Recorded on 2026-11-24 with AL-2671 (the "pin tax" ruling under
D-16, package 1). Source comments are banned since AL-2676
([#2751](https://github.com/Asymmetric-al/core/issues/2751)), so the reasons
that record D-18 of the implementation record would have put in each frozen
file are written here and in each edited test's title. It describes the code
as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../docs/adr/README.md).

## Context

Many suites restated a number or a hash that another file already owns: the
service-key ceiling's SHA-256 and totals, the deny-by-default exception list's
length, a hash of `packages/database/types/database.ts`, the seed's row
counts. Every package that legitimately changed the owning file had to edit
those suites too, and a reviewer learned nothing from the edit. The ruling on
the pin tax (D-16, 24 November 2026) approved replacing them: Q1 replaces the
ceiling's hash and totals with a growth check against the base branch, Q2
deletes or trims the closed-issue proofs and shrinking-list floors row by row,
and Q3 points the seed wording at `supabase/seed-expectations.json`. Q5
refused `merge=union` for these lists, so each stays one sorted item per line.
Record D-18 lets the change update the frozen suites in the same change.

## Decisions

1. **The ceiling is parsed strictly and checked against the base branch
   (Q1).** `scripts/verify/service-role-client-gate.mjs` exports
   `parseCeilingRows`, `CEILING` and `ceilingGrowth`. A row is
   `<file> <kind> <count>` with an optional fourth field `ruling:<ID>`
   (`W8-R10`, `D-16-Q1`); rows are unique and sorted by key. The CLI resolves a
   base as the comment ratchet does and fails a row added without a token, or
   a count raised without a token other than the base row's. CI's `lint` job
   runs it with `--require-base`, and the preflight runs it as a scoped stage.
   In `tests/unit/scripts/service-role-client-gate.test.ts` the test "pins the
   113 reviewed entries…" (the SHA-256 of `CEILING_ROWS`, the per-kind totals,
   113 rows and 107 files) is replaced by "the ceiling parses strictly…" and
   by fixtures 1 to 8 (growth, malformed rows and tokens, duplicates, order,
   shrinks, base resolution, and a growth commit in a throwaway repository).
2. **`issue-2253`: the allowlist's limits are read from the gate's ceiling
   (Q1).** In `tests/unit/acceptance/issue-2253/service-role-gate.acceptance.test.ts`
   criterion 9's `[175, 113, 107]` and the per-kind limits (`[63, 36]` for the
   platform wrapper and the harness's `TOTALS` for the other three kinds) are
   computed from `CEILING`. The harness keeps `TOTALS`.
3. **`issue-2251` and the exception list's shape test: no floor (Q2 row
   11).** `>= 74` in
   `tests/unit/acceptance/issue-2251/rls-posture.realstack.acceptance.test.ts`
   and `>= 73` in `tests/unit/scripts/rls-deny-by-default-exceptions.test.ts`
   are deleted. The stale check beside the first proves every listed table is
   a live tenant table with no policy, and the catalog gate fails any table
   with neither a policy nor an entry.
4. **`issue-2260`: only #2260's own invariants stay (Q2 row 14).** In
   `tests/unit/acceptance/issue-2260/donor-feed-preferences.static.acceptance.test.ts`
   criterion 18 loses `OTHERS_SHA`, the counts `[74, 57, 17]` and the equality
   with `issue-2251`'s `S`, `D` and the WP3a table, and keeps that the list
   never names #2260's table. Criterion 19 loses its three allowlist caps and
   keeps that the allowlist never names #2260's route; the ceiling bounds the
   allowlist.
5. **`issue-2251`: no classified total (Q2 row 15).** The `toBe(141)` sum of
   `S`, `D` and `F` in
   `tests/unit/acceptance/issue-2251/static.acceptance.test.ts` is deleted; it
   summed static arrays, and the catalog gate covers the live tables.
6. **`issue-2255` and `issue-2256`: no `database.ts` hash (Q2 row 16).** The
   SHA-256 of `packages/database/types/database.ts` is deleted from
   `tests/unit/acceptance/issue-2255/migration-text.acceptance.test.ts`
   (criterion 15) and
   `tests/unit/acceptance/issue-2256/migration-text.acceptance.test.ts`
   (criterion 7). Each criterion's `git ls-files` scan includes that file.
7. **`issue-2253`: `LISTED` is read from the exceptions file.** In
   `tests/unit/acceptance/issue-2253/rls-catalog-gate.realstack.acceptance.test.ts`
   `LISTED = 74` and the check that the file holds `LISTED` entries go; the
   real check, tenant tables equal tables with policies plus `LISTED`, stays.
   `tests/unit/scripts/supabase-migrations.test.ts` builds the catalog gate's
   summary line from the same count instead of 75 and 74.
8. **`issue-2250`: criterion 17 holds one item per line.**
   `tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts`
   holds the guard's reach in `GUARD_REACH`, one item per line, joined into
   the same value. A new case grants `authz.is_super_admin()` to the guard in
   a rolled-back transaction and shows the criterion's value changes (since
   WP2c's rest, AL-2675, which dropped that function, it grants
   `authz.staff_read()`).
9. **The seed counts are read from their file (Q3).**
   `tests/unit/scripts/release/release-database.test.ts` and
   `tests/unit/scripts/release/schema-fingerprint.realstack.test.ts` take the
   counts from `readSeedExpectations()` instead of literals, and a new case
   shows a rebuild stops before Payload when a count differs.
   `scripts/seed-demo.sh` prints the expected counts by reading the file with
   `node`, and stops, naming the key, when one of them is missing or not a
   whole number; `tests/unit/scripts/seed-counts.test.ts` runs that snippet on
   the tracked file, on changed counts and on broken files instead of matching
   literal text.

## What stays

The ceiling's rows and counts, the allowlist, the exception list and the
other reviewed lists are unchanged. Package 2 (the privileged-function list,
the allowlist's `lines`) is not part of this record. On a merge queue the
`lint` step, like the comment ratchet, compares with `origin/develop`; if
`production` ever gets a merge queue, the step must be given the queue's base.
