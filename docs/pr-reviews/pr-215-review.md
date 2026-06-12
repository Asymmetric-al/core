# PR #215 Review - Set up Mission Control Cloud Agent dev environment

- URL: https://github.com/Asymmetric-al/core/pull/215
- Base: `production`
- Head: `cursor/mission-control-cloud-env-0f58`
- Draft: no
- GitHub state at review: `DIRTY`, `REVIEW_REQUIRED`
- Size: 15 changed files, +364 / -42
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: failed.

Conflict:

- `docs/ai/working-set.md`

Tests were not run because the PR does not produce a merged tree against current `production`.

GitHub checks on the PR head were green, but those do not cover the current merge result.

## Verdict

Do not merge until the conflict is resolved and the setup script stops silently overwriting local intent.

## Findings

### P1 - Current branch cannot merge into `production`

Impact: local verification cannot be run on the final merged result.

Suggested fix:

- Rebase or merge current `production`.
- Resolve `docs/ai/working-set.md`.
- Run `bun install --frozen-lockfile && bun run ci:preflight`.

### P2 - Setup script can mutate the lockfile

Evidence: `scripts/dev/setup-mission-control-cloud.mjs` lines 166-169 runs `bun install` without `--frozen-lockfile`.

Impact: an environment setup script can change dependencies during what looks like a dev bootstrap flow.

Suggested fix:

- Use `bun install --frozen-lockfile`.
- If mutation is intentional, require an explicit flag and document it.

### P2 - Setup script forces auth bypass even when explicitly disabled

Evidence: `shouldReplaceEnvValue` around lines 70-73 replaces explicit values and the script forces `E2E_AUTH_BYPASS=true`.

Impact: a developer or cloud agent that intentionally sets `E2E_AUTH_BYPASS=false` can have that safety choice overwritten.

Suggested fix:

- Preserve explicit `false` values by default.
- Add a `--force-bypass` option if this script must override.
- Make the output say when it changes auth-bypass behavior.

### P2 - Test assertion is too weak

Evidence: `tests/unit/scripts/run-with-ci-env.test.ts` line 109 only asserts that output contains `PAYLOAD_SECRET=`.

Impact: the test can pass even if the placeholder value or preservation behavior is wrong.

Suggested fix:

- Assert the exact placeholder line.
- Add a case for preserving an existing explicit value.

### P2 - DocRaptor env changes are outside the PR title

Impact: the branch title implies Mission Control Cloud env only, but it also adjusts DocRaptor-related env handling.

Suggested fix:

- Update the PR body/title to call out DocRaptor, or split it.

## Required Before Merge

- Resolve conflict.
- Make dependency install frozen by default.
- Preserve explicit auth-bypass choices.
- Strengthen env-placeholder tests.
- Run the full preflight.
