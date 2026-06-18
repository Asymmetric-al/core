# Delta for PR Merge Pipeline

## ADDED Requirements

### Requirement: PRs Into `develop` Merge Without A Human Approval Gate

The repository MUST allow pull requests targeting `develop` to merge based solely on
GitHub-enforced required status checks, with no required human review, while keeping merge safety
in the GitHub platform rather than in agent prompts.

#### Scenario: A PR satisfies the required checks

- WHEN a non-draft PR into `develop` has `ci-gate` and `integration-gate` passing and is current
  with `develop`
- THEN it is eligible to merge via GitHub auto-merge without any human approval
- AND the required status checks, `enforce_admins`, and strict up-to-date enforcement remain in
  effect for every actor, including admins and automation

#### Scenario: Required checks are not yet green

- WHEN any required check is failing or pending
- THEN GitHub MUST NOT merge the PR even though auto-merge is armed and no review is required

### Requirement: An Autonomous Orchestrator Shepherds Reviewed PRs To Merge

The repository MUST provide a model-agnostic command that carries each open `develop` PR from
machine-reviewed to merged or explicitly escalated, runnable on demand by an operator (local loop,
cloud session, or routine).

#### Scenario: A reviewed PR is processed

- WHEN the five machine signals (`ci-gate`, `integration-gate`, Greptile, Cursor Bugbot, Cursor
  Security Reviewer) have settled on a non-draft `develop` PR
- THEN the orchestrator works it in strict priority order: fix red required CI, update a stale or
  conflicted branch, triage review findings, close test gaps, then arm auto-merge
- AND its only terminal merge action is enabling GitHub auto-merge, never a direct or admin merge

#### Scenario: A finding or failure cannot be resolved autonomously

- WHEN a finding is architectural, ambiguous, or security-sensitive, OR a real merge conflict
  exists, OR the same failure recurs after a fix, OR the per-PR iteration/push caps are reached
- THEN the orchestrator applies the `needs-human` label, comments what decision is needed, and
  stops working that PR
- AND escalation is treated as a normal outcome, not a failure

### Requirement: Review Findings Are Triaged Against A Severity Contract

The orchestrator MUST triage every unresolved bot finding into fix, dismiss-with-written-reason, or
escalate, treating high-severity findings as must-fix-or-rebut and lower-severity findings as
batchable, so that genuine findings are not buried by review noise.

#### Scenario: A high-severity finding is present

- WHEN a Codex P0/P1, an above-threshold Greptile finding, or any Cursor Bugbot or Security
  Reviewer finding exists
- THEN it MUST be fixed or rebutted on-thread with written reasoning before auto-merge is armed

#### Scenario: A low-severity nit is present

- WHEN a finding is style, naming, formatting, or a verbose review-lens essay
- THEN it MAY be noted in the Merge Report and not individually addressed, and MUST NOT block merge

### Requirement: Untested New Behavior Gets Test Coverage Before Merge

Because no human reviews the diff, the orchestrator MUST run a test-gap pass on each PR and ensure
new or changed behavior is covered by automated tests, without weakening existing tests.

#### Scenario: New behavior lacks a test

- WHEN a PR adds or changes behavior (a route, handler, calculation, state transition, or bug fix)
  with no corresponding test
- THEN the orchestrator adds a proportionate unit test in the same PR, OR opens a tracked
  follow-up issue when the gap is too large to close inline, and records this in the Merge Report
- AND it MUST NOT weaken assertions, skip tests, or write trivial always-pass tests to manufacture
  coverage

### Requirement: Merges Are Reported And Auditable Post-Merge

The orchestrator MUST post a plain-English Merge Report and apply an outcome label so a
non-technical operator can be notified and audit merges after the fact.

#### Scenario: A PR is merged by the pipeline

- WHEN the orchestrator arms auto-merge on a PR
- THEN it first posts a Merge Report stating what the PR does, its risk tier, findings fixed and
  dismissed-with-reason, and the tests that prove it works
- AND it applies `captain:merged-with-findings` if any high-severity finding was fixed or
  dismissed, otherwise `captain:merged-clean`
