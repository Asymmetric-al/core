# Proposal

## Why

The owner will turn on GitHub's merge queue for `develop` to replace the
"branch must be up to date before merging" rule. The VM factory merges with
GitHub's REST merge endpoint, which "does not support ... merging with a merge
queue", and its readiness decision asks a branch that is behind to integrate
its base whenever any required check is strict. With the queue on, the factory
could no longer land a pull request, and it would keep updating branches that
the queue already tests against the latest base.

## What Changes

- Readiness detects a required merge queue from the target branch's active
  ruleset rules (a `merge_queue` rule). That one function is the factory's
  only queue detection.
- With a queue required, a branch that is only behind its base is not a
  repair: no base integration is requested for staleness alone. A conflict
  with the base still is. The merge decision says the merge goes through the
  queue.
- With a queue required, the factory's merge request adds the pull request to
  the queue at its reviewed head through GraphQL `enqueuePullRequest`. Queued
  is never reported as merged: the factory waits, and does not enqueue the
  pull request again, until GitHub reports it merged. A rejected enqueue is
  refused, and a lost or failed response is unknown and reconciled before any
  retry, as for every factory write today.
- Without a queue, the direct merge request and the strict up-to-date
  behaviour stay exactly as they are.
- A short runbook entry gives the owner the exact steps to turn the queue on
  and off, and what to check first.

## Non-goals

- No change to GitHub settings, branch protection, rulesets, workflows,
  `docs/ci.md` or acceptance tests. The owner changes the setting.
- No waiting inside the merge lane for the queue to finish, no queue
  configuration in the factory, no dequeue, jump or retry policy, and no new
  abstraction over GitHub.
- No change to review automation or required human review.

## Authority

Owner ruling of 18 November 2026, program step 8. As offered: "Merge queue".
Owner: "Only do what is needed, don't over engineer things here." Tracked as
issue #2709. The ruling covers factory support for a merge queue on `develop`;
it does not itself change any GitHub setting.

`commission-core-archon-vm100` remains the governing change for VM protected
delivery. Its requirement that protected merge uses fresh external truth, and
that an unknown remote effect is reconciled before retry, applies unchanged to
an enqueue. That change "does not change GitHub protections", and this one does
not either. It is a separate change because its authority (this ruling) and
its lifetime differ from the commissioning lane.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-instruction-system`: adds the VM factory's behaviour when the target
  branch requires a merge queue.

## Impact

- `scripts/archon-factory/pack/.shared/readiness.mjs`: queue detection, the
  behind-branch rule and the merge decision.
- `scripts/archon-factory/pack/.shared/github.mjs`: the merge request enqueues
  when told the base branch requires a queue.
- `scripts/archon-factory/pack/deliver/scripts/readiness.ts`: the merge lane
  passes the decision's queue flag and the pull request's node id, records a
  queued result as queued, and waits on a queued request without sending
  another (task 3.1, delivered as a second slice).
- `docs/ops/archon-vm100-factory-runbook.md`: the merge-queue entry.
- A changed pack reaches VM 100 only as a new release through
  `installation/install.mjs`.

## Rollback

Turn the queue off (runbook steps) and restore the strict up-to-date rule.
With no `merge_queue` rule the factory's code paths are the ones it has today,
so reverting the code is optional; revert the commits to remove it entirely.
