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

- [ ] 3.1 **TS-1** (planned) Move the alias and the 16 workspace pins to 7.1.0-beta with the lockfile; make the two Admin repairs; add `ES2023.Intl`; add `.next/types/**/*.ts` and `next typegen` to the three product apps; update the version verifier, the compiler-family fixtures, the Principal harness and the TypeScript guidance. Verify: VR-7
- [ ] 3.2 **GEN-1a** (planned) Check Payload types present and absent, and that the import-map producer equals the committed file
- [ ] 3.3 **RB-1** (planned) Rehearse the rollback to 7.0.2 once, in a scratch copy
- [ ] 3.4 **TS-3** (planned) Write the program inventory by actual membership; add compiled programs for root config, `scripts/` and `tooling/` to `typecheck` and CI; add strict lint-context programs for the central test groups, each with a failing and a passing typed control and its recorded reason; open the follow-up issue Central test compiler coverage. Verify: VR-6, VR-7

## 4. Formatter

- [ ] 4.1 **FM-1** (planned) Add `oxfmt.config.mts`, the `.prettierignore` additions and the ignore and protected-bytes tests
- [ ] 4.2 **FM-2** (planned) Add `scripts/lib/format-source.mts` with the `trusted` and `managed` profiles
- [ ] 4.3 **FM-3** (planned) Find all formatter consumers by reference search. Port each with its test: the two Python renderers use the CLI; the others use the adapter (L7).
- [ ] 4.4 **GEN-1b** (planned) Route the currency generator and the import-map postprocessor through the adapter
- [ ] 4.5 **SD-1** (planned) Add `--refresh-local` and `--refresh-diffs` to `shadcn-diff.mjs`
- [ ] 4.6 **FC-1** (planned) Cut over: `format`, `format:check`, the read-only `lint-staged` check with its new flags (design L11), CI, editor settings, contract tests and docs; remove the direct Prettier dependency and confirm by reference search that no Core caller of Prettier remains. Wait for the open stack for up to two working days first (design L12). Verify: VR-8, VR-9
- [ ] 4.7 **FC-2** (planned) Make the one formatting commit from a clean tree, refresh the records it stales, add its blame-ignore entry. Verify: the reviewer's replay on the parent commit; `format:check`; a second pass changes nothing; typecheck and tests

## 5. Linter

- [ ] 5.1 **PL-0** (planned) List every rule the incumbent ESLint configs enforce at `error`, with its scope and its Oxlint equivalent, bridge or stated gap; seed one violation per rule and see it fail through Oxlint before ESLint is retired
- [ ] 5.2 **PL-1** (planned) Write the per-rule policy from fresh counts: design section 4 in the config, the test and script profile with a reason per rule, `tooling/quality/pending.json` with a task per entry, and `verify:lint-pending`
- [ ] 5.3 **PL-2** (planned) Add framework scoping, the Playwright scope and the four import tiers, each with a failing and a clean fixture. Verify: VR-3, VR-4
- [ ] 5.4 **QB-1** (planned) Add the Query bridge config and the uncached per-workspace `lint:query` task. Verify: VR-5
- [ ] 5.4a **BC-1** (planned) Run the one backend comparison of design L4 in a scratch copy at the cutover revision and record it
- [ ] 5.5 **LC-1** (planned) Cut over: `lint` and workspace scripts, `lint-staged`, CI, directive conversion, the reduced shadcn bridge config, general ESLint removed, contract tests, a first `docs/ai/rules/code-quality.md`. Verify: VR-4, VR-6, VR-9
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
