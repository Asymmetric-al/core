# Design

## Context

Acceptance suites for issues #2153 through #2407 were written by the
factory's Acceptance role against one base commit each. To stop later edits
from silently changing what had been reviewed, many of them pinned bytes:
reviewed-fingerprint lists for the two CI workflows, `CI_BASES` byte-prefix
hashes of `docs/ci.md`, exact step indexes in the `migrate` job, exact
`run:` strings that list every other issue's real-stack file, and opt-in
`git merge-base` diff-scope blocks. The structure they really protected is
smaller: required jobs exist, stay blocking, and run the named checks.

## Goals / Non-Goals

**Goals:** remove byte-level pins assertion by assertion; keep every
behavioral, real-database and structural security assertion; replace a pin
with its semantic assertion where it stood for a real invariant; add one
structural guard for required checks; change the authoring guidance.

**Non-goals:** workflow, `docs/ci.md`, branch-protection or review-automation
changes; other hashed ledgers; exact job inventories (semantic, kept).

## Decisions

1. **Per assertion, not per file.** Each pin is classified as (a) whole-file
   hash or fingerprint, (b) byte equality with a stored copy, (c) diff scope
   of a merged change, or (d) pinned line numbers or step positions. Pure
   bookkeeping is deleted; an `it` left empty is deleted. When it is unclear
   whether an assertion protects anything, it stays and is listed in the
   workstream report.
2. **Semantic replacement for CI steps.** A real-stack verification step is
   asserted to exist once in `migrate`, to set no `continue-on-error` and no
   `if:`, and to run `bun x vitest run` with the issue's own files. Its
   position and the other issues' files in the same `run:` line are not
   asserted.
3. **Structural guard lives outside issue folders.**
   `tests/unit/workflows/required-ci-checks.test.ts` with a pure helper in
   `tests/unit/helpers/required-ci-checks.ts`. The required set is develop's
   live contexts from `docs/ci.md` § Branch protection: `ci-gate`,
   `e2e-smoke-gate`, `migrate`, `smoke`. Each required job and its transitive
   `needs` must not be `continue-on-error`, and their run lines must not end
   in `|| true`, `|| :` or `|| exit 0`, except in steps whose condition is
   exactly `failure()` (they run only after the job has already failed).
   `ci-gate` must need and read the result of every other `ci.yml` job except
   jobs downstream of it and the explicit advisory `shadscan-report`;
   `e2e-smoke-gate` must need and read `migrate`, `smoke` and
   `test-e2e-smoke`; both gates must run `if: always()`. Production-only
   contexts (`e2e-gate`, `release-source-gate`) are out of scope because
   `e2e-gate` depends on jobs that are advisory on `develop`.
4. **Guidance.** The repository testing rulebook gains the rule. The factory
   Ezra role, which designs acceptance tests, gains a "byte-pinned"
   anti-pattern; its LF-normalized hashes in the pack role manifest are
   regenerated with `scripts/archon-factory/build-pack.mjs`.

## Risks / Trade-offs

- Deleting a pin removes a tripwire for unreviewed edits. Review and the new
  structural guard take that role; the deleted pins never distinguished a
  harmful edit from a harmless one.
- The guard's required set is a constant. A branch-protection change must
  update it; the test names the job it is missing.

## Migration Plan

No data or runtime migration. Rollback is a revert of the change's commits.
