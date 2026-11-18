# Design

## Context

See proposal.md for why. Current code and settings, read on 18 November 2026:

- `develop` uses classic branch protection: strict status checks on, required
  checks `ci-gate`, `e2e-smoke-gate`, `migrate` and `smoke`, no required
  approvals, conversation resolution required, admins enforced. The repository
  has no rulesets, and `GET /rules/branches/develop` returns no rules. It is a
  public, organization-owned repository with merge commits only.
- Readiness (`pack/.shared/readiness.mjs`) already receives both the classic
  protection and the branch's active rules. A `behind` pull request is a
  repair with `integrate` when any required check is strict.
- The merge lane (`pack/deliver/scripts/readiness.ts`) calls
  `github.merge(n, { sha, method, title })`, a REST
  `PUT /pulls/{n}/merge`. It records `merged: false` or a refused error as
  `merge-refused`. Any other result is `unknown` and is settled by reading the
  pull request; an unmerged pull request then blocks as `merge-unconfirmed`.

GitHub documentation (docs.github.com, read 18 November 2026):

- REST "Merge a pull request": "This endpoint does not support stacked pull
  requests or merging with a merge queue."
- GraphQL `enqueuePullRequest`: "Add a pull request to the merge queue."
  Inputs `pullRequestId` ("The ID of the pull request to enqueue.") and
  `expectedHeadOid` ("The expected head OID of the pull request."); it returns
  `mergeQueueEntry`. "Merging a pull request with a merge queue": use the
  `enqueuePullRequest` mutation to add a pull request only if it can be queued
  now; otherwise "the mutation returns an error that explains why".
- REST "Get branch protection": the response has no merge-queue field
  (`required_status_checks`, `enforce_admins`, `required_pull_request_reviews`,
  `restrictions`, `required_linear_history`, ... `lock_branch`,
  `allow_fork_syncing`).
- REST "Get rules for a branch": "Returns all active rules that apply to the
  specified branch"; a rule of type `merge_queue` carries its parameters
  (`merge_method`, `grouping_strategy`, group sizes and timeouts).
  "Rules in rulesets with "evaluate" or "disabled" enforcement statuses are
  not returned."
- "Available rules for rulesets", "Require merge queue": "You can require that
  merges must be performed with a merge queue at the repository level." Its
  settings are Merge method, Build concurrency, Minimum/maximum group size,
  Wait time to meet minimum group size (minutes), Require all queue entries to
  pass required checks, and Status check timeout (minutes). "This rule is not
  available for rulesets created at the organization level."
- "About rulesets": "Rulesets and branch protection rules can both protect
  branches in a repository. They work alongside each other, and all applicable
  rules are enforced."
- Merge queue overview: "The merge queue provides the same benefits as the
  **Require branches to be up to date before merging** branch protection, but
  does not require a pull request author to update their pull request branch".
- Availability: "Pull request merge queues are available in any public
  repository owned by an organization, or in private repositories owned by
  organizations using GitHub Enterprise Cloud."

## Goals / Non-Goals

**Goals:** one detection function; queue-off behaviour identical, including no
extra GitHub reads before a merge write; an enqueue keeps the factory's write
discipline (refused, unknown, never merged).

**Non-Goals:** waiting for the queue inside the merge lane; reading the queue's
state; supporting a queue configured only in classic branch protection.

## Decisions

1. **Detect the queue from the branch's active ruleset rules.** Only rules
   report a merge queue over REST; classic protection does not. Readiness
   already has these rules, so detection needs no new request. The runbook has
   the owner configure the queue with a repository ruleset. Alternative: the
   GraphQL `PullRequest.isMergeQueueEnabled` field sees both kinds, but
   readiness does not read it today and would need a new query in the caller.

2. **Readiness carries the decision; the merge request obeys it.** A `MERGE`
   decision gains `mergeQueue: true` only when a queue is required; queue-off
   decisions are unchanged objects. `github.merge` enqueues only when the caller
   passes `mergeQueue: true` with the pull request's node id. Alternative:
   `merge` reads the pull request and the base branch's rules itself. That adds
   two reads before every merge write while the queue is off, and a failed read
   there would leave an `unknown` merge request that needs reconciliation.

3. **GraphQL `enqueuePullRequest` with `expectedHeadOid`, sent as a write.**
   It is the documented way to add a pull request to a queue and binds the
   reviewed head. It goes through the same request path as other writes:
   a lost response or server error is `unknown` and never retried; a client
   error or GraphQL error is `refused`; an answer without a queue entry is
   `unknown`. The result is `{ queued: true, mergeQueueEntry }` and has no
   `merged` field. Alternative: REST `PUT /pulls/{n}/merge-async`, which
   "merges a pull request into the base branch in the background or adds it to
   a merge queue". It is newer and could serve both cases, but using it for the
   queue-off path would change today's synchronous merge, and the workstream
   asked for the minimum.

4. **Only staleness is waived.** With a queue, `behind` is not a repair. A
   conflict (`dirty` or not mergeable) still integrates the base, because the
   queue cannot merge a conflicting change.

## Risks / Trade-offs

- [The merge lane is not wired yet] → Until task 3.1 lands, the lane never
  asks for an enqueue: with a queue on, its direct merge is refused and the
  issue blocks `merge-refused`. If the flag were passed without the result
  handling, a queued result would be read as unconfirmed and block
  `merge-unconfirmed`. Neither reports MERGED early. The runbook holds
  merging until both are installed.
- [GitHub may report `mergeable_state: blocked` for a pull request whose base
  requires a queue; not documented and not observed here] → Readiness would
  answer PR_READY ("Required human review pending (0/0)") and not enqueue. The
  runbook makes the first queued factory merge the check.
- [A queue required only in classic protection is invisible to REST] → The
  direct merge is refused and the issue blocks; the runbook uses a ruleset.
- [The queue merges with its own merge method and message, not the factory's
  `commit_title`] → The runbook sets the ruleset's merge method to merge
  commits, matching the repository setting.

## Migration Plan

1. Merge this change and install it as a new pack release (runbook, Updates).
2. Wire the merge lane (task 3.1) and install that release.
3. The owner turns the queue on with the runbook steps and watches the first
   factory merge. Rollback: the runbook's turn-off steps; with no
   `merge_queue` rule the factory runs today's code paths.
