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
   error is `refused`; an answer without a queue entry is `unknown`. GraphQL
   reports its errors in a 200 answer, and not every error means the mutation
   was rejected: a rate limit or a server-side failure may come after it ran.
   So GraphQL errors are `refused` only when every one carries the type
   `FORBIDDEN`, `NOT_FOUND` or `UNPROCESSABLE`, and `unknown` otherwise,
   including an error without a type. GitHub's documentation lists no GraphQL
   error types (github/docs issue #11071 asked for that list and was moved to
   an internal tracker), and the type is not part of the schema. On
   18 November 2026 read-only queries answered `NOT_FOUND` (an unknown node
   id, a missing repository), `FORBIDDEN` (an admin-only organization field)
   and also `EXCESSIVE_PAGINATION`, `INVALID_PAGINATION` and an error with no
   type. GitHub's own clients treat `NOT_FOUND` and `FORBIDDEN` as rejections
   (cli/cli `pkg/cmd/issue/shared/lookup.go`) and `UNPROCESSABLE` on a
   mutation as one (github/gh-aw
   `actions/setup/js/work_queue_issue_api.cjs`, a `createLabel` that already
   exists). Which type GitHub gives a rejected `enqueuePullRequest` was not
   observed: no mutation was sent. The result is
   `{ queued: true, mergeQueueEntry }` and has no `merged` field.
   Alternative: REST `PUT /pulls/{n}/merge-async`, which
   "merges a pull request into the base branch in the background or adds it to
   a merge queue". It is newer and could serve both cases, but using it for the
   queue-off path would change today's synchronous merge, and the workstream
   asked for the minimum.

4. **Only staleness is waived.** With a queue, `behind` is not a repair. A
   conflict (`dirty` or not mergeable) still integrates the base, because the
   queue cannot merge a conflicting change.

5. **The merge lane passes the flag and treats queued as waiting.** With
   `mergeQueue` on the decision, the lane passes `mergeQueue: true` and the
   pull request's node id from its fresh re-check; without it, the request
   is today's, byte for byte. A `{ queued: true }` result is recorded as a
   merge request with status `queued` and answered WAIT, not read back as an
   unconfirmed merge. Each later round reads the pull request first: merged
   goes to the existing MERGED closeout; not merged, with a same-head request
   still `queued`, answers WAIT and sends nothing. Alternative: keep the
   existing guard, which blocks every recorded same-head request as
   `merge-unconfirmed`. A feedback round runs every 10 minutes
   (`checkWaitMs`) and a `merge_group` run takes longer, so nearly every
   queued merge would stop for a person although GitHub then merges it.

## Risks / Trade-offs

- [The queue removes the pull request (a failed `merge_group` check, or a
  person); it then looks the same as a queued one, and the factory does not
  read the queue] → The lane keeps answering WAIT and never enqueues again;
  the issue's feedback-round budget ends the wait as BLOCKED
  `feedback-limit`. A person re-adds the pull request with Merge when ready
  (a direct merge is refused while the queue is required), then retries the
  issue; the next round records MERGED once the queue has merged it. Nothing
  is reported merged early.
- [The same budget can end the wait of a pull request that is still queued
  and healthy] → Each queued round answers WAIT, which `record-logic.mjs`
  turns into `continue` on the `feedback` route. `workitem.mjs` adds one to
  `feedbackRounds` for every such round on a polling route and blocks
  `feedback-limit` once it passes `maxFeedbackRounds`. The counter covers the
  item's whole life: only `retry` and `reopen` reset it (`resetBudgets`), so
  rounds already spent on the pull request's own checks and review threads
  count. `config.mjs` sets 12 rounds and `checkWaitMs` of 10 minutes; the
  runbook sets the queue's status check timeout to 120 minutes, the whole
  budget even when no round was spent before. A blocked issue is not
  followed when the queue merges its pull request later (the intake pass
  follows only `PR_READY` items), so it stays BLOCKED until a person retries;
  that retry records MERGED if the queue has merged it, or waits again. Queued
  waits count against the feedback budget, and that stays so. Asked about
  this on 2026-11-18, the owner said the factory "will not be fully central
  to how we are building anymore, it's not irrelevant, it's juts not central"
  and left the choice to the implementer. The budget logic is unchanged: the
  stop fails safe, one retry recovers it, and exempting queued rounds would
  mean changing the work-item state machine for a system that is no longer
  central. The runbook gives the recovery for both the queued and the removed
  case.
- [A queue merge has no receipt for its merge commit] → It closes out as
  MERGED with `merged_by: external`, since factory attribution needs a
  confirmed receipt for the exact merge commit. This also stays so, under the
  same 2026-11-18 ruling: it is a label only (the merge, close-out and issue
  close are correct), and the work item still records that the factory queued
  that head.
- [An enqueue whose outcome is unknown may have queued the pull request] →
  The request is recorded `unknown` and the issue blocks `merge-unconfirmed`;
  later rounds at that head block again and send nothing. Because a direct
  merge is refused while the queue is required, the blocker's recovery (and
  the runbook) says to look at the queue page: leave the record if the pull
  request is there, add it with Merge when ready if it is not, and retry
  only after GitHub reports it merged.
- [A release without this change sends a direct merge while the queue is on]
  → GitHub refuses it and the issue blocks `merge-refused`; it is never
  reported merged. The runbook holds merging until the release is installed.
- [GitHub may report `mergeable_state: blocked` for a pull request whose base
  requires a queue; not documented and not observed here] → Readiness would
  answer PR_READY ("Required human review pending (0/0)") and not enqueue. The
  runbook makes the first queued factory merge the check.
- [With required code-owner review, a queue and a `behind` pull request,
  readiness still asks for review] → Readiness proves a code owner's approval
  only by GitHub's `clean`, because the reviews list does not say who owns the
  code. A `behind` pull request therefore stops at PR_READY ("Required human
  review pending (0/0, code owners)") and a person adds it with Merge when
  ready; it is never enqueued without GitHub's proof. Treating `behind` as
  proof under a queue would rest on undocumented behaviour (whether GitHub
  reports `blocked` before `behind` while a review is missing), and the GraphQL
  `reviewDecision` field ("The current status of this pull request with
  respect to code review") does not say that it covers code owners and would
  need a new read. `develop` requires no code-owner review (read 19 November
  2026: no required approvals, `require_code_owner_reviews` false, no
  rulesets), so under the "Only do what is needed" ruling this stays as built;
  two readiness tests pin it.
- [A queue required only in classic protection is invisible to REST] → The
  direct merge is refused and the issue blocks; the runbook uses a ruleset.
- [The queue merges with its own merge method and message, not the factory's
  `commit_title`] → The runbook sets the ruleset's merge method to merge
  commits, matching the repository setting.

## Migration Plan

1. Merge this change, merge-lane wiring (task 3.1) included, and install it
   as a new pack release (runbook, Updates).
2. The owner turns the queue on with the runbook steps and watches the first
   factory merge. Rollback: the runbook's turn-off steps; with no
   `merge_queue` rule the factory runs today's code paths.
