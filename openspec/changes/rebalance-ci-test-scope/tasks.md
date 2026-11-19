# Tasks

## 1. Planning and authority

- [x] 1.1 Record the owner's 2026-11-18 step-3 ruling and the `instant-nav`
      reply verbatim in `proposal.md` (Authority).
- [x] 1.2 Measure before timings from `gh` run data and record them in
      `design.md`.
- [x] 1.3 `bun run openspec -- validate rebalance-ci-test-scope --strict` and
      `bun run verify:openspec-deltas` pass.

## 2. Acceptance runs once

- [x] 2.1 Red first: unit-runner tests expect `--exclude tests/unit/acceptance/**`
      by default on every platform, and no exclusion when an argument names
      acceptance files. (7 failed before the implementation.)
- [x] 2.2 Add the exclusion in `scripts/verify/unit-tests.mjs`; keep the
      acceptance job and its "no tests executed" guard unchanged.
- [x] 2.3 List the files each job executes before and after; the only
      difference is the acceptance directory leaving `test-unit`. (Push to
      `develop` and `merge_group`: 1,567 files before; after, 1,433 in
      `test-unit` plus 134 in `acceptance-tests`; none missing, none extra,
      none run twice.)

## 3. Unit tests in shards

- [x] 3.1 Red first: a develop pull request whose real diff is documents only
      must pass Vitest no exclusion but the acceptance directory. (The
      factory-test selection excluded 70 files.) Remove the selection, its
      analysis, its derived full-run triggers and their tests; rename what
      remains to `scripts/verify/instant-navigation-scope.mjs`.
- [x] 3.2 Choose the shard count from per-file times in three develop logs
      (`design.md` §2): three.
- [x] 3.3 Red first: workflow tests for the `test-unit` matrix
      (`fail-fast: false`, the `--shard` run line, a coverage artifact per
      shard), and a test that the shards, as Vitest assigns them, run the
      unsharded `test:unit` list exactly once each. (5 failed before the
      matrix.) Then shard `test-unit` in `ci.yml`.
- [x] 3.4 List the files each job executes for a push to `develop`, a
      `merge_group` run and a develop pull request: 1,567 before; 1,433 in
      `test-unit` (478, 478 and 477 per shard) plus 134 in
      `acceptance-tests`; none missing, extra or run twice.

## 4. Required integration path

- [x] 4.1 Red first: workflow tests expect `test-e2e-smoke` to have no
      `needs`, `smoke` to keep `needs: migrate`, and the gates unchanged.
- [x] 4.2 Remove `needs: smoke` from `test-e2e-smoke`.
- [x] 4.3 Run the required-checks guard and every test that reads
      `ci-integration.yml`.

## 5. `verify:shadcn-config` in CI

- [x] 5.1 Red first: a workflow test expects the step in the `lint` job.
- [x] 5.2 Add the step.

## 6. Next.js agent-guide items

- [x] 6.1 Red first: `ci-build.mjs` tests for recording a failed app build in
      GitHub Actions, for the debug-prerender command, and for refusing to run
      on Vercel or outside GitHub Actions; a workflow test for the
      `if: failure()` step in `build`.
- [x] 6.2 Implement the failure-only debug-prerender rebuild.
- [x] 6.3 Red first: selection tests for the instant-navigation inputs and
      workflow tests for the `instant-nav` trigger, its scope step, its full
      checkout and the absence of `continue-on-error`.
- [x] 6.4 Extend the `instant-nav` trigger and remove the dead
      `continue-on-error` expression.
- [x] 6.5 Correct the instant-navigation comment in
      `tests/unit/apps/next-config-instant-navigation.test.ts` (comment only).

## 7. Dev-server lock (conditional)

- [x] 7.1 On native Windows, start donor `next dev`, wait for
      `.next/dev/lock`, kill the process tree, start again without deleting
      the lock, and record whether the second start is blocked. (Not blocked;
      `design.md` §8.)
- [x] 7.2 Only if the second start is not blocked: red first, then stop
      `devServerCommand` deleting `.next/dev/lock` and limit
      `clearStaleNextLocks` to build locks outside `.next/dev`.

## 8. Documents and verification

- [x] 8.1 Update `docs/ci.md`, and `CONTRIBUTING.md`, `README.md` and
      `docs/ai/rules/testing.md` where they describe the changed placement.
      (`README.md` needed no change.)
- [x] 8.2 Run the changed and affected tests with at most two workers, the
      required-checks guard, and every test that reads the two workflows.
- [x] 8.3 Lint and format the touched files.
- [ ] 8.4 After the pull request runs: confirm the three `test-unit` shard
      timings, that `ci-gate` reads the matrix result, and the CI Integration
      and `instant-nav` timings and logs on GitHub.

## 9. Not in this change (reported for others)

- [ ] 9.1 Promote an axe spec only after a clean advisory run record (see
      `design.md` §4).
- [x] 9.2 Add an acceptance stage to the local preflight (pre-push
      workstream, `scripts/verify/ci-preflight.mjs`), and record that CI
      runs `verify:shadcn-config` in required lint.
- [x] 9.3 Add a one-line pointer to this change's supersession (`design.md`
      §7) at the top of `reduce-development-builds/design.md`, as
      `complete-repository-modernization` did for its own.
- [ ] 9.4 Amend the superseded clause itself in
      `reduce-development-builds/design.md` and its task 1.4, keeping the old
      wording as dated history (that change's owner).
- [ ] 9.5 Archive `reduce-development-builds` before this change.

## 10. Review fixes (review round 6, sections c1 and c2)

- [x] 10.1 Red first: the workflow test evaluates every `instant-nav` work
      step for each event and for the outputs `true`, `false` and missing; a
      CLI test runs the scope script as the job does with a temporary
      `GITHUB_OUTPUT`. Then make the production guards independent of the
      script and run on `develop` unless the output is exactly `false`.
- [x] 10.4 Red first: a non-ASCII donor path through real git, and
      NUL-separated reader output. Then read the instant-nav diff with `-z`.
- [x] 10.6 Red first: arguments that merely contain "acceptance" keep the
      exclusion. Then drop it only for a path inside `tests/unit/acceptance`.
      (Replaced by 11.2.)
- [x] 10.7 Red first: the debug-prerender rebuild must have its own timeout of
      at most half the build job budget. Then give it `timeout-minutes: 6`.
- [x] 10.8 Correct the two documents that still describe the serial
      integration chain (`docs/ai/repo-groundtruth.md`, the `docs/ci.md`
      `test-e2e` heading).
- [x] 10.9 Say the acceptance files run in the acceptance job and not again in
      the unit-test job (real-database files also run in `migrate`); record
      the explicit supersession of one `reduce-development-builds` clause and
      the archive order.
- [x] 10.10 Red first: outside CI the dev-server command checks the app's
      dev lock first, and a live server holding it fails the start with a
      message naming it and what to do; CI keeps the plain command. Then add
      `tests/e2e/dev-server-lock.mjs`.

## 11. Review round 8 fixes

- [x] 11.1 Red first: a changed file whose name holds a newline matches
      `apps/donor/**` (c2a.7). Then compile `**` to `[\s\S]*`.
- [x] 11.2 Red first: what Vitest selects through the runner for each filter
      form (a fragment, a directory name and a bare file name selected
      nothing; a path after `--` ran all 134 acceptance files). Then let
      Vitest's `parseCLI` decide whether the arguments carry filters (c2a.10).
- [x] 11.3 Red first: the decision step runs only on develop pull requests,
      and no `instant-nav` step swallows a failure. Then add its `if` and drop
      the `|| true` (c2b.1, c2b.2).
- [x] 11.4 Say that the guards depend on the decision step only on develop
      pull requests, where a failing step fails the job (c2b.1); that
      `instant-nav` feeds no `develop` required check (c2b.2); and that a test
      filter, not a named path, lifts the acceptance exclusion (c2b.4).
      Record the supersession on both sides (c2b.3).
- [x] 11.5 Run the required-checks guard of `retire-acceptance-byte-pins`
      against the final workflows, and every test that reads them.
