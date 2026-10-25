# Issue #2277 — runtime acceptance checklist (not automated)

Spec: [final spec r1](https://github.com/Asymmetric-al/core/issues/2277#issuecomment-6386065652) (approved with all defaults), plus addendum 1 (separate ~1k test budget).

## Opt-in checks to run on the PR head

- [ ] Criteria 9 (edited files), 10 and 13: `ACCEPTANCE_2277_SCOPE=1 bunx vitest run tests/unit/acceptance/issue-2277` (or `ACCEPTANCE_2277_BASE=<merge-base>`).
- [ ] Criterion 15: `gh pr view <n> -R Asymmetric-al/core --json body --jq .body > /tmp/2277-body.md`, then `ACCEPTANCE_2277_PR_BODY_FILE=/tmp/2277-body.md bunx vitest run tests/unit/acceptance/issue-2277`.

## CI (criteria 10, 12, 14)

- [ ] `tests/unit/scripts/production-release.test.ts`, `production-source.test.ts`, `attribution-retirement.contract.test.ts` and `pre-push-guard.test.ts` pass unchanged.
- [ ] `tests/unit/acceptance/issue-2154/**`, `issue-2183/**`, `issue-2180/**` and `tests/unit/docs/openspec-modernization.test.ts` pass unchanged.
- [ ] `bun run test:unit` and `bun run ci:preflight` pass on the PR head.

## Post-merge (OQ3 maintainer)

- [ ] P1: `gh api repos/Asymmetric-al/core/labels/release-blocker --jq '.name,.color,.description'` prints `release-blocker`, `b60205` and the §2.4 description.
- [ ] P2: #2273 carries `release-blocker` and its "release block" paragraph is a one-line pointer to the label.
- [ ] P3: `bun run release:production -- --dry-run` from a clean `develop` refuses at pre-flight, lists #2273 and never reaches the preflight or the push.
