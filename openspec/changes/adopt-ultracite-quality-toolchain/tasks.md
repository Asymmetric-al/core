# Tasks

Each task carries the stable ID that `design.md` section 6 defines. A task is checked only when the coordinator has
rerun its verification on the integrated tree; the command, revision and result are recorded beside it. A delegate's
report does not verify a task. An unchecked task carries one status after its ID: planned, in progress, implemented,
integrated or blocked (with the blocker). Each numbered group is one pull request into develop, stacked on the one before it.

## 1. Plan

- [x] 1.1 Record the owner's ratification of plan v10 (2026-11-19) and the council's ten rounds in `council-record.md`
- [x] 1.2 Record the simplification review and plan v11 (2026-11-20) in `design.md` section 12, `council-record.md` and evidence E79
- [ ] 1.3 **OS-1** (planned) Validate this change strictly (`bun run openspec -- validate adopt-ultracite-quality-toolchain --strict`, `bun run verify:openspec-deltas`); reconcile with the related active changes at close-out

## 2. Tools, inactive

- [x] 2.1 **TC-1** Install the exact pins of design L1 with the lockfile; nothing calls them. Verified at `35748a19e` (Ubuntu): frozen install, `verify:bun-lock-drift`, `verify:bun-version`, `verify:workspace-contract`, 408 focused tests
- [x] 2.2 **TC-2** Patch `ultracite@8.3.0` for the alias defect, with its test. Verified at `d8ecd3e46` (Ubuntu): `vitest run tests/unit/scripts/quality-antislop-patch.test.ts`, 6 of 6
- [x] 2.3 **TC-3** Add the first root `oxlint.config.mts` and the launcher `tooling/quality/lint.mts` (design L2, L3). Verify: VR-4 (first config, launcher exit codes and suppression-file refusal). Verified at `55bf3cb9d` (Ubuntu and Windows): the launcher, backend and verifier tests, 58 of 58
- [x] 2.4 **TC-4** Prove TSRS executes, on Windows and Ubuntu (design L4); add the pin and no-competitor checks to `typescript-toolchain.mjs`. Verify: VR-2. Verified at `55bf3cb9d`: the pinned `tsrs` child observed from the root, a workspace and a temporary directory on both systems; a typed run of `apps/factory-console` gives the same 4,061 findings on both
- [x] 2.5 **TF-1** Repair the two test files Vitest cannot collect. Verified at `f5ee25023` (Ubuntu): the whole-repository `vitest list --json` exits 0 (it exited 1 before); the 16 migration tests keep their names and pass; the suites that name the two files pass

## 3. Compiler

- [x] 3.1 **TS-1** Move the alias and the 16 workspace pins to 7.1.0-beta with the lockfile; make the two Admin repairs; add `ES2023.Intl`; add `.next/types/**/*.ts` and `next typegen` to the three product apps; update the version verifier, the compiler-family fixtures, the Principal harness and the TypeScript guidance. Verify: VR-7. Verified at `6e24bf412` (Ubuntu): frozen install, uncached typecheck of all workspaces, the strict builds, `verify:typescript-toolchain`, `verify:workspace-contract`
- [x] 3.2 **GEN-1a** Check Payload types present and absent, and that the import-map producer equals the committed file. Verified at `6e24bf412`: Payload types checked present and absent; the import-map producer equals the committed file
- [x] 3.3 **RB-1** Rehearse the rollback to 7.0.2 once, in a scratch copy. Verified at `6e24bf412`: the rollback to 7.0.2 rehearsed once in a scratch copy
- [x] 3.4 **TS-3** Write the program inventory by actual membership; add compiled programs for root config, `scripts/` and `tooling/` to `typecheck` and CI; add strict lint-context programs for the central test groups, each with a failing and a passing typed control and its recorded reason; open the follow-up issue Central test compiler coverage. Verify: VR-6, VR-7. Verified at `db72f5c92` (Ubuntu): uncached typecheck 17/17 including `//#typecheck:programs`, a seeded error fails it; inventory `--check`; controls and the CI-pinning acceptance suites green. Wired through Turbo (`typecheck` depends on the root task), so `ci.yml` is unchanged. Follow-up: #2732

## 4. Formatter

- [x] 4.1 **FM-1** Add `oxfmt.config.mts`, the `.prettierignore` additions and the ignore and protected-bytes tests. Verified at `9154806ff` (Ubuntu): config, ignore and protected-bytes tests; Oxfmt lists 223 differing files, none written
- [x] 4.2 **FM-2** Add `scripts/lib/format-source.mts` with the `trusted` and `managed` profiles. Verified at `9154806ff`: adapter tests, fail-closed on a missing formatter and malformed input
- [x] 4.3 **FM-3** Find all formatter consumers by reference search. Port each with its test: the two Python renderers use the CLI; the others use the adapter (L7).. Verified at `9154806ff`: every caller ported with its tests; the five renderers `--check`; scripts and docs suites green
- [x] 4.4 **GEN-1b** Route the currency generator and the import-map postprocessor through the adapter. Verified at `9154806ff`: fixed-input generator tests; the postprocessor strips the legacy header
- [x] 4.5 **SD-1** Add `--refresh-local` and `--refresh-diffs` to `shadcn-diff.mjs`. Verified (Ubuntu): the new refresh suite and the existing shadcn-diff suites; both modes keep every non-hash byte, refuse unmatched paths with exit 2 and leave the file unchanged on failure; the default verify mode is unchanged
- [ ] 4.6 **FC-1** (planned) Cut over: `format`, `format:check`, the read-only `lint-staged` check with its new flags (design L11), CI, editor settings, contract tests and docs; remove the direct Prettier dependency and confirm by reference search that no Core caller of Prettier remains. Wait for the open stack for up to two working days first (design L12). Verify: VR-8, VR-9
- [ ] 4.7 **FC-2** (planned) Make the one formatting commit from a clean tree, refresh the records it stales, add its blame-ignore entry. Verify: the reviewer's replay on the parent commit; `format:check`; a second pass changes nothing; typecheck and tests

## 5. Linter

- [x] 5.1 **PL-0** List every rule the incumbent ESLint configs enforce at `error`, with its scope and its Oxlint equivalent, bridge or stated gap; seed one violation per rule and see it fail through Oxlint before ESLint is retired. Done (Ubuntu): `tooling/quality/eslint-parity.json` from `scripts/verify/eslint-parity.mts` (`--check` green): 71 rules at error in 17 live configs; 60 map to Oxlint, 6 stay on the shadcn bridge, 5 gaps (the four the plan names and `react/no-deprecated`, which PL-1 settles). 59 seeds fire in both engines; `react/preserve-manual-memoization` fires in neither and is pinned silent until PL-1 counts it in the real tree
- [x] 5.2 **PL-1** Write the per-rule policy from fresh counts: design section 4 in the config, the test and script profile with a reason per rule, `tooling/quality/pending.json` with a task per entry, and `verify:lint-pending`. Done (Ubuntu): the policy in `oxlint.config.mts`; `lint-counts.json` from `verify:lint-pending --counts` (93,883 typed findings with all rules on: 27,707 product, 58,626 tests, 7,550 scripts); `tooling/quality/pending.json`, 833 entries under 36 `RS-*` owners; `scripts/verify/lint-pending.mts` with its controls. With pending applied, typed lint reports only the 13 parity-rule findings LC-1 repairs (never pending). PL-0 F1: `react/no-deprecated` is a stated partial gap (React 19.3.1 exports none of its main targets; `no-find-dom-node`, `no-render-return-value` and `no-unsafe` with `checkAliases` stay on). F2: the incumbent `preserve-manual-memoization` reports 0 in 1,098 app files. The script and CI wiring of `verify:lint-pending` lands with LC-1
- [x] 5.3 **PL-2** Add framework scoping, the Playwright scope and the four import tiers, each with a failing and a clean fixture. Verify: VR-3, VR-4. Done (Ubuntu): nine tier blocks porting every incumbent ban and exception (0 findings on the tree, E81); `quality-lint-scopes.test.ts` runs 41 failing and clean fixtures for the tiers, Next, React JSX, Vitest and Playwright through the real launcher and config
- [x] 5.4 **QB-1** Add the Query bridge config and the uncached per-workspace `lint:query` task. Verify: VR-5. Done (Ubuntu): `tooling/quality/eslint-query.config.mjs` (the two typed bridge rules only); `lint:query` in the six Query workspaces and the uncached Turbo task, run at concurrency 1; `quality-query-bridge.test.ts` with a failing case and a valid twin for each of the seven Query rules, including imported-void and typed-wrapper. The bridge reports 4 `no-rest-destructuring` findings in `packages/database/hooks/member-care.ts` (no incumbent rule covers them); LC-1 repairs them before the bridge becomes a gate
- [ ] 5.4a **BC-1** (planned) Run the one backend comparison of design L4 in a scratch copy at the cutover revision and record it
- [ ] 5.5 **LC-1** (planned) Cut over: `lint` and workspace scripts, `lint-staged`, CI, directive conversion, the reduced shadcn bridge config, general ESLint removed, contract tests, a first `docs/ai/rules/code-quality.md`. Verify: VR-4, VR-6, VR-9. Keep the three rules of E82, and any later rule of Core's own, enforced (design L10)
- [ ] 5.5a **LC-0** (in review) Repair the findings that can never be pending: 13 from rules ESLint enforces today and 4 from the Query bridge. Prepared on the branch `chore/AL-2728-cutover-repairs`, stacked on this one, as its own pull request, because it changes product code
- [ ] 5.6 **WF-2** (planned) Adapt the edit hook of pull request #2726 once it is on develop. Verify: VR-10

## 6. Mechanical fixes

- [ ] 6.1 **M1** (planned) Apply the spacing fix with formatting to a fixed point, as one commit; add its blame-ignore entry. Verify: the reviewer's replay; typecheck; tests; the unit run's test names unchanged
- [ ] 6.2 **M2** (planned) Apply safe autofix rules, one commit each, each gated by typecheck and tests and replayed by its reviewer; revert files that fail; list in the rulebook any rule whose fix broke the compile

## 7. Repairs

- [ ] 7.0 **MK-1** (planned) Sort the module-mock findings into external-boundary and internal mocks; add the evasion checks (the stock deny list and one small JS-plugin rule) with their fixtures; add the payment secret key to the keys the unit setup deletes
- [ ] 7.1 **RS-\*** (planned) Size the repairs from the pending list and open one pull request per workspace or rule group. Each follows design section 4.5, is reviewed by a model other than its author, deletes the pending entries it cleans and adds their seeded violations. (One line is added here per pull request when it is opened.)

## 8. Close-out

- [ ] 8.1 **WF-5** (planned) Update the rulebook, AGENTS routing, the canonical Ultracite skill through `skills:sync`, and the OpenSpec specs
- [ ] 8.2 **WF-7** (planned) Observe each harness in normal use, once natively and once under T3 where both are in use. Record the settings file, profile and worktree of each run. The hook runs once per edit and its report reaches the model. Verify: VR-10
- [ ] 8.3 **PF-1** (planned) Record time and peak memory of `lint`, `format:check` and `typecheck`, before and after
- [ ] 8.4 **CL-1** (planned) Delete the pending list and its check; turn on unused-directive errors; run VR-12 on a fresh frozen install; hold the independent final review and fix its findings; write the final handoff, naming everything not done here with its owner (compiling the central tests; the legacy shadcn repair, with its raw count). The factory owns the pack release. Its lint and format ignores remain; neither cleanup is done here. The handoff is short and links `design.md` and `evidence.md`. It gives what was built and why, with the exact versions in L1; the council's models, efforts, substitutions, rounds and scores (§12); what became of the research handoff's recommendations (§10); what was demonstrated, what passed and what remains unverified (§1); the daily commands and the native, T3 and editor workflow (L3, L11); and every blocker, unfinished goal, fallback and manual step. It also confirms that the research handoff still matches the digest in the design header.
