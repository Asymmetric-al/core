# Tasks

## 1. Lint rule (TDD)

- [x] 1.1 Write failing tests in
      `tests/unit/scripts/no-comments-lint-rule.test.ts` for banned comments,
      machine-read comments, scope, the baseline allowance and the rule's
      presence in the root, a library and an app configuration.
- [x] 1.2 Implement `tooling/eslint-config/no-comments.mjs` and add it to
      `tooling/eslint-config/base.mjs` until the tests pass.

## 2. Ratchet gate (TDD)

- [x] 2.1 Write failing tests in `tests/unit/scripts/comment-ratchet.test.ts`
      against temporary Git repositories: a new comment, a new file, a
      hand-edited baseline, a deletion, a rename, committed growth and the
      report.
- [x] 2.2 Implement `scripts/verify/comment-ratchet.mjs` and
      `scripts/lib/source-comments.mjs`; add `bun run verify:comments`.
- [x] 2.3 Generate `tooling/eslint-config/comment-baseline.json`.
- [x] 2.4 Add the gate to `scripts/verify/ci-preflight.mjs` (both profiles,
      scoped in the fast one), its contract test, the CI `lint` job and
      `docs/ci.md`.

## 3. Removal tool (TDD)

- [x] 3.1 Write failing tests in `tests/unit/scripts/delete-comments.test.ts`
      for listing, stripping, JSX comments, kept directives and the
      unchanged-syntax-tree proof.
- [x] 3.2 Implement `scripts/delete-comments.mjs`.

## 4. Skill

- [x] 4.1 Write `docs/ai/skills/delete-comment/` and add it to the catalog in
      `docs/ai/rules/agent-skill-routing.md`.
- [x] 4.2 Run `bun run skills:sync`, record the skill in
      `docs/ai/skill-source-audit.json`, and pass `bun run skills:verify` and
      `bunx vitest run tests/unit/docs`.

## 5. First pass: `packages/auth`

- [x] 5.1 Classify all comments in `packages/auth`.
- [x] 5.2 Remove them with the tool and lower the baseline. Two JSDoc blocks
      in `capabilities/effective-capabilities.ts` stay: the acceptance test for
      #2303 (criterion 7) requires them.
- [x] 5.3 Write the decision records into `packages/auth/docs/adr/`.
- [x] 5.4 File an issue for each excuse.
- [x] 5.5 Pass lint, typecheck and the unit tests that cover `packages/auth`.

## 6. Close-out

- [x] 6.1 `bun run openspec:validate`, `bun run verify:openspec-deltas`.
- [x] 6.2 Readiness gate. `bun run ci:preflight` on Linux passed every stage
      through the builds, then stopped in `test:unit` on a 120-second timeout
      in `tests/unit/scripts/own-api-lint-tree.test.ts`. That case takes 109
      seconds in a full run on unmodified `develop` on the same machine and 16
      seconds alone. `bun run test:acceptance` passed when run separately, and
      required CI passed every stage on the pull request.

## 7. Review

- [x] 7.1 Fix the automated review's findings on the gate, the removal tool,
      the rule, the skill and three ADRs.
- [x] 7.2 Fact-check all 14 ADRs against the code with fresh reviewers and
      correct what they confirm. Code gaps found on the way are tracked in
      #2755 and #2756.
