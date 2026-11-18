# Tasks

## 1. Inventory

- [ ] 1.1 List every byte, fingerprint, diff-scope and position pin in
      `tests/unit/acceptance/**` with file, lines, category, what it
      protected and the decision.

## 2. Structural guard (TDD)

- [ ] 2.1 Write `tests/unit/workflows/required-ci-checks.test.ts` fixture
      cases and run them red against a stub helper.
- [ ] 2.2 Implement `tests/unit/helpers/required-ci-checks.ts` until the
      fixture cases pass.
- [ ] 2.3 Run the guard against the real `ci.yml` and `ci-integration.yml`.

## 3. Retire pins

- [ ] 3.1 Remove the `ci.yml`, `ci-integration.yml` and `docs/ci.md`
      fingerprints, byte prefixes and step positions; replace each with its
      semantic assertion where it stood for an invariant.
- [ ] 3.2 Remove opt-in `git merge-base` diff-scope blocks of merged changes.
- [ ] 3.3 Remove or replace remaining whole-file hashes of other files, or
      list them with the reason they stay.
- [ ] 3.4 Run every touched acceptance file by name (at most 2 workers).

## 4. Guidance

- [ ] 4.1 Add the rule to `docs/ai/rules/testing.md`.
- [ ] 4.2 Add the byte-pinned anti-pattern to the Ezra role and regenerate
      the pack role manifest; run the factory pack check.

## 5. Proof

- [ ] 5.1 Benign edits to `ci.yml`, `ci-integration.yml` and `docs/ci.md`
      leave the edited acceptance files green; restore exactly.
- [ ] 5.2 `continue-on-error: true` on `migrate` fails the structural guard;
      restore exactly.
- [ ] 5.3 `bun run openspec -- validate retire-acceptance-byte-pins --strict`
      and `bun run verify:openspec-deltas` pass.
