# Pause handoff: the quality-toolchain migration (AL-2728)

Written on 20 November 2026, at the owner's request, before a pause of unknown length. The work resumes when the
other open pull-request stack has merged, probably on a codebase that has moved a good deal. This file says where
the work stands, what is left, what to do first on resuming, and what was learned. `design.md` remains the plan and
`tasks.md` the checklist; where this file and the design disagree, the design wins. Delete this file at close-out:
the final handoff of task CL-1 replaces it.

## 1. In brief

The change moves Core from ESLint and Prettier to Oxlint and Oxfmt (through Ultracite, with its anti-slop rules),
runs typed lint on TSRS, and moves the native compiler to TypeScript 7.1.0-beta. It ends with no lint debt.

- **Done: 20 of the 34 task lines**, which is roughly 35 to 40 percent of the effort. The plan, the tool install, the
  compiler move and all the preparation for the formatter and the linter are finished and pushed.
- **Not done:** the two switchovers (formatter, then linter), the two mechanical passes, the repairs, and close-out.
  The repairs are the largest part by far: about 55,000 findings once the spacing pass has cleared about 44,000.
- **The debt grows while lint is not gated.** One merge from develop on the day of the pause added 4,756 findings
  and three new ESLint rules that the linter switchover must carry (section 4.1).
- **Why it stopped here:** the switchovers edit `ci.yml`, the pre-commit hook and the pre-push script. The other
  stack (section 7.2) edits the same files, and the plan says to let it land first (design L12).
- **Nothing new gates commits or CI yet**, with two exceptions that are live on the branch: the compiler is
  TypeScript 7.1.0-beta, and root configuration, `scripts/` and `tooling/` are now type-checked. `bun run lint` is
  still ESLint and `bun run format` is still Prettier.

## 2. Where everything is

| Item               | State                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tracking issue     | #2728, open (Linear AL-2728)                                                                                                                                                                      |
| Pull request #2730 | **Merged into develop** on 20 November 2026 as `b821d5a37`: the plan, the pinned tools (inactive), the first lint config, the lint launcher, the TSRS proof                                       |
| Pull request #2731 | **Open**, base develop, branch `chore/AL-2728-quality-toolchain`. Everything else done so far. Green on its last pushed commit before this file was added                                         |
| Follow-up issue    | #2732, open: compile the central tests (not part of this change)                                                                                                                                  |
| Plan and records   | this directory: `design.md` (plan v11), `tasks.md`, `implementation-guide.md`, `evidence.md` (E1 to E81), `council-record.md`, `requirement-map.md`, `program-inventory.json`, `lint-counts.json` |

**Pinned versions (design L1):** Ultracite 8.3.0 with one local patch, Oxlint 1.94.0, Oxfmt 0.79.0, TSRS
7.1.0-beta.tsrs2, `@typescript/native` as `typescript@7.1.0-beta` (root alias and 16 workspace pins), classic
TypeScript 6.0.3 for the compiler API, the parser and the editor.

**Commits on #2731, oldest first.** Merge commits are left out.

<!-- prettier-ignore -->
| Commit | Tasks | What it does |
|---|---|---|
| `6e24bf412` | TS-1, GEN-1a, RB-1 | Compiler to 7.1.0-beta: alias, 16 pins, lockfile; five Admin type annotations; `ES2023.Intl`; route types through `next typegen`; verifier and fixtures |
| `9154806ff` | FM-1, FM-2, FM-3, GEN-1b | `oxfmt.config.mts` (inactive); `scripts/lib/format-source.mts`, the one formatting adapter; every script that called Prettier now formats through the adapter; `.prettierignore` additions |
| `db72f5c92` | TS-3 | `tsconfig.root.json`, `scripts/tsconfig.json`, `tooling/tsconfig.json` compiled by the root Turbo task `typecheck:programs`; lint-context programs for the central tests with typed controls; `program-inventory.json` |
| `e1ba8035a` | docs | Marks eight tasks verified |
| `6013f3fd2` | SD-1 | `--refresh-local` and `--refresh-diffs` for `scripts/verify/shadcn-diff.mjs` |
| `60de1a3e9` | PL-0 | `tooling/quality/eslint-parity.json`, its generator, and one seeded violation per mapped rule |
| `f1841022e` | PL-1 | The lint policy in `oxlint.config.mts`; `tooling/quality/pending.json`; `scripts/verify/lint-pending.mts`; `lint-counts.json` |
| `4d8ce929a` | chore | Program inventory regenerated after a develop merge |
| `08ade687c` | PL-2 | The import tiers in `oxlint.config.mts`; scope controls for the tiers, Next, React JSX, Vitest and Playwright |
| `ab0c41f48` | review fix | A unit test that compiles the three root programs (pull-request CI skipped them; see section 9) |
| `32629ceb5` | QB-1 | The Query bridge: `tooling/quality/eslint-query.config.mjs`, `lint:query` in six workspaces, its controls |
| `2b299ef37` | chore | Parity list regenerated for the new `tooling/quality` JavaScript file |
| the commit that adds this file | tidy | After merging develop at `7b0ac284b`: records regenerated, E82, this file. See section 4.1 |

## 3. What is active today and what is not

<!-- prettier-ignore -->
| Thing | State on the #2731 branch |
|---|---|
| Compiler | **Active.** Every workspace `typecheck` and build uses TypeScript 7.1.0-beta. The rollback to 7.0.2 was rehearsed once (design L8) |
| Root, `scripts/`, `tooling/` type-check | **Active.** `bun run typecheck` runs it (each workspace `typecheck` depends on `//#typecheck:programs`), and so does the unit run (`tests/unit/scripts/typescript-root-programs.test.ts`). A script with a type error now fails |
| `bun run lint`, lint-staged, CI lint | **Unchanged: ESLint.** |
| `bun run format`, `format:check`, CI format | **Unchanged: Prettier.** |
| Scripts that format generated output | **Changed.** They call Oxfmt through the adapter, not Prettier. Their current output equals the committed files and passes Prettier's check |
| The new lint config and launcher | Installed, not called by any script, hook or workflow. Run by hand: `node tooling/quality/lint.mts --typed` |
| `lint:query` | Scripts exist in six workspaces and at the root. Not part of `lint`, hooks or CI |
| `verify:lint-pending`, `verify:eslint-parity` | No package scripts yet. Run by hand: `node scripts/verify/lint-pending.mts`, `node scripts/verify/eslint-parity.mts --check` |
| New unit tests | **Active** in the unit run: the launcher, backend, parity, pending, scope, Query-bridge, formatter and program tests |

## 4. Task status

`tasks.md` has the full wording and the verifying commit of each done task.

<!-- prettier-ignore -->
| Group | Done | Left |
|---|---|---|
| 1. Plan | 1.1, 1.2 | 1.3 OS-1 (final strict validation and reconciliation, at close-out) |
| 2. Tools, inactive | TC-1, TC-2, TC-3, TC-4, TF-1 | none |
| 3. Compiler | TS-1, GEN-1a, RB-1, TS-3 | none |
| 4. Formatter | FM-1, FM-2, FM-3, GEN-1b, SD-1 | FC-1 (switchover), FC-2 (the one formatting commit) |
| 5. Linter | PL-0, PL-1, PL-2, QB-1 | BC-1 (backend comparison), LC-1 (switchover), WF-2 (edit hook) |
| 6. Mechanical fixes | none | M1 (spacing), M2 (safe autofixes) |
| 7. Repairs | none | MK-1 (module mocks), RS-\* (repairs by area) |
| 8. Close-out | none | WF-5, WF-7, PF-1, CL-1 |

### 4.1 The last commit before the pause

- **Develop was merged in** (merge commit `71dde57a3`; develop then included #2734, the tenant-routing release).
  The one conflict, in the Shadscan proof ledger, was resolved by taking develop's file and recomputing the proofs
  of the six manifests this branch changes.
- **Every derived record was regenerated on that tree** (section 7.3). The pending list went from 833 to 844
  entries: one dropped as clean, twelve added for findings the merge brought in.
- **Three ESLint rules of Core's own arrived with that merge** (E82): `own-api/no-direct-call`,
  `tenant-navigation/no-prefixless-navigation` and `tenant-navigation/no-tenantless-cache`. They guard tenant
  correctness, are enforced at `error`, and have no Oxlint equivalent. The parity list records them as unexpected
  gaps and the parity test pins them by name. The linter switchover must keep them enforced (section 5.2, item 8;
  design L10).
- **The parity test no longer regenerates the list from the live ESLint configs in the unit run.** It reads the
  committed record. Otherwise every ESLint change on develop would fail the unit run of someone who has nothing to
  do with this migration. The drift check is explicit instead: `node scripts/verify/eslint-parity.mts --check`, or
  the test with `CORE_ESLINT_PARITY=live`.
- **This file was added.**
- **LC-0 is on its own branch.** The 17 findings that can never be pending (13 from rules ESLint enforces today, 4
  from the Query bridge) are repaired on `chore/AL-2728-cutover-repairs`, stacked on this branch, with its own pull
  request. It is kept apart because it changes product code, including the donor checkout's payment handler, while
  everything else on this branch is inactive. Its pull request states the result of its independent review and the
  questions it leaves for the owner.

## 5. What is left, in order

Each step is its own pull request unless noted (design L13). #2731 already mixes the compiler with the formatter
and linter preparation; section 8 has a recommendation about that.

### 5.1 Formatter switchover (FC-1), then the one formatting commit (FC-2)

FC-1 changes, in one pull request:

1. `format` and `format:check` call Oxfmt from the repository root with
   `--no-error-on-unmatched-pattern --disable-nested-config` (design L7).
2. Pre-commit becomes a read-only check (design L11): `lint-staged --concurrent false --no-stash --fail-on-changes
--no-hide-partially-staged` running `oxfmt --check`, and the hook refuses, by name, any eligible staged file that
   also has unstaged changes.
3. The CI format job, `ci:preflight`, the contract tests that pin their stage order, the editor settings
   (`.vscode/extensions.json`, `.vscode/settings.json`) and the docs.
4. The direct Prettier dependency is removed. Search every tracked file for remaining callers first. One historical
   call stays: `docs/qa/admin-workspaces-hillclimb/**/capture-analysis.mjs` is protected evidence, not live tooling.
5. Verify VR-8 and VR-9 (design section 8).

FC-2 is one commit from a clean tree by one writer with nothing else in it: `oxfmt --write` over the repository.
When FM-1 was built, Oxfmt listed 223 files that differ; expect a different number later. In the same commit,
refresh every record the formatting stales (section 7.3), then add the commit to `.git-blame-ignore-revs` in the
next commit. A reviewer replays the command on the parent and compares (implementation guide section 4a).

### 5.2 Linter switchover (BC-1, then LC-1, then WF-2)

BC-1 is one comparison of TSRS against the stock backend in a scratch copy at the switchover revision, recorded in
`evidence.md` (design L4).

LC-1 is the largest single pull request before the repairs. Its list, including everything found on the way here:

1. **Scripts.** `bun run lint` becomes the typed launcher over the repository, then `lint:query`, then `lint:ui`.
   Add `lint:fast` and `fix`. Workspace `lint` scripts call the launcher on their own directory; Turbo `lint` tasks
   are uncached (design L3).
2. **Hooks and CI.** The untyped launcher joins the read-only pre-commit check. The CI lint job runs the typed
   launcher, the Query bridge per workspace and the shadcn bridge.
3. **Wire the two verifiers.** Add `"verify:lint-pending": "node scripts/verify/lint-pending.mts"` and a
   `verify-lint-pending` stage after lint in `scripts/verify/ci-preflight.mjs`. In CI, pass
   `--base <the pull request's base commit>`; the default base is `origin/develop`. The exact edits are in the PL-1
   report (section 11).
4. **Repair what today's rules already forbid.** With the pending list applied, typed lint reports 13 findings from
   rules ESLint enforces today, and the Query bridge reports 4. They can never be pending. The repairs are on the
   LC-0 branch (section 4.1); merge it first, or redo them from its pull request if it has gone stale.
5. **Re-measure the pending list** on the merged tree (section 7.3). New code in develop will have added findings.
6. **Directives.** Convert non-shadcn `eslint-disable` and `eslint-enable` comments in authored sources to
   `oxlint-*`. Delete the 230 `eslint-disable no-restricted-imports` comments in `tests/**`: the import tiers do not
   apply there. The one ESLint inline configuration comment, in the donor checkout file, becomes a root-config
   override for that file (E64).
7. **The shadcn bridge.** Reduce its ESLint config to what the six rules need (E63) and keep its controls and health
   check (design L10, VR-4). Remove the general ESLint configs and plugins.
8. **Keep Core's own ESLint rules enforced.** The three tenant rules of E82 live in
   `tooling/eslint-config/own-api.mjs` and `tenant-navigation.mjs`, and more may have been added since. First try
   them through Oxlint's JS plugin loader, the way the Query rules run; keep that only if a seeded violation of each
   fires and a valid twin passes in every scope. Otherwise they stay on ESLint as a third bridge. The same goes for
   the public-content boundary check in `packages/api`, which also runs through ESLint (PL-2 report). Run
   `node scripts/verify/eslint-parity.mts --write` first: its unexpected gaps are the full list to decide.
9. **Retire the parity generator.** `scripts/verify/eslint-parity.mts` reads the ESLint configs that this step
   removes. Keep the seeded violations by moving them into the config smoke test; delete the generator, its record
   and the test that compares them.
10. **Record the known gap.** `react/no-deprecated` has no Oxlint 1.94.0 equivalent (section 8).
11. **Docs.** A first `docs/ai/rules/code-quality.md`; the "Enforcement" section of
    `docs/guides/architecture/data-access-boundary.md`; AGENTS routing.
12. Verify VR-4, VR-6 and VR-9.

WF-2 adapts the agent edit hook that pull request #2726 adds: swap its two tool calls to Oxfmt and the untyped
launcher, and correct its message (design L11). Do it in LC-1 if #2726 has merged, otherwise when it does.

### 5.3 Mechanical fixes (M1, M2)

- **M1.** Apply the fix of `anti-slop/require-readable-spacing` and format, repeating until nothing changes, as one
  commit. It clears 43,919 findings (13,771 product, 25,122 tests, 5,026 scripts). Check typecheck, tests, and that
  the test names in the unit run's report are unchanged.
- **M2.** Safe autofix rules, one commit per rule, each gated by typecheck and tests; revert files that fail and
  leave them to manual repair. A trial at the plan's base showed a bulk type-import fix breaking 108 compile sites
  (E27), so `import/consistent-type-specifier-style` (990 findings) needs care.

### 5.4 Repairs (MK-1, then RS-\*)

- **MK-1 first.** Sort the 1,477 `anti-slop/no-module-mocking` findings (all in tests, over 400 files) into mocks
  of an external boundary and mocks of Core's own modules; add the three evasion checks; add the payment secret key
  to the keys the unit setup deletes (design section 4.5).
- **RS-\*.** One pull request per workspace or rule group. Each deletes its pending entries, adds a seeded violation
  per rule it turns on, follows the forbidden-repairs list of design section 4.5, and is reviewed by a different
  model from its author (implementation guide section 4). Section 6 sizes them.

### 5.5 Close-out (WF-5, WF-7, PF-1, CL-1, OS-1)

Update the rulebook, the routing and the canonical Ultracite skill; observe the edit hook in each harness; record
time and memory before and after; delete the pending list and its check; turn on unused-directive errors; run the
final verification (VR-12) on a fresh install; hold the independent final review; write the final handoff; validate
and reconcile the OpenSpec change. Delete this file.

## 6. Numbers and analysis

Measured on Ubuntu at the merge commit `71dde57a3`, with every policy rule on. `lint-counts.json` has every row;
regenerate it with `node scripts/verify/lint-pending.mts --counts`.

- **98,639 typed findings:** 28,683 in product code, 62,045 in tests, 7,911 in scripts and tooling.
- **98,626 of them are pending** in 844 entries under 36 repair tasks. The other 13 are from rules ESLint enforces
  today (section 5.2, item 4).
- **One rule is 45 percent of the total:** `anti-slop/require-readable-spacing`, 43,919, cleared by M1.
- After M1 about **55,000** remain. How many of those M2 clears is unknown until M2 runs; a trial of every safe fix
  at the plan's base left about 33,000 (E25), under an older policy.
- **The total was 93,883 one merge earlier.** Pull request #2734 alone added 4,756 findings: 3,419 in tests, 976 in
  product code, 361 in scripts. Nothing checks new code against the new policy until LC-1, so every week of pause
  adds repair work, mostly in tests.

<!-- prettier-ignore -->
| Repair task | Entries | Findings | | Largest rules (all areas) | Findings |
|---|---:|---:|---|---|---:|
| `RS-tests` | 126 | 58,035 | | `anti-slop/require-readable-spacing` (M1) | 43,919 |
| `RS-packages-api` | 53 | 9,361 | | `eslint/curly` | 7,388 |
| `RS-apps-admin` | 50 | 7,757 | | `anti-slop/require-safety-comment-for-type-assertion` | 4,531 |
| `RS-scripts` | 35 | 6,870 | | `typescript/no-unsafe-type-assertion` | 3,074 |
| `RS-packages-ui` | 46 | 3,028 | | `typescript/no-non-null-assertion` | 2,798 |
| `RS-apps-factory-console` | 44 | 2,893 | | `typescript/no-unsafe-member-access` | 2,417 |
| `RS-typescript` | 31 | 991 | | `typescript/no-unsafe-assignment` | 2,129 |
| `RS-packages-auth` | 40 | 990 | | `unicorn/text-encoding-identifier-case` | 1,946 |
| `RS-unicorn` | 42 | 974 | | `anti-slop/no-module-mocking` (MK-1) | 1,477 |
| `RS-packages-database` | 37 | 908 | | `anti-slop/no-unsafe-dictionary-type` | 1,435 |
| `RS-apps-missionary` | 35 | 897 | | `vitest/prefer-expect-resolves` | 1,309 |
| `RS-packages-eve-runtime` | 29 | 808 | | `anti-slop/no-runtime-typeof` | 1,259 |
| the other 24 tasks | 276 | 5,114 | | `vitest/consistent-test-it` | 1,077 |

**Where the effort is.** Many of the large rules have safe or near-mechanical fixes (`curly`, the unicorn and
vitest style rules, type-import style). The slow part is the roughly 17,000 findings about unsafe types and
assertions (`no-unsafe-*`, `no-non-null-assertion`, the two type-assertion rules, `strict-boolean-expressions`),
because each needs a real repair and many sit on money, tenant or auth paths where design section 4.5 demands a
preservation test first. The 1,477 module mocks are the other slow part. Tests hold twice the findings of product
code, so the test areas decide the schedule.

**Costs observed.** Typed lint over the repository takes 25 to 45 seconds and about 1.5 GB of memory on Linux. The
pre-push gate takes 24 to 45 minutes and only one runs at a time on the shared machine; the wait for its lock has
been up to 25 minutes. About twenty pushes so far.

## 7. Resuming on a changed codebase

### 7.1 First steps

1. Read this file, then `tasks.md`, then `implementation-guide.md`.
2. Find out what merged: the state of #2731 and of every pull request in section 7.2.
3. If #2731 is still open, merge develop into its branch (never rebase or force-push a pushed branch here) and
   resolve conflicts with section 7.2. If #2731 has merged, branch from develop for the next pull request.
4. `bun install --frozen-lockfile`, then regenerate the records of section 7.3 in order.
5. Run the checks of section 7.4. Fix what the merge broke before starting new work.
6. Re-check the assumptions of section 7.5.
7. Continue with section 5 from the top.

### 7.2 The other stack, and what each part changes for this work

<!-- prettier-ignore -->
| Pull request | What it does | What to do here when it has merged |
|---|---|---|
| #2716 (AL-2706) | Replaces byte pins in the acceptance suites with rule assertions, including the three suites that pin `ci.yml` (#2153, #2201, #2221) | `ci.yml` can be edited normally. Add a pull-request step that runs `bunx turbo run typecheck:programs`; then the unit test `typescript-root-programs.test.ts` may stay as a second guard or go |
| #2725 (AL-2707) | Makes Shadscan advisory and retires its ledger; edits `ci.yml`, `.husky/pre-commit`, `ci-preflight.mjs`, `package.json`, `tooling/shadscan/findings.json` | In `findings.json` take develop's side: this branch only refreshed proof hashes there. Stop refreshing Shadscan proofs (section 7.3). Keep both sides' `package.json` script edits |
| #2723 (AL-2704) | Makes React Doctor advisory and retires its ledger | Nothing to merge by hand. This change never edits the React Doctor ledger (owner ruling of 18 November 2026) |
| #2726 (AL-2710, AL-2711) | Speeds up pre-push, shards the required unit run, adds the agent edit hook; edits `ci.yml`, `ci-preflight.mjs`, its contract test, `scripts/verify/shadcn-diff.mjs`, hook registrations | Re-apply SD-1's changes to `shadcn-diff.mjs` (the SD-1 report lists the functions changed) and rerun `shadcn-diff-refresh.test.ts` with the existing shadcn-diff suites. Check that the new quality tests land in a shard and pass there. WF-2 can now be done |
| #2727 (AL-2708) | PostgREST contract tests in CI; edits `package.json` | Keep both sides' script edits |
| #2722 (AL-2709) | Lets the factory land pull requests through a merge queue | Pushes and required checks may work differently; read its docs before the next push |

Files the two switchovers will edit and the stack also edits: `.github/workflows/ci.yml`, `.husky/pre-commit`,
`scripts/verify/ci-preflight.mjs`, `tests/unit/scripts/ci-preflight.contract.test.ts`, the hook registrations
(`.claude/settings.json`, `.codex/hooks.json`, `.cursor/hooks.json`) and `package.json`. Build the switchovers on
develop's structure at that time. On a conflict keep the applicable edits from both sides; never take one side
wholesale (design L12).

### 7.3 Records to regenerate after any merge, in this order

<!-- prettier-ignore -->
| Record | Goes stale when | Regenerate |
|---|---|---|
| `bun.lock` | `package.json` conflicts are resolved | `bun install`, then `bun run verify:bun-lock-drift` and `bun run verify:workspace-contract` |
| `program-inventory.json` (this directory) | any tracked TypeScript file or `tsconfig` is added or removed | `node scripts/verify/typescript-programs.mts --write`, format it, then `--check`. A new `tsconfig` also needs an entry in that script, or `typescript-programs.test.ts` fails |
| `tooling/quality/eslint-parity.json` | an ESLint config changes, or the first JavaScript file appears in a directory the root ESLint config covers | `node scripts/verify/eslint-parity.mts --check` shows drift and `--write` regenerates. A rule the generator cannot map becomes an unexpected gap: decide it (section 5.2, item 8) and add it to the pinned list in `quality-eslint-parity.test.ts`. Nothing in the unit run detects drift (section 4.1) |
| `tooling/quality/pending.json` | develop adds or removes findings | Run `node tooling/quality/lint.mts --typed --format json` and `node scripts/verify/lint-pending.mts --base origin/develop`. Delete entries the verifier reports as clean. A finding from a rule with no entry is repaired; an entry may be added only while #2731 has not merged, because afterwards the verifier refuses added or widened entries |
| `lint-counts.json` (this directory) | the same | `node scripts/verify/lint-pending.mts --counts`, written to the file and formatted |
| Shadscan proof hashes (`tooling/shadscan/findings.json`) | a cited file changes (any `package.json`); **only while the ledger exists** | Re-check the entry's claim, then set the proof's hash to the SHA-256 of the file's bytes; `bun run verify:shadscan` |
| shadcn upstream baseline | a file it hashes changes | `node scripts/verify/shadcn-diff.mjs --refresh-local <paths>`; `--refresh-diffs <paths>` for upstream diffs (contacts the registry) |
| Skill audit hashes and mirrors | skill tooling or a skill changes | `bun run skills:sync` on Linux, then `node scripts/update-skill-audit-hashes.mjs` |
| Acceptance pins | a pinned file changes; **only while byte pins exist** | Re-check what the pin protects; update it with a comment naming this change, keeping the check (design L12) |

### 7.4 Checks to rerun after the merge

`bun run verify:workspace-contract`, `bun run verify:typescript-toolchain`, `bun run typecheck --force`,
`node tooling/quality/lint.mts --typed` (expect only the known parity findings), `node scripts/verify/lint-pending.mts`,
`node scripts/verify/eslint-parity.mts --check`, `bun run lint:query`, the test files
`tests/unit/scripts/quality-*.test.ts`, `typescript-*.test.ts`, `format*.test.ts` and `shadcn-diff*.test.ts`, the five
document renderers with `--check` (FM-3), then `bun run ci:preflight` on Linux.

### 7.5 Assumptions to re-check

- **Tool versions.** TypeScript 7.1 may have left beta, and TSRS, Oxlint and Ultracite will have newer releases. Do
  not upgrade inside a task. Design L1 makes an upgrade its own change: qualify the four tools together and rerun
  VR-1 to VR-5 and VR-8. Two local workarounds exist only because of the pinned versions and should be re-tested on
  any upgrade: the Ultracite alias patch (TC-2) and the explicit `/**` form of every import pattern (E81).
- **The pending list's base.** The verifier compares against `origin/develop` by default. Once #2731 is on develop,
  a pull request that adds findings for a rule with no pending entry fails typed lint, but nothing runs typed lint
  in CI until LC-1. So develop can collect findings that LC-1 must then repair or, in its own first commit, record.
- **New unit tests in develop.** Tests written during the pause follow ESLint's rules, not the new policy. Expect
  the test areas to have grown.
- **The other stack's shape.** Section 7.2 describes the pull requests as they were on 20 November 2026.

## 8. Decisions taken that the owner may want to review

1. **`react/no-deprecated` is a stated partial gap.** Oxlint 1.94.0 has no equivalent. React 19.3.1 no longer exports
   most of what it flags, and `react/no-find-dom-node`, `react/no-render-return-value` and `react/no-unsafe` (with
   `checkAliases`) stay on. Legacy calls whose return value is unused, and a few streaming and test-utility APIs,
   are not covered. The alternative is to keep this one rule on an ESLint bridge.
2. **Four import restrictions are stricter than ESLint's were**, each with no finding today: the health route keeps
   tiers 0 and 1; the two motion modules keep the cross-app ban; the 12 table-boundary files keep the UI layer's
   Supabase bans; Factory Console's `src/` and all of `tooling/**` are covered.
3. **Root `tests/**` and `scripts/**` stay outside the import tiers**, as under ESLint. `tests/**` imports app code
   746 times on purpose.
4. **`ci.yml` was not edited.** Three acceptance suites pin its bytes. The root type-check is wired through Turbo
   and a unit test instead (section 9, item 1).
5. **The root program is `tsconfig.root.json`, not a root `tsconfig.json`**, so React Doctor's audit and the shadcn
   view do not pick it up. The cost: typed lint sees the 12 root files only in a looser default program;
   `typecheck` still compiles them strictly.
6. **`scripts/shadcn/add-shadcnuikit.ts` declares its one `Bun` call locally** instead of installing `@types/bun`.
7. **The typed controls for the central tests** write temporary `typed-control-*` folders under `tests/**` during
   the unit run and remove them afterwards; they add about nine seconds.
8. **The three tenant rules of E82 are recorded as gaps, not yet solved.** How LC-1 carries them (Oxlint's JS plugin
   loader, or a third ESLint bridge) is undecided until both are tested; design L10 says so and asks for a focused
   review of that paragraph when work resumes.
9. **The parity test reads the committed record instead of the live ESLint configs** (section 4.1), so that other
   work is not blocked by this migration's bookkeeping during the pause.
10. **#2731 is larger than the plan intended** (about 235 files, 129 of them test fixtures). It holds the compiler
    together with the formatter and linter preparation. Recommendation: merge it as it stands before the
    switchovers, since everything in it except the compiler and the root type-check is inactive; then one pull
    request per step of section 5. Note that merging it switches every type-check and build to TypeScript
    7.1.0-beta.

## 9. Risks and known problems

1. **Pull-request CI type-checks only affected workspaces.** A change to root configuration, `scripts/` or
   `tooling/` alone selects no workspace, so the Turbo task `typecheck:programs` does not run there. The unit test
   `typescript-root-programs.test.ts` covers the gap. Replace or complement it with a CI step once `ci.yml` can be
   edited (section 7.2, #2716).
2. **One record is checked in the unit run and can fail other people's pull requests:** program coverage. A new
   `tsconfig` that `scripts/verify/typescript-programs.mts` does not classify fails `typescript-programs.test.ts`,
   and the message names the fix. The parity list is deliberately not checked there (section 4.1), so it can go
   stale unnoticed: run its `--check` on resuming, and expect more rules like those of E82.
3. **Generated output is formatted by Oxfmt while the gate still checks with Prettier.** Today the two agree on
   every generated file. If a regeneration during the pause produces output Prettier rejects, finish FC-1 rather
   than hand-format.
4. **TypeScript 7.1.0-beta is a beta.** If it blocks a gate, the rollback of design L8 is one forward commit.
5. **Develop keeps adding findings** until LC-1 gates lint: 4,756 from one pull request (section 6). It also adds
   ESLint rules of Core's own (E82), each of which LC-1 has to carry.
6. **`verify:shadcn-diff` depends on a rate-limited public registry.** It failed two pushes with "shadcn CLI
   coverage failed" and passed after a wait. It retries only on HTTP 502 to 504.
7. **Automated review was thin on #2731.** One reviewer skips pull requests over 100 files, and two others were at
   their usage limits for most of the work. Linux runs and the full pre-push gate carried verification. An
   independent review of #2731 before it merges would be worth its cost.
8. **The admin build job lacks `PAYLOAD_SECRET` in `ci.yml`.** This predates the change; it is noted in #2731.

## 10. What cost time, and what to do differently

- **Verify on Linux before believing a delegate's test run.** Delegates work on Windows, where the wider suites
  fail for environment reasons (147 failures in one run that had one real failure on Linux).
- **Derived records multiply.** Almost every commit staled one of the records in section 7.3 and failed a hook or
  the gate once. Regenerate all of them before each commit; a single script that does so would repay itself.
- **Any `package.json` edit stales Shadscan proofs** while that ledger exists. Batch manifest edits.
- **Stacked branches and the gate.** Pushing two branches together starts a duplicate CI run whose cancellation
  looks like failures. Push one branch at a time.
- **Check the install after switching branches.** A stale `node_modules` from the other branch failed one gate run.
- **A policy change can break an earlier task's controls.** PL-1 turned off the rule TS-3's typed controls used,
  and the pending list hid it in the test folders. The controls now bypass the pending list and use a rule the
  policy keeps.
- **Engines differ in small ways that only a comparison shows.** The import-pattern depth difference (E81) was
  found by running both engines over every import specifier in the tree; a literal port would have opened holes.
- **Briefs for delegates should say which protected files exist.** One patch edited two acceptance pins and missed
  a third; the fix was to avoid the pinned file altogether.

## 11. Records

- **In this directory:** the plan and its records (section 2).
- **Delegate briefs, reports and patches** for every task are kept by the coordinator outside the repository; the
  reports name the exact edits proposed for later steps (PL-1, PL-2, QB-1, SD-1, TS-3). Ask the coordinator's
  thread for them.
- **Evidence added during implementation:** E80 (Vitest listing), E81 (import-pattern depth) and E82 (the three new
  ESLint rules and the growth in findings) in `evidence.md`.
