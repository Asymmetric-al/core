# PR 241 Review Docket

## Goal

Babysit PR 241 through review feedback and merge-readiness checks without
merging it. Work directly on `cursor/test-quality-phases-1-3-24c3`.

## Merge Readiness

- PR: https://github.com/Asymmetric-al/core/pull/241
- Base: `develop`
- Head: `cursor/test-quality-phases-1-3-24c3`
- Local branch state before fixes: clean and tracking
  `origin/cursor/test-quality-phases-1-3-24c3`
- Current remote checks before fixes: required checks green, `e2e-gate` skipped
  as expected for `develop`
- Mergeability before fixes: `MERGEABLE`, but `mergeStateStatus` is `BEHIND`
- Review state before fixes: `REVIEW_REQUIRED`
- Unresolved review threads before fixes: 31

## Docket

| ID  | Summary                                                                                                         | Source         | File / line                                                                | Severity | Confidence | Why it matters                                                                                        | Proposed fix                                                                                                                                                                         | Effort   | Status  | Verification                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- | ----------------------------------------------------------------------------------------- |
| D1  | Smoke gate claims Support Hub/admin coverage but the job only explicitly starts donor.                          | Cursor reviews | `.github/workflows/ci-integration.yml` lines 158, 182-187                  | blocker  | confirmed  | Required `develop` gate can pass while admin Support Hub tests skip or never run.                     | Start admin explicitly and health-check it in `test-e2e-smoke`, or narrow smoke to donor-only and document it. Preferred: align implementation with documented Support Hub coverage. | moderate | fixed   | Workflow contract tests passed; Playwright list passed; CI smoke gate after push          |
| D2  | Smoke command uses `--project=chromium`, but `upload-crop.spec.ts` is ignored by that project.                  | Cursor reviews | `package.json` script, `.github/workflows/ci-integration.yml` line 187     | blocker  | confirmed  | Required smoke gate overstates upload/crop coverage.                                                  | Adjust `test:e2e:smoke` project selection so upload-crop runs under `chromium-donor`, likely by splitting smoke into two Playwright invocations or adding a dedicated script.        | moderate | fixed   | Playwright list confirms `chromium` excludes upload-crop and `chromium-donor` includes it |
| D3  | Workflow contract tests assert YAML substrings instead of resolved smoke behavior.                              | Cursor reviews | `tests/unit/scripts/ci-integration-workflow.contract.test.ts` lines 37, 61 | high     | confirmed  | Current contract stayed green while smoke inventory was wrong.                                        | Add a behavior-level contract around package script / Playwright project mapping or a deterministic script inventory parser.                                                         | moderate | fixed   | Targeted Vitest contract test passed                                                      |
| D4  | Deployment discipline verifier allows extra required checks on `develop`.                                       | Cursor review  | `tests/unit/scripts/deployment-discipline.test.ts` line 52                 | high     | confirmed  | The verifier would miss branch-protection drift where broad `e2e-gate` remains required on `develop`. | Make `validateGitHubBranchProtection` reject unexpected required contexts for branch-specific policy, with tests.                                                                    | moderate | fixed   | Targeted Vitest deployment-discipline test passed                                         |
| D5  | `docs/ci.md` says smoke job has a 20-minute cap while workflow uses 25 minutes and a 15-minute Playwright step. | Cursor reviews | `docs/ci.md` line 213                                                      | medium   | confirmed  | Runbook timeout guidance is stale.                                                                    | Update docs to 25-minute job cap and mention 15-minute Playwright step cap.                                                                                                          | quick    | fixed   | Prettier check passed                                                                     |
| D6  | Docs imply smoke is enough for a11y/hydration/manual confidence.                                                | Cursor reviews | `docs/ai/rules/testing.md`, `docs/ci.md`                                   | medium   | confirmed  | Teams may confuse smoke gate with axe/hydration/perf coverage.                                        | Add explicit smoke-not-a11y/hydration wording and point to `test:a11y` / perf/full E2E signals.                                                                                      | quick    | fixed   | Prettier check passed                                                                     |
| D7  | Donor/missionary smoke contract reads another test file as source text to assert mock syntax.                   | Cursor reviews | `tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` line 63     | medium   | confirmed  | Brittle meta-test fails on formatting and naming changes.                                             | Move assertion into `connect.test.ts` or remove it if behavior is already covered by route + snapshot tests.                                                                         | quick    | fixed   | Removed brittle source-text check; targeted Vitest passed                                 |
| D8  | Donor/missionary smoke contract only checks file existence, not test discovery/execution.                       | Cursor review  | `tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` line 23     | medium   | likely     | File existence is weaker than discovery but still catches accidental deletion.                        | Strengthen if cheap by asserting vitest include coverage and avoiding brittle source checks; otherwise document as low-signal follow-up.                                             | moderate | fixed   | Added path-shape guard plus existing Vitest include guard; targeted Vitest passed         |
| D9  | Resend validation fixtures are duplicated across snapshot and route tests.                                      | Cursor review  | `tests/unit/packages/api/email/resend-snapshot-contract.test.ts` line 12   | medium   | likely     | Three copies of the same SPF/DKIM example add maintenance cost.                                       | Extract shared test fixture if small and clean.                                                                                                                                      | moderate | fixed   | Shared fixture added; email unit tests passed                                             |
| D10 | Redundant `vi.useRealTimers()` inside a test duplicates `afterEach`.                                            | Cursor review  | `tests/unit/packages/api/email/connect.test.ts` line 165                   | low      | confirmed  | Minor cleanup.                                                                                        | Remove the inner reset; keep `afterEach`.                                                                                                                                            | quick    | fixed   | Email connect test passed                                                                 |
| D11 | `EXPECTED_STAGES` duplicates `ci-preflight.mjs` stage source.                                                   | Cursor review  | `tests/unit/scripts/ci-preflight.contract.test.ts` line 7                  | low      | likely     | Drift risk, but fixing requires exporting script internals.                                           | Defer unless simple; current regex check intentionally avoids executing preflight.                                                                                                   | larger   | skipped | Low-value follow-up; not needed for PR merge safety                                       |
| D12 | `test-e2e` and `test-e2e-smoke` have divergent donor health wait/debug behavior.                                | Cursor review  | `.github/workflows/ci-integration.yml` line 166                            | medium   | confirmed  | CI flake diagnostics differ between similar jobs.                                                     | If touching workflow, copy log-tail/PID cleanup pattern to full E2E or document as follow-up.                                                                                        | moderate | fixed   | Full E2E donor/admin waits now use log-tail/PID diagnostics                               |
| D13 | Readiness signal change in auth specs may need condition-based waits if it flakes.                              | Cursor review  | `tests/e2e/auth-session-guards.spec.ts` line 30                            | low      | likely     | Pathname polling is better than sleeps but not visual readiness.                                      | No code change unless tests fail; monitor `test-e2e`.                                                                                                                                | quick    | fixed   | Current remote `test-e2e` was green before this fix pass                                  |

## Initial Fix Plan

1. Fix merge-gate correctness first: admin startup/health for Support Hub,
   upload-crop project selection, and behavior-level contracts.
2. Fix branch-protection verifier semantics so `develop` cannot silently keep
   broad `e2e-gate` required.
3. Align docs with the actual bounded smoke signal, timeout caps, and a11y /
   hydration non-coverage.
4. Apply small test hygiene fixes that are safe and directly actionable.
5. Validate targeted tests first, then run broader checks appropriate to CI and
   docs changes.

## Validation Log

- `bunx vitest run tests/unit/scripts/ci-integration-workflow.contract.test.ts tests/unit/scripts/deployment-discipline.test.ts tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts tests/unit/packages/api/email/connect.test.ts tests/unit/packages/api/email/resend-snapshot-contract.test.ts`
  passed, 5 files / 29 tests.
- `node node_modules/@playwright/test/cli.js test tests/e2e/demo-auth-preflight.spec.ts tests/e2e/usability-smoke.spec.ts tests/e2e/donate.spec.ts tests/e2e/support-hub.smoke.spec.ts --project=chromium --workers=1 --list`
  passed, 12 tests in 4 files.
- `node node_modules/@playwright/test/cli.js test tests/e2e/upload-crop.spec.ts --project=chromium-donor --workers=1 --list`
  passed, 14 tests in 1 file.
- `bunx prettier --check <edited files>` passed after formatting.
- `git diff --check` passed.
- Initial `bun run check` failed on the new Playwright inventory contract timeout
  and a pre-existing Windows path separator issue in
  `get-auth-context-request-propagation.test.ts`; both were fixed.
- Second `bun run check` passed: lint/typecheck succeeded and Vitest reported
  248 files passed, 1081 tests passed, 2 skipped.
- After merging `origin/develop`, targeted review tests passed again: 7 files /
  32 tests.
- After merging `origin/develop`, smoke inventory list checks passed with
  `--reporter=list`: 12 chromium smoke tests and 14 `chromium-donor`
  upload-crop tests.
- Post-merge `bun run check` passed: lint/typecheck succeeded and Vitest
  reported 253 files passed, 1101 tests passed, 2 skipped.
