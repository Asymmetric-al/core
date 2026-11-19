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
   `if:`, to run after `Apply migrations`, and to run `bun x vitest run`
   with the issue's own files. The run is one line, and every word after the
   command must be a plain test path that exists, so no operator, comment,
   flag or variable can make the step pass while its tests fail, and a
   mistyped path cannot be skipped silently. The step carries no key but
   `name`, `env` and `run` (a `shell` or `working-directory` would change how
   the line runs), and it does not override the job's `DATABASE_URL` unless
   the caller expects that value. Its position and which other files share
   the `run:` line are not asserted. A shared test names all real-database
   acceptance files, checks the list against the files on disk, and asserts
   that one such step runs each file with the database URL variable the file
   reads.
3. **Structural guard lives outside issue folders.**
   `tests/unit/workflows/required-ci-checks.test.ts` with a pure helper in
   `tests/unit/helpers/required-ci-checks.ts`. The required set is develop's
   live contexts from `docs/ci.md` § Branch protection: `ci-gate`,
   `e2e-smoke-gate`, `migrate`, `smoke`. Each required job and its transitive
   `needs` must not be `continue-on-error` or call a reusable workflow, and
   their run scripts must not swallow failure: an `||` fallback that is a
   no-op, a message or a group with no failing exit, `; true`, or `set +e`.
   Quoted text, comments and `${{ }}` expressions are ignored. No step may
   have a condition that is false for every modelled event, and `migrate`
   and `smoke` may not have a job condition that skips them on a develop
   pull request, push or merge-queue run once their needs succeeded
   (unevaluable conditions fail closed there). Steps whose condition is
   exactly `failure()` are exempt (they run only after the job has already
   failed).
   `ci-gate` must need and read the result of every other `ci.yml` job except
   jobs downstream of it and the explicit advisory `shadscan-report`;
   `e2e-smoke-gate` must need and read `migrate`, `smoke` and
   `test-e2e-smoke`; both gates must run `if: always()`. Because a result
   read only in a log line gates nothing, the guard also runs
   `e2e-smoke-gate`'s script under bash, through the existing
   `gateEnforcementProblems` model, once per outcome of the jobs it gates: it
   must pass when they all succeeded and fail when any one failed, was
   cancelled or was skipped. `ci-gate` is not run there: its policy script
   allows planned skips, and the issue-2153 and ci-build-policy tests run it.
   A fallback group's bare `exit` counts as failing only as the group's
   first command, since later it returns the status of the command before
   it. Production-only contexts (`e2e-gate`, `release-source-gate`) are out
   of scope because `e2e-gate` depends on jobs that are advisory on
   `develop`.
4. **Guidance.** The repository testing rulebook gains the rule. The factory
   Ezra role, which designs acceptance tests, gains a "byte-pinned"
   anti-pattern with the same hash exception as the spec; its LF-normalized
   hashes in the pack role manifest are regenerated with
   `scripts/archon-factory/build-pack.mjs`.
5. **Base-relative rules keep their rule, not their merge base.** Removing
   a merge-base comparison must not remove a rule that holds between a pull
   request and its base. The one such rule found is forward-migration
   order (#2406 criterion 1, and the same check in #2258, #2260, #2312 and
   #2407a): it now covers every forward migration a pull request adds and
   reads the base commit from the CI event (`pull_request.base.sha` or
   `merge_group.base_sha`), skipping with a stated reason when there is
   none (`tests/unit/acceptance/shared/migration-order.ts`). A migration
   verifier under `scripts/verify/` is its better home.

## Risks / Trade-offs

- Deleting a pin removes a tripwire for unreviewed edits. Review and the new
  structural guard take that role; the deleted pins never distinguished a
  harmful edit from a harmless one.
- The guard's required set is a constant. A branch-protection change must
  update it; the test names the job it is missing.
- The guard is a heuristic. It reads run scripts as text (heredocs, pipes
  without `pipefail` and custom `shell:` templates are not modelled) and
  evaluates conditions only for the events in the shared event model. The
  exact `migrate` pins in `tests/unit/helpers/workflow-yaml.ts`
  (`PINNED_STEP_BODIES`, `PINNED_JOB_IFS`) remain the backstop, and the
  real-database steps are also asserted directly by the acceptance suites.
- Kept hashes are listed with their reason in the workstream reports:
  applied migrations, image digests, evidence chains, and the ADR-0001 body
  above its amendments.

## Migration Plan

No data or runtime migration. Rollback is a revert of the change's commits.
