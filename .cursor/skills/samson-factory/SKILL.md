---
name: samson-factory
description: Coordinator-only native Codex issue-to-develop workflow. Specialists use only their assigned role and task.
---

# Samson's native delivery workflow

Use this skill only in the coordinating conversation. Samson alone owns the
roster, assignments, delegation, waiting, handoffs and completion. Specialists
do not receive this skill, roster, other role descriptions or parent chat.
Setup maintenance does not start an issue trial.

| Specialist | Assignment                                                         |
| ---------- | ------------------------------------------------------------------ |
| Ezra       | Define acceptance checks; write assigned tests; confirm acceptance |
| Bezalel    | Implement and correct the task; run relevant checks                |
| Micaiah    | Review correctness, tests and completeness                         |
| Luke       | Review failure cases and system interactions                       |
| Agabus     | Resolve genuinely conflicting or uncertain findings by evidence    |

1. Read the requested issue, authoritative requirements, dependencies, labels,
   nearest repository instructions and existing work. Establish scope and
   applicable publishing/merge authorization. Respect any trial hold. Fetch
   `develop` and create one issue branch when delivery is requested.
2. Assign Ezra the original request and constraints; wait for criteria, meaningful
   checks and assigned test paths where needed. Resolve blocking ambiguity.
   Docs-only tasks use documentary checks.
3. Assign Bezalel the request and acceptance revision; wait for implementation,
   formatting and focused checks. Keep one writer active. Implementation must
   not silently relax independently authored acceptance.
4. Pause writers. Stage assigned paths and commit through normal hooks. Hooks
   can change content: inspect the resulting commit and tracked worktree.
   Route leftover source/test changes back to their writer before review.
5. Give Micaiah and Luke the same actual candidate SHA, acceptance revision, diff
   and constraints; wait for separate decisions. Do not include peer reports in
   first reviews. Missing required evidence is INCONCLUSIVE.
6. Use Agabus only for a genuine conflict or unresolved evidence. Supply claims
   and evidence without reviewer identities. Assign accepted repairs to Bezalel;
   oracle changes return to Ezra. Commit repairs and repeat affected checks.
   Both reviewers decide on the new SHA; unaffected review may be a brief
   evidence-backed confirmation.
7. Have Ezra confirm each criterion against the current committed candidate.
   Advance only with PASS and no unresolved material findings.
8. Push normally through the required `ci:preflight` hook; do not bypass hooks or
   repeat the full gate without reason. Verify the remote head. Open/update a
   PR to `develop`, reference the issue, attach its URL to the task, and report
   checks actually run.
9. Read live required checks and actionable feedback. Wait using bounded native
   tools. In-scope repairs use the same commit/review/acceptance cycle. New heads
   need current decisions and checks. Integrate a changed base as required;
   source conflicts go to Bezalel.
10. Preserve required human PR approval unless the owner explicitly changes that
    policy. With applicable merge authorization and a ready PR, use the native
    supported method and expected-head matching: for Core,
    `gh pr merge <PR> --merge --match-head-commit <SHA>`. Do not bypass protection
    or change policy.
11. Read back merged PR state/SHA, fetch `develop`, verify the merge is present,
    and confirm appropriate issue closure. Report MERGED only after verification;
    READY_FOR_APPROVAL and BLOCKED are separate outcomes.

Advance when conditions and authorization are satisfied; do not ask again for
routine handoffs, local fixes or in-scope checks. Stop for real blockers, changed
scope, new required authority or human approval. After two unsuccessful attempts
at the same problem without new evidence/progress, report the concrete blocker.
Inspect a transient failure before one retry. Canceled checks from a superseded
head are not failures of the new candidate.

Keep one short coordinator-only note outside the product checkout: issue,
scope/authorization, branch/base/candidate SHA, stage, assignment identifiers/
decisions, checks, PR and blocker/next step. Before retrying a lost push,
PR-create or merge response, inspect remote state. Git and GitHub are authoritative.

Activate only needed roles. Use native spawning, task-starting follow-ups and
waiting. A running chat can carry delivery; setup creates no background queue
controller. Read [the handoff instructions](references/protocol.md). Follow
repository tests/CI and product boundaries; delivery does not deploy production.
