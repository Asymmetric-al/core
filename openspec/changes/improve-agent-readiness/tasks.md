## 1. Correct instructions that direct a wrong action

- [x] 1.1 Default `/5-ship-working-tree` to a `develop` pull-request base,
      remove `production` and `main` as offered bases, and use
      `bun run ci:preflight` as its readiness gate.
- [x] 1.2 Replace the unconditional build chain in `/4-close-project` with the
      canonical readiness gate, keeping its design-system lint reference.
- [x] 1.3 Point `README.md` and the contributing guide at the owning rules for
      route parameters, semantic tokens and shared UI imports, and correct the
      stale dependency rows.
- [x] 1.4 Describe `repo-entry` as instruction-system maintenance and add
      `packages/eve-runtime` to the workspace map.
- [x] 1.5 Route Supabase command examples through `bun run supabase --`.
- [x] 1.6 Route local scratch to the ignored `docs/ai/working-set.local.md`
      and describe `docs/ai/working-set.md` as a tracked historical record,
      leaving that file unchanged.

## 2. Orientation and client loading

- [x] 2.1 State the product purpose and the four surfaces in root `AGENTS.md`
      within the always-on budget, and name hosted surfaces in each app file.
- [x] 2.2 Add a sibling `CLAUDE.md` import for every scoped `AGENTS.md` and
      assert it in `tests/unit/docs/agent-instruction-routing.test.ts`.
- [x] 2.3 Exclude compiled skill guides from Cursor's always-applied rules
      through `.cursorignore`, covering every skill root.

## 3. Verification and OpenSpec guidance

- [x] 3.1 Add the proof-tier vocabulary and the parallel-checkout settings to
      `docs/ai/rules/testing.md`.
- [x] 3.2 Bound Apply and Verify to the selected slice in
      `docs/ai/rules/openspec.md`.

## 4. Verify

- [x] 4.1 Structural: `skills:verify`, `format:check`, `openspec:validate` and
      `verify:openspec-deltas` pass; protected paths keep their blob hashes.
- [x] 4.2 Unit: `tests/unit/docs` and `tests/unit/scripts` pass on Linux, and
      the acceptance wrapper passes.
- [x] 4.3 Runtime, Claude Code: reading a file in a newly covered directory
      loaded that directory's `AGENTS.md` through the new import. Observed for
      `packages/api`, `packages/auth`, `packages/database`, `packages/ui`,
      `supabase` and `scripts`; `apps/missionary` displayed the import line.
- [x] 4.4 Runtime, Cursor: a session listed the six skill guides among its
      always-applied rules before the change and none after it. This is the
      session's report of its own context on 2026-11-13, not a deterministic
      check.
- [ ] 4.5 Readiness: the pre-push `bun run ci:preflight` and pull-request CI
      pass.
