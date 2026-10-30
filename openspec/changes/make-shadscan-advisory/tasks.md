# Tasks

## 1. Authority

- [ ] 1.1 Record the owner's ratification of this proposal, with date and scope, in `proposal.md` under Authority; verify the ruling names this change ID and the superseded 2026-10-04 score targets
- [ ] 1.2 Amend `modernize-shadscan-readiness` per design D7 (withdraw four requirements, move tasks 5.2/5.5/5.7/5.8 to a dated superseded section, add history notes); verify `bun run openspec:validate` and `bun run verify:openspec-deltas` pass

## 2. Retire the blocking gate

- [ ] 2.1 Write failing tests for `scripts/shadscan-audit.mjs`: a valid low-score report exits 0; invalid JSON, schema mismatch, version mismatch and timeout exit non-zero; the scanner environment omits `GH_TOKEN`, `GITHUB_TOKEN` and `NODE_OPTIONS`; an undiscovered app is reported as "not discovered". Then implement per design D2 and verify the new test file passes
- [ ] 2.2 Rewrite `tests/unit/scripts/shadscan-publish.test.ts` red-first for the simplified summary (no floors or classification columns, marker comment updated in place, unavailable-evidence text); move the publish and summary scripts beside the audit script; verify the test passes
- [ ] 2.3 Rename `verify:shadscan` to `shadscan:audit` in root `package.json`; remove the scan from `.husky/pre-commit` and from `scripts/verify/ci-preflight.mjs`, updating any test that pins the preflight step list; verify `git grep -n -i shadscan -- .husky scripts/verify/ci-preflight.mjs` is empty and the preflight tests pass
- [ ] 2.4 Move the scan into `.github/workflows/shadscan.yml` (install, audit with a 10-minute limit, publish; unavailable-evidence message on failure) and delete both Shadscan steps from the `integrity` job in `ci.yml`, leaving `ci-gate` needs unchanged; verify on the PR run that `integrity` has no Shadscan step and `shadscan-report` updates its comment
- [ ] 2.5 Delete `tooling/shadscan/`, `scripts/verify/shadscan-policy.mjs` and the `shadscan-ledger`, `shadscan-policy`, `shadscan-perfect-score` and `shadscan-staged` tests; verify `git grep -n -E "tooling/shadscan|shadscan-policy|findings\.json"` only hits dated history documents, and the full unit suite passes (`bun run test:unit`)
- [ ] 2.6 Verify retention: `git diff --stat develop -- tests/unit/apps tests/unit/packages tests/fixtures/base-ui-compliance` shows no change to behavior, browser or axe proof tests, and those suites pass
- [ ] 2.7 Rewrite `docs/guides/development/shadscan.md` as an advisory guide (reading the report, triage rules, `bun run shadscan:audit`, MCP use, known static-analysis limits); update `docs/ci.md`, `CONTRIBUTING.md`, `README.md` and `docs/ai/rules/frontend.md`; verify `bun run format:check` passes and every documented command runs as written

## 3. Accessibility lint

- [ ] 3.1 Write a failing config test proving that the Next and non-Next first-party UI entry points both enable all `jsx-a11y` recommended rules at error level, under one plugin namespace with no redefinition error, and with the shared-component mapping present; implement per design D4–D5 with exact `eslint-plugin-jsx-a11y@6.10.2` in `@asym/eslint-config`; verify the test passes and `bun.lock` gains no new package version
- [ ] 3.2 Add failing lint fixtures: a click handler on a non-interactive element, an image without alternative text, and a mapped shared component evaluated as its native element. Verify each fixture reports the expected rule through the real lint entry point
- [ ] 3.3 Run the enabled rules over the full first-party scope and commit `a11y-inventory.md` in this change directory, with counts per rule and file and the source commit SHA; verify the file exists and its totals match a re-run
- [ ] 3.4 Repair real violations at their owning component, adding focused behavior tests wherever a repair changes behavior. Use rule-named `-- reason` inline disables only for static false positives. Verify the affected tests and `bun run lint` pass
- [ ] 3.5 If residual debt remains, write failing tests first: `validateSuppressions` accepts `jsx-a11y/*` but still rejects unrelated rules and non-first-party paths. Then widen it, record the residual with native `--suppress-rule`, and open a tracked issue listing it. Verify lint passes, that adding one more violation to a suppressed file fails, and that an unpruned suppression fails
- [ ] 3.6 Document the accessibility lint scope, the component mapping, the Base UI `render` limitation and the suppression policy in the shared-UI guidance referenced by `docs/ai/rules/frontend.md`; verify `bun run format:check` passes

## 4. Integration verification

- [ ] 4.1 Run `bun run check`, `bun run openspec -- validate make-shadscan-advisory --strict` and `bun run verify:openspec-deltas`; verify all pass, recording any Windows-only baseline failures against `develop`
- [ ] 4.2 Run the branch's `.husky/pre-commit` file directly on Windows against a staged change; verify it completes without scanning, and record the duration (worktree commits run the main checkout's hook, so do not cite a worktree commit as evidence)
- [ ] 4.3 Verify on the PR's exact head that every required check passes without a Shadscan step, the `shadscan-report` job posts or updates its single comment with per-app and per-category scores, and lint enforces the new rules; record the run URLs on the PR

## Workflow follow-up

- Archive this change only after it merges, along with the amended `modernize-shadscan-readiness`, so the merged `ui-quality-audits` capability contains no contradictory requirements.
