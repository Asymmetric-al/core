# Issue #2068 — runtime acceptance checklist (not automated)

Spec: [rev 1 comment](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555) (approved with D1a and D2a in [this comment](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357392760)).

These checks run during final acceptance on the implementation PR. The automated tests in this directory do not cover them.

> 2026-11-18: #2706 retired the opt-in automation for done criteria 2, 3 (exact gate set) and 7 (`criterion-2-pin-history`, `criterion-7-diff-scope` and the `ACCEPTANCE_2068_*` switches). Those items are now the review steps below.

## Done criterion 2 (review)

- [ ] In the PR's first-parent history, one commit pins the pre-change digest `456b5091243a22a0a75defe19c3fd753dc6848ca5ec4bbcfdeef0551ebc6cde6` in `tests/unit/packages/api/document-purpose-digest.test.ts` while `packages/api/src/generated-documents/purpose-catalog/` is still identical to `cc568c92` (`git diff cc568c92 <commit> -- packages/api/src/generated-documents/purpose-catalog/` is empty).
- [ ] A later commit changes that catalog directory and replaces the pin with the new digest in the same commit, and the PR head pins only the new digest.
- [ ] The PR body records both digests.
- [ ] On the pre-change pin commit, the product and unit tests that already existed there pass ([addendum 1 item 1](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357644196)). The #2068 acceptance tests for criteria 3-6 are expected to be red on that commit.
- [ ] Criterion 3 exact gate set: in the PR diff of `packages/api/src/generated-documents/purpose-catalog/types.ts`, `PURPOSE_LAUNCH_GATES` is the base list in its order followed by exactly phase07, phase13 and phase14 at the end ([addendum 2 item 3](https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357880766)). The automated criterion 3 tests still check that no base name is removed or reordered and that the three new names are present.

## Done criterion 7 (review)

- [ ] The PR's changed files are only under `packages/api/src/generated-documents/purpose-catalog/`, `tests/unit/packages/api/document-purpose-*.test.ts` and this acceptance directory (`gh pr diff <n> -R Asymmetric-al/core --name-only`).

## Done criterion 8

- [ ] `bun run test:unit` passes on the PR head.
- [ ] `bun run ci:preflight` passes on the PR head.
- [ ] Every required CI check on the PR head SHA is green.
