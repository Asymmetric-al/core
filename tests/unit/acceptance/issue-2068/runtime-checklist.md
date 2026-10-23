# Issue #2068 — runtime acceptance checklist (not automated)

Spec: [rev 1 comment](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555) (approved with D1a and D2a in [this comment](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357392760)).

These checks run during final acceptance on the implementation PR. The automated tests in this directory do not cover them.

## Done criterion 2 (opt-in automation available)

- [ ] Run `ACCEPTANCE_2068_HISTORY=1 bunx vitest run tests/unit/acceptance/issue-2068/criterion-2-pin-history.acceptance.test.ts` on the PR head.
- [ ] Save the PR body (`gh pr view <n> -R Asymmetric-al/core --json body --jq .body > /tmp/2068-body.md`) and rerun with `ACCEPTANCE_2068_PR_BODY_FILE=/tmp/2068-body.md`.
- [ ] The PR's CI run on the pre-change pin commit passed its unit tests, apart from the intentionally red #2068 acceptance tests for criteria 3-6 (see open questions in the Acceptance report).

## Done criterion 7 (opt-in automation available)

- [ ] Run `ACCEPTANCE_2068_SCOPE=1 bunx vitest run tests/unit/acceptance/issue-2068/criterion-7-diff-scope.acceptance.test.ts` on the PR head.

## Done criterion 8

- [ ] `bun run test:unit` passes on the PR head.
- [ ] `bun run ci:preflight` passes on the PR head.
- [ ] Every required CI check on the PR head SHA is green.
