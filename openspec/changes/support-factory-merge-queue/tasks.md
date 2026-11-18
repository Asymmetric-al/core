# Tasks

## 1. Readiness detects the queue and waives staleness only

- [x] 1.1 Write failing tests in `tests/unit/scripts/archon-pack-readiness.test.ts`
      for queue detection from ruleset rules, a behind branch under a queue
      (classic and ruleset strict), a conflict under a queue, and today's
      strict and merge decisions without one; verify they fail for the
      missing behaviour. Red on 18 November: 6 failures (detection not
      exported; a behind branch under a queue was a strict REPAIR; no
      `mergeQueue` on the decision).
- [x] 1.2 Implement detection and the behind-branch rule in
      `pack/.shared/readiness.mjs`, with `mergeQueue: true` on a queued merge
      decision only; verify the readiness test file passes.

## 2. The merge request enqueues when told

- [x] 2.1 Write failing tests in `tests/unit/scripts/archon-pack-github.test.ts`
      for one GraphQL `enqueuePullRequest` write bound to the reviewed head, a
      result that is never merged, refused and unknown failures, a missing
      node id, and an unchanged direct merge without a queue; verify they fail.
      Red on 18 November: 5 failures (the REST merge was sent instead).
- [x] 2.2 Implement the enqueue path in `pack/.shared/github.mjs`; verify the
      github test file and the existing tests of both modules pass with
      `bunx vitest run` on `archon-pack-github`, `archon-pack-readiness` and
      the nine other `archon-*` test files that import either module
      (2 workers): 248 and 217 tests passed.

## 3. Merge lane wiring

- [x] 3.1 In `pack/deliver/scripts/readiness.ts`, pass
      `mergeQueue: true` and `nodeId: pr.node_id` to `github.merge` when the
      decision carries `mergeQueue`, record a `{ queued: true }` result as a
      merge request with status `queued` answered with WAIT instead of
      `merge-unconfirmed`, and answer WAIT without a new request on a later
      round while that same-head request is queued; verify with caller tests
      in `tests/unit/scripts/archon-readiness-callers.test.ts`, written first.
      Red on 18 November: 3 failures (a queued result fell through to "Merge
      outcome could not be confirmed" and blocked `merge-unconfirmed`); the
      test pinning today's exact direct request without a queue passed before
      and after. Green: 36 tests in that file, and 469 across the 11 test
      files that import the lane or either `.shared` module (2 workers).

## 4. Operations

- [x] 4.1 Add the merge-queue entry to `docs/ops/archon-vm100-factory-runbook.md`
      (turn on, turn off, availability, what to check first); verify every
      setting named matches GitHub's ruleset documentation quoted in design.md.

## 5. Acceptance

- [x] 5.1 Validate with `bun run openspec -- validate support-factory-merge-queue --strict`
      and `bun run verify:openspec-deltas`.
- [ ] 5.2 Install the release on VM 100 and observe the first factory merge
      through the queue on `develop` (owner action after the queue is on).

## 6. Review follow-up (18 November)

- [x] 6.1 Write failing tests in `tests/unit/scripts/archon-pack-github.test.ts`
      for an enqueue whose GraphQL errors are a rate limit, carry no type, or
      mix a rejection with another error (unknown, never retried), and for
      errors that are all `FORBIDDEN`, `NOT_FOUND` or `UNPROCESSABLE`
      (refused); then classify in `pack/.shared/github.mjs` and verify the
      files that import it pass (2 workers). Red on 18 November: 3 failures
      (each answered `refused`). Green: 80 tests in that file, and 311 across
      the 11 test files that import `github.mjs` or the merge lane.
- [x] 6.2 Correct the runbook section "Merge queue on develop" (a healthy
      queued pull request can also block `feedback-limit`; retry is the
      recovery; a hold or stop does not dequeue; no direct merge while the
      queue is required), record the feedback-budget interaction in
      design.md, and correct the merge attribution and `mergeRequest` fields
      in `pack/README.md`.

## 7. Bot review follow-up (19 November)

- [x] 7.1 Write failing caller tests in
      `tests/unit/scripts/archon-readiness-callers.test.ts`: an enqueue that
      throws `outcome: "unknown"` on an open pull request blocks
      `merge-unconfirmed` once, sends no second request, and a later round
      stays blocked, each with a recovery that names the queue page and
      Merge when ready; the queued WAIT says to re-add with Merge when ready.
      Then make both `merge-unconfirmed` recoveries in
      `pack/deliver/scripts/readiness.ts` queue-aware when the decision
      carries `mergeQueue`, and correct the WAIT text. Red on 19 November:
      2 failures (the recovery was "Inspect the PR before any retry"; the WAIT
      said "re-adds or merges it"). Green: 37 tests in that file.
- [x] 7.2 Add the unknown-enqueue recovery to the runbook section "Merge
      queue on develop" and to design.md, and the queue to the spec scenario
      "The enqueue response is lost".

## Workflow follow-up

- Archive the change after the implementation has merged and the first queued
  factory merge has been observed.
