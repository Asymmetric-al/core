# Issue #2068 — runtime acceptance checklist (not automated)

Spec: [rev 1 comment](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555) (approved with D1a and D2a in [this comment](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357392760)).

These checks run during final acceptance on the implementation PR. The automated tests in this directory do not cover them.

## Done criterion 2 (opt-in automation available)

- [ ] Run `ACCEPTANCE_2068_HISTORY=1 bunx vitest run tests/unit/acceptance/issue-2068/criterion-2-pin-history.acceptance.test.ts` on the PR head.
- [ ] Save the PR body (`gh pr view <n> -R Asymmetric-al/core --json body --jq .body > /tmp/2068-body.md`) and rerun with `ACCEPTANCE_2068_PR_BODY_FILE=/tmp/2068-body.md`.
- [ ] On the pre-change pin commit, the product and unit tests that already existed there pass ([addendum 1 item 1](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357644196)). The #2068 acceptance tests for criteria 3-6 are expected to be red on that commit.
- [ ] Criterion 3 exact gate set (opt-in): `ACCEPTANCE_2068_SCOPE=1 bunx vitest run tests/unit/acceptance/issue-2068/criterion-3-giving-summary-contract.acceptance.test.ts` confirms `PURPOSE_LAUNCH_GATES` gains only the phase07, phase13 and phase14 names.

## Done criterion 7 (opt-in automation available)

- [ ] Run `ACCEPTANCE_2068_SCOPE=1 bunx vitest run tests/unit/acceptance/issue-2068/criterion-7-diff-scope.acceptance.test.ts` on the PR head.

## Done criterion 8

- [ ] `bun run test:unit` passes on the PR head.
- [ ] `bun run ci:preflight` passes on the PR head.
- [ ] Every required CI check on the PR head SHA is green.
