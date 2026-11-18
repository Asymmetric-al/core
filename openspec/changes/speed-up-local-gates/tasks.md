# Tasks

## 1. Push profiles (TDD)

- [ ] 1.1 Time each candidate fast-profile stage alone on the Windows host and
      record the machine state; keep a stage out of the fast profile when it
      is not cheap (verify: timings in the workstream report).
- [ ] 1.2 Write failing tests in `tests/unit/scripts/ci-preflight.contract.test.ts`
      for the fast stage list, its changed-file scoping and unknown-diff
      fallback, the full profile's acceptance stage, argument parsing, the
      failure summary and the two pass lines; run them red.
- [ ] 1.3 Write failing tests in `tests/unit/scripts/pre-push-handoffs.test.ts`
      for profile selection (production, `ASYM_PRE_PUSH_PROFILE=full`, unset,
      `fast`, unknown value) while keeping the production and isolation
      tests; run them red.
- [ ] 1.4 Implement the profiles in `scripts/verify/ci-preflight.mjs` and the
      selection in `scripts/git/pre-push.mjs` until both files pass.

## 2. Factory selector (TDD)

- [ ] 2.1 Write failing tests in `tests/unit/scripts/archon-boundary-round.test.ts`
      that the publish step passes `ASYM_PRE_PUSH_PROFILE=full`, that the pack
      and the hook name the same variable, and that a real fast-profile pass
      line is not accepted by `hookEvidence`; run them red.
- [ ] 2.2 Set the selector in `publication.mjs` and the qualification script;
      run every `tests/unit/scripts/archon-*.test.ts` file that touches
      publication.

## 3. Edit hook (TDD)

- [ ] 3.1 Write failing tests in `tests/unit/scripts/agent-hooks.test.ts` for
      payload parsing per harness, path filtering (protected, generated,
      `.next`, `.next-docs`, `.agents`, deleted, outside the checkout),
      command construction, missing tools, and the harness configurations;
      run them red.
- [ ] 3.2 Implement `scripts/agent-hooks/after-edit.mjs` and wire
      `.claude/settings.json`, `.codex/hooks.json` and `.cursor/hooks.json`
      until the tests pass.
- [ ] 3.3 Show a real Claude Code edit formatted by the hook in this session.

## 4. Next.js guidance (TDD)

- [ ] 4.1 Add failing assertions to `tests/unit/docs/agent-instruction-routing.test.ts`
      for the runtime-verification step in the three product apps and for the
      factory Console's managed block; run them red.
- [ ] 4.2 Add the workflow step, the generated block (from the installed
      `next`), and the root heading fix; check the root byte budget test.

## 5. Documents

- [ ] 5.1 Update every document that describes the push gate (`docs/ci.md`,
      `CONTRIBUTING.md`, `README.md`, `contribution-workflow.md`,
      `docs/ai/rules/general.md` with the upgrade-stop line,
      `docs/ai/rules/testing.md`, `docs/ai/protected-paths.md`,
      `docs/ai/repo-groundtruth.md`, `docs/ops/production-release.md`, and
      skills under `docs/ai/skills` with `bun run skills:sync`); verify with
      `git grep` that none states the old behaviour, and run
      `bunx vitest run tests/unit/docs`.

## 6. Verification

- [ ] 6.1 Run the fast profile three times on this Windows host and record
      stage timings and machine state.
- [ ] 6.2 In a restored scratch state, show the fast profile stops a push for
      a formatting error, a lint error and a type error.
- [ ] 6.3 `bun run openspec -- validate speed-up-local-gates --strict` and
      `bun run verify:openspec-deltas` pass.

## Workflow follow-up

- Archive the change after the pull request merges.
- Install the updated factory pack on the VM before the factory publishes a
  candidate based on this change.
