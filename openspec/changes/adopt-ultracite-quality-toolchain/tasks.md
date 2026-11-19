# Tasks

Each task carries the stable ID that `design.md` section 10 defines; that section, with sections 8 and 9, says what
the task contains and how it is verified. `implementation-guide.md` gives the order of work inside each batch. A task
is checked only when its verification has been run on the integrated tree and the command, revision and result are
recorded beside it. Every batch starts with IN-0 (merge the current `origin/develop`, then re-run the CTI, AP-1 and the D13 table on the merged tree) and ends with
the batch gate of design section 8.1.

## 1. Authority and record

- [x] 1.1 Record the owner's ratification of plan v10 (2026-11-19) and the council's ten rounds in `council-record.md`
- [ ] 1.2 **OS-1** (batch A1; reconciled at C5 in task 10.14) Validate this change strictly (`bun run openspec -- validate adopt-ultracite-quality-toolchain --strict`, `bun run verify:openspec-deltas`) and link `integrate-design-system-lint` tasks 5.4 to 5.10

## 2. Batch A1: records, tools and the inactive toolchain

Staffing: by the amendment of 2026-11-19 (design section 8.4, evidence E77), delegates draft the named tools of this
batch in their own worktrees. The coordinator makes every shared edit, integrates one tool at a time and verifies.

- [ ] 2.1 **TID-1** Delete the duplicate one-line test file and wrap `supabase-migrations.test.ts` in a `describe`; add `scripts/quality/test-ids.mts`. Verify: whole-repository `vitest list --json` exits 0 on Windows and Ubuntu
- [ ] 2.2 **SD-1** Add the three `shadcn-diff.mjs` modes with path-root normalization, test-first
- [ ] 2.3 **AP-1** Add the content-pin inventory (five kinds), amendment lists and `pin-amend-proof.mts`, test-first
- [ ] 2.4 **SR-1** Add the Shadscan rebind tool only if `tooling/shadscan/findings.json` still exists when task 2.6 edits the root manifest; rebind each Shadscan-cited file in the commit that changes it
- [ ] 2.5 **VM-1** Add `verify-mechanical.mts`, `scratch.mts` and `derived-records.json`, with every control of design section 8.3 written first; the `m1` and `m2:<rule>` replay controls are completed at A3 with FIX-1
- [ ] 2.6 **TC-1** Install the exact cohort of design D1 with the lockfile in the same commit; Oxfmt inactive. Verify: a frozen install; `verify:bun-lock-drift`
- [ ] 2.7 **TC-2** Add the Ultracite patch with its 15 fixtures and the Core equality check; file the upstream report. Verify: VR-1
- [ ] 2.8 **TC-3** Add the first `oxlint.config.mts` (the `core` preset with the D2 spreads; PL-1 completes it) and the runner `lint.mts` with its exit-code contract (a crash or setup failure exits 2, never 0 or 1). Verify: VR-4, VR-9
- [ ] 2.9 **TC-4** Prove TSRS identity on Windows and in WSL (Ubuntu); the Ubuntu CI step lands with CT-0a. Verify: VR-2
- [ ] 2.10 **TC-6** Qualify `@shadcn/lint` 0.2.5 against 0.2.3 with its patch; record the result
- [ ] 2.11 **FM-1** Write `oxfmt.config.mts`, the managed overrides, `.prettierignore` additions and the D8 ignore and protected-bytes tests (inactive until CT-0a)
- [ ] 2.12 **VQ-1** Add `verify:quality` (`tooling/quality/verify-quality.mts`) with the A1 rows of the activation table; pass the batch gate

## 3. Batch A2: compiler

- [ ] 3.1 **TS-1** Move the root alias and 16 pins to TypeScript 7.1.0-beta with the lock; make the two type-only Admin repairs; add `ES2023.Intl`; update the version verifier and its tests (today's checks kept; roster, literal alias, physical classic resolution and new negatives added); make the capability fixtures exact per compiler family and give the Principal harness forward-slash specifiers and exact diagnostics; update the TypeScript rulebook, the readiness guide and the shared-config README
- [ ] 3.2 **TS-1** Add `tsconfig.typecheck.json` and `next typegen` to the four apps; declare the four uncached app typecheck tasks; prove the two negatives and validator membership
- [ ] 3.3 **GEN-1a** Compile Admin with Payload types present and absent; check the import-map producer against the committed file
- [ ] 3.4 **RB-1** Rehearse the compiler rollback in a scratch copy
- [ ] 3.5 Run the strict builds per platform with expected and observed task IDs. Verify: VR-7
- [ ] 3.6 Pass the batch gate; write rebind notes for every proof-cited manifest the batch edited

## 4. Batch A3: policy, inventories and owners

- [ ] 4.1 **PL-0** Record the parity set and the gap list
- [ ] 4.2 **PL-1** Compose `oxlint.config.mts` and the per-rule anti-slop policy with fixtures; record the value, conflicts and disposition of each optional preset or JS-plugin bundle.
- [ ] 4.3 **PL-2** (delegated) Scope the framework rules and the four import tiers, with fixtures. Verify: VR-3, VR-4, VR-5
- [ ] 4.4 **PL-3** Record the prescribed repair forms; add `emit-diff.mts`
- [ ] 4.5 **PL-4** Add the layers and the composition test. Verify: VR-4 through each root entry
- [ ] 4.6 **PL-5** Add the `core/*` rules and the `verify:quality` contracts, including the reviewed Vitest resolution snapshot and P4 allowlist, each test-first. Verify: VR-13
- [ ] 4.7 **FIX-1** Add the fix entry `oxlint.fix.config.mts`, `fix.mts` and `staged-guard.mts`, test-first. Verify: VR-9
- [ ] 4.8 **MI-1** Generate `money-scope.json` and `numeric-truthiness.json`
- [ ] 4.9 **TA-1** Generate `tenant-auth-scope.json` and add the Payload access wiring check
- [ ] 4.10 **GH-1** Add golden hash tests from raw input for the 16 hashing files
- [ ] 4.11 **PO-1** Register predicate owners and doubles owners with their negative tests
- [ ] 4.12 **RD-1** Register detached forms, reporters, notifiers and failure values; generate `handler-inventory.json` and review its "other" group
- [ ] 4.13 **RD-2** Add `runDetached` with its tests
- [ ] 4.14 **FP-1** (delegated) Build the fault-patch library and its runner; list unprotected functions. Verify: every patch fails at base on its recorded assertion
- [ ] 4.15 Pass the batch gate, the composition test, the sentinels and the golden tests

## 5. Batch A4: formatter consumers

- [ ] 5.1 **FM-2** Add `scripts/lib/format-source.mts` with both D8 profiles; prove managed CLI/refresh parity and config isolation, and fail before writing on missing formatter or malformed supported input
- [ ] 5.2 **FM-3** (delegated) Port every formatter consumer with its design section 6 contract and tests; preserve transaction and provenance integrity and keep Phase 25 byte-exact. Verify: VR-8

## 6. Batch A5: cutover

- [ ] 6.0 At IN-0, check the open pull-request stack of design D13; hold this batch for up to two working days if it has not merged, then proceed on develop's current structure
- [ ] 6.1 **CT-0a** Make Oxfmt the formatter, activating **FM-1**; remove Prettier and `lint-staged`; **WF-6** add `.vscode/extensions.json` and `.vscode/settings.json` in the same commit (design D11). Verify: the settings test and the recorded VS Code and Cursor check
- [ ] 6.2 **UIB-1** Retire general ESLint and its plugins; add `bridge.config.mjs`; give `lint.mjs` chunking, `--paths-file`, filtering and the ledger-key checks; reduce `verify:eslint` to one health run
- [ ] 6.3 **PC-1** Add the staged runner `pre-commit.mts`, which formats the staged bytes, writes the index itself and never runs `git add`. Verify: the interleaving control and the adapter and command-line parity of VR-9
- [ ] 6.4 **CT-0a** Port the transition entry, `bun run lint`, the `lint:query` dispatcher and **GEN-1b**; update the contract tests and docs the CTI lists
- [ ] 6.5 **CT-0a** Convert the non-shadcn ESLint directives; remove the checkout's inline configuration comment and add its `react/refs` override. Verify: the bridge gate and the seeded control
- [ ] 6.6 **CT-0a** Amend the pins AP-1 lists, with proofs; write rebind notes; pass the CT-0a commit checks
- [ ] 6.7 **CT-0b** Run `bun run format` over the format scope (design D8); the changed files must equal the reviewed inventory, canonical skills included; regenerate derived records. Verify: `verify-mechanical --transform oxfmt` and the full batch gate
- [ ] 6.8 Add CT-0b to `.git-blame-ignore-revs`; push CT-0a and CT-0b together; run the networked `verify:shadcn-diff`
- [ ] 6.9 **PF-1** Measure the CI lint job on a `workflow_dispatch` run of `ci.yml` on the branch; split it if it passes 20 minutes

## 7. Batches A6 and A6b: test programs and parity

- [ ] 7.1 **TS-2** Add the program registry, `sync-test-programs.mts`, generated paths and excludes, and the sentinel program; make the three import repairs. Verify: VR-11
- [ ] 7.2 **TS-2** Run the Query bridge once per central program; measure heap and time; split any program above 2.5 GB. Retime the full CI lint job with these programs active and apply PF-1’s 20-minute split rule. Verify: VR-5 and PF-1
- [ ] 7.3 **TC-5** Freeze the nonzero A6 commit and compare coverage, diagnostic and safe-fix parity, repeatability, time and backend peak memory under design §7.4
- [ ] 7.4 **FB-1** Rehearse the backend fallback in a scratch copy

## 8. Batches A7 to A9: mechanical batches and packets

- [ ] 8.1 **M1** Run the spacing fix and Oxfmt to a fixed point as the sole writer. Verify: `verify-mechanical --transform m1`; identical TID-1 test IDs per entrypoint; the full-scale hooked-commit rehearsal on Windows
- [ ] 8.2 **M2** Run each safe rule as its own batch with its M1 pass. Verify: the M2 gate of design section 8.3 for each
- [ ] 8.3 **INV** Publish the inventory, the slice map and one packet per slice
- [ ] 8.4 **PF-1** Record the baseline

## 9. Phase B: slices and mock pilots

- [ ] 9.1 **W-MOCK-SB** Land the network guard, the registry, the stub migration and the Supabase recorder recipe. Verify: VR-13 network controls
- [ ] 9.2 **W-MOCK-SB-CI** (coordinator) Wire each registry entry to its owning workflow, job and Vitest config (including #2727 if merged); add the network glob and canary plus explicit selection of the two Stripe live files. Verify positive selection and unit denial in VR-13.
- [ ] 9.3 **W-MOCK-ST** Add the Stripe construction guard and the resolver-based recorder. Verify: VR-13 Stripe controls
- [ ] 9.4 Pilot the other mock recipes, recording the file that proves each one before any slice uses it; build the shared P4 shims once
- [ ] 9.5 **RS-\*** Run the remediation slices; accept each by design section 8.5, with an independent semantic review
- [ ] 9.6 **RS-PACK** Repair the factory pack under its operational review and release it as a new pack

## 10. Phase C: integration and close-out

- [ ] 10.1 **IN-1** Integrate the slices in dependency order
- [ ] 10.2 **SW-1** Merge the latest `develop`; sweep to zero and rehearse **PF-1** on the integrated candidate before CT-1. Verify: the C1 gate
- [ ] 10.3 **CT-1** Flip to the full policy; retire the transition entry and `legacy-directives.json`
- [ ] 10.4 **CT-T** Make every program blocking; delete the ratchet file and the `typecheck:ratchet` updater
- [ ] 10.5 **W-UI** In two parts: W-UI-a ends on a recorded revision with the bridge gate green and the ledger empty; W-UI-b is the engine switch as one revertible commit. Repair the UI ledger to zero; move the six shadcn rules into Oxlint for the six UI workspaces; apply **TC-6**'s choice by making `@shadcn/lint` a root devDependency and moving or removing its patch; add `quality:health`; port the design-system suites with their negative controls; repair `packages/ui` before its consumers, with paired before-and-after screenshots; delete the bridge and `verify:eslint` with its callers. Verify: a frozen install, VR-4, VR-9, the networked `verify:shadcn-diff`
- [ ] 10.6 **WF-1** Rerun the real-repository staging tests in their final form
- [ ] 10.7 **WF-2** Register the agent hook (layout-only writes, never blocks, 100-second budget). If pull request #2726's hook is on develop, replace its registrations, carry its tests and requirement scenarios into VR-10, and delete its script. Verify: VR-10
- [ ] 10.8 **WF-3** Bring CI, `ci:preflight`, the contract tests and `docs/ci.md` to their final form
- [ ] 10.9 **WF-4** Run the cache and affected-selection tests. Verify: VR-6
- [ ] 10.10 **WF-5** Update the rulebooks, `AGENTS.md` routes, `README.md`, `CONTRIBUTING.md` and the skills. Seed the `ultracite` audit entry and scope its hash update as D9 specifies
- [ ] 10.11 **WF-6** Repeat the recorded VS Code and Cursor check after W-UI: a seeded shadcn finding appears through Oxlint
- [ ] 10.12 **WF-7** Observe each harness on Windows and in WSL in its normal trust and permission mode, recording that mode and the hook's wall time; document any harness whose feedback the model cannot see
- [ ] 10.13 **PF-1** Confirm performance against the baseline; repeat **RB-1**
- [ ] 10.14 Reconcile this change with every related active change named in design section 10 (OS-1); add the MODIFIED delta for the edit-hook requirements once they are durable in `openspec/specs` (design D13)
- [ ] 10.15 **VR-12** Verify the final reviewed revision in a fresh clone on a frozen install, with Turbo's cache bypassed; confirm `ci-gate` and `integration-gate` on that commit; record commands, revision, environment and results, and whether each check ran locally, ran in remote CI or did not run
- [ ] 10.16 Hold the independent final review with at least two reviewers on different providers; fix its findings; open the pull request with the council record and evidence
- [ ] 10.17 Confirm the research handoff still matches the digest in the design header; write the final handoff that design section 10 (Close-out) lists, reporting any migration artifact still in place as unfinished
