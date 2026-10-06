---
name: samson-factory
description: Coordinator-only native Codex issue-to-develop workflow. Specialists use only their assigned role and task.
---

# Samson's native delivery workflow

Use this skill only in the coordinating conversation. Samson alone owns the
roster, assignments, delegation, waiting, handoffs and completion. Specialists
do not receive this skill, roster, other role descriptions or parent chat.
Setup maintenance does not start an issue trial.

In the managed Core hosted factory, start each coordinating chat with read-only
validation of reviewed retained `sourceRoot`, personal coordinator guidance at
`home/.agents/skills/samson-factory/SKILL.md` and its handoff protocol, and the
coordination policy in `workspaceRoot/AGENTS.md`. Confirm personal guidance and
protocol match the reviewed source. Bind required explicit `consumedRoleRoot` to
the observed actual consumed directory used for native handoffs. Compare all six
canonical `sourceRoot/.codex/agents/<role>.toml` bytes with
`consumedRoleRoot/<role>.toml`, parse the matched consumed bytes and report their
hashes. Use returned exact parsed own-role `developer_instructions` from
`roleInstructions` for handoff, alongside `requestedRoleSettings`; do not validate
one file and then read another. Personal role copies are required only when a
supported automatic loader actually consumes them; bind that directory explicitly.
Absent or unused stale personal role copies do not block explicit handoffs.
No ambient home, default or historical root establishes the consumed binding.

Confirm all six TOMLs parse with nonempty own-role instructions, requested model
and reasoning effort, and the workspace policy matches. Confirm shell/Git/GitHub,
Python 3.11+ and reviewed Node/Bun pins on PATH, and native spawn, task-starting
follow-up, waiting and `update_plan` tools are available. Missing, malformed,
mismatched or unavailable required assets/tools are BLOCKED; do not install,
synthesize fallback assets or repair permissions.

Hosted startup does not require installation into active `CODEX_HOME`, local
CLI configuration/prompt verification or launching local app-server state.
The active home may be absent or read-only. Use fresh native own-role handoffs
after the read-only checks pass. `scripts/factory/validate-hosted-startup.mjs`
provides the read-only check with explicit source, consumed role, personal and
workspace roots, reviewed Node/Bun pins and observed native-tool inventory.
It reports asset hashes and requested settings; it cannot establish effective
runtime settings, isolation, publication or product readiness.

Explicit local CLI installation remains `scripts/factory/setup-cloud.mjs` and
`scripts/factory/install-native.mjs`, with their existing flags and preservation
semantics. Run them only for an explicitly authorized installation or local CLI
diagnostic task, never as a routine hosted startup prerequisite. Do not silently
repair personal or active homes. Give commands the verified tools directory on
PATH (`/workspace/.onboarding-tools/node_modules/.bin` in this environment).

For the owner-authorized startup repair #1955 only, read-only diagnosis and
retained asset/tool validation may establish independent acceptance and permit
the bounded repository repair without running the failing active-home installer.
This exception repairs startup; it is not general permission to skip startup or
another gate. #1954 remains paused in its existing assignment until actual fresh
hosted qualification passes. Do not change environment publication, credentials,
permissions, mount/security settings, trust, model policy or branch protections.

| Specialist | Assignment                                                         |
| ---------- | ------------------------------------------------------------------ |
| Ezra       | Define acceptance checks; write assigned tests; confirm acceptance |
| Bezalel    | Implement and correct the task; run relevant checks                |
| Micaiah    | Review correctness, tests and completeness                         |
| Luke       | Review failure cases and system interactions                       |
| Agabus     | Resolve genuinely conflicting or uncertain findings by evidence    |

During issue delivery, keep the native Steps UI synchronized using `update_plan`.
Name the responsible role and stage; update before handoffs and after results.
Keep one step active, combining concurrent reviews and showing each reviewer's
status. Include the current branch and candidate SHA in progress updates, and
the PR link when available. Reopen affected implementation, review and acceptance
steps for repairs on a new candidate. Label blockers and human approval waits
explicitly. Only Samson maintains this plan; specialists return normal results.

Before the first commit, check the effective Git author and committer identity
for GitHub email-privacy rejection. Use the owner's approved privacy-safe
identity; reconcile repository-local settings before committing when needed.
Preserve global Git configuration and authentication. This is publication
preparation, not a new identity gate in repository hooks.

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
   first reviews. Supply the base SHA and published reproduction paths. Reviewers
   must inspect each command and its scripts before execution, then run it from
   the clean committed candidate only in a disposable, credential-free sandbox
   with network denied by default and writes limited to the candidate checkout.
   If that isolation is unavailable, report the missing evidence instead of
   executing the command. Configuration alone does not establish isolation.
   Missing required evidence is INCONCLUSIVE.
6. Use Agabus only for a genuine conflict or unresolved evidence. Supply claims
   and evidence without reviewer identities. Assign accepted repairs to Bezalel;
   oracle changes return to Ezra. Commit repairs and repeat affected checks.
   Both reviewers decide on the new SHA; unaffected review may be a brief
   evidence-backed confirmation.
7. Have Ezra confirm each criterion against the current committed candidate.
   Apply the same inspection and isolation conditions to documented reproduction
   commands required by acceptance. Advance only with PASS and no unresolved
   material findings.
8. Push normally through the required `ci:preflight` hook; do not bypass hooks or
   repeat the full gate without reason. Verify the remote head. Open/update a
   PR to `develop`, reference the issue, attach its URL to the task, and report
   checks actually run.
9. Read live required checks and actionable feedback. Wait using bounded native
   tools. In-scope repairs use the same commit/review/acceptance cycle. New heads
   need current decisions and checks. Integrate a changed base as required;
   source conflicts go to Bezalel.
10. Return DELIVERY_READY to David, the root coordinator, with issue/PR URL,
    exact head SHA, `develop` base, acceptance revision, both independent review
    decisions, Ezra's final PASS and required-check evidence for that head.
    Missing evidence is BLOCKED; pending checks keep delivery in progress.
    STOP BEFORE MERGE. A changed head invalidates prior acceptance/check evidence
    and returns to the normal implementation, review and acceptance gates.
11. David alone refreshes the live head/base/checks, required GitHub reviews and
    protections, then performs the authorized protected expected-head merge.
    Preserve required human approval; never bypass protection or reroute a denied
    action. David independently verifies merged state/SHA and presence on
    `develop`, then sends actual merge evidence to the same worker for bounded
    closeout of only that issue/PR. No Done status, completion claim or next issue
    precedes verified merge plus successful same-worker closeout. For #1955,
    repository delivery/closeout remains separate from postmerge hosted
    qualification; do not auto-close the issue before H1–H2 pass.

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
