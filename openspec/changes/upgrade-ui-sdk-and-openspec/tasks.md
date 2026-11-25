## 1. Baseline & Release Verification

- [x] 1.1 Verify live published target releases (`@ui-sdk/core@0.1.0-beta.17`, `@ui-sdk/react@0.1.0-beta.17` at `d850982bd8aed202e07009825c3d9daf643fa24e`; `@fission-ai/openspec@2.2.0` at `f1cd852f4edce22b8df9548a4df889172ca8ff25`) and runtime/peer compatibility.
- [x] 1.2 Smoke-test `@fission-ai/openspec@2.2.0` CLI and internal parser/merger exports in an isolated scratch directory before mutating the live repo.
- [x] 1.3 Scaffold and validate `openspec/changes/upgrade-ui-sdk-and-openspec` before implementation.

## 2. Upgrade Dependency Pins & Lockfile

- [x] 2.1 Pin `@ui-sdk/core` and `@ui-sdk/react` to `0.1.0-beta.17` in `packages/ui/package.json` and `@fission-ai/openspec` to `2.2.0` in root `package.json`, regenerate `bun.lock`, and confirm single-copy workspace resolution with zero lockfile drift.

## 3. UI SDK Migration, Wrappers, Consumers & Skill

- [x] 3.1 Read installed `packages/ui/node_modules/@ui-sdk/react/docs/llms.txt` and relevant component/hook/agent docs for `0.1.0-beta.17`; audit `packages/ui/components/primitives/{agent-bridge,rating,shortcut,shortcut-help,sortable-list}.tsx` and their app consumers.
- [x] 3.2 Update affected unit and Playwright tests for confirmed `0.1.0-beta.17` changes (cancelled `setValue` failure semantics, `checkPattern` `aria-hidden` radio fix) and add regression coverage for strict step validation and numeric bounds refusal.
- [x] 3.3 Refresh canonical `docs/ai/skills/ui-sdk/` from commit `d850982bd8aed202e07009825c3d9daf643fa24e`, compute `skills-lock.json` hash via `skills@1.5.7` in scratch, update `references/upstream.md`, `docs/ai/skill-source-audit.json`, `docs/ai/skills-maintenance-log.md`, and `tests/unit/docs/skills-lock-current-paths.test.ts`.

## 4. OpenSpec 2.2.0 Cohort, Router Skill & Instructions

- [x] 4.1 Update `scripts/refresh-upstream-skills.mjs` for tag `v2.2.0`, add `"openspec"` alongside the seven curated workflows, and reconcile `openspec/SKILL.md` plus `references/{answers,where-things-stand,without-skills}.md` to Core's local-only rules with fail-closed guards.
- [x] 4.2 Run `node scripts/refresh-upstream-skills.mjs --only=Fission-AI/OpenSpec` twice to verify deterministic idempotency and review every diff across all eight OpenSpec skills.
- [x] 4.3 Update `docs/ai/rules/openspec.md`, `docs/ai/rules/agent-skill-routing.md`, `openspec/project.md`, `docs/ai/skill-source-audit.json`, `docs/ai/skills-maintenance-log.md`, and OpenSpec/skill unit tests (`openspec-modernization`, `skill-inventory-audit`, `skills-lock-current-paths`, `openspec-skill-refresh`).
- [x] 4.4 Run `bun run skills:sync` (twice for idempotency), update installed payload hashes with `node scripts/update-skill-audit-hashes.mjs`, and confirm `bun run skills:verify` passes without mutating the tree.

## 5. Verification, Review & Merge

- [x] 5.1 Run OpenSpec CLI and delta gates (`openspec:version`, `openspec:validate`, `openspec:audit-archive`, `verify:openspec-deltas`) plus disposable-fixture smoke tests and router-behavior checks.
- [x] 5.2 Run UI SDK unit tests, docs/script unit tests, isolated UI SDK Playwright browser specs (and real-apps suite where available), `verify:comments`, `verify:workspace-contract`, `verify:bun-lock-drift`, `bun run check`, affected builds, clean frozen-lockfile install proof, and `bun run ci:preflight`.
- [x] 5.3 Complete an independent review of the diff for missed consumers, stale instructions, overwritten customizations, and regressions; resolve any confirmed findings.
- [ ] 5.4 Commit, push, open PR targeting `develop`, babysit via T3 Code native PR tools until merged (leaving this OpenSpec change active until after merge), and verify the merge commit on `origin/develop`.
