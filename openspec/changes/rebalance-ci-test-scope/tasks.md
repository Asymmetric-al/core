# Tasks

## 1. Planning and authority

- [x] 1.1 Record the owner's 2026-11-18 step-3 ruling and the `instant-nav`
      reply verbatim in `proposal.md` (Authority).
- [x] 1.2 Measure before timings from `gh` run data and record them in
      `design.md`.
- [ ] 1.3 `bun run openspec -- validate rebalance-ci-test-scope --strict` and
      `bun run verify:openspec-deltas` pass.

## 2. Acceptance runs once

- [ ] 2.1 Red first: unit-runner tests expect `--exclude tests/unit/acceptance/**`
      by default on every platform, and no exclusion when an argument names
      acceptance files.
- [ ] 2.2 Add the exclusion in `scripts/verify/unit-tests.mjs`; keep the
      acceptance job and its "no tests executed" guard unchanged.
- [ ] 2.3 List the files each job executes before and after; the only
      difference is the acceptance directory leaving `test-unit`.

## 3. Factory tests by their inputs

- [ ] 3.1 Red first: tests for the pure selection function (events, base
      branch, unknown or empty change sets, full-run triggers, group inputs,
      group test files, skip reasons, glob matching) and for the changed-file
      reader (invalid SHAs, shallow history, git failure).
- [ ] 3.2 Implement `scripts/verify/ci-test-scope.mjs`.
- [ ] 3.3 Red first: runner tests that a skipped group becomes `--exclude`
      globs, that the decision is printed, and that a selection error runs
      everything.
- [ ] 3.4 Wire the selection into `scripts/verify/unit-tests.mjs` and pass the
      pull request's base and head SHAs to the `test-unit` step.
- [ ] 3.5 Red first, then green: the structural inputs guard
      (`tests/unit/scripts/ci-test-scope-inputs.test.ts`) passes on the factory
      group and fails on a fixture test that imports or reads outside it.
- [ ] 3.6 Dry-run the selection on three real pull requests (documentation
      only, product only, scripts) and record the result.

## 4. Required integration path

- [ ] 4.1 Red first: workflow tests expect `test-e2e-smoke` to have no
      `needs`, `smoke` to keep `needs: migrate`, and the gates unchanged.
- [ ] 4.2 Remove `needs: smoke` from `test-e2e-smoke`.
- [ ] 4.3 Run the required-checks guard and every test that reads
      `ci-integration.yml`.

## 5. `verify:shadcn-config` in CI

- [ ] 5.1 Red first: a workflow test expects the step in the `lint` job.
- [ ] 5.2 Add the step.

## 6. Next.js agent-guide items

- [ ] 6.1 Red first: `ci-build.mjs` tests for recording a failed app build in
      GitHub Actions, for the debug-prerender command, and for refusing to run
      on Vercel or outside GitHub Actions; a workflow test for the
      `if: failure()` step in `build`.
- [ ] 6.2 Implement the failure-only debug-prerender rebuild.
- [ ] 6.3 Red first: selection tests for the instant-navigation inputs and
      workflow tests for the `instant-nav` trigger, its scope step, its full
      checkout and the absence of `continue-on-error`.
- [ ] 6.4 Extend the `instant-nav` trigger and remove the dead
      `continue-on-error` expression.
- [ ] 6.5 Correct the instant-navigation comment in
      `tests/unit/apps/next-config-instant-navigation.test.ts` (comment only).

## 7. Dev-server lock (conditional)

- [x] 7.1 On native Windows, start donor `next dev`, wait for
      `.next/dev/lock`, kill the process tree, start again without deleting
      the lock, and record whether the second start is blocked.
- [ ] 7.2 Only if the second start is not blocked: red first, then stop
      `devServerCommand` deleting `.next/dev/lock` and limit
      `clearStaleNextLocks` to build locks outside `.next/dev`.

## 8. Documents and verification

- [ ] 8.1 Update `docs/ci.md`, and `CONTRIBUTING.md`, `README.md` and
      `docs/ai/rules/testing.md` where they describe the changed placement.
- [ ] 8.2 Run the changed and affected tests with at most two workers, the
      required-checks guard, and every test that reads the two workflows.
- [ ] 8.3 Lint and format the touched files.

## 9. Not in this change (reported for others)

- [ ] 9.1 Promote an axe spec only after a clean advisory run record (see
      `design.md` §4).
- [ ] 9.2 Add an acceptance stage to the local preflight (pre-push
      workstream, `scripts/verify/ci-preflight.mjs`), and update its comment
      that `verify:shadcn-config` runs only locally.
