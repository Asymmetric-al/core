# PR Management Pipeline Cleanup Report

- Date: 2026-06-23
- Branch: `cleanup/remove-pr-management-pipeline`
- Scope: remove the automated PR-management pipeline while preserving CI gates
  and the 12 advisory Cursor review bots.

## Files Deleted

- `.github/workflows/auto-merge.yml`
- `.github/workflows/autofix.yml`
- `.github/workflows/release-source.yml`
- `.github/workflows/nia-source-check.yml`
- `.github/workflows/pr-signal-coordinator.yml`
- `scripts/github/merge-coordinator.mjs`
- `scripts/github/autofix-guard.mjs`
- `scripts/github/pr-signal-coordinator.mjs`
- `scripts/nia-source-check.sh`
- `scripts/nia_pick_core_source.py`
- `tests/unit/scripts/merge-coordinator.test.ts`
- `tests/unit/scripts/pr-signal-coordinator.test.ts`
- `tests/unit/scripts/test_nia_source_check.py`
- `tests/unit/scripts/test_nia_pick_core_source.py`
- `docs/ai/pr-pipeline-bots/RERUN-AND-ACTIVATION.md`
- `docs/ai/pr-management-pipeline-plan.md`
- `docs/ai/pr-pipeline-build.md`
- `docs/ops/pr-agent-contextualized-codex-prompt.md`
- `CODEX-DIAGNOSTIC-pr-pipeline.md`
- `CODEX-HANDOFF-251-split.md`

`scripts/github/` was removed after its coordinator scripts were deleted.

## Files Scrubbed

- `AGENTS.md`
- `docs/ai/nia.md`
- `docs/ai/pr-pipeline-bots/ALL-BOT-PROMPTS.md`
- `docs/ai/pr-pipeline-bots/README.md`
- `docs/ai/pr-pipeline-bots/bot-final-merge-gate.md`
- `docs/ai/pr-pipeline-bots/bot-minimal-safe-fix-planner.md`
- `docs/ai/pr-pipeline-bots/bot-systematic-bug-correctness.md`
- `docs/ai/rules/general.md`
- `docs/ci.md`
- `docs/ops/deployment-reports/production-deployment-completion-audit.md`
- `docs/pr-reviews/pr-212-review.md`

The 12 Cursor review bots remain documented as advisory reviewers. References to
the merge coordinator, autofix workflow, release-source gate, Nia source-check
workflow, automation labels, `needs-human`, coordinator-driven rerun tiers, and
fix-plan marker consumption were removed from live instructions.

## Branch Protection

Final `gh api` verification:

- `production` required checks: `ci-gate`, `integration-gate`, `e2e-gate`
- `develop` required checks: `ci-gate`, `integration-gate`

No GitHub write was needed during this cleanup run because production branch
protection already no longer included `release-source-gate` when verified.

## Repository Auto-Merge Setting

After Blake requested it, GitHub repository "Allow auto-merge" was disabled with
`gh api -X PATCH repos/Asymmetric-al/core -F allow_auto_merge=false`.

Final `gh api repos/Asymmetric-al/core` verification reports
`allow_auto_merge: false`.

## Manual Follow-Ups Left For Blake

- Delete the `automation:*`, `needs-human`, and `automation:auto-escalated`
  labels from the repository and from open PRs/issues if they should disappear
  from GitHub state.
- Review the `PIPELINE_PAT` and `CURSOR_API_KEY` secrets and remove or rotate
  them if no remaining workflow or manual process needs them.

## Verification

- Exact live-reference search: passed, excluding this historical cleanup report.
- Deleted-path search: passed, excluding this historical cleanup report.
- `bun run lint`: passed.
- `bun run typecheck`: passed.
- `bun run test:unit`: passed, 329 files and 1,639 tests passing with 1 skipped.
- `bun run check`: passed after formatting.
- `bun run format:check`: passed after formatting the edited Markdown files.
