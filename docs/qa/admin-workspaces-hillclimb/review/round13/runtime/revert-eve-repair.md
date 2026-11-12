# Revert read guard and Eve scroll ownership

November 12, 2026, Asia/Bangkok. Implementation worktree r12 only.

The published-version revert now checks the GET response before parsing or PATCHing it. A failed read reports the existing failure message and leaves form/version state intact. Two parameterized 403/500 tests failed before the fix (the old code proceeded to the supplied successful PATCH) and pass afterward. All ten revert tests pass.

Eve section navigation now sets the selected tab and a pure section-request counter in the event handler. The existing committed effect owns scroll scheduling, including a repeated selection in the same tab. The previous source-extracted React Doctor probe demonstrated two frame schedules when invoking an updater twice. A new real React Strict Mode repeated-selection test passes before and after this purity fix; it is compatibility coverage, not a claimed React reproduction of a visible duplicate scroll.

Validation from r12:

- `bunx --no-install vitest run tests/unit/apps/admin/app/eve-operations-tabs.test.tsx tests/unit/apps/admin/web-studio-revert-status.test.tsx tests/unit/apps/admin/app/eve-operations-workspace.test.tsx --maxWorkers=1 --reporter=dot`: exit 0, 25 tests / 3 files. jsdom emits three navigation-not-implemented diagnostics from anchor navigation; no failed assertions.
- `bunx --no-install prettier --write` on the two source and two test files: exit 0.
- `node tooling/eslint-config/lint.mjs` on both changed source files: exit 0.
- `node node_modules/@typescript/native/lib/tsc.js --noEmit --incremental false -p apps/admin`: exit 0 (concurrent repair tree, before final freeze).

No live Payload writes, provider calls, database operations, server changes, Git mutations, or ledger edits. Live browser qualification and candidate refreeze remain required. Prior round13 evidence remains historical.
