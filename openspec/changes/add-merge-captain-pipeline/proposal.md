# Proposal: Autonomous PR-to-merge pipeline (Merge Captain)

## Why

PRs targeting `develop` already get a full machine review — `ci-gate`, `integration-gate`,
Greptile, Cursor Bugbot, and Cursor Security Reviewer all run, and the PR Signal Coordinator
reconciles their state into `automation:*` labels ending in `automation:pr-intake-ready`. But
nothing acts on that state: no agent fixes findings, resolves threads, closes test gaps, or
merges. PRs accumulate fully reviewed and stuck (13 open into `develop` at time of writing).

The team is a non-technical founder plus AI agents, with no production users yet. `develop` is the
integration branch where UI/UX is exercised. The desired posture is **no human approval gate**:
PRs should merge automatically once tests pass, with the human only **notified after** a merge and
able to **audit** any PR that had higher-severity findings.

This change introduces **Merge Captain**, a model-agnostic orchestration command that an operator
starts on demand (via `/loop`, a Claude Code cloud session, or a routine) to carry every open
`develop` PR to merge or explicit escalation. It also removes the now-obsolete human-gate plumbing
and tunes the review surface for signal over noise.

## What Changes

- **Add** `.claude/commands/merge-captain.md`: the autonomous shepherding loop (queue from
  `automation:pr-intake-ready`; strict priority order CI → stale/conflict → triaged findings →
  test-gap → finalize; Fix / Dismiss-with-reason / Escalate triage; mandatory test-gap pass;
  plain-English Merge Report; hard iteration/push caps; auto-merge as the only terminal action).
- **Remove the human gate on `develop`** (GitHub state, applied out-of-band by the maintainer):
  drop the required pull-request review while keeping required status checks (`ci-gate`,
  `integration-gate`), `enforce_admins`, and strict up-to-date branches; enable repo auto-merge.
- **Delete** `.github/workflows/codex-review-notify-code-owner.yml` (it requests a human code-owner
  review that no longer exists in the flow) and `.github/reviewers.yml` (orphaned reviewer-routing
  roster whose in-repo consumer was already removed; reviewer routing is moot with no human gate).
- **Add** automation labels `needs-human`, `captain:merged-clean`, `captain:merged-with-findings`
  for escalation and post-merge audit.
- **Add** a "Review guidelines" section to `AGENTS.md` so Codex and other bots rate severity
  (P0/P1 must-fix vs. nit) in line with repo priorities, reducing review noise.
- **Add** `docs/guides/development/merge-captain-pipeline.md`: the end-to-end human-readable
  runbook (every stage, the GitHub settings, how to start the loop locally or in the cloud, how to
  read merge notifications, and how to reverse each change).

## What Does Not Change

- The PR Signal Coordinator and its `automation:*` labels remain the source of signal state; Merge
  Captain reads them and never writes them.
- Greptile → Codex chaining (`greptile-trigger-codex-review.yml`) stays.
- Merge style stays **merge commits** (squash/rebase remain disabled at the repo level); PR
  authorship stays human-driven with multiple commits per PR.
- Required CI gates (`ci-gate`, `integration-gate`) and the `develop` → `production` release path
  (`scripts/release/production.mjs`, release-source gate) are unchanged.
- No new merge gate is _required_ yet; promoting browser/e2e suites to required checks is staged
  separately after burn-in.

## Risks & Mitigations

- **No human pre-merge review.** Mitigated by: required CI gates stay enforced (incl. admins);
  the mandatory test-gap pass; auto-merge (GitHub, not the agent, performs the merge); hard
  iteration caps; `needs-human` escalation; post-merge Merge Report + audit labels. Reversible in
  one API call (re-add the required review).
- **Review noise burying real findings.** Mitigated by the severity contract + AGENTS.md review
  guidelines + Greptile threshold tuning + paring the Cursor lens battery (operator-side).
- **Premature auto-merge before bots finish.** Mitigated by sequencing: Merge Captain only arms
  auto-merge after triaging all MUST-tier findings; bot checks are not required checks, so the
  discipline lives in the command, with a future option to add a severity-gate required check.
