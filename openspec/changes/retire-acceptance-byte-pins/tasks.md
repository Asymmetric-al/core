# Tasks

## 1. Inventory

- [x] 1.1 List every byte, fingerprint, diff-scope and position pin in
      `tests/unit/acceptance/**` with file, lines, category, what it
      protected and the decision. (Workstream report for #2706.)

## 2. Structural guard (TDD)

- [x] 2.1 Write `tests/unit/workflows/required-ci-checks.test.ts` fixture
      cases and run them red against a stub helper (22 failed, 5 passed).
- [x] 2.2 Implement `tests/unit/helpers/required-ci-checks.ts` until the
      fixture cases pass (27 passed).
- [x] 2.3 Run the guard against the real `ci.yml` and `ci-integration.yml`.

## 3. Retire pins

- [x] 3.1 Remove the `ci.yml`, `ci-integration.yml` and `docs/ci.md`
      fingerprints, byte prefixes and step positions; replace each with its
      semantic assertion where it stood for an invariant.
- [x] 3.2 Remove opt-in `git merge-base` diff-scope blocks of merged changes.
- [ ] 3.3 Remove or replace remaining whole-file hashes of other files, or
      list them with the reason they stay. Applied-migration, evidence-chain
      and security-ledger hashes stay; the rest are listed in the workstream
      report for a follow-up.
- [x] 3.4 Run every touched acceptance file by name (at most 2 workers).

## 4. Guidance

- [x] 4.1 Add the rule to `docs/ai/rules/testing.md`.
- [x] 4.2 Add the byte-pinned anti-pattern to the Ezra role and regenerate
      the pack role manifest; run the factory pack check.

## 5. Proof

- [x] 5.1 Benign edits to `ci.yml`, `ci-integration.yml` and `docs/ci.md`
      leave the edited acceptance files green; restore exactly.
- [x] 5.2 `continue-on-error: true` on `migrate` fails the structural guard;
      restore exactly.
- [x] 5.3 `bun run openspec -- validate retire-acceptance-byte-pins --strict`
      and `bun run verify:openspec-deltas` pass.

## 6. Review fixes

- [x] 6.1 Assert that CI runs the issue-2364 real-stack file, and that one
      blocking `migrate` step runs every named real-database acceptance
      file with the database URL it reads (red first in a scratch edit).
- [x] 6.2 Reject anything but plain test paths after `bun x vitest run` in
      the real-stack step check (fixture cases red first).
- [x] 6.3 Widen the structural guard to swallowed failures, steps that never
      run, skippable required jobs and reusable-workflow calls (fixture cases
      red first); say in `docs/ai/rules/testing.md` that it is a heuristic.
- [x] 6.4 State the hash exception in the spec delta and the exact authority
      in the proposal; correct the #2308 ceiling comment; date-note the
      #2068 and #2154 runtime checklists.
- [ ] 6.5 Owner confirms on the pull request that #2706 covers the
      diff-scope, step-position and blob-pin removals as well as the
      fingerprint comparisons.

## 7. Bot review of #2716

- [x] 7.1 Real-stack steps: reject other step keys, a run over several
      lines and an unexpected step-level `DATABASE_URL`; use the shared
      check in #2258 and #2312 (fixture cases and a scratch edit red first).
- [x] 7.2 Guard: run `e2e-smoke-gate`'s script per outcome; a late bare
      `exit` in a fallback group does not fail (fixture cases red first).
- [x] 7.3 Keep the forward-migration order rule against the CI base commit
      (fixtures red first).
- [x] 7.4 Tighten the #2180, #2201/#2221, #2221 table, #2257 and #2308
      checks (scratch edits red first, restored byte-identical).
- [x] 7.5 State the guard's limits, the gate and base scenarios, and the
      Ezra hash exception; turn the retired #2068 and #2154 checklist
      commands into review steps.
- [ ] 7.6 Move the forward-migration order rule into a migration verifier
      under `scripts/verify/` (outside this change's fence).
