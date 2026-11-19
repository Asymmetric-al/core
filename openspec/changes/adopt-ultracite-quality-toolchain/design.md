# Core quality-toolchain migration — plan v10 (ratified)

**Status:** ratified on 2026-11-19 at the owner's direction, after council round 10 (§16). This is the plan of record.

**Qualified at:** Core `develop` `e6a5ce81a4505f134c4266c3e076bfaf744ba540`. Implementation starts from the then-current `origin/develop` (`182eb0338` on 2026-11-19) and re-checks §2 there (IN-0, D13).

**Owner:** the coordinator, the agent session that ran the council and holds the write ownership of §8.4.

**Evidence:** E1–E76, in the evidence record that ships with this plan.

**Companions:** the implementation guide (the runbook for every batch), the evidence record, and the council record.

**Durable home:** the OpenSpec change `openspec/changes/adopt-ultracite-quality-toolchain/`. It holds:

- the proposal;
- the design (this plan);
- the tasks (§10);
- a spec delta for the new capability `code-quality-toolchain`;
- the implementation guide, the evidence record and the council record.

The repository is public. The research handoff and the owner's assignment are the owner's documents and are not copied into it. The handoff is identified by its date and digest (2026-11-18, SHA-256 `1ba77b0e3d5c129e8697fffb114e5e59470f2b67494ea9f007d1ad7d39b42c20`); §13 records what became of each of its recommendations, and §15 maps the assignment's sections to this plan.

**Conventions:** evidence classes are **[X]** executed, **[I]** inspected, **[Inf]** inferred and **[U]** unverified (an upstream or handoff claim not yet checked in Core). Task IDs are stable; new ones are added, none are reused, and withdrawn ones stay withdrawn. Reviewer tags: A is Claude, C is Codex, G is Gemini; "R10" is round 10.

---

## 0. Changes since v9

Round 10 reviewed v9. Its reviewers again endorsed the v8 simplifications and found defects at execution scale and at the edges of the repository: Windows command-line limits, test collection on the real tree, a dependency contradiction at the cutover, a control that Vitest cannot run, guards that judged by a denylist, and owner-directed work in flight that v9 did not follow. v10 resolves every finding. E63–E67 and E74 qualify components or reproduce failures. The full Windows rehearsal (VR-9), the three integration-selection legs (VR-13) and the real pin-plus-provenance acceptance/rejection pair (VR-8) are implementation gates, not completed runs. Several fixes remove machinery: the React Doctor rebind tools, the test spawn helper and its lint rule, three ESLint plugins, and most hand-written fault patches.

### 0a. Round-10 findings → resolution

<!-- prettier-ignore -->
| Finding (reviewer) | Resolution in v10 |
|---|---|
| The UI bridge imports three ESLint plugins that the cutover removes (G F3, hard gate) | The bridge imports no retired plugin. After CT-0a's conversion only three upstream comments in the vendored ReUI files name a retired rule, and an inline no-op stub resolves them. Executed: gated exit 0 with zero messages, raw exactly 1,703, a stale directive fails (E63). `eslint-config-next` leaves the bridge manifest. D1, D12 |
| CT-0a's directive conversion breaks the bridge on the checkout file: an inline configuration comment re-enables `react-hooks/refs` (A F1) | CT-0a inventories and removes ESLint inline configuration comments. The one that exists becomes a `react/refs` override for that file in the transition entry; Oxlint reports the same site and a seeded control proves the protection (E64). `verify:quality` rejects such comments afterwards. D5, D12, §8.2 |
| `pre-commit.mts`, `lint.mjs` and `git add` fail with `ENAMETOOLONG` on Windows at commit scale; staged non-source files warn (G F1, hard gate) | One chunker for every runner; `lint.mjs` chunks after a single health run, takes `--paths-file`, filters by extension and bridge ignores, and passes `--no-warn-ignored`; Git receives path lists through its batch forms, never as arguments (the staged runner never runs `git add`, C 2 below). D3, D10, D12, VR-9 |
| Whole-repo `vitest list --json` fails at base and hides `skipIf` IDs (G F2, hard gate) | A1 repairs the two files with no collectable suite. Link checks list only the referenced files, filters first. Test IDs come from one tool, per entrypoint and platform; file parity uses `--filesOnly`; compare gated IDs in their owning jobs; an approved tier move may change the entrypoint, not the union. Whole-repo collection health is a CI step. D5, §4.7, §7.2, §8.5 (TID-1), E67 |
| The direct-selection denial control cannot run under `test.exclude`; the spawn rule collides with frozen acceptance suites; ephemeral child variables (G F4, hard gate) and children started by code under test (A F4) | A three-leg control; `configDefaults.exclude` is spread. **No spawn helper and no spawn rule:** the preload reaches inheriting Node and Bun descendants, including children of code under test; their refusals join the per-test record. No acceptance suite is edited. E66 passed eight preload fixture cases, one of which demonstrates the replacement-environment limit; it separately tested external HTTP through git and curl. E67 reproduces collection denial. The guard also wraps `node:child_process`, so a child given a replaced environment is covered as well (E75). W-MOCK-SB must prove the remaining network and three-leg controls in VR-13, including caller-supplied ephemeral integration variables. The two `stripe-live` suites get an explicit integration selection and a test-mode credential gate. The guards stay on in the integration tier, limited to registered hosts. §4.7, VR-13 |
| ESLint accepts ledger keys for deleted files and a prune drops unrelated dead keys (G F5) | `lint.mjs` fails on a key whose file is gone, and a path-limited prune may change only keys under its paths. Reproduced (E65). D12, VR-9 |
| `verify-mechanical` has no `node_modules`, no defined path set, and compares structural JSON edits byte for byte (G F6) | Identical lockfile required; a scratch worktree with its own frozen install, reused; replay through the writer's own enumeration with a recorded revert list; derived JSON written through the format adapter before comparison. §8.3 |
| App typecheck flags and Turbo config; zero-commit CI range; a missing bridge trigger; lint-job time; Windows and WSL share a hostname (G F7) | `-p tsconfig.typecheck.json` with `incremental: false`, declared as root package tasks; base equal to head resolves to `HEAD^..HEAD`; `tooling/typescript-config/**` triggers the full bridge; one health run, scoped typed checks and a measured split rule; the lock records its platform. §5.2, §7.1, §7.2, D3, D10 |
| Agent-hook contradictions, unstated matchers, static-import failure before the handler (G F8) | Wording aligned; matchers stated; the entry is plain JavaScript that loads the implementation dynamically inside its handler. D11, VR-10 |
| Owner-directed quality work in flight is not followed, and RDL-1 rebinds a ledger the owner ruled must never be rebound (A F2) | New D13: follow develop at every batch, never maintain what another change is deleting, one owner per shared surface. **RDL-1 and RDX-1 are withdrawn**; SR-1 and the pin amendments are conditional; hook and workflow owners are named. D9, D13, E69 |
| The money and nullable-number rewrite guard is a denylist; `> 0` and bigint escape it (A F3) | An allowlist keyed on the base numeric-truthiness findings: `isNonZero`, `isNonZeroBigInt`, direct `x !== 0n` on a non-nullable bigint, or an owned money predicate on the same operand; otherwise record and test the behavior change using the applicable zero, negative, missing and (number only) `NaN` cases. D6, §4.2, VR-13 |
| Test-double casts have no honest class (A F5) | Class P4 covers doubles in registered doubles owners, whose doubles throw on an unprovided member; `as never` is rejected elsewhere in tests. D5 |
| Exception test links prove existence, not relevance (A F6) | Static relevance on every run, executed relevance (coverage of the marked code by its own named test) at slice acceptance and in CI. D5, VR-13 |
| A slice can weaken tenant, auth and money tests without touching product code (A F7) | One fault-patch library built at A3; select on base or head test reachability and require each protecting test, not just one per function, to detect the fault on its recorded assertion. §8.5 (FP-1) |
| The Payload fault-patch recipe needs Postgres in the unit tier (A F8) | Patches run against the direct access-function tests, with a static wiring check on every collection's `access` block. §4.2 |
| `no-cast-helper` misses `T[]`, `Promise<T>` and overload helpers; "test-first" is labelled by rule, so it covers type-only edits (A F9) | The rule reports assertions that reference the function's own type parameter and the overload form. Behavior relevance is decided per edit by emitted output. D5, §4.2 |
| `no-silent-catch` scope and notifier owners; `runDetached` signature; workflow ownership in W-MOCK-SB; legacy-directive conversion proof; branch-coverage wording; about 945 per-property patches; guards off in the integration tier (A F10) | Scope stated and sized by a handler inventory, with reporters, notifiers and failure values registered; `runDetached` takes a promise or a function; W-MOCK-SB-CI is a coordinator commit; the legacy list keeps base text and the conversion is recomputed; covered-branch counts cannot fall and new branches must be covered; patches for the high-risk classes and a reviewed mapping for the rest; guards stay on. D5, §4.7, §8.5 |
| The Windows pre-commit cannot pass the UI file list in one ESLint call (C 1, hard gate; the same failure as G F1) | Resolved with G F1: one health run, then bounded ESLint chunks from a paths file. Two controls are added: an error that occurs only in the last chunk fails the run, and an empty UI set exits 0 without linting every workspace. D10, D12, VR-9 |
| Pre-commit can stage an edit the author never selected: it formats working-tree files and stages them, and a write between the guard and the staging is swept in (C 2, hard gate) | The staged runner formats the **staged bytes** and writes the result to the index itself; it never runs `git add`. A working-tree file that changed while the hook ran is left alone and named. E74 covers an edit before the comparison; VR-9 also checks an edit immediately before index publication. D10, VR-9 |
| A mechanical pin amendment needs a provenance comment that the blob comparison rejects (C 3, hard gate) | `verify-mechanical` applies the exact old-text and new-text pair of the amendment record; the pair may change the pin literal and one adjacent comment line, nothing else. §8.3 |
| The ratchet is required for CT-0b before it exists, and §8.5 promised site-level detection the count ratchet does not give (C 4) | CT-0b is accepted by source replay and the programs that already block; the ratchet applies from A6. Slice acceptance states the real guarantee, with a control for the undetected same-key move. §5.5, §8.5 |
| The public app typecheck has no literal command, and a clean tree cannot prove isolation from dev-generated types (C 5) | `tsc --noEmit -p tsconfig.typecheck.json` (as for G F7); the isolation control runs with a poisoned dev-types file present in every app. §5.2, VR-6 |
| An owned-path ESLint prune can publish an unowned ledger deletion (C 6) | The owned-key check of G F5; unrelated dead keys are removed only by the coordinator's full-scope prune. D12 |
| Editors cannot find the bridge config, and the bridge's retirement has no single revertible point (C 7) | ESLint is off in editors from CT-0a, when the editor settings land with the formatter; the bridge is reached through `lint:ui`, `check:changed` and the staged hook. W-UI is split: W-UI-a ends on a green zero-debt bridge, and W-UI-b is the engine switch as one revertible commit. D11, D12, §11 |

### 0b. Retained from earlier rounds

Unchanged in substance: the toolchain cohort and TSRS binding and identity (D1, D4); root entry configs and the per-command entry table (D2, D3); protected and mirrored-tree ignores; the anti-slop policy and exception classes (D5); the money scope, TA-1 and golden-hash protections; proof-or-note rebinds (D9); the CT-0a/CT-0b split; the single UI-bridge config and directive ownership between the engines (D12); job-scoped network authority (§4.7); the ordered `verify-mechanical`; uncached app typechecks; the Stripe construction guard; program ownership, healthy runs and the count-based ratchet (§5.4–§5.5); per-platform strict builds; event-aware CI with the commit-range resolver; PF-1; FB-1; RB-1; GEN-1; and the v8 simplifications (the incumbent ESLint UI bridge instead of an Oxlint ledger, `verify-mechanical` instead of whole-tree replay, count-based ratchets, the Node hook launcher with JSON feedback, no global unstub change). Resolutions of rounds 2 to 9 are in the council record.

### 0c. Changes made at ratification

After round 10 the coordinator made five kinds of change that no reviewer scored. The council record gives each one with its source.

- **Two arbiter rulings.** The owner's standing instruction is that a choice which would otherwise go to him is ruled on by a fresh, independent agent, from the evidence and the coordinator's recommendation. The first ruling settled how this change follows the quality pull requests open on develop: batch A1 starts now, batch A5 is held for up to two working days if that stack is still open, and each shared file has one owner (D13). The second settled a conflict with the edit-hook requirements that pull request #2726 brings: the hook changes layout only, never blocks an edit, and stops within its time budget (D11).
- **A nothing-lost audit.** Eleven independent readers compared the draft with plan versions 1 to 9, the evidence, the owner's assignment, the research handoff and the reviews of rounds 1 to 9. They reported 253 items that successive compressions had dropped or weakened. Each was accepted, accepted in a changed form, found already present, or rejected with a reason. The largest restorations are the task glossary of §10 (with the rule that a lint crash exits 2 and never passes), the version verifier's contract (§5.2), the contract of each formatter consumer (§6), the per-library TanStack protections (§4.4), the Playwright scope (§4.5), the backend-parity and performance procedures (§7.4), and the design-system suites that W-UI must port (D12).
- **New evidence, E70 to E76:** the quality pull requests opened on 19 November, the socket guard's coverage, Oxlint's native suppression file, the formatting of this change's own documents, the staged-bytes prototype, a guard that reaches a child whose environment was replaced, and port-qualified proxy exemptions.
- **Editor settings** land at the cutover instead of at the end (D11).
- **A final consistency check.** Five independent readers looked for the defects that a merge of about 200 edits leaves behind: unresolved round-10 findings, contradictions between sections, companion documents that disagreed with the plan, false repository facts, and assignment clauses with no mapping. Each finding was fixed; the council record lists them. Among the fixes: the first batches can now be executed as written, the staged runner never writes a working-tree file, and the numeric-truthiness check works per finding instead of per file.

---

## 1. Outcome and definition of done

1. **Policy:** Ultracite 8.3.0 presets on Oxlint 1.94.0 and Oxfmt 0.79.0, under one root policy.
   - All 18 anti-slop rules are active, with one justified JS carve-out.
   - Core's architecture, design-system, Query, Playwright and test checks are preserved, and in places strengthened.
2. **Typed lint:** TSRS `7.1.0-beta.tsrs2` is the only installed typed-lint backend, bound per platform and proven to run on Windows and Ubuntu.
3. **Compiler:** Microsoft TypeScript native `7.1.0-beta` is the independent compiler for all 16 product workspaces and for the root, script, tooling and central-test programs. Classic `typescript@6.0.3` serves the API, parser and editor.
4. **ESLint and Prettier:** neither owns Core source any more. Only the two-rule Query bridge stays on ESLint.
5. **Zero debt:** zero findings and warnings under the accepted policy on every owned scope. Every compiler program is blocking. No suppression or ratchet file remains at completion.
6. **Integration:** hooks, staging, caches, CI and docs are wired and verified. Harness integrations that are not proven are documented as explicit-command only.

"Done" means §12 holds on a fresh frozen install of the final reviewed revision, and an independent final review has run. Record Node and Bun versions for final acceptance, TC-4 and the strict builds; all use the supported Node range and pinned Bun (§2).

---

## 2. Current ground truth (refreshed 2026-11-19)

<!-- prettier-ignore -->
| Fact | Evidence |
|---|---|
| **Runtime:** Core supports Node `>=24.22.3 <25` and pins Bun `1.4.3`; CI pins Node `24.22.3`. The round-1 runs on Node `24.22.1` are qualification evidence, not acceptance runs. | Root manifest, `.node-version`, CI, round-1 investigation [I] |
| **TypeScript pins:** 16 product pins `typescript: 7.0.2`; root `@typescript/native: npm:typescript@7.0.2`; classic 6.0.3. Five vendored manifests declare the alias (refresh-from-upstream only). `lib` is declared in five presets plus `packages/auth`, `packages/config` and `apps/factory-console`; children replace the parent array. `packages/eve-runtime` extends no preset. | E1, G R6–R7 [I] |
| **ESLint today:** `bun run lint` runs workspace ESLint configs only; root-only bans are unenforced in CI. `lint:ui` is `tooling/eslint-config/lint.mjs`: a six-workspace default with `--raw` and `--prune-suppressions`. `@shadcn/lint` is declared only in `tooling/eslint-config` and does not resolve from the root. | E15, E46, G R5 [X/I] |
| **CI:** runs on `pull_request`, `push`, `merge_group` and `workflow_dispatch`. Turbo `--affected` ignores task `inputs`. `ci-build-policy.mjs` treats any non-app `tsconfig*.json` as a shared build trigger. `ci-build.mjs` drops `--force`, and on win32 builds directly without Turbo. Configs set `incremental:true`. | G R4–R6, E46 [X/I] |
| **Formatting today:** Prettier 3.9.10 with default options (E10). Formatter consumers: the handoff's six scripts plus `scripts/lib/openspec-contracts.mjs` (E8), and the Phase 27/28/29 renderers, the two Python renderers and the managed-skill test that round 1 added; §6 lists them all. The tree holds 2,344 `prettier-ignore` lines in 172 files, and tests read `.prettierignore` (E8). | E8, E10, G R1 [I/X] |
| **Oxfmt:** honors `prettier-ignore` and `.prettierignore`. Compat options change 233 files. The Ultracite preset sorts and carries shared ignores. `.mts` configs and `sortImports:false` work. Oxfmt adds a final newline to the ledger. It changes `packages/database/collections/registry.ts` and the `POST` slice of `packages/api/src/donate/index.ts`. | E10, E43, E44, C R5, G R6 [X] |
| **Oxlint config semantics:** overrides and ignores are rooted at the config file's directory. `extends` drops `env` and `ignorePatterns`. Root configs work from a private cwd. Config-level `reportUnusedDisableDirectives` fails untyped runs on type-aware disables; the CLI severity flag on typed runs does not. Without `--type-aware`, typed rules are inactive. | E26, E47, G R6, C R6 [X] |
| **Hash-bound records:** <br>• Shadscan (issue #2707 retires this ledger). <br>• shadcn: five hash sets across two path roots plus split components. <br>• React Doctor: ungated and 182/254 stale. By owner ruling its records are never rebound; PR #2723 retires the ledger. <br>• Skill audit. <br>• Acceptance and script pins: hex literals, workflow fingerprints, git-history equality, byte-length constants. | E2, E21, E48, E69, G R5–R6, A R6, A R10 [X/I] |
| **Anti-slop defect:** the alias defect crashes two rules; a scoped patch fixes it. Three rules have zero findings: `no-reduce-accumulator-copy`, `no-unknown-type-aliases`, `no-widen-then-assert`. | E18, E22 [X] |
| **Finding counts:** candidate raw 100,839; 57,601 after M1. Bulk "type-only" fixes broke 108 compile sites. The M1 file list is 3,156 JS/TS paths (373,148 characters as absolute arguments). | E26, E27, C R6 [X] |
| **TSRS:** matches tsgolint on diagnostics: 7,265 each on `packages/api` (E7, repeated by Codex in rounds 5 and 6) and 25,352 each on apps plus packages, with four differences in message text only (E12). Codex's round-1 investigation also found the safe-fix patches equal on the scopes it measured; TC-5 repeats that comparison on the frozen corpus. Platform packages: `@tsrs/win32-x64`, `@tsrs/linux-x64-gnu` and `@tsrs/linux-x64-musl`; FB-1 uses `@oxlint-tsgolint/linux-x64`. | E7, E12, C R1, C R5–R6 [X] |
| **Oxlint suppressions:** stale and growth both fail; a targeted prune also drops deleted paths (E54). Private-cwd fixing and report-only runs leave a ledger untouched. This plan uses no Oxlint suppression file (D12). | E35, E37, E42, E54 [X] |
| **Central tests:** 1,788 files. `@/` ownership is unique per file. `@payload-config` reaches 7 tests. Workspace-only specifiers resolve to one declaration each. `tests/setup/unit-env.ts` imports `scripts/git/environment.mjs`. | E40, E41, E45, C R6 [X] |
| **Mocks:** Vitest 5.0.5 unstubs before every test when `unstubGlobals` is set, restoring each global's first-stub original; module-level stubs are discarded. Core sets only `clearMocks` (no `unstubGlobals`/`unstubEnvs`), and keeps it. There are 469 `vi.stubGlobal(` calls in 194 files across all globals and lifetimes; `fetch` is also replaced by `spyOn(globalThis, "fetch")` and direct assignment. stripe-node 22.2.0 uses Node `http` and accepts `host`/`port`/`protocol`. supabase-js resolves `fetch` at call time; it sends the key in `apikey` and, for PostgREST and storage requests without a session, also as `Authorization: Bearer`. | A R5–R8, E50, E51, E57 [X/I] |
| **Env validation:** `SKIP_ENV_VALIDATION=1` returns the raw environment (`schema.ts:414-416`); the unit env, the Playwright servers and three workflows set it. Core never sends `Stripe-Account`; tenant isolation is the per-tenant secret key, with no platform fallback for a missing tenant. | E51 [I] |
| **Hooks:** one shell command (`node "$(git rev-parse --show-toplevel)/…"`) works in PowerShell and Git Bash from a subdirectory. Cursor loads `.claude/settings.json` hooks by default and runs the command verbatim (argument `claude`), with `path` in its payloads. A bare PowerShell `if` wrapper loses exit 2, and a git call in the outer command reads an inherited `GIT_DIR`. This plan registers a Node launcher instead (E59). | E49, E53, E59, G R6–R8 [X/I] |
| **Oxlint prune and ignores:** a targeted `--prune-suppressions` also drops entries for deleted, unnamed paths. Oxlint does not read `.prettierignore`; Ultracite's shared ignores exclude no skill, mirror or doc trees (117+ tracked JS/TS files under `.agents/` alone). | E54, G R7 [X/I] |
| **Compiler inputs:** tsconfig `include` has no brace expansion (TS18003). Next 16.4.5 writes `.next/types/validator.ts`; the three product apps include only `.next/types/**/*.d.ts` and type-check without `next typegen`. `packages/eve-runtime` uses no preset and declares no `lib`. | E52, E55, G R7 [X/I] |
| **Directives at base:** 267 disable directives in 141 authored files; 251 have a reason; 230 are `no-restricted-imports`. | E56 [X] |
| **Acceptance blob pins:** `issue-2258` pins seven paths (authz tests and `projection/types.ts`) by git blob id computed from working-tree bytes. | E57, C R8 [X/I] |
| **Next typegen:** runs without service variables on all four apps, leaves no tracked drift, and the generated `validator.ts` compiles cleanly on 7.1-beta (Admin's only errors are the five known TS2883 sites). | E58 [X] |
| **Hook launcher:** a Node one-liner that finds the repository root without git works unchanged in Git Bash, Windows PowerShell, PowerShell 7 and cmd.exe. | E59 [X] |
| **Incumbent UI ledger:** the six UI workspaces (`apps/{admin,donor,missionary,factory-console}`, `packages/{ui,missionary}`) run `tooling/eslint-config/lint.mjs` as their `lint`, with a count-based ledger of 1,703 `shadcn/*` counts in 108 files. The other ten packages run ESLint directly. The shadcn layer is `design-system.mjs`. | E1, E60 [I] |
| **Bridge config:** one non-discoverable config (TS/JSX parser, preserved ignores, `designSystemConfig()`) reproduces the ledger exactly: gated exit 0; raw 1,703 findings in 108 files, identical per rule; no unknown-rule errors. After CT-0a's directive conversion it needs **no retired ESLint plugin**: the nine vendored ReUI files resolve their three upstream comments through an inline no-op stub. | E61, E63 [X] |
| **Directive ownership:** Oxlint's root option `respectEslintDisableDirectives: false` makes it ignore `eslint-*` directives while still honoring and checking `oxlint-*`. With unused-directive errors on (vendored ReUI exempt), the bridge reports exactly two stale non-UI directives; the two shadcn directives are live. | E62 [X] |
| **Inline configuration:** one ESLint inline configuration comment exists, `checkout-client.tsx:4` (`react-hooks/refs`, AL-1958, the payment path). It re-enables its rule in the bridge once line 2341's directive is converted. Oxlint's `react/refs` reports the same site and honors `oxlint-disable-next-line react/refs`. | A R10, E64 [X] |
| **ESLint ledger behavior (10.13.0):** a subset prune leaves other existing files' entries alone; a key whose file is gone is accepted silently, and any prune drops such keys. | G R10, E65 [X] |
| **Windows command lines:** process creation fails with `ENAMETOOLONG` above 32,767 characters, even without a shell. The 1,466 UI sources are 177,070 characters as absolute paths, and `lint.mjs` starts ESLint once with every path. | G R10 [X] |
| **Test collection:** whole-repo `vitest list --json` fails at base on two files with no collectable suite, and takes 43 s; `--filesOnly` takes 2 s; `describe.skipIf` suites list no IDs; an excluded file selected directly stops at collection, before any setup file. | G R10, E67 [X/I] |
| **Child processes in tests:** 65 acceptance files (owned by Acceptance) and 131 other test files start processes. A guard preloaded through `NODE_OPTIONS` and `BUN_OPTIONS` reaches inheriting Node and Bun descendants; E66 case 6 does not load it; wrapping `node:child_process` in the same module closes that case (E75). The proxy fixture stopped external HTTP from git and curl; port-qualified `NO_PROXY` entries are honored by Bun and ignored by curl and git (E76). | E66, E68 [X/I] |
| **App typecheck and Turbo:** all four apps run `tsc --noEmit`; the presets and Factory Console set `incremental: true`; Factory Console has no `turbo.json`; `verify-eslint-config.mjs` runs the health check seven times. | G R10, E68 [I] |
| **Work in flight** (all open and unmerged on 2026-11-19, develop at `182eb0338`): React Doctor advisory (PR #2723); acceptance pins to rules (PR #2716); Shadscan advisory (PR #2725), which also proposes an unratified ESLint accessibility-lint change; a fast pre-push profile, a shared agent edit hook with its own OpenSpec requirements, and a three-shard unit job (PR #2726); an advisory API-contract workflow with live suites (PR #2727); the merge queue (PR #2722); skill retirements (PR #2719). | A R10, E69, E70 [I] |

---

## 3. Decisions

### D1. Exact toolchain cohort

<!-- prettier-ignore -->
| Package | Pin | Role | Task |
|---|---|---|---|
| `ultracite` | 8.3.0 + reviewed Bun patch | presets, anti-slop | TC-1, TC-2 |
| `oxlint` | 1.94.0 | linter | TC-1 |
| `oxfmt` | 0.79.0 | formatter (installed A1, active CT-0) | TC-1, CT-0 |
| `tsrs` | 7.1.0-beta.tsrs2 | typed-lint backend only | TC-1 |
| `@typescript/native` | `npm:typescript@7.1.0-beta` | root compiler | TS-1 |
| `typescript` ×16 | 7.1.0-beta | workspace compiler | TS-1 |
| `typescript` (root) | 6.0.3 (unchanged) | classic API, parser, editor, typed checks in `verify:quality` | — |
| `eslint`, `@typescript-eslint/parser` | 10.13.0, 8.72.0 (unchanged) | the Query bridge, and the UI bridge until W-UI | — |
| `@tanstack/eslint-plugin-query` | 5.108.0 | Query rules | TC-1 |
| `eslint-plugin-playwright` | 2.12.2 | Oxlint JS plugin | TC-1 |
| `@shadcn/lint` | 0.2.3 with its patch, in `tooling/eslint-config` (the UI bridge) until W-UI; then a root devDependency for the Oxlint JS plugin: 0.2.3 with its patch moved to `tooling/quality/patches/`, or 0.2.5 unpatched if TC-6 proves equivalence (D12) | ESLint UI bridge → Oxlint JS plugin at W-UI | TC-6, W-UI |

**Not installed:**

- `oxlint-tsgolint`; FB-1 documents the fallback.
- Root devDependencies used only by tests.

**Retired at CT-0a:** direct Prettier declarations and Core imports and commands that invoke Prettier, the general ESLint rules and configs, and every general ESLint plugin and shared config package: `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-unused-imports`, `eslint-config-next` (also removed from `tooling/eslint-config/package.json`) and the rest that only the general configs used. The UI bridge needs none of them (E63). The `@asym/eslint-config` workspace survives only as the UI bridge (design-system layer, `lint.mjs`, `health.mjs`, the ledger); from CT-0a its dependencies are `eslint`, `@typescript-eslint/parser` and `@shadcn/lint` with its patch. It is retired at W-UI; `verify:eslint` is reduced to the bridge config until then. The CTI lists every removed package. For Prettier, `retired.json` checks direct declarations and live Core callers, not transitive `bun.lock` entries, and a frozen install followed by `lint:ui`, `lint:query` and `verify:eslint` proves that nothing still imports one.

**Lockfile:** `bun.lock` is regenerated in the same commit as each manifest change. Manage the cohort manually at exact pins. Neither `ultracite init` nor `ultracite upgrade` configures Core: the typed 8.3.0 initializer adds `oxlint-tsgolint` and older Oxlint and Oxfmt ranges. Inspect any generated setup only in scratch; do not copy its configs, guidance, hooks or editor settings wholesale.

### D2. Configuration layout

**Root entry configs** are the only paths ever passed to `-c`:

| File                           | Purpose                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `oxlint.config.mts`            | Full policy; editors and plain runs discover it.                                                                                                       |
| `oxlint.transition.config.mts` | Transition gate for A5–C2; deleted at CT-1.                                                                                                            |
| `oxlint.fix.config.mts`        | Exports the policy named by `CORE_FIX_POLICY` (`fix`, `m1` or `m2:<rule>`). Only `fix.mts` sets the variable; an absent or unknown value throws (E47). |
| `oxfmt.config.mts`             | Formatter config.                                                                                                                                      |

Rules for every Oxlint entry:

- It spreads `env: core.env` and `ignorePatterns: [...core.ignorePatterns, ...coreRepoIgnores]`, because `extends` does not carry them.
- It writes overrides root-relative.
- It sets neither `typeAware` nor `reportUnusedDisableDirectives`; D3 decides those per run.
- It sets `options.respectEslintDisableDirectives: false` (E62), so Oxlint reads only `oxlint-*` directives and never treats the bridge's `eslint-*` directives as its own.

**`coreRepoIgnores`** lists:

- tracked generated files: `apps/admin/app/(payload)/**/importMap.js`;
- local generated outputs: `apps/admin/payload-types.ts`, `**/public/maplibre/**`, `**/.eve/**`, `playwright-report/**`, `test-results/**`;
- **managed, mirrored and protected trees** (Oxlint does not read `.prettierignore`; G R7): `.agents/**`, `.claude/**`, `.cursor/**`, `.next-docs/**`, `docs/**` and `tests/fixtures/skills/**`. Canonical skill sources under `docs/ai/skills/**` keep their own audit flow (D9 family 4). No lint batch (M1, M2) fixes them. They are in the format scope (D8), so CT-0b formats the ones Oxfmt changes;
- negative fixtures;
- evidence trees.

**Owned outside the usual roots:** `docs/prds/**/tools/*.mjs` (10 authored tools, re-included after the `docs/**` ignore) and `.oss-scanner/smoke.mjs`. They get untyped lint and Oxfmt.

`verify:quality` shares the same list. It also checks that every tracked JS/TS-family path is either owned (lint scope) or matched by exactly one ignore with a reason.

**`tooling/quality/`** has no `package.json`. It contains:

- **Policy fragments:** `policy.mts`, `layers.mts` (with `JSX_ELEMENT_RULES`), `restricted-imports.mts`, `design-system.mts`, `reui-data-grid-exceptions.mts`.
- **Query bridge config:** `eslint-query.config.mjs`.
- **Runners:** `lint.mts`, `lint-query.mts`, `lint-query-scope.mts`, `fix.mts`, `agent-hook.mjs` (the plain-JavaScript hook entry) with `agent-hook-impl.mts`, `hook-launcher.mts`, `pre-commit.mts`, `staged-guard.mts`, `verify-quality.mts`, `verify-mechanical.mts`, `scratch.mts` (the provisioned scratch worktree that `verify-mechanical` and the fault-patch runner share, §8.3), `fault-patch.mts` (§8.5).
- **Registries:** `programs.json`, `predicate-owners.json`, `double-owners.json` (D5), `detached-owners.json` (reporters, notifiers and failure values, D5), `directive-map.json` (D5), `derived-records.json` (the registered derived files and their allowed changes, §8.3), `integration-tier.json`(§4.7), `retired.json`.
- **Generated and checked:** `legacy-directives.json` (D5; from A3 until CT-1), `money-scope.json`, `numeric-truthiness.json` (D6), `tenant-auth-scope.json` (§4.2), `handler-inventory.json` (D5), `typecheck-ratchet.json` (until CT-T), `content-pins.json`.
- **Notes and code:** `rebind-notes/`, `amendments/`, `test-moves/` (§8.5; A1's TID-1 writes the first file), `fault-patches/` (FP-1, §8.5), `rules/`, `patches/`, `lib/guards.mts`, `lib/chunk.mts` (the one path-list chunker, D3).

**Guards:**

- `lint.mts` and `fix.mts` refuse any `-c` path outside the repository root.
- Nested configs are rejected, and commands pass `--disable-nested-config`. A negative fixture must also reject a discoverable Biome config at a Core provider root (repository or workspace).

### D3. Lint execution model

- **Entry and flags per command:**

  | Command                                                      | Entry A5–C2                                                       | Entry from CT-1           | Typed          | Unused-directive errors |
  | ------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------- | -------------- | ----------------------- |
  | `lint:ox` (gate)                                             | transition                                                        | full                      | yes            | **only from CT-1**      |
  | `lint:new`                                                   | full                                                              | — (merged into `lint:ox`) | yes            | yes                     |
  | `lint:ui` (the ESLint UI bridge, D12)                        | design-system layer + its ledger                                  | same, until W-UI          | no             | ESLint's own            |
  | `--staged-report` (pre-commit), `check:changed`              | the active gate entry (transition)                                | full                      | no             | no                      |
  | `lint:fast`, explicit-path `fix` report, agent hook, editors | full                                                              | full                      | no             | no                      |
  | batch `fix` (`m1`, `m2:<rule>`)                              | fix policy; **no report step** (the §8.3 whole-repo gate follows) | —                         | rule-dependent | no                      |
  - Typed runs pass `--type-aware --deny-warnings --disable-nested-config`; the unused-directive flag is `--report-unused-disable-directives-severity=error`.
  - Unused-directive errors run only against the full policy, which owns every rule. A combined `SAFETY: P3` directive for `typescript/no-unsafe-type-assertion` is therefore never "unused" in the gate, while genuinely unused directives still fail (C R7). Untyped runs never report unused directives. Every path-scoped Oxlint report, typed or not, passes `--no-error-on-unmatched-pattern --disable-nested-config --deny-warnings`. Test those arguments independently of typed and unused-directive flags: all-ignored input passes, but a real warning fails.
  - Informational full-policy runs (`lint:fast`, the `fix` report) exit nonzero on findings; during A5–C2 they inform slice authors and are not commit gates.
  - `lint:new` gates each slice's owned files (§8.5) from Phase B, and the whole repository at C1, where it must be zero (the shadcn rules are on the UI bridge). Before that it is a report.
  - Typed runs cover whole scopes as directory roots and are never cached.

- **`lint:query`** is one root dispatcher used by `lint`, CI and `check:changed`:
  - the Turbo `lint:query` task in the Query-reachable workspaces (graph-derived and checked), each running `lint-query.mts` with an absolute bridge config from the workspace cwd and `--no-config-lookup --no-inline-config`; `cache:false`, `--concurrency=2`, from CT-0a;
  - The workspace bridge uses the classic TS6 parser service with `projectService: true` and repository-root `tsconfigRootDir`. Its config ignores Next and compiler output, coverage and generated Payload types; test an ignored output independently of the central parent’s child-program ignores (E30). Through the public dispatcher, direct and typed-wrapper rest destructuring and inline void, imported void and imported number-or-undefined query functions must report the intended rule; their valid counterparts stay clean. Keep the Query bridge until a pinned replacement passes those controls (E13).
  - from TS-2 (A6), one ESLint process **per central-test program**, at most two at once, so no process loads more than one program (E23's single-process OOM). The parent `tests/tsconfig.json` run passes generated ignores for every child program directory (from `programs.json`). Programs whose import closure has no Query import (graph-verified, e.g. `tests/e2e`, `tests/unit/scripts`) are excluded, and the exclusion is checked. A6 measures each program's peak heap and time; a program above 2.5 GB is split along its generated directory boundaries.
  - `lint-query-scope.mts` selects work for PRs and `check:changed`: Turbo-affected Query workspaces, plus every central program whose import closure (from `sync-test-programs`) touches a changed workspace or file; a change to policy, lockfile, root config, `tooling/quality/**` or `tooling/typescript-config/**` (the parser's project service reads those presets) selects everything.
- **`lint`:** `lint:ox` + `lint:query` + `lint:ui` (until W-UI; `quality:health` afterwards) + `verify:quality`.
- **`lint:ui [paths] [--raw] [--prune-suppressions]`:** the incumbent ESLint UI bridge over the six UI workspaces (D12, E60). `--raw` is a read-only report with an empty ledger.
- **There is no Oxlint suppression file at any point** (D12). Oxlint 1.94.0 writes `oxlint-suppressions.json` in its working directory on `--suppress-all` and afterwards honors it with no notice in its output (E72). The file's presence is therefore itself a failure: `lint.mts` exits 2 when it exists in its working directory, `staged-guard.mts` refuses it tracked or untracked, and `verify:quality` fails on a tracked one at any path, from A1 and permanently.
- **Writer flags:** `lint.mts` exits 2 on `--fix*`, `--suppress-all` or `--prune-suppressions` and names the right command instead. CT-0 updates the design-system-lint docs to match. Inventory legacy ESLint flags before retiring their callers; do not pass unsupported flags to Oxlint. On request, the runner emits one parseable Oxlint JSON report across all chunks, preserving rule, severity, message, file and location.
- **Explicit path lists** (G R10): every runner that passes file paths to a child process uses one chunker, `tooling/quality/lib/chunk.mts`: deterministic chunks by encoded command length (≤ 24,000 characters on win32, where process creation fails with `ENAMETOOLONG` above 32,767 even without a shell; ≤ 100,000 elsewhere), ordered by sorted paths. Every chunked child process is started with `shell: false`: the win32 chunk limit holds only without a shell, which would cap the command line at 8,191 characters. That covers Oxlint, Oxfmt, the Query bridge and the UI bridge runner `lint.mjs`. A caller with a long list passes `--paths-file <file>` (NUL-separated) instead of arguments. Git never receives a long path list as arguments: the staged runner reads blobs with `cat-file --batch`, pipes each formatted blob to `hash-object -w --stdin`, and writes the resulting IDs and original modes with one `update-index -z --index-info`. It never writes a working-tree file, and ignore checks use `git check-ignore --stdin`. Every tool that lists or searches all tracked files streams Git's output or sets an explicit 64 MiB `maxBuffer`: `fix.mts`, `verify-quality.mts`, the AP-1 inventory `content-pins.mts`, `sync-test-programs.mts` and the CTI's `git grep`. Node's default buffer fails with `ENOBUFS` on Core's 17,961 tracked files (G R8).
- **Workspace `lint` scripts** (so `turbo run lint --filter=…`, the root `lint:<app>` scripts and the workspace `AGENTS.md` commands stay meaningful): every workspace runs `lint.mts --scope .` on the gate entry, typed; the six UI workspaces also run `lint.mjs` (the bridge) until W-UI. `lint:query` stays its own Turbo task. The Turbo `lint` task is uncached.
- **Typecheck:** the Turbo workspace task plus `typecheck:root` (§7.1); §5.5 defines the program gates.

### D4. TSRS binding, identity, mode, resources, fallback

- **Resolution:**
  - win32: `.bin/tsrs-lint.exe`, `.bunx` target `tsrs\bin\tsrs-lint` (UTF-16LE).
  - POSIX: `.bin/tsrs-lint` → `node_modules/tsrs/bin/tsrs-lint`.
  - A missing or substituted launcher → exit 2.
- **Environment:** delete inherited `OXLINT_TSGOLINT_*`, `TSRS_*` and profiling variables. Then set `OXLINT_TSGOLINT_PATH`, the variable through which Oxlint finds its typed backend, to the absolute `tsrs-lint` launcher resolved above (never to the `tsrs` binary itself, E12), and set `TSRS_FAST=0`.
- **Mode:** reference (`TSRS_FAST=0`) uses the pinned checker; leaving the variable unset selects fast mode. On apps plus packages, reference and explicit fast produced identical diagnostics; reference took 6.4–7.4 s at 1.61–1.69 GB backend peak, fast 7.9–9.7 s at 1.83–2.03 GB, and scratch tsgolint 54.8 s at 2.44 GB (E12). Codex's preference for fast mode is recorded as a dissent.
- **Identity (VR-2):**
  1. The shim target, and the installed package version equal to the pin.
  2. The **expected native executable**, resolved by the pinned launcher's own logic: `lib/getExePath.js` (which uses `lib/platform.js` and appends `-gnu`/`-musl` on Linux), imported by file URL from the directory of `require.resolve("tsrs/package.json")` (the `lib/` files are not package exports), with `TSRS_BINARY` removed. A `\\?\` prefix is stripped, and the result is compared by canonical realpath with the child observed during a sentinel run.
  3. The native `tsrs --version` banner must match all three fields: TypeScript `7.1.0-beta`, tsrs `7.1.0-beta.tsrs2`, and `microsoft/TypeScript@3e9236361fa9` (E29).
  4. No `oxlint-tsgolint` or `@oxlint-tsgolint/*` is installed.

  Required controls: Windows (coordinator) and Ubuntu: in WSL at A1, then a CI step in the lint job, which CT-0a adds.

- **Resources:** an integer `N` sets both `--threads=N` and `RAYON_NUM_THREADS=N`.
  - Default: `N = max(1, floor(cpus))`.
  - With `CORE_LINT_PARALLEL=1`: `N = max(1, floor(cpus/4))`. Every implementation agent sets this flag and uses the runner, and at most four typed lints or typechecks run at once on one machine (§8.4); the coordinator lowers that if PF-1 requires it.
- **FB-1** (a replacement transaction, dry-run in a scratch copy, not merged):
  1. Edit both declarations: remove `tsrs`, add `oxlint-tsgolint@7.0.2007`.
  2. Regenerate the lock once, then run a frozen check.
  3. Switch the backend constant.
  4. Resolve the launcher chain: `.bin/tsgolint(.bunx|.exe)` → `oxlint-tsgolint/bin/tsgolint.js` → the platform binary that the launcher's own logic resolves (`@oxlint-tsgolint/<os>-<arch>`).
  5. Check identity:
     - the platform package and its version;
     - `bun.lock` integrity;
     - the binary sha256, looked up by the exact `<os>-<arch>` package; a missing or mismatched entry fails;
     - the observed child;
     - sentinels. There is no `--version`.
  6. Flip the exclusion check.
  7. Compare TC-5 fixtures.

  The compiler is untouched.

### D5. Anti-slop and anti-evasion

- **Rules:**
  - All 18 anti-slop rules are `error`. Carve-out: `no-runtime-typeof` is off in `*.{js,mjs,cjs,jsx}`.
  - The three zero-finding rules (`no-reduce-accumulator-copy`, `no-unknown-type-aliases`, `no-widen-then-assert`) each get a positive sentinel.
  - `verify:quality` rejects new authored JS in owned scope and any TS→JS rename in the branch diff. The exact allowlist holds the configs that must be JavaScript and two files that must load in any Node or Bun process without type stripping: the hook entry `tooling/quality/agent-hook.mjs` (D11) and the network guard `tests/setup/network-guard.mjs` (§4.7).
- **Patch:** a `patchedDependencies` patch on `ultracite@8.3.0`.
  - TC-2 strips the dead helpers `resolvedSubstitutionArgument` and `isUnappliedReferenceTo`.
  - It ships with a 15-fixture test and a Core equality check.
  - It is reported upstream on #60.
- **Closed exception classes** apply to every disable (both `oxlint-disable*` and `eslint-disable*`), to coverage-ignore comments (`v8|istanbul|c8 ignore`), and to class-R markers:

  | Class | Meaning                                                                                         |
  | ----- | ----------------------------------------------------------------------------------------------- |
  | P1    | fixed protocol or persisted names                                                               |
  | P2    | third-party typing mismatch                                                                     |
  | P3    | reflective validator or decoder, with tests                                                     |
  | P4    | governed test shim, or a test double in a registered doubles owner                              |
  | P5    | module-loading subject                                                                          |
  | N1    | framework contract                                                                              |
  | V     | vendored                                                                                        |
  | T1    | analyzer defect, with reproducer and removal condition                                          |
  | **R** | recovery boundary: a documented best-effort or recovery catch, with a test of the fallback path |

  The format is `-- <class>: <reason>`; P3, R and T1 add `[test: <file>#<name>]`. Every new authored disable, including a file-wide one, must name at least one rule and give a nonempty reason; `verify:quality` rejects a blanket disable even if classed. A link must name a test that exists **and exercises the marked code** (A/G R10):
  - **Existence** (every `verify:quality` run): only the referenced files are listed, with `vitest list <files> --json`. File filters come before `--json`, which otherwise takes the next argument as an output file; the step is skipped when there are no links. A missing test fails. The whole repository is never listed on the lint path: at base that listing fails and takes 43 s (E67).
  - **Static relevance** (every run): the linked test file's import closure contains the module that holds the marked code; for P3, the decoder's module.
  - **Executed relevance** (slice acceptance for links the slice adds or changes; the CI unit-test job for all links): coverage is attributed to the exact test a link names, never pooled across tests. Slice acceptance runs each link the slice adds, changes or retargets on its own, only that named test, with V8 coverage, and it must execute at least one line of the handler or decoder body its link marks. CI does the same for every link whose directive, test file or subject file changed in the commit range. For the links nothing touched, CI keeps a cheaper regression check: each linked test file runs once, filtered to its linked names, and each marked body must be executed. A link to an unrelated test fails.

- **Legacy directives:** A3 generates `legacy-directives.json` from the base directives (267 at `e6a5ce81a`, E56; regenerated at A3's own base): file, rule and the directive's full text. It is shrink-only; new directives must be classed. Owning slices reclassify or remove their entries. It is empty and in `retired.json` at C2.
- **Directive ownership (E62, E63):** CT-0a converts every non-shadcn `eslint-disable*` **and `eslint-enable*`** directive in authored JS/TS-family sources to `oxlint-*` (a block disable and its matching enable convert together, as at `packages/ui/components/shadcn/data-table/types.ts:164,180`). Rule names are mapped through `tooling/quality/directive-map.json`. The legacy list keeps each directive's base text; `verify:quality` recomputes the conversion from that text and requires the file to contain exactly the converted directive, so a converted directive cannot be mistaken for one whose reason was edited. Directives that become unused under Oxlint are removed there. `shadcn/*` directives stay `eslint-*` (the bridge owns them) until W-UI converts them. The vendored ReUI files keep their upstream comments: the bridge resolves them through a no-op stub (D12), and Oxlint gives those files a class-V config override.
- **ESLint inline configuration comments** (A R10, E64): `/* eslint <rule>: … */`, `/* global … */`, `/* globals … */`, `/* eslint-env … */` and `/* exported … */` are inventoried by the CTI and removed at CT-0a, each ported to a root-relative Oxlint override in the transition and full entries. One exists at the plan's base: `apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:4`, `/* eslint react-hooks/refs: "error" */` (AL-1958, on the payment path). It becomes a `react/refs: "error"` override for that file in the transition entry (the full entry already carries the rule), and its directive on line 2341 becomes `oxlint-disable-next-line react/refs` with its AL-1958 reason. Oxlint reports the same site as the ESLint rule did, and a seeded ref read in that file is the control (E64). From CT-0a, `verify:quality` rejects ESLint inline configuration comments outside vendored files.
- **SAFETY markers:**
  - `require-safety-comment-for-type-assertion` sets `markers: ["SAFETY: P2", "SAFETY: P3", "SAFETY: P4"]`, so the rule itself rejects untagged markers.
  - **Test doubles have their own class** (A R10): a partial fake is not a third-party typing mismatch, and tests hold 459 `as never` and 220 `as unknown as` assertions at base. `SAFETY: P4:` is accepted only inside a registered doubles owner (`double-owners.json`: one per test program, for example `tests/support/doubles.ts` and a package's own `tests/support/doubles.ts`). An owner exports typed double factories whose result throws `Unstubbed member: <name>` when a test touches a member it did not provide, with negative tests for that behavior, and it is exempt from `core/no-cast-helper`. Outside an owner, `core/no-test-double-cast` rejects `as never` in test files (a chained `as unknown as T` is already reported by `no-chained-type-assertions`), and `verify:quality` rejects a `SAFETY: P4` marker. Slice ledgers count doubles-owner call sites.
  - **Every marker carries the assertion's real class:** `SAFETY: P2:` for a third-party typing mismatch; `SAFETY: P3:` only for a reflective validator or decoder, with a `[test: …]` link like any P3.
  - **Narrowing assertions,** which `typescript/no-unsafe-type-assertion` also reports, use one combined directive with that class, e.g. `// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: P2: <reason>`, counted once. The directive contract accepts `SAFETY: <P2|P3|P4>:` as a class. P4, in a marker or in a combined directive, is valid only inside a file registered in `double-owners.json`: a doubles-owner factory that narrows (for example `Partial<T>` to `T`) needs the combined form, and must not have to label itself P2 or P3.
  - **Production narrowing of I/O data** (Supabase rows, `fetch` JSON, webhook payloads) is parsed through an owner schema; a marker is allowed there only as P3 with a decoder test.
  - **Review threshold:** each slice lists its markers against the casts it removed; a file that gains more markers than casts it lost, or any production I/O marker, needs coordinator review.
  - `verify:quality` enumerates markers by regex over all comments and checks the tag, boilerplate, and any reason reused more than three times.
  - `core/one-assertion-per-safety-marker` uses the anti-slop owning-statement algorithm, starting from each assertion. Two assertions under one marker are reported.
- **Ceilings:**
  - New disables plus class-R markers may not exceed 2% of the findings a slice resolved, each one listed; beyond that, coordinator review.
  - SAFETY markers are the prescribed form for necessary assertions, so they have no percentage cap. They are governed by the marker contract (tag, boilerplate, reuse, one assertion per marker) and listed per slice.
  - `core/no-cast-helper` reports three forms (A R10): an assertion whose target type **references** the enclosing function's own type parameter (`T`, `T[]`, `Promise<T>`, `Record<string, T>` and so on) when the operand's declared type does not; an overload set whose implementation returns a wider type than a generic overload promises (the assertion-free `cast<T>(x: unknown, _hint?: T): T` form); and a function whose body only returns a parameter asserted to a fixed type. Fixtures cover each form and a two-statement body. Registered doubles owners are exempt. `typescript/no-unnecessary-type-parameters` stays on from the preset.
- **Guards:**
  1. **Mocks.**
     - `vitest/no-restricted-vi-methods` deny list: `mock`, `doMock`, `unmock`, `doUnmock`, `importMock`, `unstable_mockModule`.
     - `core/no-module-mock-evasion` runs on **all** files and:
       - enforces the same deny list;
       - in authored Vitest suites, rejects `mock.module` bound to `bun:test`, including aliased and namespace imports;
       - bans any non-call value use of `vi` or the `vitest` export (aliasing, destructuring, re-export, computed member, `.call`/`.apply`/`.bind`);
       - reports `vi.spyOn(x, …)` when `x` is bound by a namespace import, a default import of a module, or a `require`/`import()` result; a typed `verify:quality` check also reports a spy target whose type is a module namespace object (covering named imports of `export * as api` re-exports).
     - Type positions (`typeof vi.fn`, `ReturnType<typeof vi.fn>`) are exempt.
     - P4/P5 exceptions use classed directives.
  2. **Predicates.**
     - `core/no-trivial-type-predicate` reports a type predicate or assertion function whose body returns a constant, whose body never reads its parameter, or whose asserted type is the parameter's declared type (or a supertype). Fixtures cover each, plus an allowed discriminant check.
     - **`typeof x === "function"`** on a declared union (the TanStack updater pattern, e.g. `contributions/main-body.tsx:1401`, `use-crm-grid-layout.ts:215`): the allowed repairs are TanStack's `functionalUpdate` through the Table owner, an owned `isUpdaterFunction<T>` in the workspace guards owner (with negative tests), or class N1. Removing the check is never a repair.
     - `core/no-generic-primitive-predicate` (syntactic):
       - every predicate or assertion function annotates its parameter;
       - same-file aliases are resolved;
       - the rule reports when a parameter is `unknown`, `any`, `{}`, `object` or an unconstrained type parameter;
       - asserting a primitive keyword or `Function` from such a parameter is banned everywhere.
     - Imported aliases are resolved by a typed check in `verify:quality` (classic checker): it reports only when the alias resolves to an unknown-like type. So `ctx: AuthContext` narrowing to `AuthenticatedContext` is allowed (A R6).
     - Structural guards are allowed only in the registered owner:
       - one per workspace;
       - plus `tests/support/guards.ts`, `scripts/lib/guards.mts` and `tooling/quality/lib/guards.mts`.
     - Owners carry negative tests per claimed property. Tests that use Zod resolve it through their test program's generated paths; `scripts/lib/guards.mts` and `tooling/quality/lib/guards.mts` are hand-written structural guards, because the root has no Zod and no root dependency is added (§5.4).
     - Each slice reports new calls to registered predicate owners alongside the `typeof` checks it removed. Review the comparison against the owners’ negative tests, not as a one-for-one quota.
  3. **Promises.**
     - `no-floating-promises` with `ignoreVoid:false`.
     - `detached-owners.json` names the sanctioned form per workspace:
       - workspaces that depend on `@asym/lib` use `runDetached(work, { operation })` from `@asym/lib/monitoring`, where `work` is a promise or a function that returns one. It does not exist yet: **RD-2** adds it before any conversion. Contract: it attaches one rejection handler that reports through the existing monitoring client with the operation name, reports a synchronous throw from a `work` function in the same way, never rethrows, and returns `void`. Tests cover a rejected promise, a function that throws synchronously, a function whose promise rejects, and the absence of an unhandled rejection;
       - Console and eve-runtime each own one that reports through their logger;
       - `env`, `email`, `config`, `database`, `auth` and `mock-data` have no detached work: hooks return the promise, and consumers detach it;
       - scripts and tooling use top-level `await`.
     - `core/no-silent-catch` judges **every asynchronous failure handler in production code** (A R10): each `.catch(h)` and `.then(_, h)` handler, and each `catch` clause of a `try` block that contains `await`. At the plan's base that is 95 `.catch(` sites and 569 `catch` clauses. Tests are out of scope: their handlers are assertions. A purely synchronous `catch` falls under `no-empty`.
     - **Allowlist, not denylist:** a handler is non-silent only if it does at least one of these:
       - rethrows;
       - calls a registered **reporter** (the workspace logger or monitoring client);
       - calls a registered **notifier**, a user-facing failure channel: the toast owners (for example `toast.error`, as at `apps/admin/app/(app)/crm/columns.tsx:361`) and each workspace's registered error-state setters;
       - returns or passes a registered **failure value**: a failure constructor such as `failure(...)`, or an error response with a literal status of 400 or above built by `NextResponse.json`, `Response.json`, `new Response` or a registered response helper.

       The three lists live in `detached-owners.json`, per workspace.

     - Every other handler needs a class-R marker with its linked fallback test, whether its result is discarded, awaited, assigned or returned. That includes an empty or comment-only handler, one that returns only a literal, `undefined` or `null` (`await p.catch(() => null)`), and `() => ({})`, `() => []`, `() => void 0` and `() => FALLBACK` (e.g. `pdf/page-client.tsx:1199,1252,1302`).
     - **Sized before Phase B (RD-1):** `scripts/quality/handler-inventory.mts` writes `handler-inventory.json`, every handler with its classification (rethrow, reporter, notifier, failure value, silent shape, other). A3 reviews the "other" group once: a recurring legitimate pattern is registered with a reason, and the rest are left for their slices to repair or to mark class R. The counts go into the packets, so the class-R budget is known before slices start.
     - Slice ledgers count try→`.catch` rewrites.
  4. **`ban-ts-comment` ratchet:** ban `@ts-ignore` and `@ts-nocheck`. Only a described `@ts-expect-error` is allowed, and only in allowlisted negative-type tests; `tests/type-resolution/` allows no suppression.
  5. **`verify:quality` contracts:** directives, SAFETY markers, coverage-ignore comments, class R.
  6. **Per-slice exception ledger.**
  7. **Review-checklist counts:**
     - `Boolean(x)` wrapping;
     - tautological assertions;
     - non-thrown `cause` renames;
     - `?.`/`??` introduced at former `!` sites.

  No `@total-typescript/shoehorn`.

### D6. Core adaptations and composition order

**Layers** in `tooling/quality/layers.mts`:

1. **Presets:** `core` (with `env` and `ignorePatterns` spread at the entry) and the patched anti-slop rules.
2. **Framework and plugin rules:** Scope Ultracite’s React, Next and Vitest presets to D7. Use only its empty-fixture allowance from the Playwright preset; `eslint-plugin-playwright` supplies the rules (§4.5). Query follows §4.4; Shadcn follows D12. PL-1 records the other preset decisions.
3. **Global adaptations** from `policy.mts`, written as one override block (`files: ["**/*"]`) placed after every preset and framework override block, never as top-level rules. Preset override blocks re-enable top-level settings (E26: `jsx-a11y/prefer-tag-over-role` still fired).
4. **Narrow scoped overrides, last:**
   - money scope;
   - JS untyped-off;
   - Playwright `no-empty-pattern`;
   - Vitest `no-empty-function` off;
   - the import tiers;
   - Shadcn exceptions;
   - virtualizer exceptions;
   - ReUI (V);
   - P-class config exceptions.

**Composition test:** asserts the effective setting of every adaptation on sample files. VR-4 sentinels run through **each root entry**. Every deviation has a reason.

<!-- prettier-ignore -->
| Principle | Rules |
|---|---|
| A. Repair changes behavior without defect evidence | `require-await`, `typescript/promise-function-async`, `no-await-in-loop`, `require-unicode-regexp`, `unicorn/no-array-sort`, `unicorn/no-array-reverse` (the same in-place mutation contract; 29/10 post-M1 findings), `unicorn/prefer-dom-node-dataset`, `jsx-a11y/prefer-tag-over-role`, `unicorn/prefer-number-coercion` |
| B. Convention, contract or conflict | `func-style`, `unicorn/filename-case`, `no-inline-comments`, `no-warning-comments`, `prefer-named-capture-group`, `oxc/no-barrel-file`, `typescript/consistent-type-definitions` (E27), `typescript/non-nullable-type-assertion-style` (contradicts `no-non-null-assertion`), `no-use-before-define` → `{functions:false,classes:true,variables:false}`, `eqeqeq` → `["error","always",{null:"ignore"}]` with `no-eq-null` off |
| C. Arbitrary metric or style | `complexity`, `class-methods-use-this`, `prefer-destructuring`, `no-plusplus`, `no-bitwise`, `unicorn/no-await-expression-member`, `unicorn/consistent-function-scoping`, `promise/avoid-new`, `unicorn/no-array-for-each`, `react/jsx-handler-names`, `react/todo`, `vitest/require-mock-type-parameters` |
| D. Weakens tests | `vitest/prefer-to-be-truthy`, `vitest/prefer-to-be-falsy`, `vitest/prefer-strict-equal`, `vitest/max-expects`, `vitest/require-top-level-describe`, `vitest/prefer-import-in-mock`, `vitest/prefer-describe-function-title` |
| E. Configured | see below |
| F. Untyped JS | all 61 type-aware rules and TS-syntax-only rules off in `*.{js,mjs,cjs,jsx}` (generated) |
| G. Additions | `core/*` rules only |
| V. Vendored | see below |

**E. Configured rules:**

- `strict-boolean-expressions`: `allowNullableString:true` and `allowNullableBoolean:true`. Optional text uses an empty string as absent, and an unset optional flag is treated as false. Numbers get no such allowance (the money scope and the numeric-truthiness allowlist, below).
- `prefer-nullish-coalescing`: `ignorePrimitives`.
- `no-confusing-void-expression`: `ignoreArrowShorthand`.
- `jsdoc/check-tag-names`: `definedTags:["vitest-environment"]`.
- `return-await`: `"always"`, manual only.
- `object-shorthand`: `ignoreConstructors:true`.
- Type imports: the preset (`prefer-top-level`).
- SAFETY markers (D5).

**Money scope:** `typescript/strict-boolean-expressions` with `allowNumber:false` applies to the files in `money-scope.json` (MI-1). `restrict-template-expressions` stays at the preset; interpolating a number is not a falsy-zero hazard.

- **Sources** (by content, not path):
  - `*Cents`, `*_cents`, `minorUnits`, `amountMinor` and database money columns;
  - imports of `@asym/api/money`, calls to Core money formatters, and `Intl.NumberFormat` with `style: "currency"`;
  - `amount`, `unit_amount`, `amount_received` and `amount_total` on Stripe objects.
- **Exclusions:** reviewed, with reasons.
- **No-shrink rule:** compared with the merge base, a file may leave the scope only through a new reviewed exclusion.
- **Checks:** regenerate and compare the inventory, then independently assert effective `allowNumber:false` for every full-policy member. Use sentinels in GraphQL, API schemas, admin contributions and CRM gift history, reports, shared payments and giving UI. A typed `verify:quality` check (classic checker) rejects `Boolean(x)` and `!!x` on number or bigint operands in money-scope files.
- **Numeric truthiness is repaired through an allowlist, not a denylist** (A R10). Negative amounts are live in Core (refunds and corrections: `packages/api/src/admin/contribution-operations/correction-effective-values.ts:49,77`, `packages/api/src/public-giving/gift-anonymity.ts:89`, `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx:101`), and so is bigint money (`pledges/page-client.tsx:106`). A negative number is truthy, so `amount > 0` changes the result, and `0n !== 0` is true. MI-1 therefore generates `numeric-truthiness.json` at A3: every base `strict-boolean-expressions` finding, in any scope, whose operand is a number, a nullable number or a bigint (file, enclosing function, operand text). When such a finding disappears in a slice, its repair must be one of:
  - `isNonZero(x)` for a number (`x != null && x !== 0 && !Number.isNaN(x)`, exact for `-0`, `NaN` and negatives);
  - `isNonZeroBigInt(x)` for a bigint (`x != null && x !== 0n`), or a direct `x !== 0n` on a non-nullable bigint;
  - an owned money predicate from the workspace's registered owner;
  - a **listed behavior change** in the slice ledger, with a test that pins `0`, a negative value, `null`/`undefined` and, for a number, `NaN`.

  The check works per finding, not per file (final check R03): for each numeric check that left the inventory, its recorded file, function and operand identify the replacement in the slice diff, and that replacement must be one of the allowed forms on the same operand, or a listed and tested behavior change for that check. A valid helper added for a different operand earns no credit. An ambiguous correspondence is reviewed by hand. The compiler and UI count ratchets are unchanged. `amount > 0`, `>= 1`, `!== 0`, `!= null`, `Number.isFinite(x)`, `typeof x === "number"` and `x !== undefined` are therefore never accepted as silent repairs.

- **The `$0` gift site** (`detail-drawer.tsx:496`, `entry.amountCents ?`): the repair is `isNonZero(entry.amountCents)`, which preserves today's output exactly, including `NaN` and negative amounts; a test pins `0`, a negative value, `null` and `NaN`. Showing `$0` would be a product change; it is filed as a follow-up, not done here.

**V. Vendored:** the 9 `reuiDataGridFiles`.

- Parity rules stay on, as today. The incumbent root config turns off one rule for these nine files, `react-hooks/exhaustive-deps`, so that they re-sync cleanly from the registry; that exception carries over under its Oxlint name and does not reach adjacent authored files such as the data-grid panel.
- New-policy rules are off.
- Oxfmt is allowed.
- The README procedure is updated.

### D7. Framework scoping

- **React:** non-JSX files (`*.{ts,mts,js,mjs}` in `apps/**`, `packages/**` and `tests/**`) get the preset minus `JSX_ELEMENT_RULES`.
  - `JSX_ELEMENT_RULES` = all `react/jsx-*`, plus `react/button-has-type`, `react/checked-requires-onchange-or-readonly`, `react/iframe-missing-sandbox`, `react/self-closing-comp`, `react/void-dom-elements-no-children`, `react-perf/*` and `jsx-a11y/*`.
  - `*.{tsx,jsx}` get the full preset.
  - The virtualizer owners have exact exceptions.
  - `react/no-danger` stays at `error`. Use the shared `SafeHtml` renderer. Any necessary raw HTML sink needs a D5 exception limited to that sink, naming the sanitizer, with a test proving unsafe input stays inert.
- **Next:** scope the preset to `apps/admin`, `apps/donor`, `apps/missionary` and `apps/factory-console`; resolve all four from the repository root for `settings.next.rootDir`. The native internal-link rule does not prove route-tree parity. At Payload, auth and app boundaries, keep intentional full-document navigation, with a site-specific reason and a navigation test that distinguishes a reload from a client transition.
- **Vitest:** the include globs minus e2e, Base UI specs, Console e2e, `tests/integration/**/*.mjs` and `docs/**`. Vitest fix rules apply only there.
- **Playwright:** §4.5.
- **Defaults:** `categories.correctness:"off"`; in-scope and out-of-scope sentinels.

### D8. Formatter

**Base options:** `oxfmt.config.mts` starts with `{ ...ultraciteOxfmt, trailingComma:"all", proseWrap:"preserve", sortPackageJson:true, sortImports:false, sortTailwindcss:false }`.

- The shared ignores are kept, except that `packages/database/types/currency-foundation.generated.ts` is un-ignored: Ultracite's `**/*.generated.*` pattern would hide it from `format:check`, and its generator formats through the adapter.
- Sentinels cover the unsorted cases (E44).

**`.prettierignore` gains:**

- `*.toml`, `docs/qa/**`, `docs/ops/phase-evidence/**`;
- the hashed Support Hub Phase 26 records;
- verbatim/minified skill assets, named explicitly: `docs/ai/skills/bendc-frontend-guidelines/references/readme-original.md` and `docs/ai/skills/impeccable/scripts/modern-screenshot.umd.js`; `tests/fixtures/skills/emil-upstream/` and the founder source tree `docs/prds/program-roadmap/source-2026-09-22/` are already ignored at `e6a5ce81a` and stay;
- `openspec/changes/archive/**` (immutable history; Oxfmt would rewrite three archived files);
- `scripts/archon-factory/pack/**`, until its release slice **RS-PACK** formats and repairs it under its operational review (a changed pack is a new release, `scripts/AGENTS.md`). The entry is shrink-only and retired by RS-PACK.

A protected-bytes test covers all of them. FM-1 also checks both sides of `!docs/ai/skills/ui-sdk/references/upstream.md`: a misformatted copy is reported and formatted, but an excluded sibling is neither reported nor changed. Fixtures preserve the ignored bytes for line, block, JSX, YAML and Markdown comments, the OpenSpec `prettier-ignore-start`/`prettier-ignore-end` range, noncontiguous list numbers and the one-entry-per-line ledgers.

**CLI flags:** every call passes `--no-error-on-unmatched-pattern --disable-nested-config`.

**Working directory:** Oxfmt reads `.gitignore` and `.prettierignore` from its working directory and discovers its config there (E10, E44). Every Oxfmt run therefore uses the repository root as its working directory: `format`, `format:check`, `pre-commit.mts`, `fix.mts`, the `verify-mechanical` replay and the `format-source.mts` adapter. FM-2 tests the adapter called from a workspace directory and expects root-config output.

**Format scope:** every tracked file that Oxfmt formats when it runs from the root over `.`: its supported file types, minus `.gitignore`, `.prettierignore` and the config's ignores. It is wider than the lint scope of D2. It includes Markdown, CSS, JSON and YAML, and trees that `coreRepoIgnores` hides from Oxlint, among them the canonical skills under `docs/ai/skills/**` (round 8 measured 13 that Oxfmt changes, for example `design-taste-frontend/references/imagery.md` and `pr-review-canvas/styles.css`). `format`, `format:check` and CT-0b work on the format scope. Batch `fix.mts` stays in the lint scope (§8.3). For explicit paths that pass D10’s target checks, format and lint scopes are applied separately.

**Wide tables:** Prettier and Oxfmt pad every cell of a Markdown table to its column's widest cell. A table with long cells carries `<!-- prettier-ignore -->` on the line before it, as the repository's ADRs do; both formatters then leave it as written (E73). This change's own documents use it, and so should any later edit that adds a long cell to one of their tables.

**Adapter:** `scripts/lib/format-source.mts` uses `format(filename, source, options)` with two fixed profiles. `trusted` uses the root options. `managed` treats imported bytes as data: trusted virtual filenames, no source-local config or plugins, and no sorting (including imports, package JSON and Tailwind). The root config applies the same options to format-owned managed skill paths; protected files stay excluded. FM-2 compares root CLI and refresh output on an unsorted managed `package.json`; on managed input with Tailwind classes, neither path may trigger benign markers in source-local formatter or Tailwind configs.

Select supported inputs deliberately, including special basenames. Check `errors` before using `code`: malformed supported input fails before any write; unsupported inputs are left untouched. Test `.prettierrc`, `.babelrc`, `package.json` and `tsconfig.json`, unsupported `.eslintrc` for this pin, and `.raw` fixtures with trusted Markdown, JS and JSON filenames. Generators use the adapter except for the two trusted Python consumers in §6, which use the pinned local CLI.

### D9. Hash-bound records and rebind integrity

Four families are rebound by this change; one of them is conditional, and the React Doctor ledger is deliberately not among them.

1. **Shadscan `findings.json`** (pre-commit) — SR-1 `scripts/verify/shadscan-rebind.mts`, using the policy's own hashing. **Conditional (D13):** #2707 retires this ledger. SR-1 is built and used only while `tooling/shadscan/findings.json` exists on the branch; when develop deletes it, the family ends and SR-1 is deleted in the same merge.
2. **shadcn `upstream-review-baseline.json`** (pre-push) — SD-1 extends `shadcn-diff.mjs` in three modes. All take repo-relative inputs and map them onto the four path forms that the baseline uses on its two path roots: repo-relative `proofSources`/`protectedSources`, `packages/ui/${localOnly.path}`, and `packages/ui/${files.localPath ?? files.path}` (split components, with `owners` for previews).
   - `--refresh-local <paths>` (offline): local hashes, preserving `reason` and `proofs`.
   - `--refresh-diffs <paths>` (networked, pinned shadcn CLI, through the ordinary `verify:shadcn-diff` transport and environment allowlist): diff and preview hashes. **Mechanical changes only.** The coordinator first compares the old and new upstream diffs. No recording or replay mode exists; `verify-mechanical` (§8.3) checks that only hash fields changed, and the networked verifier checks the values.
   - `--amend <path> --reason <text> --evidence <ref>` : for **substantive** changes to registry-owned files (Phase B, W-UI). It records the old and new upstream diff text, updates `reason`/`proofs`, and requires linked behavior tests or rendered evidence. Only then does it refresh the diff and preview hashes.
3. **React Doctor `exceptions.json` is not a rebind family** (A R10). The owner ruled on 2026-11-18 that its records are never rebound or requalified in any branch. The ledger is ungated and 182 of its 254 records were already stale on develop (E48); PR #2723 retires it and makes React Doctor an advisory audit (D13, E69). No batch here edits `docs/qa/react-doctor/exceptions.json`: `verify:quality` rejects any change to it other than its deletion arriving from develop. **RDL-1 and RDX-1 are withdrawn.** React Doctor gates nothing in this change.
4. **Skill audit** — Oxfmt → review → `skills:sync` → `update-skill-audit-hashes.mjs` → `git add` → `skills:verify`. Before sync, WF-5 seeds the canonical `ultracite` entry in `docs/ai/skill-source-audit.json` (schema 1) with `source`, `importedRef`, `examinedRef`, `rawSkillHash`, `license`, `adaptations`, `evidence` and `reviewEvidence` from the actual provenance review. Never infer a raw hash from adapted bytes. After sync, use `update-skill-audit-hashes.mjs --skill ultracite`; unrelated entries stay unchanged.
5. **Content pins (AP-1)** — `scripts/quality/content-pins.mts` statically inventories, over `tests/**` and `scripts/**`, into `content-pins.json`:
   - (a) 64-hex and 16-hex literals with their subject paths;
   - (b) workflow-fingerprint tables;
   - (c) git-history equality assertions (`git show`/`git diff`/`merge-base` compared with a named path);
   - (d) byte-length and slice constants (for example `BASE_CI_BYTES`);
   - (e) path-bound digests of 16 or more hex characters computed from working-tree bytes — including **git blob ids** (`git hash-object` form, e.g. the seven `issue-2258` `UNEDITED` pins, E57) and `createHash`/`ls-tree` comparisons. The scanner keys on a digest literal plus a repository path in the same declaration or assertion.

   Before each batch, AP-1 lists the pins whose subjects change. Amendments follow Core's convention (E48): the check is kept, and a comment names this change, its batch and what changed. They are written as an exact list (`amendments/<batch>.json`: file, old text, new text) with an executed proof (`pin-amend-proof.mts`): applying the batch's transform to the base bytes reproduces the new value, or putting the named lines back reproduces the reviewed fingerprint. The authoritative list is AP-1's inventory **at the batch's own base**. #2716 is replacing byte, fingerprint and diff-scope pins in the acceptance suites with structural assertions (D13); an amendment whose pin no longer exists is dropped, never re-created. Named CT-0 amendments, as they stood at `e6a5ce81a`:
   - `tests/unit/acceptance/issue-2364/static.acceptance.test.ts:187`: the merge-base `registry.ts` equality becomes branch-scoped exactly as its sibling at line 137 already is ("once #2364's migration is in the shared ancestor, this PR-scope assertion must skip"). The structural `missionariesCollection` checks stay.
   - CI workflow pins (`issue-2221` `BASE_CI_BYTES`, `BASE_CI_SHA256`, `BASE_CI_DOC_SHA256`; `issue-2153` `c8bd1a2b9f625673`; `issue-2201` `CI_PRINTS`, `merge-group.acceptance.test.ts:171-179`): CT-0a rewrites `ci.yml` semantically, so they are amended with **put-back proofs**.
   - The `issue-2364` `POST`-slice and `donate.ts` byte pins: amended in CT-0b with a reproduction proof.
   - The `issue-2258` blob pins whose subjects CT-0b or M1 reformat (e.g. `packages/api/src/projection/types.ts`, `bb325e26…` → `7b6f9b11…`): amended in that mechanical commit with a proof (old id = blob of the base bytes; new id = blob of the transform output). The assertion and its "unedited" meaning stay; a later semantic edit to one of these authz files is a TA-1 edit (§8.5).

**Rebind integrity:**

- A **mechanical** batch (CT-0b, M1, M2) rebinds SR-1 entries (while that ledger exists), SD-1 hashes, skill-audit hashes and pins with **proofs**: each new value is recomputed by the family's own generator from the committed bytes, and `verify-mechanical` (§8.3) confirms that only registered hash/identity fields changed.
- **Any other** batch (A1, A2, CT-0a, Phase B, W-UI, C4, C5) rebinds through a note in `rebind-notes/<batch>.json`: entry, claim re-checked, reviewer, evidence. Workflow fingerprint and byte pins use **put-back proofs** (restoring the named lines reproduces the reviewed fingerprint).
- `verify:quality` rejects any hash change in these records (every family, including skill-audit entrypoint and tree hashes) that has neither a proof nor a note.
- Shadscan cites 145 files at `e6a5ce81a`, among them the root manifest, five workspace manifests (`packages/{auth,database,lib,missionary,ui}/package.json`), `docs/guides/development/shadscan.md`, `packages/ui/components.json`, the app layouts, shared components, tests and the checkout file that CT-0a edits; SR-1 takes the list from the ledger itself. The shadcn baseline has 134 proof sources and 34 protected sources, among them `docs/ai/rules/frontend.md`, `packages/ui/AGENTS.md` and the two motion primitives that CT-0a edits. Every batch touching them carries notes or proofs.
- **Every Shadscan obligation is conditional** (D13): the notes or proofs for Shadscan-cited files, RB-1's Shadscan check, `verify:shadscan` in VR-8 and CT-0a's note for `shadscan.md` hold only while `tooling/shadscan/findings.json` exists on the branch. Once develop has deleted the ledger they are skipped, and reported as skipped.
- Rebinds are **the last step of every batch** (the derived-record order in §8.3), with one exception that a hook forces. While `tooling/shadscan/findings.json` and the pre-commit step `verify:shadscan -- --staged` exist, the hook rejects a commit that changes a Shadscan-cited file without its rebind ("Stale evidence", E21, E32). Every such commit therefore carries that file's SR-1 rebind, with its proof or note, in the same commit. TC-1, TS-1 and CT-0a edit cited files: the root manifest and the five workspace manifests, and at CT-0a also `shadscan.md`, the checkout file and the five cited test files whose directives step 5 converts.

### D10. Staging and fixing

**`.husky/pre-commit`** (from CT-0a; nothing in it writes lint fixes):

1. `staged-guard.mts` runs before anything is written and refuses, naming each path:
   - a partially staged file that is lint- or format-eligible and not ignored;
   - any difference between index and working tree in a **policy input**: root `oxlint*.config.mts`, `oxfmt.config.mts`, `.prettierignore`, root `package.json`, `tooling/quality/**`, `typecheck-ratchet.json`, and the UI bridge's ledger, config and policy files (`tooling/eslint-config/{suppressions.json,bridge.config.mjs,design-system*.mjs,reui-data-grid-exceptions.mjs,lint.mjs,health.mjs}`);
   - any untracked file under `tooling/quality/**`, and any untracked discoverable lint or format config anywhere (`oxlint.config.*`, `.oxlintrc*`, `oxfmt.config.*`, `.oxfmtrc*`, `eslint.config.*`) and any `oxlint-suppressions.json` (E72), from `git status --porcelain -z --untracked-files=all`.

   It uses the hook's **inherited** Git environment unchanged, because Git sets `GIT_INDEX_FILE` for `commit -a` and `commit -- <path>` (it must not use `repositoryGitEnvironment()`, which strips it). The hook therefore evaluates only staged policy.

2. **`tooling/quality/pre-commit.mts`** (one staged runner replacing `lint-staged`, whose 8,191-character win32 limit would split a large commit into dozens of chunks and rerun the bridge's health check each time). It reads the staged list once (`git diff --cached --name-only --diff-filter=ACMR -z`, streamed), keeps the inherited `GIT_INDEX_FILE`, and never puts a path list on a command line that could pass the platform limit (G R10: the 1,466 UI source paths are 177,070 characters as absolute arguments, and Windows refuses to start a process above 32,767). It then:
   - **formats the staged bytes, not the working tree** (C R10, E74). A hook that formats working-tree files and then stages them can stage an edit the author never selected, when an editor or agent writes to a file between the guard and the staging. So, for each staged file in the format scope, the runner reads the staged blob, formats those bytes in process through the format adapter (D8: use the managed profile for format-owned managed paths and trusted otherwise, matching the root CLI), and writes the result into the index itself, under the inherited `GIT_INDEX_FILE`. It never runs `git add`. The hook never refreshes or writes a working-tree file. Report and gate the captured, formatted index snapshot, not a newly read working file; name formatted paths and tell the author to inspect any remaining unstaged differences. List the inspected paths, including paths an editor changes while the hook runs; the commit still contains exactly the formatted staged bytes. Format every staged input successfully before publishing the index update in one transaction. A formatter error changes neither the index nor the working tree. While it writes, the runner holds the fix lock (below), so the agent hook and `bun run fix` cannot write at the same time. No editor lock is assumed; a working file can remain unformatted after a successful commit;
   - runs `lint.mts --staged-report` once (internal chunking), untyped, on the active gate entry (D3). For each file with findings it names how many of them the `fix` policy applies and gives `bun run fix -- <paths>`. It applies no fix;
   - until W-UI, runs `lint.mjs --paths-file <file>` once over the staged files inside the six UI workspaces: one `health.mjs` run, then chunked ESLint runs (D12); skipped when none are staged;
   - runs `bun run verify:shadscan -- --staged` **only while develop's hook has that step** (D13): this change neither adds nor removes Shadscan gating.

**`fix.mts`** (used by `bun run fix -- <paths>` with the `fix` policy, by M1 and M2 with theirs, and by the agent hook with the `m1` policy only, D11):

1. **Lock** (taken first, before reading or writing anything): `git -C <root> rev-parse --git-path core-quality.lock`, holding `{ pid, host, platform, createdAtMs }`. A lock is broken **only** when its PID is dead on this host **and platform**; a live holder is never evicted for age. Windows and WSL share a hostname but not a process table (G R10), so a lock taken on the other platform is never tested by PID: it counts as live. Waiting is bounded at 30 s; the caller then reports "busy", prints the lock record, and changes nothing. `bun run fix -- --break-lock` removes a lock whose holder is known to be dead, and refuses when the holder is a live process on this platform.
2. **Targets.**
   - **Batch mode** enumerates tracked files with `git ls-files -z` (streamed; no default-sized buffers, since Core has 17,961 tracked files) and excludes files with compile diagnostics for M2 (§5.5).
   - **Explicit paths** accept existing regular files, tracked or untracked, under the root realpath (`realpathSync.native`) that are not ignored (`git check-ignore --stdin` plus `coreRepoIgnores`). Paths outside the root and ignored paths are skipped and listed on stderr; an empty result exits 0 with a message. A path that does not exist is an input error: `fix.mts` names it and exits 2 before writing anything. Batch mode runs only when M1 or M2 selects it, so `bun run fix` without paths also exits 2 and never widens to the repository.
3. **Oxlint pass.** Spawn Oxlint from a fresh `mkdtemp` cwd:
   - `-c <root>/oxlint.fix.config.mts`, with `CORE_FIX_POLICY` set;
   - absolute targets in deterministic chunks (D3);
   - `--fix --disable-nested-config --no-error-on-unmatched-pattern`;
   - for `m2:<rule>`, `--fix-suggestions` for suggestion-kind rules, or `--type-aware` plus the D4 environment for typed rules.
4. **Format.** Run Oxfmt at the root on the filtered paths that are in the format scope (D8). The lint pass and the report take only the JS/TS-family paths in the lint scope, so a Markdown or CSS file is formatted and not linted, and a file in neither scope is left alone.
5. **Fixed point.** Repeat to a fixed point, at most 6 passes; otherwise exit 2.
6. **Report** (explicit-path mode only): the untyped full-policy report at the root on the same paths, without `--fix`. Batch mode has no report step; the coordinator's whole-repo gate follows (§8.3).

**The `fix` policy** is derived from `layers.mts` by severity filtering. It keeps the reviewed list's untyped native rules whose fix kind in `oxlint --rules --format=json` is `fixable_fix` or `conditional_fix` (E36), plus `anti-slop/require-readable-spacing`, a JS-plugin rule that this metadata does not list, kept explicitly. The reviewed list:

- `anti-slop/require-readable-spacing`, `curly`, `unicorn/switch-case-braces`;
- `typescript/array-type`, `unicorn/numeric-separators-style`;
- `object-shorthand` (`ignoreConstructors`), `arrow-body-style`, `prefer-const`;
- `unicorn/no-zero-fractions`, `unicorn/prefer-string-replace-all`;
- the Vitest pair, `vitest/consistent-test-it` and `vitest/padding-around-test-blocks`, inside Vitest globs.

A composition test checks it in every sample scope: the derived policy is a subset of the full policy there and contains each reviewed rule active there, so a dropped rule fails as an extra one does, and an eligible spacing violation is fixed. Generated, vendored and ignored samples stay byte-identical.

**Unsupported writers:** direct `oxlint --fix`, any Oxlint suppression flag (`--suppress-all`, `--prune-suppressions`; there is no Oxlint suppression file), `ultracite fix`, `lint.mjs --fix`/`--suppress-all`/`--suppress-rule` (refused by the bridge runner), and runner writer flags. Negative controls cover them. The UI-bridge ledger's only writer is `lint:ui -- --prune-suppressions` (D12).

### D11. Agent hooks, skills and editors

**One registered command for every harness and shell** (E59): a Node launcher, generated from `tooling/quality/hook-launcher.mts` and registered with identical text in `.claude/settings.json` (Claude Code; Cursor imports this file) and `.codex/hooks.json` (`command` and `commandWindows`), differing only in the harness argument: `node -e "<launcher>" claude` (or `codex`). Each registration sets a 120-second timeout.

- **Matchers** (G R10): `PostToolUse` with `Write|Edit|MultiEdit` in `.claude/settings.json` (Cursor maps its edit tool onto these names when it imports the file) and `apply_patch` in `.codex/hooks.json`. WF-7 confirms each against the harness's current documentation and observed behavior.
- **One owner per surface (D13):** PR #2726 (issue #2710) adds an edit hook of its own, `scripts/agent-hooks/after-edit.mjs`, with three registrations (E70). Only one edit hook is ever registered per harness; D13 says how WF-2 takes that surface over.
- The launcher walks up from the hook's cwd to the nearest `.git` (directory or gitfile) **without calling git**, so inherited `GIT_DIR`/`GIT_WORK_TREE` cannot redirect it. It exits 0 with no output if there is no repository or if the hook entry `tooling/quality/agent-hook.mjs` is absent (an older branch); otherwise it runs the entry with `spawnSync(process.execPath, [hook, harness], { stdio: "inherit" })` — with no `cwd` override, so the hook sees the harness's own working directory.
- Its text uses no `$`, backticks or double quotes, so Git Bash, Windows PowerShell, PowerShell 7 and cmd.exe pass it unchanged. `verify:quality` checks that the registered strings equal the generated launcher.

**The hook writes layout only** (arbiter ruling of 2026-11-19, E70). It runs the `m1` fix policy: the blank-line fix (`anti-slop/require-readable-spacing`) and Oxfmt. Both change only whitespace and layout. In hook mode the formatter runs with every sorting option off, `package.json` key sorting included, so no import and no manifest entry moves while an agent is still editing; key order is normalized at commit by the staged runner and by `bun run format`. The hook applies no fix that removes, moves or rewrites code. A fix applied in the middle of a task can change code the agent is about to use, and it invalidates the agent's next edit; that is the reason PR #2726's requirement gives, and it holds whichever change lands first. The reviewed `fix` policy (D10) stays an explicit command, `bun run fix -- <paths>`.

**Feedback contract:** the hook never blocks, and it never relies on exit codes, because PowerShell turns a native exit 2 into 1. Whenever the hook entry runs, it exits 0 and writes **exactly one JSON object** to stdout (everything it runs has captured stdio). The only empty-output case is the launcher finding no repository or no hook entry, which every harness treats as a no-op:

- Claude Code and Codex `PostToolUse` get `{ "hookSpecificOutput": { "hookEventName": "PostToolUse", "additionalContext": <report> } }`, or `{}` when there is nothing to report. The hook never returns `decision: "block"`: blocking would make the agent answer for code it has not finished, and for Codex it would replace the `apply_patch` result. Pre-commit, pre-push and CI remain the gates.
- Cursor gets exactly one run per edit, through whichever path WF-7 observes delivering the report:
  - by default, the imported `.claude/settings.json` hook (a payload with `cursor_version`, or `hook_event_name: "postToolUse"`), answered with `{ "additional_context": <report> }`;
  - otherwise, one `.cursor/hooks.json` `afterFileEdit` entry with the same launcher and the argument `cursor`, writing its report to stderr.

  `verify:quality` accepts one of these two, never both.

- **The report** is capped at 8,000 characters (below Codex's spill threshold) and ends with the count of omitted findings and `bun run lint:fast -- <path>` for the rest. It names:
  - each file the hook rewrote, to be re-read before the next edit;
  - each file's findings, with how many of them the `fix` policy applies and the command `bun run fix -- <path>` ("fixable" means exactly that: the `fix` policy applies it);
  - each tool that could not start, overflowed its output, was stopped or was refused (a nested config, a busy lock), with the files it left unchecked.
- A checkout without installed dependencies gets `{}`: the hook never fails an edit because a tool is missing, and never substitutes a tool found on `PATH` or fetched through `npx` or `bunx`. Any other error uses the same channel with its reason, still exiting 0. A short human summary goes to stderr.
- **Time budget:** the hook stops at 100 seconds, lock wait included, names what it did not check, and exits 0.
- **Load failures are caught too** (G R10): in an ES module a failing static import runs before any top-level handler and would leave an empty stdout with exit 1. So the entry `agent-hook.mjs` is plain JavaScript that statically imports only Node built-ins, and it loads `agent-hook-impl.mts` with a dynamic `import()` inside its `try`/`catch`. A unit test breaks an import in the implementation and still expects one JSON object and exit 0.

**The hook (`agent-hook.mjs` loading `agent-hook-impl.mts`):**

- **Session and checkout:** reads stdin once; `sessionCwd = payload.cwd ?? process.cwd()`; `activeRoot` is found by the same walk from `sessionCwd`. If it differs from the launcher's root (a worktree session started elsewhere), the hook re-dispatches once (`CORE_HOOK_REDISPATCHED=1`) to `<activeRoot>/tooling/quality/agent-hook.mjs` if it exists, passing the captured stdin bytes as `input`. If that worktree has no hook entry, the running entry writes `{}` and exits 0: a running entry never exits with empty output. Git calls use `repositoryGitEnvironment()`. The hook acts only on files whose real path is inside `activeRoot`.
- **Paths:** `apply_patch` payloads (Codex): the patch text is in `tool_input.command` (E43), and paths come from its `*** Add File:`, `*** Update File:` and `*** Move to:` headers (`Move to` replaces the path; `*** Delete File:` is skipped). For other harness payloads, read `tool_input.file_path ?? tool_input.filePath ?? tool_input.path`. For Cursor also accept its observed top-level path (`path` or `file_path`). Relative paths resolve against `sessionCwd`, and paths that no longer exist are dropped before `fix.mts` runs.
- **Run:** `fix.mts` in explicit-path mode at `activeRoot` (which takes the lock, D10), with `CORE_FIX_POLICY=m1`, followed by its untyped full-policy report; stdout and stderr are captured so only the hook's JSON reaches stdout. It is never type-aware and never uses another policy. It makes no network call and runs no build, typecheck or test. It is activated at WF-2.
- **Requirements:** PR #2726's OpenSpec change `speed-up-local-gates` states edit-hook requirements for the capability `agent-instruction-system` (E70). Their guarantees are kept here whichever change lands first, and each becomes a VR-10 case: the hook never blocks or fails an edit; it never removes, moves or rewrites code; it reports every outcome; it stays inside its checkout and its time budget. Where this change differs (Oxfmt and Oxlint in place of Prettier and ESLint; the untyped full policy; `bun run fix` in place of a pre-commit fix; Cursor's channel), D13 says when the delta is added.

**Registration and observation:**

- There is no `.cursor/hooks.json` edit hook unless WF-7 selects one (above). `verify:quality` rejects a second edit hook for any harness.
- WF-7 observes native Claude Code, T3 Claude Code, native Codex, T3 Codex and Cursor, on Windows and in WSL: invocation count and the feedback visible to the model, for a fixable and an unfixable case, with the hook's wall time and each session's profile, project trust and permission mode as normally used. No trust, approval or permission setting is relaxed to make a hook load. A harness whose feedback is not visible is documented as explicit-command only.
- WF-2 merges its registrations into `.claude/settings.json`, into `.codex/hooks.json` (absent at `e6a5ce81a`; WF-2 creates it unless PR #2726 has added it) and, if WF-7 selects it, `.cursor/hooks.json`, and keeps every other key (today `$schema` and `env.MCP_TIMEOUT` in `.claude/settings.json`). It leaves the MCP servers, agent roles and generated block of `.codex/config.toml` unchanged. A test compares the non-hook content before and after.
- Antigravity: explicit commands only. Cursor Cloud Agents load only `.cursor/hooks.json`, so document hook support there only if WF-7 selects that entry and observes delivery there; otherwise use explicit commands.

**Skills:** WF-5 installs the canonical Ultracite skill with its adaptations (`bun run fix`, `lint:fast`/`check:changed`). It updates `tests/unit/docs/skill-inventory-audit.test.ts` `expectedNames` and the `agents/openai.yaml` alignment. The AGENTS route and rulebooks name the unsupported writers.

**Editors** (WF-6; `.vscode/` is neither tracked nor ignored today, and Cursor reads the same files). The settings land **at CT-0a, with the formatter**: from that commit an editor that still formats with Prettier on save would fight the gate, and no discoverable ESLint config remains for an editor to load (C R10). They are checked again at C4, after W-UI.

- `.vscode/extensions.json` recommends `oxc.oxc-vscode`.
- `.vscode/settings.json`: Oxc as the default formatter, at the top level and for each language Oxfmt formats; `"eslint.enable": false` and `"prettier.enable": false`; `"editor.codeActionsOnSave": {"source.fixAll.oxc": "never"}`; `"[toml]": {"editor.formatOnSave": false}`; `"typescript.tsdk": "node_modules/typescript/lib"`, the root classic 6.0.3, which is the only installed TypeScript that ships the language server. Editor lint is untyped (D3).
- **ESLint stays off in editors.** The editor extension cannot find the non-discoverable bridge config, and it would ignore the ledger and show every suppressed finding. So until W-UI the six shadcn rules have no editor feedback: `bun run lint:ui -- <paths>`, `check:changed` and the staged hook report them, and after W-UI Oxlint does, in the editor too. The two Query bridge rules never have editor feedback: `bun run lint:query`, `check:changed` and CI report them. The code-quality rulebook states both gaps. No editor task file is added for them: its problem matcher would depend on the extension these settings turn off.
- **Verified by** a test that reads these keys, and a recorded check in VS Code and Cursor at CT-0a and again at C4: a seeded Oxlint finding appears (at C4, a seeded shadcn finding too); saving formats with Oxc, applies no fix, leaves protected content and import order unchanged, and changes nothing on a second save; the TypeScript server reports 6.0.3.

### D12. Shadcn and design-system debt (the UI bridge)

- **The UI bridge until W-UI.** The six shadcn rules stay on ESLint with the incumbent count-based ledger `tooling/eslint-config/suppressions.json` (1,703 counts in 108 files, E60). Oxlint carries no shadcn rule and no suppression file until W-UI; the composition test asserts it.
- **One non-discoverable config** (E61): `tooling/eslint-config/bridge.config.mjs`, loaded by `--config` from `lint.mjs` and `health.mjs` (root and workspace invocations alike). It imports only `@typescript-eslint/parser`, `design-system.mjs` and `reui-data-grid-exceptions.mjs` — **no retired plugin** (G R10, E63). It holds the repo-root ignores, the TypeScript/JSX parser without type information, `reportUnusedDisableDirectives: "error"`, and `designSystemConfig()`. For the nine vendored ReUI files only, an inline no-op stub (`"@typescript-eslint": { rules: { "no-explicit-any": { create: () => ({}) } } }`) lets their three upstream comments (`data-grid.tsx:202,966,977`) resolve without any dependency, and unused-directive reporting is off there. At CT-0a the root and every workspace `eslint.config.mjs` are deleted, so no discoverable ESLint config remains (Ultracite's provider precedence and editor discovery cannot pick one up). E61 showed exact parity: gated exit 0; raw 1,703 findings in 108 files, identical per rule. E63 repeated it with no retired plugin, after a simulated CT-0a conversion: gated exit 0 with zero messages, raw exactly 1,703, and a stale shadcn directive fails.
- **Directive ownership** (E62): Oxlint ignores `eslint-*` directives (D2). `shadcn/*` directives are `eslint-*` and belong to the bridge until W-UI converts them; CT-0a converts every other authored disable or enable directive to `oxlint-*`; the vendored ReUI comments stay untouched (D5). The two remaining stale non-UI directives (E62) are converted or removed there; a stale shadcn directive is the negative control for the bridge's unused-directive check. ESLint inline configuration comments are removed at CT-0a (D5): the bridge cannot ignore inline configuration while it honors shadcn directives, so the one that exists would re-enable its rule there (A R10).
- **`lint.mjs`** keeps only paths inside the six UI workspaces that have a lintable extension and that the bridge does not ignore, and exits 0 without running `health.mjs` when none remain in ordinary lint mode. A prune retains the originally requested paths for the ownership check below; ordinary lint passes `--no-warn-ignored`, so a staged `.css`, `.json` or ignored file cannot raise an ESLint warning. It runs `health.mjs` once and then ESLint over deterministic chunks (D3), combining exit codes and operational warnings across chunks; today it starts ESLint once with every absolute path as an argument, which Windows cannot do for the 1,466 UI sources (G R10). `--paths-file <file>` takes a long list. It refuses `--fix`, `--suppress-all` and `--suppress-rule`.
- **Ledger keys are checked against the tree** (G R10, E65): ESLint 10.13.0 accepts a ledger key whose file is gone, and any prune silently drops such keys wherever they are. Normal validation fails on a missing file key and names it. In prune mode retain the requested ownership set before filtering live targets. Remove owned dead keys explicitly even if no live file remains; never start ESLint on an empty set or widen it. A path-limited prune compares the ledger before and after: only keys under the named paths may change; otherwise the runner restores the ledger and fails. Dead keys outside a slice's paths are removed only by the coordinator's full-scope prune: ESLint's suppression service walks the whole ledger on any prune and drops every missing path (C R10), and `integrate-design-system-lint` already requires a complete scan for such changes. Chunked prunes are safe: a subset prune leaves the entries of other existing files untouched (E65).
- **Ledger transaction** (every batch and slice): (1) a raw bridge report over live targets compared with the ledger — only decreases are allowed; report pending missing keys without blocking the authorized reconciliation; (2) the owner prunes (`lint:ui -- --prune-suppressions <owned paths>`; slices prune their owned paths, the coordinator the rest); (3) source and ledger are staged together; (4) the exact bridge gate passes. `verify:quality` checks in CI, for every commit in the range against its parent, that no (file, rule) count rises and no file key appears. A renamed or deleted suppressed file leaves a dead key, which the gate rejects until its owner prunes it. On a merge conflict, take the per-(file, rule) minimum and run the prune; any resulting failure is fixed, never re-suppressed.
- **W-UI (C3, serial), in two parts** (C R10). **W-UI-a** is step 1; it ends on a recorded revision where the bridge gate passes with an empty ledger. **W-UI-b** is steps 2 and 3 as one commit, the engine switch, so that reverting that one commit returns to the zero-debt bridge and leaves the repairs in place (§11).
  1. repairs the debt to zero through the bridge (SD-1 `--amend` for registry-owned files), following the existing repair guide `docs/ai/skills/moai-library-shadcn/references/design-system-lint-fixes.md` (E16), which WF-5 updates for the Oxlint form. It repairs `packages/ui` first, then its consumers. Every route whose markup changes gets paired Playwright screenshots, captured before the first repair and after the last under the same viewport, theme and data, and the a11y suite; each visible difference is reviewed;
  2. converts the shadcn directives to `oxlint-*` and moves the six rules into the Oxlint full entry as a JS plugin (TC-6 decides 0.2.3 + patch or 0.2.5), with VR-4 sentinels through the root entry and `quality:health` replacing `health.mjs`:
     - **Package and patch.** `@shadcn/lint` becomes a root devDependency in this commit, with `bun.lock` regenerated. Today the root `patchedDependencies` entry points at `tooling/eslint-config/patches/@shadcn%2Flint@0.2.3.patch`, inside the directory step 3 deletes. If TC-6 keeps 0.2.3, the patch moves to `tooling/quality/patches/` and the entry is repointed in this commit. If TC-6 chooses 0.2.5, the entry and the patch file are removed together. A frozen install proves the result before step 3.
     - **Scope.** The six rules are active in the full entry only for the six UI workspaces, in one override block, with the design-system and ReUI exceptions (`design-system.mts`, `reui-data-grid-exceptions.mts`) applied in their current order. The composition test asserts that scope, and a sentinel outside the six workspaces stays clean.
     - **`quality:health`** is `tooling/quality/health.mts`, the port of `health.mjs` with the same probes and failure messages. For each of the six UI workspaces it runs that workspace's probe sources through the root full entry, untyped. It fails unless each of the six rules is active at `error` there and each probe reports what it reports today; for example `p-8` on `Button` must report `shadcn/no-restyle` naming the real `icon-xs` size, which proves component discovery from that workspace. Oxlint lints files, not text, so the probes are written to a uniquely named temporary directory (`mkdtemp`) inside the workspace, so concurrent runs cannot collide, and removed in a `finally` step. A failed probe, a rule that is not at `error` or a plugin that fails to load exits 2. TC-6 qualifies that mechanism together with the plugin;
     - **The design-system suites move with the rules.** The twelve `tests/unit/scripts/design-system-*.test.ts` suites are ported to the Oxlint engine in this step, and the version TC-6 chose must pass them. A case is dropped only if it tests the bridge's own runner, ledger or Turbo cache, and each dropped case is listed with its reason. The ported suites keep every negative control: a missing theme import, an unresolved or missing primitive import, a changed variant helper and a later config entry that weakens a rule each make `quality:health` fail; an unrelated component with a familiar name, a misspelled variant and `hovr:flex` are rejected; Base UI namespace provenance and each scoped exception (measured geometry, the `ImageResponse` renderer, external CSS, portaled width) keep an adjacent non-exempt case; Factory Console is enforced from the root; the plugin's operational warnings fail the run; and every diagnostic ends with the fix-guide link, whose file exists (E16);
  3. deletes the bridge (`tooling/eslint-config`, the `@asym/eslint-config` workspace and its devDependency entries, its `turbo.json`, the `"@asym/eslint-config"` entry in the five workspace `turbo.json` `extends` arrays, `verify:eslint` with its script `scripts/verify-eslint-config.mjs` and its three callers in `validate:full`, `scripts/verify/ci-preflight.mjs` and `ci.yml`) and records `suppressions.json` and the bridge in `retired.json`. In this same switch commit replace or remove all `lint:ui` callers in root/workspace scripts, changed and staged checks, CI, preflight and their contracts. Verify both the switch and its isolated revert on the recorded W-UI-a revision.
- **Tests:** growth, a multi-commit 2→1→2 sequence, a rename with and without a remaining violation, a deleted suppressed file (dead key), a prune that tries to change a key outside its paths, a full-scale 1,466-path run on Windows, an error that occurs only in the last chunk (the run fails), an empty UI path set (exit 0, with no fallback to linting every workspace), a staged non-source file, a merge-conflict resolution, the writer refusals, a tracked bridge-config edit left unstaged, a slice prune of owned paths, a stale shadcn directive, retirement and reintroduction.
- **OpenSpec:** `integrate-design-system-lint` tasks 5.4–5.10 are linked at OS-1 and reconciled at C5. W-UI performs that work.

### D13. Work in flight on develop, and who owns what

The plan was qualified at `e6a5ce81a`. Develop has moved since (`182eb0338` on 2026-11-19), and several owner-directed quality changes are open on the same surfaces. On 2026-11-19 they were pull requests stacked on one another: develop ← #2716 ← #2725 ← #2723, #2726 and #2727 (E69, E70). Three rules keep this change from colliding with them:

1. **Follow develop.** A1 branches from the then-current `origin/develop`. Every batch starts with **IN-0**: merge the current `origin/develop`, then re-run the CTI, AP-1 and this table on the merged tree before the batch's first edit.
2. **Never re-create what develop retired, and never maintain what another change is deleting.** An artifact that an open change retires is touched here only as far as a gate still in force requires.
3. **One owner per shared surface.** Where two changes edit the same file, the table names the owner; the other change builds on it.

<!-- prettier-ignore -->
| Open change | If it has merged before the batch | If it merges later |
|---|---|---|
| React Doctor advisory (#2704, PR #2723) | The ledger is gone; nothing to do | The ledger is left byte-identical until the merge deletes it. Nothing here ever rebinds it (D9) |
| Acceptance pins become rules (#2706, PR #2716) | AP-1's inventory no longer lists those pins; their amendments are dropped | The amendments AP-1 lists are made with proofs; the later merge removes the assertions, and conflicts resolve to develop's version |
| Shadscan advisory, retirement part (#2707, PR #2725) | No SR-1, no `verify:shadscan --staged` step, no Shadscan rebinds or checkpoints | SR-1 is not built up front. It is built in the first batch whose IN-0 finds `tooling/shadscan/findings.json` present and whose commits change a file it cites. If the pull request is still open when A1 reaches TC-1, that is A1: TC-1 edits the root manifest, and the hook rejects that commit without its rebind (E21, E32). SR-1 and the hook step exist only until the merge removes the ledger; SR-1 is deleted in that merge |
| Accessibility lint in ESLint (`enforce-jsx-a11y-lint`, proposed in PR #2725, formerly section 3 of `make-shadscan-advisory`; **not ratified**) | — | It would add `eslint-plugin-jsx-a11y` rules, a mapping from shared components to native elements, and a new debt baseline to `@asym/eslint-config`. CT-0a reduces that workspace to the UI bridge and W-UI deletes it, and CT-0a removes the checkout file's inline configuration comment that the proposal expects to stay (D5). The full Oxlint policy already carries the native `jsx-a11y/*` rules in every workspace, at zero findings and with no baseline at completion (D7). If the owner ratifies that change, it is either re-proposed on the Oxlint policy (its component mapping and alias rule as Oxlint settings and a `core/*` rule, no new baseline) or landed before CT-0a, which then migrates it. The choice is the owner's; the coordinator records this on that change before A5 and raises it in the ratification report |
| Fast pre-push profile and agent edit hooks (#2710, PR #2726) | Its `scripts/agent-hooks/after-edit.mjs` is in the CTI. CT-0a switches its Prettier and ESLint calls to Oxfmt and Oxlint, and changes its line "pre-commit's eslint --fix applies them" to name `bun run fix -- <path>`. Once its edit-hook requirements are in `openspec/specs/agent-instruction-system/spec.md` (a merged but unarchived change is not yet a durable requirement, and `verify:openspec-deltas` checks MODIFIED targets against durable ones), the next IN-0 adds this change's MODIFIED delta for them, and C5 checks it again. At that point this change's own edit-hook requirement leaves its `code-quality-toolchain` delta, so the hook has one specification home. The delta covers: Oxfmt and Oxlint; the untyped full policy as the hook's lint configuration; `bun run fix` in place of pre-commit applying fixes; and Cursor's channel per WF-7. WF-2 replaces the three registrations with the D11 launcher (keeping a `.cursor/hooks.json` entry only if WF-7 selects it), carries the cases of `tests/unit/scripts/agent-hooks.test.ts` and the requirements' scenarios into VR-10, and deletes the script once they pass, so one implementation remains. The fast profile's verifier table gains this change's verifiers through the CTI | WF-2 lands the edit hook to those requirements as D11 states them. The coordinator notes on #2710 that its hook scope is done, so it drops its hook and keeps the pre-push profile |
| Acceptance once, sharded unit run, scoped tooling tests (#2711, PR #2726) | CT-0a and W-MOCK-SB-CI apply their edits on top of its structure at IN-0. The collection-health and link-relevance steps of §7.2 run once per event, outside the `test-unit` shard matrix | After the bounded A5 hold, use develop’s current job structure and keep the steps once per event. If #2711 merges before close-out, reapply them to its structure at the next IN-0; if it lands later, its integration must preserve them |
| API contract verification (#2708, PR #2727) | Its live suites (`tests/integration/api-contract/*.live.test.ts`, under their own Vitest config) are a third test entrypoint with real loopback services. W-MOCK-SB registers them in `integration-tier.json`, TID-1 lists the entrypoint, TS-2 gives the directory a test program, and the lint and format scopes own its files | The same, at the next IN-0 |
| Factory merge queue (#2709, PR #2722) | `merge_group` events are routine; §7.2 already resolves their commit range | Same |
| Skill retirements and repairs (PR #2719) | WF-5 takes `expectedNames` and the audit records from the merged inventory | Same, at the next IN-0 |

**Start and hold point** (arbiter ruling of 2026-11-19). A1 starts now: A1 builds tools and A2 changes the compiler, and neither touches much that the open stack deletes. CT-0a is different: it edits the same files as the stack (`ci.yml`, `.husky/pre-commit`, the hook registrations, and the contract tests `format-gate.contract`, `ci-preflight.contract` and `agent-instruction-routing`). If the #2716/#2725/#2723/#2726 stack is still open at A5's IN-0, the coordinator holds A5 for up to two working days, then proceeds. Later conflicts in those files resolve to develop's version, and this change's edits are re-applied on top. The same rule covers three scripts that PR #2726 also edits (E70): `scripts/verify/shadcn-diff.mjs` (SD-1, A1), `scripts/verify/ci-build.mjs` (the strict builds, A2) and `scripts/verify/ci-build-policy.mjs` (the §7.2 carve-outs).

**Owners:**

- **Agent edit hooks:** #2710 (PR #2726) until WF-2, which then owns them under D11.
- **`.husky/pre-push` and the preflight profiles:** #2710. This change only updates the commands the profiles call and enters its verifiers in the fast profile's input table, through the CTI. It runs `bun run ci:preflight`, which stays the full profile, explicitly before every push, whatever the hook does.
- **`.github/workflows/ci.yml` and `ci-integration.yml`:** #2711 owns the structure. This change edits them only in coordinator commits (CT-0a, W-MOCK-SB-CI, W-UI-b, and the lint-job split if needed), made on develop's current structure.
- **The pre-commit hook:** this change (PC-1).

---

## 4. Policy details

### 4.1 Anti-slop per-rule policy (all `error`)

Estimated repair effort at investigation: spacing is mechanical but high-volume; module mocking is very high. Safety comments, runtime `typeof`, dictionary types, unknown parameters and chained assertions are high; known-value widening and unknown returns are medium–high. Conditional empty spread and filter/map are medium; shape names and object parameters are low–medium. Reflect-get and reflect-apply have few cases but need semantic review. The three zero-count rules have negligible current repair cost, not zero verification cost. PL-1 refreshes each estimate from current counts and repair type.

<!-- prettier-ignore -->
| Rule | Raw test/prod | Repair order | Classes |
|---|---|---|---|
| require-readable-spacing | 42,963 | M1 autofix + Oxfmt | — |
| require-safety-comment-for-type-assertion | 2,971/1,328 | remove casts → tagged SAFETY form (D5) | P2, P3; P4 only in doubles owners |
| no-runtime-typeof (TS) | 317/893 | parse at ingress → remove with type evidence → domain predicate in an owner; never remove checks on `unknown`/`any`/I/O/cast values | P3 |
| no-unsafe-dictionary-type | 884/509 | Use owned value types, recursive `Json` for validated JSON, or `Map` (§4.2). Consolidate equivalent `isRecord` guards in the registered workspace owners. Rename `JsonRecord = Record<string, unknown>` in `packages/api/src/donor-portal/model.ts` and `packages/email/resend/json.ts` to identify unvalidated data, or use `Json` if validation proves it. For each ingress alias, `typescript/no-restricted-types` bans use outside its approved parse-input paths; test one allowed use and one rejected use. | P1, P3 |
| no-module-mocking | 1,273/0 | §4.7 | P4, P5 |
| no-unknown-parameters | 559/438 | precise types; parse at decode | P3 |
| no-known-value-widening | 337/279 | Use `satisfies` or a named return type. Never delete a validator call to clear an unknown-argument finding: type unvalidated input as `unknown` until checked. | P3 only for a tested validator |
| no-chained-type-assertions | 239/85 | fix declarations; money formatter → single `` as `${number}` `` (P2); pass the exact decimal string to `Intl`, never `Number(decimal)` | P2 |
| no-unknown-returns | 143/74 | Decode with `parseJsonBody(request, schema)` or a fetch wrapper that takes a schema and validates the response at ingress (§4.2). | P3 |
| no-conditional-empty-object-spread | 39/143 | Build a fresh object in the same key order under the original condition. Test key absence versus a present `undefined`; a truthy status still excludes `""`. Changing that condition is a listed behavior change. | — |
| no-shape-in-symbol-names | 49/69 | Rename vague owned names, not fixed wire keys or library props. For Recharts `shape` in `giving-breakdown-view.tsx`, use geometry-specific names for owned renderers and preserve rendering; record any unavoidable false positive at the site under D5. | P1 for fixed protocol names; T1 only under D5 |
| no-array-filter-map | 33/45 | Fuse only when both callbacks ignore the index and the target supports the replacement. Pin observable effects, callback order, filtered indices and sparse holes; retain separate passes if fusion changes any of them. | — |
| no-object-parameters / reflect-get / reflect-apply | 15/4, 17/0, 11/0 | Use capability types for trusted objects only. Before replacing reflection, test proxy receiver and accessor behavior; preserve `this` and argument order on calls. Keep the forged caller’s inputs untrusted in `effective-capabilities.test.ts`; its tests must still fail on the corresponding authorization or forwarding regression. | P3 only for tested reflective validation |
| no-reduce-accumulator-copy, no-unknown-type-aliases, no-widen-then-assert | 0 | Keep each sentinel. Mutate only an accumulator created for and owned by that reduction, never shared state or Query cache data. | — |

PL-3 records the dispositions of anti-slop #54, #65, #66 and #71, and of PR #61.

### 4.2 Behavior-sensitive repairs

PL-3 gives every rule with findings a prescribed repair form, and the packets carry it. **Whether an edit is behavior-relevant is decided per edit, objectively** (A R10): `scripts/quality/emit-diff.mts` transpiles the base and head versions of each changed file with `ts.transpileModule`, the tool the type-import batches already use, and compares the output with whitespace and comments ignored. It calls `ts.transpileModule` (classic 6.0.3) with each file's own resolved compiler options, never the defaults. Core sets `verbatimModuleSyntax: true` (`tooling/typescript-config/base.json`), under which an inline-only `import { type X } from "m"` still emits `import "m"`, while `import type` emits nothing (E38). With default options that difference disappears, and a removed side-effect import would be classified as neutral.

- Identical output: the edit is **behavior-neutral** — the type-only repairs, such as `no-known-value-widening` and most `no-unsafe-*` findings. It needs no new test.
- Any other output: the edit is **behavior-relevant**. It is made test-first, and at slice acceptance a test must execute its changed lines (§8.5).

The lists below name the rules whose repairs are usually behavior-relevant, with the form each must take.

**Test-first or manual repairs:**

- **General:**
  - `strict-boolean-expressions`;
  - `no-conditional-empty-object-spread`;
  - `no-runtime-typeof`;
  - `return-await`;
  - `no-floating-promises`.
- **Coercion, conversion and ordering:**
  - `prefer-template`: pin non-string coercion before replacing `+` with interpolation;
  - `prefer-number-properties`: preserve string-input behavior; global `isNaN` coerces, `Number.isNaN` does not;
  - `no-unnecessary-type-conversion`: correct the I/O type before removing a conversion, especially for tenant IDs;
  - `require-array-sort-compare`: preserve the default order described below;
  - `prefer-spread`: preserve the result for astral characters (`split("")` uses UTF-16 code units).
- **Behavior-changing rewrites:**
  - `prefer-response-static-json`: pin the existing response headers; `Response.json` can add `Content-Type`;
  - `no-non-null-assertion`: the failure must be kept; narrow and then throw or assert, with no `?.`/`??` defaulting;
  - `prefer-type-error`: pin the class caught by callers;
  - `prefer-query-selector`: preserve ID lookups for IDs that are not valid CSS selectors;
  - `prefer-structured-clone`;
  - `switch-exhaustiveness-check`;
  - `prefer-dom-node-text-content`: preserve the distinction between rendered `innerText` and all `textContent`;
  - `unicorn/text-encoding-identifier-case`. Its M2 batch first verifies that there are zero encoding-literal comparison or case sites.
- **More rules whose repair can change runtime results** (post-M1 test/production counts; manual, test-first, with the prescribed form):
  - `no-base-to-string` (176/57): an explicit, owned formatter or field access — never a bare `String(x)` on values that feed labels, keys or hashes;
  - `no-unnecessary-boolean-literal-compare` (5/66): removed only where the value is typed from a parsed source; at I/O boundaries the `=== true` stays with a P3 reason, or the value is parsed first;
  - `only-throw-error` (10/3) and `prefer-promise-reject-errors` (5/2): wrap in an `Error` subclass that keeps the original as `cause`, and update the catch sites that inspect it, with tests;
  - `no-useless-spread` (46/7): kept where the copy prevents aliasing (a test shows the mutation);
  - `prefer-add-event-listener` (0/4), `no-new-array` (2/2), `prefer-default-parameters` (0/1), `prefer-string-slice` (0/1), `radix` (0/12), `prefer-code-point` (23/6): each with a test pinning the edge case (`undefined` vs omitted argument, negative indices, astral characters, leading zeros).
- **Still more test-first rules** (post-M1 test/production counts; A R9): `typescript/no-deprecated` (55/272: the replacement API plus a recorded-payload test); `typescript/no-misused-promises` (13/59: `runDetached`, or an explicit sequential or parallel decision with a test); `react/exhaustive-effect-dependencies` (0/20), `react-hooks/exhaustive-deps` (2/8), `react/set-state-in-effect` (2/12), `react/refs` (2/34) and `react/no-unstable-nested-components` (5/29) (a test pinning how often the effect runs, the derived state, or state preservation); `promise/prefer-catch` (32/11: kept as `.then(a, b)` where `a`'s own errors must not reach `b`); `unicorn/custom-error-definition` (15/19: `error.name` consumers checked); `unicorn/no-object-as-default-parameter` (13/3); `react/button-has-type` (22/7: explicit `type="submit"` inside forms); `eqeqeq` (11/109: `null` comparisons keep the configured exception; others with a coercion test); `restrict-template-expressions` (23/30: an explicit formatter); `unicorn/prefer-import-meta-properties` (20/100: not in bundled client code without a build check).
- **Nullable numbers and bigints (all scopes):** a truthiness check on `number | null | undefined` becomes the owned helper `isNonZero(x)`, which preserves truthiness exactly, including `NaN` and negative values; a bigint uses `isNonZeroBigInt(x)`, or `x !== 0n` when its type is non-nullable. An owned money predicate on that operand also qualifies under D6. Any other rewrite, including `> 0`, is a listed behavior change with a test.
- **Sorting:** a `require-array-sort-compare` repair preserves today's order. Default `.sort()` compares string forms, so the preserving comparator is `(a, b) => { const x = String(a), y = String(b); return x < y ? -1 : x > y ? 1 : 0; }`; a numeric comparator is a behavior change that needs a test. Key, hash and persisted paths never use `localeCompare`.
- **Regression tests first:** functions with money, count, label, tenant or auth semantics get a regression test before the change.
- **TA-1 tenant/auth inventory** (`tooling/quality/tenant-auth-scope.json`, generated by content and checked like `money-scope.json`, with the same no-shrink rule): functions that filter by tenant (`tenant_id`, organization or tenant keys in queries and RPC calls), `resolveTenantStripe` and its callers, auth and permission guards (session, role and capability checks), every user of the admin or service-role client, and every Supabase client constructor call site, including the RLS-reliant user server client (`packages/database/supabase/server.ts`, 28 importers), and the Payload access layer (`apps/admin/src/cms/access/**` and every collection `access` block that uses it). Its fault patches remove a tenant `where` clause or a role check and run against the **direct access-function tests** (`tests/unit/cms/tenant-access.test.ts`, `tenant-context.test.ts`, `public-read-access.test.ts`): the Payload local API needs Postgres, which the unit tier refuses, and only `cms:qualify` in the integration job starts it (A R10). A static `verify:quality` check confirms that each collection and access operation references its own recorded function, not just any function in TA-1. A reviewed wiring change updates the inventory and its direct test together. A local-API leg, if one is wanted, is a coordinator-registered realstack file. Membership is computed on **base ∪ head**, so a slice that switches a function from the user client to the admin client is caught. The fault patches for inventoried functions (remove the filter or guard, swap user→admin client) live in one library built at A3 (**FP-1**, §8.5). A slice that edits an inventoried function, **or any test that reaches one**, must leave every such patch failing on the same assertion.
- **Schemas:** test new schemas against recorded payloads, including accepted numeric and nullable variants; keep both acceptance and the existing throw or fallback. Before converting `ensureJsonBody` to schema-based decoding, pin one real caller’s status and response body separately for malformed JSON, valid JSON that fails the schema, and a valid payload.
- **Projection validation:** before changing `packages/api/src/projection/validation.ts`, pin a valid frozen snapshot and rejection of cycles, disallowed prototypes, accessors and invalid values. Assert the rejected getter was never called.
- **Query retries:** preserve the database query client’s decisions for direct and nested 401/403 statuses, PostgREST auth/permission codes and nested causes; keep a retryable control at the same failure count.
- **Render-prop types:** in `apps/missionary/app/profile/profile-primitives.tsx`, a type control must infer the Base UI callback’s props and state and reject an invalid member; do not replace the callable type with `any`.
- **Money routes:** pin NaN, Infinity, trim and the error body first.
- **Order and hashing (GH-1, before Phase B):**
  - The inventory covers the 16 product files that hash or fingerprint, including the Resend webhook dedupe id (`resend.ts:314-327`) and the query-key factories.
  - Golden tests start from **raw input** (extra and permuted keys) and run through the current parser to the hash.
  - Repairs may not change key order or the stripped-key set on these paths.
  - `Map`/`Set` stay out of query keys, out of stringified, hashed or persisted values, and out of values passed from a Server Component to a client component.

### 4.3 Architecture boundaries (four tiers)

0. **Packages:** no imports of `apps/*`; `motion/react` only in `packages/lib/motion*`.
1. **App-wide:** cross-app imports (including Console), motion, the raw Twenty client, and direct `@tanstack/react-table`.
2. **UI layer:** ban `@supabase/*` and admin/server database clients in `apps/*/{components,features}/**`, `apps/*/src/{components,features}/**` and `packages/ui/**`.
3. **Route handlers:** ban Supabase clients in `apps/*/app/api/**` and `apps/*/src/app/api/**`. Only `api/health/route.ts` in either layout may import `@asym/database/supabase/server` for its health probe; other restrictions still apply.

Compose the union of all applicable bans for each path: a later `no-restricted-imports` setting replaces rather than extends the earlier one. Keep the Payload import ban in `packages/api/src/cms/public/**` and the documented ADR-3 exceptions. Central tests keep only the direct `@/` ban.

`verify:data-boundary`, `verify:service-role-clients` and `verify:cms-public-sole-entry` remain independent gates. VR-3 exercises the composed policy with real Oxlint; if a native rule misses an import form, enforce that form in the same paths before declaring parity.

### 4.4 Query and the other TanStack libraries

- **Oxlint JS-plugin rules:** `exhaustive-deps`, `no-unstable-deps`, `stable-query-client`, `infinite-query-property-order`, `mutation-property-order`, each with sentinels. Re-inventory the eight reported `exhaustive-deps`/`no-unstable-deps` findings against the slice base. Record each disposition after reviewing fetch inputs, cache identity and invalidation; keep the GH-1 goldens unchanged. Do not add functions or whole options bags to keys to silence lint.
- **Bridge rules:** `no-rest-destructuring`, `no-void-query-fn`. The root `lint:query` dispatcher (D3) runs them per workspace from CT-0a and, from TS-2, once per central-test program (at most two processes at once). In each selected Query-reachable workspace, check all eligible product TS/TSX, including files without a direct Query import. Imported-void and typed-wrapper rest negatives with valid counterparts sit in a central program and are checked through the public command.
- **Deferred:** `prefer-query-options`.
- **Per library** (files importing it at base; PL-0 names the suites and records gaps):

  <!-- prettier-ignore -->
  | Library | Files | Lint coverage | Behavior protection | Slice gate |
  |---|---:|---|---|---|
  | Query | 80 | the 5 + 2 rules; React Compiler rules | Run the query-key goldens (GH-1) and `admin-crm-relationships-query-key`; test invalidation, cancellation, pagination and optimistic updates. The browser must reuse its client across renders; two server requests must not share a client or cached data | owned Query files → their suites + bridge |
  | Table | 12 | direct `@tanstack/react-table` import ban (tier 1); `react/incompatible-library` at `error` | Keep React Compiler annotation mode and the shared `useTable` adapter. Assert subscribed table, row and cell values after selection, filtering, sorting, paging, pinning and editing; keep the updater repairs (D5) | owned table files → table suites |
  | DB | 15 | data-access boundary rules; React Compiler rules | On a frozen install, run `tanstack-runtime-identity` and `tanstack-foundation-guardrails`: one physical DB runtime and the same QueryClient runtime across collection bindings. Keep `supabase-adapter-compatibility` (transaction rollback), `query-once-helper` (unsafe ordering fails before I/O; delegated filters preserve upstream results or errors), and offline first-load suites (`donor-history-offline`, `donors-offline-load`, `home-offline-load`) | owned collection files → database suites |
  | Form | 6 | React and `jsx-a11y` rules | Check representative field, validator and default-value inference with the selected compiler and unchanged TanStack versions. Run `tanstack-form-accessibility` and owning form tests for async validation and submission, labels, errors and focus | owned form files → form suites + a11y |
  | Virtual | 2 | virtualizer owner exceptions; `react/incompatible-library` | Run `virtualization-config`, `virtualization-pilots` and `data-table-responsive-keyboard-virtualized`; exercise both virtualizer owners with a row whose height changes after render, then scroll and check measurements and keyboard focus | owned files → those suites + screenshots |
  | Store | 1 | React Compiler rules | its subscription test | owned file → its test |

  `react-hooks/config` and `react-hooks/gating` have no Oxlint equivalent; PL-0 lists them as gaps with the reason (Core does not use React Compiler gating).

### 4.5 Playwright

- Set `settings.playwright.globalAliases` at the root. Apply the recommended rules, not the whole flat config, only to JS/TS-family `*.spec.*` and `*.test.*` files under `tests/e2e/`, `tests/fixtures/base-ui-compliance/specs/` and `apps/factory-console/tests/e2e/`, not to browser fixture app code or Vitest files.
- After that map, layer 4 sets `no-empty-pattern: ["error", { allowObjectPatternsAsParameters: true }]` in those scopes. Keep `missing-playwright-await` with `includePageLocatorMethods: true`, `no-skipped-test` with `allowConditional: true`, and `--deny-warnings` so warnings fail the command.
- Pair each failure with a clean case: an unawaited web-first assertion, an unawaited locator action, a focused test and a fixed browser wait. Exercise the imported `test.extend` fixture and its alias; a valid empty fixture parameter, a permitted conditional skip and a non-Playwright object with a common locator method name must pass.

### 4.6 Shadcn — D12.

### 4.7 Vitest resolution, P4 governance, mock recipes

**Inventory and snapshot:**

- Shims: `server-only`, `@tiptap/react/menus`.
- Each of the eleven instance pins in `vitest.config.mts` must resolve to the real installed package or its own subpath. `vitest.pin-workspace-packages.mts` and the per-importer aliases may resolve workspace imports to their real sources; they must never redirect product modules to replacements.
- Allowlist each P4 replacement by exact third-party module and shim target. A new entry needs a reviewed reason, the boundary it replaces and a direct test of the shim. `next/font/local` is a candidate for compile-only use, not a preapproved general mock.
- `verify:quality` fails on unreviewed changes to `resolve.alias`, `test.alias`, `test.server.deps.inline`, plugins (including `resolveId`/`load`), `test.setupFiles`, `vitest.pin-workspace-packages.mts` or `test.coverage`; compare them with the reviewed resolution snapshot.

**Network fail-closed (W-MOCK-SB seam commit, before any recipe use):**

- **No global unstub change.** `vitest.config.mts` keeps `clearMocks` only, so non-network stubs (`matchMedia`, observers, env) keep their current lifetimes.
- **Deny-all `fetch`:** `tests/setup/unit-env.ts` installs it with `Object.defineProperty`, and a setup `beforeEach` re-installs it, so every test starts denied. Recorders are installed in `beforeEach` (after the setup's) or in the test body. The seam commit migrates every module-level, `vi.hoisted` and `beforeAll` replacement of `fetch` — `stubGlobal`, `spyOn(globalThis, "fetch")` and direct assignment — from an inventory generated by `scripts/quality/stub-inventory.mts` (E57). `core/no-unscoped-network-stub` then rejects a `fetch` replacement outside `beforeEach` or a test body.
- **Sockets:** non-loopback connections are refused; loopback is allowed only to ports registered with `registerLoopbackRecorder(port)` (cleared after each test). The guard wraps `net.Socket.prototype.connect` and reads the target from `args[0][0]` when `args[0]` is an array, because `net.connect()` passes one normalized argument array (E66: the first prototype missed this and refused registered ports). That one wrapper covers every Node client path: `net.connect`, `tls.connect`, `http` and `https` requests and the built-in `fetch` all reach it (E71), so `tls` needs no hook of its own. Every other host and port is refused, the local Supabase ports `127.0.0.1:54321` and `54322` included. Unit tests that start local servers (e.g. `tests/unit/scripts/e2e-dev-server.test.ts`) register their ports in the seam commit.
- **Network authority comes from the job, not the file name:**
  - `tooling/quality/integration-tier.json` (coordinator-owned) lists each integration-tier file, its owning workflow, job, Vitest config, gating variable, the service variables it may keep (for example `RELEASE_DATABASE_URL` and `DATABASE_URL` for the release suite's child processes), and the hosts it may reach. Its first entries are the 25 existing `*.realstack.*`/`*.integration.*` suites (loopback ports) and the two `*.stripe-live.*` suites in `packages/api/tests/unit`, which call the real Stripe test API whenever `STRIPE_SECRET_KEY` is set (`api.stripe.com:443`; A R10).
  - `vitest.config.mts` **excludes** registry files unless `CORE_TEST_TIER=integration`, spreading `configDefaults.exclude` so the default `node_modules` exclusion survives (E67). Set the variable only in the registry’s integration jobs: `ci-integration.yml` `migrate` for its files and, if #2727 has landed, its own API-contract job and config for its live suites. Each config loads the same tier guard. Those workflow edits, its `workflow-yaml.ts` amendment and any AP-1 pin amendment form one **coordinator-owned** commit, **W-MOCK-SB-CI**, because slices never edit workflows (A R10). Every other entrypoint — `test:unit`, `ci:preflight`, `ci.yml` — never collects registry files.
  - **The guards are never switched off** (A R10). In the integration tier a registered file may reach only its registered hosts and keeps only its registered service variables; everything else stays denied. Each tier file also keeps its own gating `describe.skipIf`.
  - Network tests are registry entries (named `*.network.integration.test.ts`) run by one coordinator-owned globbed step with a canary file. Separately select the two registered `*.stripe-live.test.ts` paths in their owning job; assert each collects nonzero known IDs under test-mode gating. Run only with an authorized test credential; otherwise record that the live run did not take place. Moving a test into the tier is a registry edit by the coordinator, listed in the slice ledger; slices never edit the registry or the workflow.
  - **Controls, in three legs** (G R10): Vitest stops at collection for an excluded file and never runs the setup, so one control cannot show both exclusion and denial.
    1. `test:unit` collects zero tests from a registered file.
    2. The same file selected directly without the variable is rejected at collection ("No test files found", exit 1).
    3. The setup-layer denial is proved on its own: a fixture config includes a registered path without the variable, the setup runs, and the guard denies.

    With the variable, the file is collected and reaches only its registered hosts; an unregistered file named `*.network.integration.test.ts` stays denied even with the variable; one real release child reaches its disposable database.

  - **Collected-test parity** (G R10): the active entrypoints together account for every base **file**, allowing only the reviewed moves, successors or deletions in §8.5 (`vitest list --filesOnly`, 2 s). Test IDs are compared per entrypoint, on the same platform, by the test-ID tool (TID-1, §8.5). Tier files, whose `describe.skipIf` hides their IDs when the gating variables are absent (E67), are compared inside the integration job, using safe collection-only gating values on both revisions; live credentials belong only to separately authorized integration execution. Each gated suite must list a known, nonempty ID under those values, so that two empty lists never compare as equal.
- **Refusals cannot be swallowed:** every refused attempt is recorded per test; a setup `afterEach` fails the test unless it was declared with `expectDeniedNetwork(pattern)`. The pattern must name a host (catch-alls are rejected), declarations are counted in slice ledgers, and a file-level `afterAll` fails on attempts not attributed to a test.
- **Child processes are guarded process-wide: no spawn helper, no spawn rule** (A/G R10, E66). A helper that tests must call cannot work here: 65 acceptance files start processes and are "Owned by Acceptance", 131 other test files import `node:child_process`, and about 57 script modules under test start processes of their own. Instead one plain-JavaScript module, `tests/setup/network-guard.mjs`, holds the `fetch` and socket guards and appends each refusal to the file named by `CORE_TEST_REFUSAL_LOG`. `tests/setup/unit-env.ts`:
  - imports that module, so the test process itself is guarded by the same code;
  - appends `--import <file URL of the module>` to `process.env.NODE_OPTIONS` and sets `BUN_OPTIONS=--preload <path with forward slashes>` (Bun drops backslashes), so every Node or Bun descendant that inherits these options loads the guard, whoever starts it — a test, an acceptance harness or a script under test — grandchildren included;
  - deletes service URLs and keys from `process.env` for the whole test process. The list is generated from the `@asym/env` server schema plus named extras; in the integration tier a registered file keeps its registered variables. A caller that passes its own environment to a child, such as the release suite's disposable-database URL, is unaffected;
  - sets `CORE_TEST_REFUSAL_LOG` to a per-worker file. The setup `afterEach` reads new entries into the per-test record, so a child that catches its refusal and exits 0 still fails its test;
  - has `registerLoopbackRecorder(port)` also write `CORE_TEST_LOOPBACK_PORTS` in `process.env`, so a child started afterwards may reach that port and nothing else;
  - **wraps `node:child_process`** in the guard module itself (`spawn`, `spawnSync`, `exec`, `execSync`, `execFile`, `execFileSync`, `fork`, followed by `syncBuiltinESMExports()`), so that the guard is merged into whatever environment a caller passes, one built from scratch included: the wrapper extends the caller's `NODE_OPTIONS`, adds the Bun preload and copies the control variables. Because the module is preloaded into each child, a child's own spawns are wrapped as well. Tests keep using the ordinary API and import no helper (final check R07, E75);
  - points `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` and their lowercase forms at a closed loopback port, and puts in `NO_PROXY` only the registered recorder ports, as port-qualified entries (`127.0.0.1:<port>`). Bun honors those exactly. curl and git ignore a port-qualified entry and so reach no loopback port at all (E76); a test whose curl or git child needs a local recorder uses a Node or Bun client or moves to the integration tier. A blanket loopback exemption is never set: it would let a proxy-aware child reach any local listener. Node ignores proxy variables and depends on the preload.

  **Stated limits** (testing rulebook): a process that a non-Node program starts with a cleared environment has no guard, and a non-HTTP client such as `psql` ignores proxies. Removing ambient credentials is not network isolation, so these two cases are named as limits, not claimed as covered. If the pilot finds a suite that must see its child's environment exactly as passed, the coordinator registers that file as an exception to the wrapper and this limit applies to it; the exception list is part of `integration-tier.json` and is reported in the final handoff.

- **`STRIPE_API_BASE_URL`** is deleted in the setup `beforeEach`.

**Supabase (121 `vi.mock` sites):**

1. Set the environment before import, per test: `vi.stubEnv` in `beforeEach`, then `vi.resetModules()` and a dynamic import inside the test.
2. Stub `fetch` with a recorder: `vi.stubGlobal("fetch", recorder)`.
3. The recorder asserts:
   - the URL and query, including tenant filters;
   - RPC bodies;
   - the privilege headers: service role versus anon + JWT, asserted on `apikey` with synthetic keys in the production format (supabase-js 2.118 always sends `apikey`; PostgREST and storage requests without a session also send the key as a Bearer token, so `Authorization` is asserted too).
4. No production change. Client or transport parameters on tenant- or auth-scoped functions are forbidden. `verify:service-role-clients` passes unchanged for the pilot and for every slice that touches client construction: `docs/security/service-role-client-allowlist.json` is shrink-only by file, kind and count, and is never widened to make a mock redesign pass.

**Stripe, server side:**

- **Guard at construction**, independent of env validation and of module-load snapshots. `createStripeClient` reads `process.env.STRIPE_API_BASE_URL` at call time. When it is set, the client is built with its `host`/`port`/`protocol` only if all of these hold; otherwise it throws:
  - `process.env.NODE_ENV === "test"`;
  - `isProtectedDeployment(...)` from `@asym/env/target-env` (no schema side effects), **called at call time** with `NODE_ENV`, `VERCEL_ENV` and `VERCEL_TARGET_ENV` from `process.env`, is false (not the module-load `runtimeEnvFlags`);
  - `new URL(raw)` has protocol `http:`, hostname `127.0.0.1` or `localhost`, an explicit port 1–65535, pathname `/`, and no username, password, search or hash.
- **Second layer:** `@asym/env` adds a top-level check that is **not** gated by `SKIP_ENV_VALIDATION` (unlike the existing `E2E_AUTH_BYPASS` check, which is) and throws when the variable is present outside `NODE_ENV=test`.
- This is a reviewed production change. The transport is unchanged; stripe-node retries, timeouts and idempotency still apply.
- **Tests:**
  - refusals: `NODE_ENV=production` with `SKIP_ENV_VALIDATION=1`; `NODE_ENV=test` with `VERCEL_ENV=production`, without `vi.resetModules()`; a non-loopback host; `https:`; a path; credentials; the `@asym/env` refusal under `SKIP_ENV_VALIDATION=1`;
  - two tests in one file using different ephemeral ports, without `vi.resetModules()`;
  - the positive control goes through the **real resolver** (`resolveTenantStripe`) with synthetic tenants and `sk_test_` keys: (a) a tenant key → that key; (b) a tenant row with an empty key → the platform key (today's designed fallback, `tenant-client.ts:66-68`); (c) no tenant row → `tenant_not_found` and no request. The in-process recorder asserts the selected key in `Authorization`, Core's pinned `Stripe-Version`, the `Idempotency-Key`, the path and form body, and the **absence** of `Stripe-Account` (Core isolates tenants by key).
- **Fault patches:** tenant B's key used for tenant A; a missing tenant borrowing the platform key. Each must fail on an assertion naming the property.
- Browser Stripe: an injected `stripePromise`.

**Other recipes:**

- Database hooks: a real `QueryClientProvider` plus the recorder.
- Auth: a real provider with a test session.
- Lib hooks: real hooks.
- For deep `node_modules/@payloadcms/ui` mocks, pilot one representative file before slices use the recipe. Inject an Admin CMS adapter per call or render, or prove the same behavior in E2E under §8.5; do not alias Payload UI to a fake.
- `next/navigation|headers|cache`: P4 shims.
- `next/link|image|dynamic`: the real modules.
- `pg`: an injected client or the integration tier.
- `node:fs`: temp directories.
- `maplibre-gl`: an injected factory or a P4 shim.
- `sonner`: a real `<Toaster/>`.
- `@asym/env`: set the environment before import.

**Seam rules:** per-call or per-request injection only; no module setters in server code; no test-only exports; commit a production seam first with the existing behavior tests unchanged and green, then rewrite those tests in a separate commit. Keep the required guard setup, fetch-lifetime migration and controls together in W-MOCK-SB.

**Docs:** the Vitest skill and the testing rulebook are updated.

---

## 5. TypeScript: three responsibilities

### 5.1 Typed lint (TSRS) — D4.

### 5.2 Independent compiler: TS-1, RB-1, GEN-1, strict builds

**TS-1:**

- the root alias, 16 pins, the lock, and two type-only Admin repairs for the five TS2883 sites (E11): the mention extension typed as `ReturnType<typeof Mention.configure>` through its existing `@asym/ui` import, and the readonly collection registry in `support-store.ts` typed from public `@asym/database` exports, with no new Admin import of `@tanstack/db` (C R1);
- vendored manifests untouched;
- **`"ES2023.Intl"`** added to the `lib` of all five `tooling/typescript-config` presets **and** to the three local overrides (`packages/auth`, `packages/config`, `apps/factory-console`). `packages/eve-runtime` (no preset) gets `"lib": ["ES2022", "ES2023.Intl"]`. A compile test asserts `packages/api` and `packages/eve-runtime` see `Intl.StringNumericLiteral`.
- **Next generated types** (qualified, E58): the three product apps add `.next/types/**/*.ts` to `include` (Factory Console already has it), and each app's `typecheck` becomes `next typegen && tsc --noEmit -p tsconfig.typecheck.json` with the pinned Next (G R10: without `-p` the compiler would read `tsconfig.json`). Typegen needs no service variables, leaves no tracked drift, and its validator compiles cleanly on 7.1-beta (E58).
  - **Negative (end to end):** in a scratch copy, an authored route with an incompatible export (for example a page whose `params` type contradicts its segment) makes the public `typecheck` fail through the regenerated validator.
  - **Membership:** after generation, an error injected into `validator.ts` and a direct compiler run must fail; `--listFilesOnly` lists the validator.
  - **Uncached, canonical program:** the four app `typecheck` tasks are `cache: false` and run on every CI event, so no restored output or unselected task can report a stale green. They are declared as package tasks in the root `turbo.json` (`@asym/admin#typecheck`, `@asym/donor#typecheck`, `@asym/missionary-app#typecheck`, `@asym/factory-console#typecheck`), because Factory Console has no `turbo.json` of its own (E68). Each compiles `tsconfig.typecheck.json`, which extends the app config, sets `"incremental": false` (the shared presets and Factory Console set it to `true`, and a stale `.tsbuildinfo` must not be reused), and drops `.next/dev/types/**`, which only `next dev` writes. Factory Console's own config names that glob in its `include`, so a clean tree proves nothing here: the control runs with a poisoned file under `.next/dev/types` present in every app, and the public `typecheck` must still pass (C R10). Payload-generated types present and absent remain GEN-1a's two explicit states.
- **the version verifier** (`scripts/verify/typescript-toolchain.mjs` and its test): its pattern admits the exact `7.1.0-beta` on the native side only, and it keeps every check it makes today (installed equals declared for the classic API, the alias and each workspace; the parser and the classic API on one physical `typescript@6.0.3`; the editor SDK; the root `tsc` launcher, including its Windows `.bunx` target). It adds the literal alias form `npm:typescript@7.1.0-beta`, the roster of the 16 product workspaces (today it skips a workspace without a pin, so a deleted pin leaves inspection) and the physical resolution of §5.3. New negative tests: a stale workspace pin, a nightly, a range, a wrong alias and a replaced classic root;
- **negative fixtures, exact per compiler family** (C R1): the capability poison fixtures keep their classic tags, and a family table adds the native expectation: `authenticated-context.ts:7` is TS2345 on classic 6.0.3 and TS2741 on native 7.0.2 and 7.1-beta, and `grant-subjects.ts:11` is TS2741 on both. Each family's (file, line, code) multiset must match exactly; a missing, duplicate, extra or locationless diagnostic fails. The Principal harness (`tests/unit/packages/api/principal/compile-fail.test.ts`) builds its module specifiers with forward slashes instead of a raw `path.join()` result, which breaks its positive fixture on Windows. The positive then compiles with no diagnostic, and each negative yields exactly one, TS2322 at its marked line, compared across every code instead of through a TS2322 filter;
- **guidance:** `docs/ai/rules/typescript-future-proofing.md`, `docs/guides/typescript-6-readiness.md` and `tooling/typescript-config/README.md` say why the exact native pre-release is admitted while classic 6.0.3 stays for the API, parser and editor, give the `ES2023.Intl` and `tsconfig.typecheck.json` conventions, and say how RB-1 returns to 7.0.2.

**Strict builds (per platform):**

- **Ubuntu** (a CI job, or WSL) is authoritative. `ci-build.mjs` forwards `--force --summarize` **only when `--strict` is set** (ordinary `build` keeps Turbo caching), to all four strict invocations (one shared-package step plus one per app). Every build task in every summary must be a cache miss.
- **win32** has no Turbo branch. Before running the direct builds it deletes `{apps,packages}/**/*.tsbuildinfo`, `apps/*/.next` and `packages/*/dist`, and it records logs and exit codes.
- **Factory Console** is excluded from the default build, so the qualification runs its strict build explicitly.
- Unit tests assert the argument arrays on both branches, with and without `--strict`.
- **Coverage by task:** each platform records expected and observed build task IDs, including the separate Console invocation. The win32 shared-package list in `ci-build.mjs` gains `@asym/eve-runtime` and `@asym/mock-data` (both have build scripts and are Admin dependencies); any remaining omission is labelled, with Ubuntu authoritative.
- Also covered: program membership of generated files, and the Console negative.

**RB-1:** a scratch dry run in A2 of the rollback in §11. It is repeated at C5 against the integrated registry, together with the proof checks, and with the Shadscan check while that ledger exists (it cites the root manifest 8 times).

**GEN-1a** (A2; direct native compiler):

1. Payload `generate:types`.
2. Compile Admin with the generated types present.
3. Remove them and compile again (the boundary check).
4. The import-map producer's output must equal the committed file.

Legs that need services run in a CI job; a leg that runs nowhere is reported as unverified, never as passed.

**GEN-1b** (CT-0):

- The currency generator and the import-map postprocessor format through the adapter.
- The postprocessor drops its `eslint-disable … TODO(AL-000)` header and strips the one already on line 1 of the committed `importMap.js`; CT-0a re-runs it so the committed file matches. The file becomes a root lint ignore.
- Fixed-input tests: in a scratch copy, the currency generator turns a named fixed input into exactly the expected formatted bytes, and a second run changes nothing.

### 5.3 Classic API consumers — unchanged.

They stay on the physical `typescript@6.0.3` at the root: every authored file outside the evidence trees that imports `typescript` (26 at the plan's base, all under `scripts/`, `tests/` or the root, none inside a workspace), the Query parser and the editor SDK. TS-1's verifier resolves `typescript` from each of them and fails on any other realpath, so a consumer added inside a workspace, where `typescript` resolves to the native package with no classic API (E11), is caught.

### 5.4 Programs, ownership and resolution

<!-- prettier-ignore -->
| Scope | Program | Notes |
|---|---|---|
| 16 workspaces | unchanged | own aliases |
| Root TS configs | root `tsconfig.json` (`files` only: the six Playwright configs, the Vitest configs and helpers, and the root Oxlint and Oxfmt entries) | `types: ["node"]`; a `lib` that includes ES2023 (`vitest.pin-workspace-packages.mts` uses `toSorted`, and the ES2022 library gave three errors, C R1); `allowImportingTsExtensions`, `noEmit` |
| `scripts/**/*.ts`, `scripts/**/*.mts`, `tooling/quality/**/*.mts` | `scripts/tsconfig.json`, `tooling/quality/tsconfig.json` | `erasableSyntaxOnly`, `allowImportingTsExtensions`, `noEmit`; include `["**/*.ts", "**/*.mts"]` as two literal patterns (tsconfig has no brace expansion, E52); only `scripts/shadcn` has Bun types, through its own `scripts/shadcn/tsconfig.json`, which `scripts/tsconfig.json` excludes; the factory pack is repaired under its operational review |
| `tests/unit/apps/<app>/`, `tests/unit/packages/ui/`, `tests/unit/acceptance/issue-2364/`, `tests/e2e/`, Base UI fixture, `tests/unit/packages/api/principal/`, `tests/unit/packages/api/projection/` | directory programs | generated paths; `tests/e2e` adds Node types; `issue-2364/` maps Donor's `@/` and keeps Donor's `@/lib/mock-data` imports, whose spelling its test pins (`donor-pages.acceptance.test.tsx:130`); the Base UI fixture program covers all its authored sources, including all twelve browser entries its HTML pages load (its `include` lists four today); the two existing API test programs (ordinary tests; the Principal poison harness keeps its own generated config) are registered, and a representative file from each must resolve the intended declarations in both typed lint and the compiler |
| rest of `tests/` | `tests/tsconfig.json` | generated paths; **generated `exclude` of every child program directory** |
| test programs | — | `allowJs:true, checkJs:false` (for `tests/setup/unit-env.ts` → `scripts/git/environment.mjs`) |
| capability poison program | harness-verified negative program, outside the registry modes | — |
| negative fixtures, generated, evidence | excluded | — |

**Discovery (E28):** TSRS discovers only a `tsconfig.json` in a file's own directory chain. A named `tsconfig.<x>.json` is invisible to typed lint, and a file that no discovered program includes is linted in an inferred, non-strict program without any error (E28: 0 diagnostics where the strict program reports 20). So every program that typed lint must see is a `tsconfig.json` in its own directory; the apps' `tsconfig.typecheck.json` (§5.2) serves the compiler only. TS-2's typed-rule pair for each program uses a finding that only a strict program reports, so a silently inferred program fails it.

**`scripts/quality/sync-test-programs.mts`** (TS-2) runs as a generator and as a `--check` in `verify:quality`.

- **Alias needs:** it computes alias needs as (specifier, target) pairs:
  - `@/*` per workspace;
  - exact aliases such as `@payload-config` (E40, E45).
- **Failures:** it fails when one program needs two targets for one specifier, when a program lacks a mapping its files need, or when a tracked test file is in no program and no exact exclusion.
- **Generated paths:** it emits `tests/.generated/paths.<program>.json`, which each program extends last. The file holds exact-specifier `paths`.
  - Besides the alias needs, it maps every bare specifier that central tests or their support files import and the root cannot resolve (E40 lists them; `nuqs/adapters/react`, mapped by hand in the Base UI fixture today, is one). Each is resolved with `ts.resolveModuleName` from every workspace that declares the package, under that workspace's compiler options, and all must give one declaration realpath; otherwise the generator fails (E41).
  - Entries are POSIX paths relative to `tests/.generated/`, routed through `<declaring workspace>/node_modules/<pkg>/…` (E41), with realpath identity asserted.
  - Source exports of unlinked `@asym/*` packages are accepted.
- **Excludes:** it generates the `tests/tsconfig.json` excludes.
- **Vitest parity:** each Vitest pin and its type path share one package-root realpath.

**Repairs in TS-2:**

- `missionary-layout-shell.tsx`: three `@/` imports become relative.
- `searchable-select-consumer-null-policy.test.tsx:29`: imports from `@asym/database/collections/support-hub.schema`.
- `workspace-main.tsx`: imports bare `react-dom/client`.

No root devDependencies are added.

**Sentinels:** `tests/type-resolution/` is a separate program, excluded from the others, with one valid use and one invalid use per mapped package and **no suppression comments**. Its harness compiles it and asserts the exact list of (file, line, code), including the corrected positive controls (Table `ColumnDef` takes its type arguments) and E41's controls: a `QueryClient` from a mapped path is accepted where `packages/database` expects its own (one type identity), and `setPlatform("invalid-control")` is rejected.

**Alias contract:** no direct `@/` imports in central tests.

**Healthy runs** (C R8): every compiler invocation must be healthy before any diagnostic is counted:

- it terminates normally with exit 0, or with an exit explained entirely by source diagnostics that carry a file and location;
- any locationless diagnostic (for example TS2688 for missing `types`), TS5xxx configuration error or TS18003 is fatal;
- output parses completely;
- `--listFilesOnly` itself exits 0 and lists at least one authored file of each declared extension.

A missing-types control (`--types` naming an absent package) must be classified unhealthy even though `--listFilesOnly` still prints the authored files. Intentional compile-failure harnesses (the poison program, the type-resolution sentinels) are separate and assert their exact expected diagnostics.

**Acceptance (end of TS-2):**

- zero TS2307/TS7016;
- coverage from `--listFilesOnly`;
- a typed-rule pair per owner program (Discovery, above), and in each program that maps an alias a second pair under the shipping `--type-aware` run: a `Promise`-returning function imported through the alias fails `no-floating-promises` when left unawaited and passes when awaited, so typed lint is shown to follow the alias;
- the Vitest per-importer alias tests pass.

### 5.5 Program gate modes and the ratchet (simplified: no site mapping)

**Registry:** `programs.json`.

- The workspaces, root, scripts, tooling and e2e are blocking once green.
- The central-test programs start as ratchet at TS-2.

**Ratchet file:** `typecheck-ratchet.json`, per ratchet program.

- It holds the key multiset `file | code | normalized message`, plus the member list: repo-relative authored files only (dependency identity and generated-file presence are separate assertions). A member's deletion or move is recorded explicitly by its owner.
- The check fails on a new key or a higher count, a lower count that has not been recorded, or an unrecorded member departure. A recorded departure is valid only for an actual deletion or a move with verified destination coverage, not for excluding a still-present file. It reads counts only from a healthy run (§5.4).
- Updates go through `typecheck:ratchet --update --owner <id> <files>`: only owned, named files may change: counts only downward, with membership changes limited to the verified deletions or moves above (§8.4); every other entry stays as it was. A program that reaches zero flips to blocking in the same commit. **CT-T** (in C2) flips the rest and deletes the file and the updater.

**M2 never touches files with compile diagnostics.** M2 skips every file that has a diagnostic in any program at the batch's start; those files are repaired by their Phase B slice. M2's compile acceptance: every touched file has zero diagnostics in every program before and after, blocking programs exit 0, and ratchet counts are unchanged. **M1 and CT-0b change layout only** and may touch files with diagnostics (C R9 found 51 such M1 paths). CT-0b runs in A5, before the central-test programs and the ratchet exist (A6), so its compile acceptance is the source replay (§8.3) and the programs that already block exiting 0. M1 runs after A6; its acceptance is the source replay, unchanged ratchet counts and blocking programs exiting 0 (C R10).

**Phase B units:**

- A slice clears its owned files' diagnostics in every program that includes them.
- Outside its owned files, a slice's edits may not add a new ratchet key or raise any key's count. The ratchet is count-based, so a same-key diagnostic moving within one unowned file is **not** detected; that limit is documented, and owned files must be at zero regardless.
- The coordinator enforces zero for the shared `tests/tsconfig.json` after merges (C1).

---

## 6. Formatting and protected content

**Consumers** (ported in A4, integrated in CT-0):

- `update-skill-audit-hashes` uses trusted JSON. Before one atomic write, it validates every selected skill’s full canonical and installed file lists and bytes.
- `refresh-upstream-skills` stages imported content as data under the managed profile. Its isolated tests inject the formatter: missing Oxfmt, malformed supported input, a symlink or an inventory mismatch must fail. Those failures and an interrupted publication must leave the previously published tree and audit records byte-identical.
- `managed-skill-compatibility` defers Markdown formatting of `improve-animations/PLAN-TEMPLATE.md` until the refresh normalizer repairs its nested fences. Compare the raw fixture with the expected repaired output.
- `taste-preview-adapter.mjs` and `taste-charts-adapter.mjs` use the managed profile. Each reviewed replacement must match exactly once on upstream input (all six chart replacements); mixed or drifted input fails. Review the two preview templates, their helper and the adapted outputs against the safety overlays before re-attesting normalized hashes; raw upstream hashes never change in this port.
- `postprocess-payload-importmap` uses the trusted profile and retains both supported locations (GEN-1b).
- `openspec-contracts` emits the Markdown ignore ranges tested by FM-1. The Phase 27/28/29 renderers and the currency generator use the trusted profile. Regenerate changed projections with their owners, never by hand.
- `docs/prds/workflow-studio/tools/render.py` and `docs/prds/program-roadmap/tools/render-phases.py` use `bunx --no-install oxfmt` from the root with the D8 CLI flags and `--stdin-filepath <output-path>`. A formatter failure stops publication.
- The managed-skill test uses the managed profile. Each port has a focused second-pass byte check; publisher failure tests compare destination bytes, not just exit codes.

Phase 25 stays byte-exact.

**Protected bytes:** D8.

---

## 7. Workflows, CI, caches, resources

### 7.1 Commands and verifier activation

<!-- prettier-ignore -->
| Command | Behavior |
|---|---|
| `bun run lint` | `lint:ox` + `lint:query` + `lint:ui` (until W-UI; then `quality:health`) + `verify:quality` |
| `bun run lint:ox`, `lint:new` | the typed Oxlint runs of D3: `lint:ox` is the gate, on the transition entry until CT-1 and on the full entry after it; `lint:new` runs the full entry and merges into `lint:ox` at CT-1 |
| `bun run lint:<app>` | `turbo run lint lint:query --filter=<app>`, both uncached: the app's workspace lint (with the UI bridge until W-UI) and its Query bridge; `local-gates.contract.test.ts` is updated to match |
| `bun run lint:query` | the root bridge dispatcher (D3): workspace tasks from CT-0a, plus one process per central-test program from TS-2; the same command in CI and `check:changed` |
| `bun run lint:fast -- <paths>` | untyped full-policy report (informational) |
| `bun run lint:ui [paths] [--raw] [--prune-suppressions]` | the ESLint UI bridge until W-UI (D12); `--raw` is read-only; prune is the ledger's only writer |
| `bun run quality:health` | from W-UI: `tooling/quality/health.mts` (D12), the design-system probes through the full entry in each of the six UI workspaces; a failed probe or rule load exits 2 |
| `bun run fix -- <paths>` | `fix.mts` in explicit-path mode |
| `bun run format` / `format:check` | Oxfmt from the root |
| `bun run typecheck` | Turbo workspace typecheck + `typecheck:root` |
| `bun run check` | lint + typecheck + unit tests |
| `bun run check:changed` | changed files: the untyped report on the **active gate entry** (D3), `lint:ui` for changed UI files until W-UI, a format check, affected typecheck, and `lint:query` (affected workspaces and programs; all of them when `tooling/quality/**`, `tooling/typescript-config/**`, root `oxlint*.config.mts`, `turbo.json`, root `package.json` or `bun.lock` changed). A change to `tooling/quality/**`, root `oxlint*.config.mts`, root `package.json` or `bun.lock` also widens the untyped report to the whole lint scope. A change under `packages/ui/**`, `packages/missionary/**` or `tooling/eslint-config/**` (the theme, `components.json`, the shared components and their exports, the bridge policy, the `@shadcn/lint` patch) widens the UI check to all six UI workspaces: `lint:ui` until W-UI, the full entry's shadcn rules after it |
| `bun run verify:quality` | the checks active per the table below |
| `bun run ci:preflight` | updated; every existing gate kept; `verify:eslint` is reduced to the bridge config until W-UI and retired there |

**`verify:quality` activation** (each check starts in the named batch. CT-1 replaces live transition-entry and legacy-list checks, CT-T replaces the live ratchet checks, and W-UI-b replaces the bridge ledger, bridge-only directives and no-shadcn-in-Oxlint checks. Each switch installs its replacement and retirement checks in the same commit; reverting the switch restores the previous checks. `retired.json` rejects reintroduction while retirement is in force):

<!-- prettier-ignore -->
| From | Checks activated |
|---|---|
| A1 | new-JS and rename guards; writer-flag refusal; root-entry guard; no `oxlint-suppressions.json` at any path (listed in `retired.json` from the start and kept there after W-UI; a committed one is the negative control); content-pin inventory (five kinds); rebind integrity (proof or note, every family); the React Doctor ledger is unchanged; path classification (owned or one reasoned ignore); `verify-mechanical` with its fixture controls (the `oxfmt` transform; `m1` and `m2:<rule>` from A3; the integrated controls start with each real transform, §8.3) |
| A3 | composition and sentinels; money scope (no shrink), the money `Boolean`/`!!` check and the numeric-truthiness allowlist; TA-1 (no shrink) and the Payload `access` wiring; predicate, detached, doubles-owner and SAFETY contracts; the handler inventory; directive, coverage-ignore and class-R contracts with test links (existence and static relevance); the fault-patch library applies cleanly; `legacy-directives.json` (shrink-only); resolution snapshot |
| A5 (CT-0a) | UI-bridge ledger: per-commit comparison, writer refusals and no dead keys; Oxlint entries carry no `shadcn/*`; no ESLint inline configuration comment outside vendored files; converted legacy directives match their base text; protected bytes; Oxfmt config |
| A6 (TS-2) | program registry; generated paths and excludes; Vitest parity; ratchet; healthy runs; central `lint:query` programs |
| B (W-MOCK-SB) | the integration-tier registry against every declared owning workflow, job and Vitest config (selected files, gating variables, hosts); `core/no-unscoped-network-stub`; the setup still installs the guard, the preload variables and the refusal record |
| C2 (CT-1) | full-policy entry; the transition entry and `legacy-directives.json` are in `retired.json` |
| C2 (CT-T) | the ratchet file is in `retired.json`; every program is blocking |
| C3 (W-UI-b) | shadcn rules active in the full Oxlint entry; the UI bridge, `suppressions.json` and `tooling/eslint-config` are in `retired.json` |
| C4 (WF-2) | registered hook strings equal the generated launcher; one edit hook per harness (for Cursor, the imported Claude hook or one `.cursor/hooks.json` entry, never both) |

### 7.2 CI

- **Full scope:**
  - Runs on every event other than `pull_request`, and whenever the base SHA is absent.
  - Covers the full bridge and the full workspace typecheck.
  - `ci.yml` and `lint-query-scope.mts` keep the `github.event_name != 'pull_request'` form.
- **Lint job:**
  - `lint:ox`;
  - `lint:query` (workspaces and central programs);
  - `lint:ui` until W-UI, then `quality:health`;
  - `verify:quality`;
  - the Ubuntu TSRS observed-child identity step (VR-2);
  - the existing verifiers.
- **Lint-job budget** (G R10): the job has a 25-minute limit (`ci.yml:136`).
  - `verify:eslint` runs the design-system health check **once**, at the root. Today it runs seven times (root plus six workspaces, E68); the workspaces now share one config.
  - `verify:quality` builds a classic-TS6 program only for the programs that contain candidate files: a `vi.spyOn`, an imported-alias predicate, a money-scope or numeric-truthiness file, or, on a pull request, a changed file.
  - A5 measures the job on a `workflow_dispatch` run of `ci.yml` on the pushed branch: `ci.yml` runs on `push` only for `develop` and `production`, and this change opens its pull request only at C5. A6 repeats the measurement once the central Query programs run in the job. At either checkpoint, above 20 minutes, `lint:query` and `lint:ui` move to their own parallel jobs in a coordinator-owned workflow edit. PF-1 records both timings.
- **Unit-test job:** gains the collection-health step (`vitest list --json` over the whole repository exits 0; about 43 s) and the executed link-relevance step (D5). Both run once per event. If develop has split the unit run into shards (PR #2726 makes `test-unit` a three-shard matrix, E70), they run in one job outside the matrix, and `ci-gate` needs that job.
- **Other jobs:**
  - `format:check`;
  - typecheck: package tasks affected on PRs, otherwise all; the four uncached app typechecks on every event; `typecheck:root`;
  - the build policy, unchanged.
- **Tooling-only paths:** `scripts/verify/ci-build-policy.mjs` (including its `BUILD_CONFIG` pattern), `scripts/vercel/should-ignore-build.mjs` and `scripts/qa/preview-smoke-scope.mjs` classify these as tooling-only. The carve-outs are checked **before** the existing `"tooling/"` shared-runtime prefix in the latter two:
  - `tooling/quality/**`, `tests/.generated/**`;
  - root `tsconfig.json`, `scripts/**/tsconfig*.json`, `tests/**/tsconfig*.json`;
  - root `oxlint*.config.mts`, `oxfmt.config.mts`;
  - `tooling/eslint-config/**` (the UI bridge) until W-UI.

  The ESLint entries are dropped, and each helper's tests are updated.

- **Workflow-fingerprint and byte pins** are amended through AP-1.
- **Commit range for per-commit checks** (`verify:quality`, G R8): the lint job checks out full history and exports `CI_EVENT_NAME`, `CI_BASE_SHA` (`pull_request.base.sha`, else `merge_group.base_sha`, else `event.before`) and `CI_HEAD_SHA` (`pull_request.head.sha`, else `merge_group.head_sha`, else `github.sha`). One resolver in `verify-quality.mts` handles all four events: an all-zero or missing `before` falls back to the merge base with `origin/develop`; when that base equals HEAD (a first push or a re-run on `develop` itself) the range is `HEAD^..HEAD` (G R10); `workflow_dispatch` checks HEAD against its first parent; merge commits are compared with their first parent. Unit tests cover each event, a new branch, a merge commit and a base equal to the head.

### 7.3 Caches

- Among the lint and typecheck tasks, only package `typecheck` tasks are cached; the four app `typecheck` tasks are uncached (§5.2).
- **VR-6:**
  - an imported-type edit reruns its dependents;
  - a pin change reruns everything;
  - separately change only `bun.lock`, only a tracked lint-plugin patch and only a component-discovery input. Run `check:changed` for each: the lockfile must select all Query programs and the full untyped scope per §7.1; the patch must rerun the affected lint on unchanged source after a frozen install; the discovery edit must change the expected diagnostic in an unchanged UI consumer. Restore each input before the next case;
  - a change confined to `tooling/quality/**` triggers the full bridge, and so does one confined to `tooling/typescript-config/**`; a change to the bridge policy alone leaves an unrelated package's cached typecheck valid;
  - app typechecks are never served from cache; an error in a `.next/dev/types` file does not change the canonical result; a root-helper-only change still runs all four app typechecks.

### 7.4 Resources and measurement

- **PF-1 measures the real workflow.** Compare `develop` and the candidate on the same machine and matched inputs: full `bun run lint`, `bun run format:check` and `bun run typecheck`, plus representative file and workspace commands where supported. Include the Query bridge, the active UI bridge or its health-check replacement, formatting and the full compiler. Record revisions and thread settings, including `RAYON_NUM_THREADS`, which also selects serial tsconfig processing in the pinned TSRS. Exclude task-cache hits even on warm runs.
  - Alternate three runs per revision in each of the cold and warm conditions. Record elapsed time and whole-tree peak memory: on Windows take the maximum per-tick sum of current working sets, not the sum of process lifetime peaks; on Linux use an isolated cgroup’s `memory.peak`.
  - Record the pre-commit runner's wall time for the VR-9 rehearsal and for a typical small commit, and the edit hook's wall time from WF-7.
  - Measure the CI lint job separately at A5 and again with the A6 central programs (§7.2). Record the baseline at A9, rehearse on the integrated C1 candidate before CT-1 and confirm at C5. At default concurrency full lint must take no more than twice the baseline wall time and peak at no more than 8 GB. If either limit is exceeded, lower concurrency, never scope, and remeasure.
- **TC-5 measures backend parity (A6b).** Freeze the A6 full-policy revision while it still has findings, before typed fixes. Compare TSRS reference, TSRS fast and isolated scratch `oxlint-tsgolint@7.0.2007` on the same inputs and machine. Retain positive and negative fixtures for imported types, aliases, out-of-include files, unsafe operations and nested TanStack generics.
  - Repeat each combination at least twice: default and reversed input order, one and N workers (D4), semantic reporting off and on. Compare backends at like settings and check stability across order, workers and repeats. Record raw diagnostics, files actually checked (including clean files), exit status or crash, wall time and peak backend memory.
  - Compare diagnostic multisets by rule/code, file, location and severity; list and explain message-only differences separately. Require identical safe-fix patches for every typed fixable rule when applied to disposable copies. Record each checker base from pinned release metadata or the TSRS banner; check version-dependent differences against the matching Microsoft compiler. Unexplained diagnostic or coverage differences, instability, crashes and unsafe fixes fail parity.

---

## 8. Transition and delivery

### 8.1 Batch and commit contract

- **Base refresh (IN-0):** every batch starts by merging the current `origin/develop`, then re-running the CTI, AP-1 and the D13 table on the merged tree before its first edit. AP-1 does not exist at A1's start: A1 runs it as soon as it is built, before TC-1's first manifest edit.
- **Hooks:** every commit passes the hooks in force; no `--no-verify`.
- **Commits inside a batch** pass the hooks and the batch's stated commit checks; the full batch gate applies at the batch's end; nothing is pushed inside a batch except to obtain required hosted evidence after the local gates pass (§8.1 Push).
- **Batch gate:** every batch ends green on:
  - `test:unit` and **`test:acceptance`**. Each failing-name set must match develop's known Windows-only set, or the suite must be green in WSL/CI.
  - typecheck (§5.5).
  - the lint gate in force, and the UI bridge with its exact ledger until W-UI.
  - `format:check`.
  - `verify:quality` (active checks).
  - the batch's own checks.
- **CTI:** an unlimited `git grep` over every tracked file except archives, evidence, `docs/qa/**` and lockfiles, for every path, script and command the batch changes. AP-1 runs alongside it.
- **Rebinds** are the last step of each batch (D9). The one exception: while the Shadscan hook step exists, a Shadscan-cited file is rebound in the commit that changes it.
- **Push:** only when the full local gates pass. If a batch requires hosted evidence, publish its locally gated commit to obtain that evidence; the batch does not close until the hosted gates pass on that exact commit. At C5 fix independent-review findings before pushing, then open or update the PR. A changed head repeats the affected review and gates. `bun run ci:preflight` is run explicitly before every push, whatever profile the pre-push hook has by then (D13).
- **Plan amendments:** a material flaw that implementation reveals is recorded in the evidence record, and the affected decisions and tasks are updated in the design and `tasks.md` (new task IDs are added, none reused). That change gets a focused independent review before the affected batch continues. The council's full score is reopened only when the change materially invalidates this plan.

### 8.2 Order

<!-- prettier-ignore -->
| # | Batch | Owner | Gate at end |
|---|---|---|---|
| A1 | IN-0 (branch from current develop; record the base); TID-1 (repair the two uncollectable test files; the test-ID tool); SD-1, AP-1 (five kinds), VM-1 (tools + tests first); VQ-1 (`verify:quality` with the A1 checks of §7.1); SR-1 only if the Shadscan ledger still exists when TC-1 edits the root manifest (D13); FM-1 (written, inactive until CT-0a); OS-1 (link `integrate-design-system-lint` 5.4–5.10); TC-1 (inactive Oxfmt); TC-2; TC-3; TC-4 (Windows + Ubuntu identity); TC-6 (qualification only) | coordinator | §8.1 |
| A2 | TS-1 (including app `next typegen`, E58), RB-1, GEN-1a, strict-build per platform | coordinator | §8.1 + strict builds |
| A3 | PL-0..PL-5, FIX-1, MI-1 (with the numeric-truthiness inventory), TA-1, FP-1 (the fault-patch library), GH-1, PO-1, RD-1 (with the handler inventory), RD-2 (PL-2 and FP-1 delegated) | coordinator | §8.1 + composition + sentinels through each root entry + golden tests + every library patch fails at base |
| A4 | FM-2, FM-3 (worktree delegate) | delegate → coordinator | consumer tests |
| A5 | **CT-0a** (including WF-6 editor settings) then **CT-0b** (below). Held for up to two working days if the open stack of D13 has not merged at its IN-0 | coordinator | CT-0a commit checks; §8.1 at the end of CT-0b; networked `verify:shadcn-diff` |
| A6 | TS-2 | coordinator | zero TS2307/TS7016; healthy runs; blocking programs exit 0; ratchet recorded; central `lint:query` green |
| A6b | TC-5; FB-1 dry run | coordinator | parity report |
| A7 | M1 | coordinator (sole writer) | §8.1 + `verify-mechanical` + identical test IDs (TID-1) + M1 leg of the hooked-commit rehearsal |
| A8 | M2-<rule> batches | coordinator (sole writer) | §8.3 |
| A9 | INV, slice map, packets (owned paths, pinned files, registry entries); PF-1 baseline | coordinator | — |
| B | W-MOCK-SB with the coordinator commit W-MOCK-SB-CI (before any file is excluded from `test:unit`, and before the registry check of §7.1 activates), then W-MOCK-ST; after those, the other W-MOCK pilots and the RS-* slices, including the separately reviewed RS-PACK release | slices; coordinator for W-MOCK-SB-CI | §8.5 |
| C1 | IN-1, SW-1 | coordinator | below |
| C2 | CT-1 (policy flip; transition entry retired) + CT-T | coordinator | full Oxlint policy green (shadcn still on the UI bridge); every program blocking; §8.1 |
| C3 | W-UI (serial; `--amend` for registry files): bridge debt to zero (W-UI-a), then the shadcn rules into the full entry and the bridge retired in one revertible commit (W-UI-b) | delegate(s) for W-UI-a; coordinator for the atomic W-UI-b switch | UI ledger zero; bridge deleted and retired; shadcn sentinels through the root entry; networked `verify:shadcn-diff` |
| C4 | WF-1..WF-5 and WF-7; recheck the WF-6 settings shipped at CT-0a | coordinator (+ delegates) | VR-9/VR-10 |
| C5 | PF-1 confirm; RB-1 repeat; OpenSpec reconcile; independent review; local VR-12; push and open the PR; hosted VR-12 on that head | coordinator | §12 |

"CT-0" elsewhere in this plan means CT-0a and CT-0b together.

**CT-0a (A5, semantic cutover)**, in this order:

1. **Formatter:** Oxfmt becomes the formatter (`format`, `format:check`, the staged runner `pre-commit.mts` replacing `lint-staged`), with its config and `.prettierignore`; Prettier is removed. The editor settings of D11 (WF-6) land in the same commit.
2. **Retire general ESLint:** the general rules, configs and plugins go (D1; a frozen install afterwards proves nothing imports a removed package); Oxlint takes over (including the root-only bans). The root and every workspace `eslint.config.mjs` are deleted; `tooling/eslint-config/bridge.config.mjs` (D12, with no retired plugin, E63) becomes the sole UI-bridge config, loaded by `--config`; the Query bridge keeps its separate `eslint-query.config.mjs`; `verify:eslint` (`scripts/verify-eslint-config.mjs`) is reduced to the bridge config with one health run. Its three callers stay until W-UI: the `validate:full` script, `scripts/verify/ci-preflight.mjs` and `.github/workflows/ci.yml`. The dead `$TURBO_ROOT$/eslint.config.mjs` input is removed from `tooling/eslint-config/turbo.json`; that file's `tooling/eslint-config/*.{mjs,json}` input already covers the bridge config. `lint.mjs` gains chunking, `--paths-file` and the ledger-key checks (D12). The workspace `lint` scripts are rewired (D3).
3. **Port the lint pieces:** the transition entry; `bun run lint` (D3); the `lint:query` dispatcher (workspace tasks); the CI lint job of §7.2, including the Ubuntu TSRS identity step (TC-4); the staged hook (D10); GEN-1b and the consumers (including the importMap header strip).
4. **Update contract tests and docs from the CTI:**
   - `ci-preflight.contract`, `script-verifiers`, `crm-boundary`, `design-system-*`, `agent-instruction-routing` (with `design-system-lint.md` and its skill references, synced), `local-gates`, `format-gate.contract.test.ts`;
   - CI helper classification;
   - a first `docs/ai/rules/code-quality.md` (absent at `e6a5ce81a`; WF-5 completes it at C4) that states the staged runner's refresh limit (D10) and the editor gaps of D11, which take effect here.
5. **Semantic code edits:** merge the duplicate `@asym/lib/motion` imports in `packages/ui/components/primitives/motion-preset.tsx` and `packages/ui/components/primitives/ripple-button.tsx`; fix any other pre-existing transition-gate finding. Convert every non-shadcn `eslint-disable*` and `eslint-enable*` directive in authored JS/TS-family sources (not the vendored ReUI files) to `oxlint-*` (D5, E62, E63), keeping `legacy-directives.json` in step in the same commit. Remove every ESLint inline configuration comment after porting it to an Oxlint override: at the plan's base that is the checkout's `react/refs` protection (D5, E64). Tracked report artifacts such as `apps/missionary/.eslint-missionary.json` are not sources and are not converted.
6. **Projections and skills:** regenerate projections; re-attest skills.
7. **Pins:** the AP-1 amendments for CT-0a's own edits, as AP-1 lists them at CT-0a's base (D9, D13). At `e6a5ce81a` they were `issue-2364:187` (branch-scoped), and **put-back proofs** for the CI workflow pins (`issue-2221` `BASE_CI_BYTES`/`BASE_CI_SHA256`/`BASE_CI_DOC_SHA256`, `issue-2153` `c8bd1a2b9f625673`, `issue-2201` `CI_PRINTS`).
8. **Last:** rebind **notes** for every proof-cited file CT-0a edits, listed from the records themselves: among them the root and workspace manifests, `frontend.md`, `packages/ui/AGENTS.md`, `design-system-health.test.ts`, the step 5 files `motion-preset.tsx` and `ripple-button.tsx` (shadcn proof and protected sources) and `base-ui-select-nullability.test.tsx` (a shadcn proof source whose directives step 5 converts). While the Shadscan ledger exists, each Shadscan-cited file CT-0a edits (`shadscan.md`, the checkout file and the cited tests whose directives step 5 converts) is rebound in the commit that changes it (D9).

**CT-0a commit checks** (C R8): the hooks; the bridge gate passes on the converted tree, including the checkout file; Oxlint reports a seeded ref read in the checkout file through both entries; every file CT-0a touches passes Oxfmt; `oxfmt --list-different .` equals the reviewed CT-0b inventory, regenerated at CT-0a (E10 lists about 233 files); every other §8.1 gate except whole-repository `format:check`. CT-0a and CT-0b are pushed together.

**CT-0b (A5, mechanical normalization only):**

1. `bun run format`: Oxfmt from the root over the format scope (D8). This is not a `fix.mts` run, and it applies no lint fix. The files it changes must be exactly the reviewed CT-0b inventory, canonical skills included; no other source edit.
2. The derived-record order (§8.3), including the `issue-2258`, `issue-2364` `POST`-slice and `donate.ts` pin proofs and the skill sync for the canonical skills Oxfmt changes.
3. `verify-mechanical` and the full §8.1 gate, including `format:check`.
4. A follow-up commit adds CT-0b (only) to `.git-blame-ignore-revs`.

**C1 gate:**

- `lint:ox` (transition), and `lint:ui` with its ledger exact;
- `lint:new` at zero;
- `lint:query`;
- typecheck, with every central-test program at zero;
- `test:unit`, `test:acceptance`, `format:check`, `verify:quality`;
- `skills:verify`, `openspec:validate`;
- the networked `verify:shadcn-diff`;
- `ci:preflight`;
- the PF-1 rehearsal on the integrated candidate (§7.4): if full lint exceeds either limit, concurrency is lowered and the run repeated, with no loss of coverage.

**Transition gate (A5–C2)** = the PL-0 parity set:

- the six Shadcn rules stay on the UI bridge (D12) and are not part of either Oxlint entry until W-UI;
- every other rule that the incumbent workspace ESLint configs enforce at `error`, mapped to Oxlint or listed below as a gap: among them the restricted-import rules, `import-x/no-duplicates`, the React hooks rules, and the error-level rules of the TS-ESLint recommended and Next core-web-vitals configs. Rules the incumbent sets to `warn` gate nothing today (no lint command passes `--max-warnings`) and are left to the full policy;
- the incumbent scope (each workspace's lint targets with their ignores) plus the root-only bans, so the gate adds no finding in trees the incumbent never linted, such as `scripts/**` and the central `tests/**`;
- gaps listed with reasons;
- typed and untyped runs as in D3.

**Networked `verify:shadcn-diff` checkpoints:**

- CT-0;
- after M1;
- each M2 batch touching `packages/ui/**`;
- IN-1;
- W-UI;
- final.

A skipped checkpoint is reported as skipped. When `ui.shadcn.com` rate-limits a checkpoint, it is retried later or from another approved network; neither the offline `--refresh-local` refresh nor a skipped attempt counts as network proof.

### 8.3 Mechanical batches (simplified verification)

**Writer:** M1 and M2 write through `fix.mts` in batch mode (private cwd, the root entry, deterministic chunks) over the lint scope, excluding files with compile diagnostics (M2, §5.5), `scripts/archon-factory/pack/**` (RS-PACK) and ignored trees. CT-0b writes with `bun run format` over the format scope (D8), which is wider and includes the canonical skills. Afterwards the coordinator runs the whole-repo **Oxlint** transition gate (the UI bridge is checked by its ledger transaction in step 4), then regenerates derived records with their own tools, in this **derived-record order**:

1. skills: `skills:sync` (all its outputs: the three skill mirrors, `.claude/commands`, `.claude/agents`, `.repo-canonical-skills.json`), `update-skill-audit-hashes.mjs` for changed canonical skills, `skills:verify`;
2. SR-1 Shadscan rebinds (only while that ledger exists, D13); SD-1 `--refresh-local`; the networked `--refresh-diffs` for changed registry files;
3. AP-1 pin amendments, each with a proof (evaluate the pin’s recorded operation on the base and transformed subject bytes to reproduce the old and new values (D9));
4. the UI-ledger transaction (D12) if a shadcn count fell: raw report, prune, exact bridge gate.

The React Doctor ledger is not in this order: no batch touches it (D9).

**`verify-mechanical.mts <base> <head> --transform <oxfmt|m1|m2:rule>`** checks the commit **in the order it was produced**: 0. **Scratch tree** (G R10): `bun.lock` must be identical at `<base>` and `<head>`; a batch that changes it is not mechanical and fails here. `scratch.mts` then provides a worktree at `<base>` with its own frozen install (`bun install --frozen-lockfile`, about 105 s here, E68), because a new worktree has no `node_modules` and the replay needs Oxfmt, Oxlint, the patched Ultracite, TSRS, the workspace types and the skill-sync dependencies. The tree is kept and reused for the same commit and lockfile. `scratch.mts` takes the commit as an argument: `verify-mechanical` asks for `<base>`, and the fault-patch runner asks for the commit under test (§8.5).

1. **Replay:** in that tree, replay the transform exactly as the writer ran it. For `oxfmt` that is `bun run format` at the root. For `m1` and `m2:<rule>` it is `fix.mts` batch mode with the **same enumeration** of tracked files, the same exclusions and the same chunking. The verifier takes no path list of its own. For `m2:<rule>` the replay is the rule followed by its M1 pass, after which the paths in the batch record's `reverted` list (`amendments/<batch>.json`) are restored to `<base>`. The result is the intermediate tree **R**. A path unchanged by replay may differ in `<head>` only through a proved step 2 edit.
2. **Proved derived edits on R:** apply only the edits that `derived-records.json` authorizes, each validated as it is applied. Replay the writer’s dependency order: skill outputs and audit hashes, SR-1 (while live) and SD-1 records, pin amendments with their add-only record, then the UI ledger. The following are the permitted edit kinds, not a second ordering:
   - pin amendments in pin-bearing tests. Each is the exact old-text and new-text pair recorded in `amendments/<batch>.json`, applied to **R**'s bytes (a file may be both transformed and pin-bearing, as the `issue-2258` harness is). The new text may differ from the old only in the pin literal and in one comment line next to it that names this change and the batch: the provenance note that Core's convention requires (D9; `issue-2258/harness.ts:41` is an existing one). Anything else in the pair fails (C R10). Each new value is checked by `pin-amend-proof.mts` (reproduce both values using that pin’s recorded hash, length, slice or other D9 operation; use D9’s put-back proof where applicable);
   - hash and identity fields in the record families, compared structurally. Each edited JSON record is then written through the format adapter, as its own generator writes it (for example `update-skill-audit-hashes.mjs:108-113`), so that step 3 compares formatted bytes with formatted bytes;
   - **add-only** creation of `tooling/quality/amendments/<batch>.json`, validated by `pin-amend-proof.mts`;
   - UI-ledger count decreases and key removals only (never increases);
   - skill-sync outputs equal to what `skills:sync` produces from the committed canonical sources.
3. **Equality:** the result must equal `<head>`, blob for blob, over every changed path; any other difference fails.
4. **Verifiers:** `skills:verify`, `verify:shadscan` (while it exists), the networked `verify:shadcn-diff` at the §8.2 checkpoints, the exact UI bridge gate and `test:acceptance` pass. `docs/qa/react-doctor/exceptions.json` is byte-identical to `<base>`.

Controls: the real dual-role `issue-2258` harness reformatted and pin-amended, with its provenance comment, passes; a harness whose own formatting is unchanged but whose subject blob changed also passes with just the proved pin and adjacent note; a byte-length or slice pin passes only with the value reproduced by its own operation; the same harness with an additional unrelated assertion edit, or with a second changed comment, fails; a non-hash field change in a record fails; a source edit outside the transform fails; a batch that changes an audited skill and one that creates its first amendment file pass; an M2 batch with a reverted file passes only if that file is in the `reverted` list and equals `<base>`; a batch that changes `bun.lock` fails; a changed React Doctor record fails; a structurally correct record left unformatted fails. Only CT-0b and the standalone M1 commit get follow-up `.git-blame-ignore-revs` entries. M2 rule commits do not, even though they end with an M1 pass.

**M1:** spacing + Oxfmt to a fixed point, accepted by `verify-mechanical`. The hook's Oxfmt step is idempotent on M1 output. TID-1 must report identical parent and head test IDs per entrypoint on the same platform; compare gated IDs in the integration job.

**M2-<rule>:** one rule per batch, each followed by an M1 re-run.

- `curly`, `unicorn/switch-case-braces`, `typescript/array-type`, `unicorn/numeric-separators-style`.
- `unicorn/text-encoding-identifier-case`: safe fix only, after a pre-check for zero comparison sites.
- `typescript/consistent-type-imports` and `import/consistent-type-specifier-style`, as **separate** batches. Each uses the emitted-import check: the ordered runtime specifiers of the `ts.transpileModule` output, under each file's resolved compiler options (§4.2), must be identical.
- `object-shorthand` (`ignoreConstructors`), `arrow-body-style`, `prefer-const`.
- The Vitest pair, in Vitest globs only.
- `typescript/no-unnecessary-type-assertion`: typed, so it passes `--type-aware`. It runs after TC-5, on files in programs. Preconditions:
  - the known site `packages/api/src/admin/comments/comment.ts:21,88` produces the expected nonempty patch;
  - only then is the private-cwd patch compared with a root-cwd run on a disposable copy.
- `typescript/no-inferrable-types`, with `--fix-suggestions`.
- `unicorn/no-zero-fractions`, `unicorn/prefer-string-replace-all`.

**M2 gate:**

- the compile acceptance in §5.5 (touched files stay at zero diagnostics; blocking programs exit 0; ratchet unchanged);
- unit and acceptance tests;
- identical test IDs from the test-ID tool (TID-1, §8.5); the Playwright `--list` diff;
- `verify-mechanical`;
- the networked `verify:shadcn-diff` for UI changes.

Failing files are reverted for that rule.

### 8.4 Write ownership

- **Coordinator:**
  - the lockfile;
  - root configs and `tooling/quality/**` (the delegated PL-2 and FP-1 write their parts there in their own worktrees; the coordinator reviews and commits them);
  - `.prettierignore`;
  - the UI-bridge ledger and the registries;
  - the mechanical batches (sole writer in A7–A8);
  - integration.
- **Slices:** each works in its own worktree, created from the base commit its packet names, on a disjoint generated set of paths. Rebinds (with notes), ratchet updates, pin amendments and SD-1 `--amend` touch only the slice's own files. Slices never edit workflows; network tests are named `*.network.integration.test.ts` and run by the coordinator-owned glob step (§4.7). Slices prune the UI ledger for their owned paths through the ledger transaction (D12); moves into the integration tier are coordinator-approved registry entries (§4.7).
- **W-UI:** runs alone after CT-1. Delegates may repair assigned UI files in W-UI-a; the coordinator makes W-UI-b, including all root, workflow and dependency changes.
- **Delegates:** implementation, qualification and review delegates are a mix of Codex GPT 6.2 Astra at xhigh, Gemini 4 Neon at xhigh through Antigravity, and Claude Opus 5.5 at xhigh or high. None runs at low effort, and a review uses a different model from the work's author. When a provider refuses a model, the work moves to another authorized Claude Code or Codex subscription and the change is recorded in the checkpoint; no other model is substituted on that provider without the owner.
- **Concurrency:** parallel work stays within what the machine carries. While delegates work in parallel, every typed lint sets `CORE_LINT_PARALLEL=1` (D4), so each run takes a quarter of the cores, and at most four typed lints or typechecks run at once on one machine; TSRS, like the compiler, starts four checkers per run by default (E4). The coordinator lowers the number of parallel slices when runs fail for memory or time.

### 8.5 Slice acceptance

- **Lint and types:**
  - zero full-policy findings in owned files;
  - zero diagnostics in owned files across every program;
  - elsewhere, no new ratchet key and no higher count (§5.5). The ratchet counts keys, so a diagnostic that moves within one unowned file under the same key is not detected; a control shows that case passing on purpose. No site mapping is added (C R10).
- **Tests (objective test-loss rule):**
  - **Test IDs (TID-1):** `scripts/quality/test-ids.mts` lists a commit's test IDs per entrypoint. It puts file filters before `--json`, fails when any file has no collectable suite, and compares base and head on the same platform; Ubuntu (CI or WSL) is authoritative, because platform-skipped suites list no IDs (E67). Every removed or renamed test ID, and every Playwright `--list` difference, maps to a successor ID or to a reviewed deletion note (`test-moves/<slice>.json`). Only for the initial A1 base, record and isolate the following two known collection failures, list the remaining base files normally, and verify the first repair against its package source and the second against its original test cases. The A1 head and later revisions allow no collection failure. A1’s first ledger entries are: the duplicate one-line file `tests/unit/packages/api/missionary-directory.test.ts` is deleted (its tests are collected from the package), and the cases in `tests/unit/scripts/supabase-migrations.test.ts` are wrapped in a `describe`.
  - per-file counts of rejection, throw, 4xx/5xx, `.not` and call-shape assertions (`toHaveBeenCalledWith`, `mock.calls` checks, request matchers) may not fall without a note;
  - every move into the integration tier is a coordinator-approved `integration-tier.json` entry, listed in the slice ledger with its reason;
  - **coverage** (A R10): per file, the number of covered branches must not fall, and every branch the slice adds must be covered (missing coverage counts as zero; an ignore or explanation is not execution). A percentage is not used: an added guard would lower it;
  - **behavior-relevant edits** (§4.2): for each file whose emitted JavaScript changed, the slice's coverage run must show the changed executable lines executed by a test, in the unit tier or another tier whose coverage is recorded. A reason in the ledger or an ignore comment does not satisfy this check;
  - unit and acceptance tests pass;
  - TDD for behavior changes;
  - golden hashes unchanged.
- **Fault-patch library (FP-1; A R10):** A3 builds `tooling/quality/fault-patches/` once, from TA-1 and MI-1: for each inventoried tenant, auth or money function that a test protects, one patch (remove the filter or guard, swap the client, drop the rounding). Record the IDs and assertions of the tests that independently detect that fault at base, and the test files that reach the function. A function that no test protects at base is listed as unprotected, and its owning slice writes the first protecting test and records the patch and failing assertion before repairing the function. `fault-patch.mts` applies a patch in a scratch worktree from `scratch.mts` (§8.3), runs the recorded protecting tests separately and resets the tree. The tree holds the commit under test: A3's base for the check that every patch fails at base, and the slice's head at slice acceptance (with its own frozen install when `bun.lock` differs). A patch run at base could not exercise the slice's changed tests. At slice acceptance, select a patch if the function was edited or any changed or deleted test file reached it at base or reaches it at head. Each recorded protecting test must still fail on its own recorded assertion at head; a moved test needs an explicit successor that detects the same fault. A slice that only loosens a tenant test (an exact `where` equality turned into `toMatchObject({})` or `toBeDefined()`) therefore fails acceptance even though every count and coverage figure is unchanged.
- **Tenant/auth edits:** any edited function in TA-1 (membership on base ∪ head) has its library patches re-run, and re-recorded with a note when the function legitimately changed, mock redesign or not. A semantic edit to an `issue-2258` `UNEDITED` authz test is a TA-1 edit and needs a note.
- **Mock redesign** (per property): a slice uses a §4.7 recipe only after that recipe's W-MOCK pilot has landed on the integration branch, naming the file that proves it. Before the redesign, the old file's call-shape assertions are recorded in `test-moves/<slice>.json` as its protected properties, each with an id. There are about 945 such assertions in the 436 `vi.mock` files, so the proof is graded by risk (A R10):
  - **Tenant filter, permission check, client privilege (admin-client swap), another tenant's Stripe key or a missing tenant borrowing the platform key, rounding, and retry classification:** each (file, property) gets its own fault patch. The redesigned test must fail on an **assertion whose message contains the property's id**; a crash or `TypeError` does not count.
  - **Every other recorded property:** a reviewed mapping in `test-moves/<slice>.json` from the old assertion to the new assertion that checks the same property (file and line), confirmed by the independent semantic review. No patch is required.
- **Ledgers:**
  - exceptions, SAFETY and class-R markers within the ceiling;
  - predicate, owner-call, `runDetached`, silent-catch, try→`.catch` rewrite and `?.`/`??` counts;
  - new calls to registered predicate owners beside the `typeof` checks the slice removed, reviewed against the owners' negative tests; and each new predicate or assertion function outside an owner, with its negative test;
  - pin amendments and rebind notes listed.
- **Markup changes:** the a11y suite and paired Playwright screenshots of each affected route, taken before and after under the same viewport, theme and data, with each visible difference reviewed.
- **Review:** an independent semantic review before IN-1.

---

## 9. Verification

Phase-specific controls run on the revision whose mechanism they test. Record transition-entry controls before CT-1 and bridge staging, ledger and ESLint-directive controls before W-UI-b. At C4 and C5 retain those results; rerun all applicable controls on the integrated head, including full-scale staging without the bridge, shadcn positives and negatives through the full entry, and retirement guards. Do not reinstall a retired mechanism to satisfy a historical control.
<!-- prettier-ignore -->
| ID | Check | Kind |
|---|---|---|
| VR-1 | Anti-slop patch: the 15 fixtures exercise both `no-unsafe-dictionary-type` and `no-known-value-widening`. Valid nested generic unions, `Partial`, defaults and alias chains must neither crash nor report the affected rule; unsafe cases must report the intended rule. Check Core equality and dead-helper removal; positive sentinels for the three zero-finding rules | +/− |
| VR-2 | Identity chain from the root, a workspace and a scratch cwd. Expected executable via the launchers' own logic (`getExePath.js` resolved from `tsrs/package.json`, `TSRS_BINARY` removed, `\\?\` stripped), canonical match with the observed child on **Windows and Ubuntu**. Check the D4 banner pins; a parseable wrong component or a missing or substituted launcher exits 2. Check installed packages and root/workspace `.bin` directories for a competing backend or shadow `tsgolint` shim; either exits 2. With a hostile inherited selector, the public runner still binds TSRS and reports the seeded `typescript/no-floating-promises` finding on an unhandled promise; its awaited counterpart is clean. FB-1 dry-run identity | +/− |
| VR-3 | Real Oxlint: permitted and forbidden package and relative imports (value, type, re-export and literal `import()`), including a path with overlapping bans, both UI and route layouts, the two health exceptions and an unrelated ban there. Include `packages/ui`, the permitted server import in `apps/admin/app/(auth)/register/page.tsx`, and permitted and forbidden imports in app `lib/`. Central tests keep only the `@/` ban. | +/− |
| VR-4 | Composition test and generated sentinels through **each root entry**. Scoped positive and clean cases. Misplaced-config control. **A valid `SAFETY: P3` combined directive passes both typed entries (transition and full) and every untyped run; a genuinely unused full-policy directive fails `lint:new`.** The per-command entry table (D3) is asserted from the runner's argument arrays. Generated, vendored and ignored samples untouched. Money: inventory, member settings and area sentinels (D6), no-shrink and `Boolean`/`!!`. Before global adaptations the non-JSX React rule set equals the preset minus `JSX_ELEMENT_RULES` and includes `react/globals`. In full-policy app and package `.ts` hooks, `react/rules-of-hooks` and `react/exhaustive-deps` fire; no `react/jsx-*` rule applies. Check resolved Next roots and a Next violation in each app; other entries keep their D3 subsets. JS typed-off; Vitest, Playwright; Shadcn ×6 through the UI bridge until W-UI and through the root entry after it, together with D12's ported design-system suites: `p-8` on `Button` reports `shadcn/no-restyle` naming `icon-xs`; a missing theme import, an unresolved primitive and a weakening config entry each make `quality:health` fail; and a Factory Console sentinel is enforced from the root; neither Oxlint entry contains `shadcn/*` before W-UI. `.mts` loading. Oxfmt sorting matches D8: no import or Tailwind sorting, and package-key sorting only on trusted content | +/− |
| VR-5 | Query: five Oxlint rules +/−; the bridge through the public `lint:query` dispatcher — real Turbo tasks in one app and one package. In each, five cases fail the expected rule: direct and typed-wrapper rest destructuring, an inline void query function, an imported `Promise<void>` query function and an imported query function returning a number or `undefined`. The valid file passes, a generated output file that contains the same violation is ignored, and the parser resolves classic TypeScript 6.0.3. Keep one process per central program (imported-void and typed-wrapper negatives with valid counterparts); peak memory recorded for PF-1; the parent `tests/` run ignores child programs; `lint-query-scope.mts` selects a central program when only a workspace it imports changed | +/− |
| VR-6 | Cache invalidation; lint uncached; bridge trigger; CI event scope; app typechecks never served from cache (a `.next/dev/types` error and a root-helper-only change); the CI commit-range resolver (four events, a new branch, a merge commit, and a base equal to the head, which resolves to `HEAD^..HEAD`); a change confined to `tooling/typescript-config/**` selects every Query workspace and every central program, in `lint-query-scope.mts` and in `check:changed`; a theme token removed from `packages/ui/styles/globals.css` makes `check:changed` report the now-unknown class in an unchanged consumer (through `lint:ui` before W-UI, the full entry after it) | behavior |
| VR-7 | Workspaces on 7.1-beta, including `ES2023.Intl` in `packages/api` and `packages/eve-runtime`. Capability fixtures exact per compiler family, and the Principal harness exact (positive clean, one TS2322 per negative), on Windows and Ubuntu. The verifier's negatives fail (stale pin, nightly, range, wrong alias, replaced classic root, shadowed launcher, a classic consumer that resolves elsewhere). From a frozen install on Windows and Ubuntu, `tsc --version` runs through the root launcher and each workspace's launcher, and the Base UI fixture compiles through `@typescript/native/lib/tsc.js`, the path `test:e2e:base-ui` calls. **Per-platform strict builds** (Ubuntu: all four summaries all misses; win32 clean-state logs; Console explicit; ordinary `build` passes no `--force`). App programs contain `validator.ts` after `next typegen` (E58); an incompatible authored route fails the public `typecheck`; an error injected after generation fails a direct compile. RB-1 at A2 and C5 (§11: pins, alias, lock and verifier back to 7.0.2, typecheck green), covering all six Shadscan-cited manifests while that ledger exists. GEN-1a/1b | +/− |
| VR-8 | Format check and second pass. `verify-mechanical` provisions its scratch tree from a frozen install and refuses a batch that changes `bun.lock`. Run the D8 profile and ignore fixtures and the §6 consumer tests, including failure without publication. Keep Phase 25 byte-exact; verify regenerated Phases 27/28/29, `verify:openspec-deltas` and `verify:program-roadmap`. Protected bytes, including the UI-bridge ledger and the two named verbatim skill assets. **Batch `fix` (M1, M2) and a root `oxlint` run leave `.agents/**`, `.claude/**`, `.cursor/**`, `docs/ai/skills/**`, the founder source tree and `tests/fixtures/skills/**` byte-identical; path classification has no unowned, unignored JS/TS path.** CT-0b's `bun run format` changes exactly the reviewed inventory, canonical skills included, and `verify-mechanical --transform oxfmt` reproduces it. Skills. Shadscan (while its ledger exists) and shadcn verify, including **split components and both path roots**. `verify-mechanical` and its controls (§8.3). AP-1 inventory (five pin kinds, including the `issue-2258` blob ids) with executed proofs and put-back proofs. The OpenSpec archive and the factory pack are untouched by Oxfmt; the currency generated file is format-checked. **Rebind integrity: a hash change without a proof or note fails (every family); any edit to the React Doctor ledger fails.** | behavior |
| VR-9 | (below) | behavior |
| VR-10 | (below) | behavior |
| VR-11 | Registry, alias needs and ownership. Generated paths portable. Generated excludes. Pin ↔ type root equality. Sentinel program exact (file, line, code) with **no suppressions**. Zero TS2307/TS7016. Ratchet semantics (authored members only; recorded deletion and move). Healthy runs: TS18003, a configuration error and a missing-types TS2688 are unhealthy; a brace-pattern control. M2 skips files with diagnostics; a slice that raises another file's count fails. The Principal and Projection test programs resolve their declarations in typed lint and the compiler. Poison program via its harness. The generator fails on two targets for one specifier, a missing mapping, a test in no program, and declaring workspaces that disagree on a declaration. The Base UI fixture program lists every browser entry. The alias-imported `no-floating-promises` pair holds in every alias program. A ratchet update that names another owner's file or raises a count is refused. The root program compiles with Node types and the ES2023 library | structural |
| VR-12 | On the final reviewed commit, in a fresh clone after `bun install --frozen-lockfile`, with Turbo's cache bypassed (`--force` on every Turbo run, no remote-cache token): `lint`, `format:check`, `typecheck`, `test:unit`, `test:acceptance`, `ci:preflight`, the strict builds (Ubuntu authoritative), `skills:verify`, `openspec:validate`, `verify:openspec-deltas`; e2e/a11y for UI slices. The `ci.yml` and `ci-integration.yml` runs on that commit (on the pull request, or dispatched on the branch) pass, including `ci-gate` and `integration-gate` (the integration tier and `cms:qualify`). If #2727 has merged, also record selection and guarded execution of its registered suites in their owning job on that commit without changing its advisory status. The record gives each command with the commit, OS, Bun and Node versions, exit code and duration, and says whether it ran locally, ran in remote CI on that commit, or did not run | completion |
| VR-13 | (below) | +/− |
| PF-1 | Live-tree time and memory within budget | performance |

**VR-9 — staging, fixing and the UI ledger on the real repository** (revised):

- **Hook outcomes:**
  - success, failure, and an all-ignored commit (exit 0);
  - a partial stage is rejected before anything is written, naming the path, with the index blob and working-tree bytes of every staged file unchanged; rename, delete-only, unsupported-only and empty stages are handled;
  - formatter disagreement.
- **Guarded files:**
  - an unstaged change to a policy input or to the UI ledger is rejected; so are an unstaged root `package.json`, an untracked `tooling/quality/**` file and an untracked discoverable config anywhere;
  - `git commit -a` and `git commit -- <file>` inspect Git's temporary index (`GIT_INDEX_FILE` preserved);
  - staged `.mts`, `.cts`, `scripts/**`, `tests/**` and root files reach the staged report; staged UI files reach `lint.mjs`.
- **UI ledger (D12):**
  - an unsuppressed new violation fails; a reduction followed by the prune passes;
  - regrowth across commits (2→1→2) fails the per-commit check;
  - a suppressed file renamed with its violation fails as a new violation; renamed and cleaned, or deleted, it leaves a dead key and fails the normal gate before prune (E65). A deletion-only transaction for the named old path succeeds without widening lint scope; an unrelated missing key stays unchanged until the coordinator’s full scan;
  - a deletion-only prune removes its owned dead key without invoking ESLint or changing another entry; a path-limited prune that would change a key outside its paths is refused and the ledger restored;
  - the merge-conflict recipe;
  - `lint.mjs` refuses `--fix`, `--suppress-all` and `--suppress-rule`.
- **Writer controls:**
  - Oxlint suppression flags and runner writer flags are refused;
  - chunking at 3,156 paths succeeds on Windows, and the runners' spawn options show `shell: false` for Oxlint, Oxfmt, the Query bridge and `lint.mjs`; `git ls-files -z` streams all 17,961 tracked files;
  - `fix.mts` reaches a fixed point, with a non-converging control;
  - an untracked new file is fixed and reported; an ignored file is skipped with a message; a misspelled path in a list with valid ones exits 2, names it and writes nothing; `bun run fix` without paths exits 2.
- **Lock:** two concurrent `fix` runs serialize; a dead-PID lock is broken; a live holder older than 60 s is **not** evicted; a lock recorded for another platform on the same host is not evicted either; a second caller reports busy after 30 s and changes nothing; `--break-lock` refuses a live same-platform holder.
- **Negative controls:** `prefer-template` and `prefer-spread` sites stay unchanged under the hook, `fix` and the agent hook.
- **Staged runner:** a full-scale (3,156-path) Windows pre-commit rehearsal, including all 1,466 UI sources through `lint.mjs --paths-file` with no `ENAMETOOLONG`; formatted staged bytes written to the active index without `git add`; a controlled interleaving (a line appended to a staged file after its blob is read) leaves the index with exactly the formatted staged bytes and the working tree with the appended line (E74); repeat with an independent editor saving immediately before index publication, including a CRLF checkout: the index still has only the formatted snapshot, the working file is byte-identical to the editor’s save, and the report names it. A formatter error on the last of two files changes neither index entry nor working file; the adapter and the command-line formatter give the same bytes for every tracked file in the format scope, with unsorted trusted and managed package-manifest controls; `health.mjs` runs once; an error only in the last ESLint chunk fails the commit; a commit with no UI file runs no bridge at all; a staged `.css` or ignored file raises no ESLint warning. The rehearsal and a typical small commit record their wall time with PF-1.
- **UI-ledger transaction:** an unstaged edit to a tracked bridge config or design-system file is rejected; a slice prune of owned paths passes; a stale ledger without the prune fails the exact gate; a stale shadcn directive fails the bridge.
- **Hooked-commit rehearsal:** use M1-touched files at A7. Exercise the reverted-file case at A8, using a disposable reverted fixture if no real file is reverted.

**VR-10 — agent hook** (revised; use the **registered command strings** from `.claude/settings.json`, `.codex/hooks.json` and, when selected, `.cursor/hooks.json` for their respective harness cases):

- **Shells:** Git Bash, Windows PowerShell, PowerShell 7 and cmd.exe, from a subdirectory, with inherited `GIT_DIR`/`GIT_WORK_TREE` pointing elsewhere: the right root is used, and JSON feedback reaches stdout with exit 0 (E59).
- **Feedback shapes:** for a finding, Claude Code and Codex both get `additionalContext`, and no output ever carries a `decision`; both get `{}` when clean; a Cursor payload (`{ path }`, `cursor_version`) through the imported `claude` command yields `additional_context` when that route is selected; otherwise test the registered `cursor` command with the native `afterFileEdit` payload and its stderr report. Refusals use the selected channel. The Claude and Codex matchers are `Write|Edit|MultiEdit` and `apply_patch`.
- **Worktrees and branches:** a Claude worktree session; re-dispatch to a worktree that has the hook (the full payload arrives) and to one that does not (`{}` with exit 0); an older branch without the adapter (exit 0).
- **Payloads:** Codex `apply_patch` with relative paths, `Move to` and `Delete`; untracked `Write` and `*** Add File:` targets; non-JS, ignored, moved and deleted files.
- **Safety:** concurrent invocations serialize on the fix lock; busy feedback after the bounded wait; the registered strings equal the generated launcher; a second edit hook for any harness is rejected; Cursor runs the hook exactly once per edit; registering keeps every other key of `.claude/settings.json` (`env.MCP_TIMEOUT`), `.codex/hooks.json` and any `.cursor/hooks.json`, and changes no MCP server, role or generated block in `.codex/config.toml`; with the local binaries absent and working global `oxlint` and `oxfmt` on `PATH`, the hook runs neither of them and no installer, and returns `{}`.
- **Layout only:** the `m1` pass alone changes only whitespace, and the hook leaves the key order of an unsorted trusted `package.json` as it is (the staged runner sorts it at commit); an import that is not used yet and a `let` that is reassigned later both stay as written; `prefer-const` and `curly` sites, which the `fix` policy would rewrite, stay unchanged and are reported as fixable.
- **Every outcome reported:** the report names each file the hook rewrote and each tool that could not start, overflowed or was stopped, with the files left unchecked; a checkout without installed dependencies yields `{}`; a multi-file patch that would outrun the 100-second budget stops, names what it did not check and exits 0; an edited file outside the checkout is left alone.
- **Output contract:** whenever the hook entry runs, stdout parses as exactly one JSON object (including when Oxfmt prints progress, when the hook throws, and when a module in the implementation fails to load); the only empty output is the launcher's no-repository or no-entry exit; a payload without `cwd` from a subdirectory resolves relative paths against that subdirectory; diagnostics are capped with an omitted-count line.
- **WF-7:** per-harness observation of invocation count, model-visible feedback and wall time, on Windows and in WSL, with the profile, project trust and permission mode in force recorded and none relaxed.

**VR-13 — behavior protections:**

- **Golden hashes:** from raw input, including the Resend dedupe id.
- **Predicates:**
  - annotated union narrowing allowed;
  - unannotated and generic parameters flagged;
  - an imported discriminated union (`AuthContext`) allowed by the typed check;
  - an imported unknown-alias flagged;
  - a primitive guard in an owner flagged.
- **SAFETY:** untagged, trailing-comment and combined forms; two assertions under one marker.
- **New disables:** for both syntaxes, reject classed blanket disables (including file-wide) and named disables without a reason; accept a used, named disable with a valid class and reason.
- **TS comments:** in a negative-type test, reject `@ts-ignore`, `@ts-nocheck` and an undescribed `@ts-expect-error`; allow a described `@ts-expect-error` there but reject it outside the allowlist and in the resolution sentinels.
- **`no-silent-catch`:** a discarded swallow, an awaited or assigned `.catch(() => null)`, `() => ({})`, `() => []`, `() => void 0` and `() => FALLBACK`, a try→`.catch` rewrite of a flagged block, and a comment-only `try`/`await` catch are flagged; class R is accepted with its linked fallback test; a rethrowing handler, a registered reporter and a registered failure constructor are allowed.
- **Exception links:** a P3, R or T1 directive whose `[test: …]` does not resolve fails; so does a link to a test that exists but never executes the marked code, even if another linked test in its file does, and a P3 link whose test does not import the decoder's module. Swap the links between two tests in the same file that execute different handlers: both links must fail.
- **Test doubles:** `as never` in a test file outside a doubles owner is reported; a `SAFETY: P4` marker outside an owner fails; a combined `SAFETY: P4` directive passes inside a doubles owner and fails outside one; a double touched on a member the test did not provide throws.
- **Cast helpers and trivial predicates:** `core/no-cast-helper` (a two-statement body asserting to the function's own type parameter; `as T[]`, `as Promise<T>` and `as Record<string, T>`; the assertion-free overload form) and `core/no-trivial-type-predicate` positive and negative fixtures; the `typeof` updater repairs (`functionalUpdate`, `isUpdaterFunction`) pass; a spy on a named import of an `export * as` namespace is reported.
- **Behavior-sensitive rules:** `no-array-reverse` is off; `isNonZero` covers `0`, `-0`, a negative value, `null` and `NaN`, and `isNonZeroBigInt` covers `0n`; a direct `!== 0n` repair passes for a statically non-nullable bigint but not for a nullable one without a listed behavior change; a numeric-truthiness finding repaired as `> 0`, `!== 0` or a bare null check without a listed behavior change fails the allowlist, even if the same file adds a valid helper for a different operand; the direct non-nullable bigint zero comparison passes; an edit whose emitted JavaScript is unchanged is classified neutral and one that changes it needs its lines executed; the string-form comparator reproduces default `.sort()` order on mixed number arrays (`[10, 9]` stays `[10, 9]`); a numeric comparator without a test is rejected in review.
- **SAFETY classes:** a `SAFETY: P3` marker without a decoder test link fails; a production marker on Supabase or `fetch` data is flagged for review; a combined `SAFETY: P2` directive on a third-party type passes.
- **Directive ownership:** an `eslint-disable` for an Oxlint rule no longer suppresses it; a live shadcn `eslint-disable` passes both engines; a stale one fails the bridge.
- **Money:** `Boolean(amount)` and `!!amount` in a money-scope file fail the typed check; the `$0` site keeps its current output, including for a negative amount. Before repairing the formatter cast, pin `formatMoney(Number.MAX_SAFE_INTEGER, "USD", "en-US")` to `$90,071,992,547,409.91`; coercing the decimal string to `Number` loses a cent.
- **Inline configuration:** the converted checkout file passes the bridge; Oxlint reports a seeded ref read during render in it through both entries; an ESLint inline configuration comment in an authored file fails `verify:quality`.
- **Fault-patch library:** every library patch fails at base on its recorded assertion; a tenant test loosened to `toMatchObject({})` fails slice acceptance even if a second protector still detects the fault. Deleting the sole exercise from the edited test also fails; the Payload patches fail the direct access-function tests, and bypassing the expected function or substituting another operation’s valid inventoried function fails the collection wiring check. For a retry-classification mock redesign, the §8.5 fault patch must fail the assertion on the retry decision, not crash before it.
- **`no-silent-catch` owners:** a handler that only calls a registered notifier passes; an error response with status 500 passes; one with status 200 does not.
- **Type imports:** turning an inline-only `import { type X } from "m"` into `import type` changes the emitted imports under `verbatimModuleSyntax`; `emit-diff` classifies it as behavior-relevant and the M2 emitted-import check reverts it. The same edit transpiled with default options would look neutral, which is why the check uses each file's resolved options.
- **Mock evasion:**
  - `vi.spyOn(namespace)`, a default-import spy, aliased, destructured, computed and exported `vi`/`vitest` are flagged;
  - `vi.doMock.call(vi, …)`, a bound mock method and a template-literal member access to a mock method are flagged;
  - `typeof vi.fn` is allowed;
  - `vi.doUnmock` in a setup file is flagged;
  - an unreviewed resolution change, a shim without the required evidence, a fake instance pin or a product module redirected to a fake (even if snapshotted) fails `verify:quality`; real workspace resolution, a real instance pin and a reviewed P4 shim pass.
  - Aliased and namespace `bun:test` module mocks in authored Vitest suites are flagged; an unrelated `mock.module` and a script invoked with Bun are clean controls for this rule.
- **Supabase pilot:**
  - fault patches remove a tenant filter and swap in the admin client;
  - the **deny-all error appears in a non-first test**;
  - a refusal swallowed by product code still fails the test through the `afterEach` record; a declared `expectDeniedNetwork` passes;
  - listeners on `127.0.0.1:54321` and `127.0.0.1:54322` receive **zero connections** (permanent, since only registered recorder ports are allowed); in-process `tls.connect` and `https.request` calls to a non-loopback host are each refused and recorded (E71); a `net.connect()` call to a registered recorder port succeeds;
  - a registered tier file yields zero tests under `test:unit`; selected directly without `CORE_TEST_TIER=integration` it is rejected at collection; through the fixture config the setup runs and the guard denies; with the variable it is collected and reaches only its registered hosts; an unregistered file named `*.network.integration.test.ts` stays denied even with the variable;
  - compare the collected files and per-entrypoint IDs for every active entrypoint (including D13’s API-contract entrypoint if merged) on the same platform. Reconcile only §8.5’s reviewed moves, renames and deletions; verify each move in both its source and destination. Unexplained losses or gains attributed to a move fail;
  - a release child (`release-database.realstack.test.ts`) reaches its disposable database in the integration tier;
  - a Node child started with a raw `spawnSync` is refused by the preload, and so are a grandchild, a Bun child and a child started by a script under test; a child that catches its refusal and exits 0 still fails its test through the refusal record; a child calling a parent-registered loopback recorder succeeds; a `git` or `curl` child is stopped by the proxy variables for external hosts and for every loopback port; a Bun child reaches the test's registered recorder and is refused an unregistered local listener (E76); a Node child and a Bun child started with an environment built from scratch, and a grandchild started the same way, are refused, with their refusals in the owning test's record and zero connections to the forbidden listener (E75); a caller's own variables and its `NODE_OPTIONS` survive the merge;
  - the two `stripe-live` suites are not collected by `test:unit` even with `STRIPE_SECRET_KEY` set; each is positively selected by its declared integration step and collects a known nonzero test ID under a safe collection fixture; verify test-only authority before a live run;
  - an entry not selected by its declared workflow/job/config fails `verify:quality`; when #2727 is present its live suites must be selected by the API-contract job and guarded by that config, and an entry whose gating variable or hosts disagree with its own workflow step fails too;
  - a catch-all `expectDeniedNetwork` pattern is rejected; an attempt from `beforeAll` fails the file's `afterAll`.
- **Stripe pilot:** the refusals listed in §4.7 (including `NODE_ENV=production` with `SKIP_ENV_VALIDATION=1`, `VERCEL_ENV=production` under `NODE_ENV=test` without `resetModules`, and the `@asym/env` refusal); two ephemeral ports in one file; the resolver positive control (tenant key, empty-key platform fallback, missing tenant, pinned version, idempotency key, no `Stripe-Account`); fault patches for another tenant's key and a missing tenant borrowing the platform key.
- **Other:** the coverage-ignore contract; a new executable branch or behavior-relevant line left untested fails even when existing covered-branch counts do not fall and the slice supplies a reason; TA-1 fault patches (including a user→admin client swap computed on base ∪ head); a test-loss control (a removed test ID without a successor or note fails); a per-property fault patch whose failure is a crash rather than an assertion is rejected.

Evidence by class. Executed: E4–E7, E9–E14, E17–E42, E44, E45, E47, E49, E50, E52–E54, E56–E59, E61–E67 and E71–E76 (E8, E57 and E67 in part). Inspected: E1–E3, E15, E16, E43, E46, E48, E51, E55, E60 and E68–E70.

---

## 10. Tasks (stable IDs)

Every task ID is defined once, here. "Batch" is where the task is done; §8.2 gives the order and the gates. The OpenSpec `tasks.md` tracks the same IDs with their status (planned, in progress, implemented, integrated, verified or blocked) and evidence. Only the coordinator marks a task verified, after rerunning its "Verified by" checks on the integrated tree; a delegate's report of success never verifies a task. Withdrawn IDs are listed at the end and are never reused. Cross-reference shorthand: CT-0 means CT-0a and CT-0b; GEN-1 means GEN-1a and GEN-1b; W-MOCK means the §10.2 mock seams, CI task and pilots. None is a separate batch.

### 10.1 Phase A: tools, cutover and mechanical batches

<!-- prettier-ignore -->
| ID | Task | Batch | Verified by |
|---|---|---|---|
| IN-0 | Base refresh: merge the current `origin/develop`, then re-run the CTI, AP-1 and the D13 table on the merged tree (§8.1) | start of every batch | checkpoint entry |
| OS-1 | The OpenSpec change `adopt-ultracite-quality-toolchain`: proposal, design (this plan), tasks, the spec delta for `code-quality-toolchain`, the implementation guide, the evidence record and the council record. It links `integrate-design-system-lint` tasks 5.4–5.10. At C5 it is reconciled with every related active change then on develop: `integrate-design-system-lint`, `make-shadscan-advisory`, `make-react-doctor-advisory`, `verify-toolchain-runtime-pins`, `complete-repository-modernization` (its task 3.2 qualified TypeScript 7 product builds and the classic compiler-API boundary; this change keeps that boundary while moving the product compiler to 7.1.0-beta and replacing Prettier, E2) and, if merged, `speed-up-local-gates`, `rebalance-ci-test-scope`, `enforce-jsx-a11y-lint` and `add-api-contract-verification` (E70) | A1, C5 | `openspec validate --strict`; `verify:openspec-deltas` |
| CTI | Cutover inventory: the unlimited `git grep` of §8.1 for every path, script and command a batch changes; every hit is updated in that batch | every batch | the contract tests it names |
| TID-1 | Delete the duplicate one-line test file, wrap `supabase-migrations.test.ts` in a `describe`, add `scripts/quality/test-ids.mts` (§8.5) | A1 | whole-repo listing exits 0 on Windows and Ubuntu; VR-13 |
| SR-1 | `scripts/verify/shadscan-rebind.mts`, using the policy's own hashing. Built in the first batch whose IN-0 finds the Shadscan ledger present and whose commits change a file it cites; never built if PR #2725 merges first (D9, D13) | A1 at the earliest | VR-8 |
| SD-1 | `shadcn-diff.mjs` in three modes (`--refresh-local`, `--refresh-diffs`, `--amend`) with path-root normalization (D9) | A1 | VR-8 |
| AP-1 | `scripts/quality/content-pins.mts`: the five pin kinds over `tests/**` and `scripts/**`, amendment lists, `pin-amend-proof.mts`, put-back proofs (D9) | A1, then every batch | VR-8 |
| VM-1 | `verify-mechanical.mts`, `scratch.mts`, `derived-records.json` and every control of §8.3. Until CT-0a the `oxfmt` replay calls the pinned Oxfmt from the root with the D8 flags, because `bun run format` is still Prettier; the `m1` and `m2:<rule>` replays and their controls are completed at A3, once FIX-1 has built `fix.mts` and the fix entry | A1 (harness and fixture controls), A3 (the `m1` and `m2:<rule>` replays); the integrated controls run with their real writers at A5 (CT-0b), A7 (M1) and A8 (M2) | VR-8 |
| VQ-1 | `tooling/quality/verify-quality.mts` and the root `verify:quality` script: the A1 checks of the §7.1 activation table, to which each later batch adds its own rows, and the commit-range resolver of §7.2 | A1, then every batch | §7.1; VR-6, VR-8 |
| TC-1 | The exact pins of D1 in the root manifest, with `bun.lock` regenerated in the same commit (retain `lockfileVersion: 1`; `verify:bun-lock-drift` passes). Oxfmt is installed but inactive; the old tools stay until CT-0a | A1 | a frozen install; VR-2 |
| TC-2 | The `patchedDependencies` patch on `ultracite@8.3.0`: dead helpers removed, the 15-fixture test, the Core equality check, the upstream report on #60. Record bundled anti-slop revision `13909c9e07590f5a85d93c62712259fe14a883f7`, retain its license and attribution, and verify the unpatched `plugin.mjs` SHA-256 `9bfb19ea9e86908fdf930103d3f1ee0825e0e0eabdf016ac54bc96ab871884c4` | A1 | VR-1 |
| TC-3 | The first `oxlint.config.mts` (the `core` preset with `env`, `ignorePatterns` and `coreRepoIgnores` spread as D2 requires; PL-1 completes it at A3), so that TC-4's sentinel run and path classification have a root entry at A1; the runner `tooling/quality/lint.mts`: the D4 binding and environment scrub, integer threads, the per-command entry table (D3), the chunker, explicit paths resolved and validated, a nonexistent explicit path exiting 2 and naming it, as `fix.mts` does (D10), empty input as a no-op, writer-flag refusal, the root-entry guard and path classification. **Exit codes:** findings exit 1; a setup failure exits 2. Oxlint itself exits 1 both for findings and for a crashing JS plugin (E5), so the runner reads the output and turns any `Error running JS plugin`, config-load failure or backend failure into exit 2 with the original message. A crash never reads as findings, and never as a pass. Test JSON across chunks: a finding only in a later chunk appears in the report and exits 1; any setup failure takes precedence and exits 2 with the original diagnostic | A1 | VR-4, VR-9 |
| TC-4 | TSRS identity (D4): shim target, the `getExePath` expected executable, the observed child, the banner, no tsgolint installed. The Windows control and the Ubuntu control in WSL run here; CT-0a adds the Ubuntu control as a step in the CI lint job (D13 lets this change edit `ci.yml` only in coordinator commits such as CT-0a) | A1 | VR-2 |
| TC-5 | Backend parity on a frozen corpus: TSRS reference vs fast vs a scratch tsgolint, with order, worker and semantic-reporting cases and typed fixable-rule patches; seeded fixtures kept (§7.4) | A6b | the parity report |
| TC-6 | Qualify `@shadcn/lint@0.2.5` unpatched against 0.2.3 with its patch on today's `tests/unit/scripts/design-system-*.test.ts` suites and on provenance; the chosen version must also pass those suites once W-UI has ported them (D12), and the `quality:health` probe mechanism through Oxlint (D12); the result is applied at W-UI | A1 (qualify), C3 (apply) | VR-4 |
| TS-1 | The compiler cohort (§5.2): the root alias, 16 pins and the lock; the two type-only Admin repairs; `ES2023.Intl`; `next typegen` and `tsconfig.typecheck.json` in the four apps; the version verifier and its tests (today's checks kept; the exact pre-release on the native side only, the literal alias, the 16-workspace roster, physical classic resolution for every consumer and the new negatives; §5.2, §5.3); the TypeScript rulebook `docs/ai/rules/typescript-future-proofing.md`, the readiness guide `docs/guides/typescript-6-readiness.md` and the shared-config README `tooling/typescript-config/README.md` updated to the new version policy; capability fixtures exact per compiler family; the Principal harness with forward-slash specifiers and exact diagnostics. One commit, reversible | A2 | VR-7 |
| Strict builds | Per-platform strict builds with expected and observed task IDs (§5.2) | A2 | VR-7 |
| RB-1 | The compiler rollback, as a scratch dry run (§11) | A2, C5 | VR-7 |
| GEN-1a | Payload types present and absent; the import-map producer equals the committed file; a leg that cannot run is reported as unverified (§5.2) | A2 | VR-7 |
| GEN-1b | The currency generator and the import-map postprocessor format through the adapter; fixed-input tests cover the current and legacy import maps separately and together. Process every map present, strip the retired header, preserve the JSDoc `Record<string, unknown>` export, and fail if neither map exists (§5.2) | A5 | VR-7 |
| FB-1 | The backend fallback as a replacement transaction, rehearsed in scratch without merging (D4); a real fallback requires the §11 decision | A6b | VR-2 |
| PL-0 | The parity set for the transition gate: every rule the incumbent ESLint configs enforce at `error` at A3's base, with its effective scope, each mapped to an Oxlint rule in the transition entry `oxlint.transition.config.mts` (written here, so that VR-4 and the A3 sentinels run through it, and made the gate at CT-0a), to the UI bridge (the six Shadcn rules), to an independent verifier, or to a listed gap or retirement with its reason; the per-library TanStack table and the React Compiler gaps (§4.4, §8.2) | A3 | VR-4 |
| PL-1 | The per-rule anti-slop policy of §4.1 with fixtures; a disposition for every optional pinned Ultracite Oxlint preset and each optional JS-plugin bundle (adopt, adapt, defer or decline, with its value and conflicts for Core; group identical reasons); the `oxlint.config.mts` composition; the outside-scope sentinel | A3 | VR-1, VR-4 |
| PL-2 | (delegated) Framework scoping (D7, §4.4, §4.5): React, Next, Vitest, Playwright and the five Query rules, with positive and negative fixtures (locator await, a `test.extend` alias, conditional skip, warning exit); the four import tiers with fixtures for every import form (§4.3); Factory Console's layout covered | A3 | VR-3, VR-4, VR-5 |
| PL-3 | The prescribed repair form for every rule with findings (§4.2), `scripts/quality/emit-diff.mts`, and the recorded dispositions of anti-slop #54, #65, #66, #71 and PR #61 | A3 | VR-13 |
| PL-4 | The layers of D6 and the composition test; every deviation carries its reason | A3 | VR-4 |
| PL-5 | The `core/*` rules and contracts of D5: `no-module-mock-evasion` (binding check plus the typed namespace check, all-files deny list), `no-trivial-type-predicate`, `no-generic-primitive-predicate` with the typed imported-alias check, the allowlist `no-silent-catch`, class R, test links with relevance, `no-cast-helper`, `no-test-double-cast`, `one-assertion-per-safety-marker`, `legacy-directives.json`, SAFETY markers, coverage-ignore comments, the numeric-truthiness allowlist | A3 | VR-13 |
| MI-1 | `money-scope.json` (by content, no shrink) and `numeric-truthiness.json` (D6) | A3 | VR-4, VR-13 |
| TA-1 | `tenant-auth-scope.json` on base ∪ head, every client constructor, the Payload access wiring check (§4.2) | A3 | VR-13 |
| FP-1 | The fault-patch library and `fault-patch.mts`; the list of unprotected functions (§8.5) | A3 (delegated) | every patch fails at base; VR-13 |
| GH-1 | Golden hashes from raw input for the 16 hashing and fingerprinting files (§4.2) | A3 | VR-13 |
| PO-1 | Predicate owners (one per workspace, plus `tests/support/guards.ts`, `scripts/lib/guards.mts`, `tooling/quality/lib/guards.mts`) and doubles owners, each with negative tests (D5) | A3 | VR-13 |
| RD-1 | `detached-owners.json`: the sanctioned detached form, reporters, notifiers and failure values per workspace; `handler-inventory.json` and the one review of its "other" group (D5) | A3 | VR-13 |
| RD-2 | `runDetached` in `@asym/lib/monitoring`, with its tests, before any conversion (D5) | A3 | its tests |
| FM-1 | `oxfmt.config.mts` (D8), the `.prettierignore` additions, the ignore-behavior and protected-bytes tests. Written at A1, activated inside CT-0a | A1, A5 | VR-8 |
| FM-2 | `scripts/lib/format-source.mts`: the `trusted` and `managed` profiles and their error contract; fails closed when the formatter is missing (D8, §6) | A4 | VR-8 |
| FM-3 | (delegated) Port every formatter consumer of §6 with its tests; requalify the Taste adapters and the skill audit through their owners | A4 | VR-8 |
| FIX-1 | The fix entry `oxlint.fix.config.mts` with its `fix`, `m1` and `m2:<rule>` policies (D2), and `fix.mts` (D10): the lock taken first, recorded with its platform and broken only for a dead same-platform PID; streamed listing; batch mode without a report; explicit paths including untracked files, with a nonexistent path or a call without paths refused (exit 2); the fixed point; `staged-guard.mts` with the policy-input guard, untracked-config detection and the inherited `GIT_INDEX_FILE` | A3 | VR-9 |
| UIB-1 | The UI bridge (D12): `bridge.config.mjs` with no retired plugin (E61, E63); deletion of every discoverable `eslint.config.mjs`; path and extension filtering, chunking and `--paths-file` in `lint.mjs`; the dead-key and owned-key checks (E65); directive conversion and inline-configuration removal (E62, E64); writer refusals; the ledger transaction; per-commit no-growth; one health run in `verify:eslint` | A5 | VR-9 |
| PC-1 | `pre-commit.mts`, the staged runner that replaces `lint-staged`: it formats the staged bytes, writes the index through Git's batch forms and never runs `git add` (D10) | A5 | VR-9 |
| CT-0a, CT-0b | The semantic cutover and the mechanical normalization (§8.2), with CT-0a's commit checks, pin proofs and notes for proof-cited files. The stale report `apps/missionary/.eslint-missionary.json` is deleted at CT-0a if the CTI finds no consumer | A5 | §8.2, VR-8, VR-9 |
| TS-2 | Test programs (§5.4, §5.5): the registry including the Principal and Projection programs, `sync-test-programs.mts`, generated paths and excludes, two literal include patterns, `allowJs` for tests, healthy runs, the unsuppressed sentinel program, the authored-member ratchet with its `typecheck:ratchet` updater, the three import repairs, the Base UI fixture program extended to every browser entry, the central `lint:query` programs | A6 | VR-5, VR-11 |
| M1 | The spacing fix plus Oxfmt to a fixed point over the owned scope, as one commit by the sole writer; the blame-ignore entry follows in the next commit (§8.3) | A7 | `verify-mechanical`; identical test IDs (TID-1); VR-9 rehearsal |
| M2-<rule> | One safe rule per batch, each followed by an M1 pass; files with compile diagnostics are skipped; failing files are reverted and recorded (§8.3) | A8 | the M2 gate and the A8 rehearsal leg |
| INV | The raw full-policy inventory on the last mechanical commit, by slice; the slice map, checked against `git ls-files` so that every tracked file in the lint scope and every tracked test file has exactly one owner, a slice or the coordinator, files without findings included (an omission or an overlap fails A9); one packet per slice (owned paths, pinned files, registry entries, per-rule counts and forms, numeric-truthiness and handler counts, the fault patches that reach its files, the plan version, the base commit its worktree starts from, the tasks it depends on and its acceptance commands from §8.5) | A9 | — |
| PF-1 | Live process-tree time and memory, including full lint against the §7.4 limits | A5 and A6 CI jobs, A9 baseline, C1 rehearsal, C5 confirmation | §7.4 matched-run time and peak-memory records against both limits |

### 10.2 Phase B: slices and mock pilots

<!-- prettier-ignore -->
| ID | Task | Batch | Verified by |
|---|---|---|---|
| RS-* | Remediation slices. Each owns a disjoint, generated path set — a product directory with its tests — fixes every full-policy finding and every compile diagnostic in it, and returns its ledger (§8.4, §8.5). The first map, which A9 regenerates from the inventory and splits wherever a slice exceeds about 2,500 findings: **RS-api** (`packages/api` with its tests; the shared boundary owners first: `http-errors`, `money`, `projection/validation`, `donations`), **RS-db** (`packages/database`, `packages/lib`, `packages/auth`), **RS-ui** (`packages/ui`, non-shadcn findings), **RS-admin-1** and **RS-admin-2** (`apps/admin` source; `tests/unit/apps/admin`), **RS-portals** (`apps/donor`, `apps/missionary`, `packages/missionary`), **RS-console** (`apps/factory-console` with its e2e), **RS-scripts** (`scripts/**` with `tests/unit/scripts`), **RS-small** (`packages/{eve-runtime,email,graphql,config,env,mock-data}`), **RS-tests-misc** (the remaining central tests; acceptance suites are edited only as their ownership rules allow) | B | §8.5 |
| RS-PACK | The factory pack `scripts/archon-factory/pack/**`: formatted and repaired under its operational review and released as a new pack; retires its `.prettierignore` entry (D8) | B | the pack's release checks |
| W-MOCK-SB | The Supabase seam (§4.7): the deny-all re-installed per test; registered-port sockets; `integration-tier.json` with job-scoped `CORE_TEST_TIER`, registered hosts and service variables; the per-test refusal record including children's refusals; migration of `fetch` replacements by lifetime from `stub-inventory.mts`; the process-wide guard for descendants (`network-guard.mjs`, `NODE_OPTIONS`, `BUN_OPTIONS`, proxy variables, the cleaned environment); the `stripe-live` registry entries; the environment set per test; the privilege recorder on `apikey` and `Authorization`. Shared P4 shims are built once by the coordinator before slices use them | B | VR-13 |
| W-MOCK-SB-CI | (coordinator) The registered integration job variables and configs (including #2727 if merged), workflow-contract and AP-1 amendments, the network glob and its canary, and explicit selection of both Stripe live suites with test-only authority | B | VR-13 |
| W-MOCK-ST | The Stripe seam: the construction guard with the call-time protected-deployment check, the `@asym/env` second layer, the resolver-based recorder including the empty-key branch (§4.7) | B | VR-13 |
| W-MOCK pilots | The other recipes of §4.7, each piloted on at least one named file before any slice uses it (among them an API case, a database hook, a jsdom UI case, a `node:fs` script and the `maplibre-gl` factory); the pilot record names the file that proves each recipe | B | §8.5 |

### 10.3 Phase C: integration and close-out

<!-- prettier-ignore -->
| ID | Task | Batch | Verified by |
|---|---|---|---|
| IN-1 | Integrate the slices in dependency order (shared owners, then consumers, then tests), rerunning lint, typecheck and tests after each merge | C1 | the C1 gate |
| SW-1 | Merge the latest develop and sweep the whole repository to zero | C1 | `lint:new` at zero |
| CT-1 | Flip `lint:ox` to the full entry with unused-directive errors; retire the transition entry and `legacy-directives.json` | C2 | full policy green |
| CT-T | Flip every remaining program to blocking; delete the ratchet file and the `typecheck:ratchet` updater | C2 | VR-11 |
| W-UI | The UI bridge's debt to zero (W-UI-a), then the six shadcn rules into the full Oxlint entry and the bridge retired in one revertible commit (W-UI-b) (D12), with the design-system suites ported, `packages/ui` repaired before its consumers, and paired before-and-after screenshots and the a11y suite for markup changes | C3 | VR-4, VR-9 |
| WF-1 | Real-repository staging tests of the guard and the staged runner in their final form, after W-UI removed the bridge step | C4 | VR-9 |
| WF-2 | The agent hook (D11): launcher, entry, implementation, registrations and tests (payload edge cases, working directory, a missing tool, a global binary on `PATH` never used, no network, layout-only writes, the time budget, the other content of the registration files kept). If PR #2726's hook is on develop, WF-2 replaces its registrations, carries its test cases and its requirements' scenarios into VR-10, and deletes its script (D13) | C4 | VR-10 |
| WF-3 | Verify the CI, `ci:preflight` and contract-test wiring switched in W-UI-b: `quality:health` in place of `lint:ui`, `verify:eslint` gone; the stage order in `docs/ci.md` updated | C4 | VR-6 |
| WF-4 | The cache and affected-selection tests | C4 | VR-6 |
| WF-5 | Guidance and skills: the compact `AGENTS.md` route within the limits `tests/unit/docs/agent-instruction-routing.test.ts` enforces (16,384 bytes, 200 lines, the `next dev` block first), with `CLAUDE.md` still importing `@AGENTS.md`; a rulebook `docs/ai/rules/code-quality.md`; the general, frontend, backend, testing and TypeScript rulebooks; the workspace `AGENTS.md` commands; `README.md` and `CONTRIBUTING.md`, because the build steps change; the Vitest skill and the canonical Ultracite skill with its provenance and adaptations, through `skills:sync`; `expectedNames` and `agents/openai.yaml`; the Cursor close-project command. The unsupported writers are named in each, and the adapted Ultracite skill and its route name `ultracite init` and `ultracite upgrade` as unsupported for Core setup (D1, §11) | C4 | `skills:verify`; the docs tests |
| WF-6 | Editor settings (D11): `.vscode/extensions.json` and `.vscode/settings.json` | A5 (CT-0a), checked again at C4 | the settings test and the recorded VS Code and Cursor check (D11) |
| WF-7 | The harness matrix: native and T3 sessions of Claude Code, Codex and Cursor, on Windows and in WSL, with installed versions recorded; one fixable and one unfixable edit each; the invocation count, working directory, delivered diagnostic and wall time, with the trust and permission mode in force recorded and never relaxed to load a hook. Antigravity is explicit-command only; document Cursor Cloud according to D11 and the observed registration. In each harness that runs typed lint, WF-7 also invokes the public typed runner and repeats the VR-2 observed-child comparison with the failing and the clean promise fixture, recording the harness, the profile, the working directory and the result. A context that is untyped-only or unavailable is recorded as such and does not count as typed proof. Typed lint is never added to the edit hook | C4 | VR-10 |
| Close-out | PF-1 confirmed; RB-1 repeated; OpenSpec reconciled; VR-12 on a fresh frozen install; the independent final review by at least two reviewers on different providers, each a fresh delegate; the pull request with the council record and evidence; the research handoff confirmed unchanged against the digest in this plan's header; the final handoff, linking the reviewed [design](design.md) and [evidence](evidence.md) (what was implemented and why, with the exact versions of D1; the council's models, efforts, substitutions, rounds and scores; §13's dispositions; what VR-12 demonstrated and what remains unverified; the daily commands with the native, T3 and editor workflow; any blocker, unfinished goal, fallback or manual action) | C5 | §12 |

**Withdrawn:** RDL-1 and RDX-1 (D9); REC-1 (`record-steps.mts`, replaced in v8 by `verify-mechanical`, §8.3); PRUNE-1 (`prune.mts` for a native Oxlint ledger, replaced in v8 by the incumbent UI bridge, D12). A scan of every earlier plan version found no other task ID that this plan lacks.

---

## 11. Rollback and maintenance

- **Compiler:** RB-1 is a narrow forward change: one commit returns the 16 workspace pins, the root alias (`npm:typescript@7.0.2`), `bun.lock` and the verifier's expected versions to 7.0.2. It keeps the compiler-family fixtures, `ES2023.Intl` and the two Admin repairs; typecheck must pass, and so must the registry and proof checks.
- **Backend:** FB-1 is a rehearsal unless a reproducible TSRS defect still blocks a gate after remedies are tried. Likewise, use RB-1 only for a reproducible compiler defect that still blocks a gate. Record the cause, reproducer, affected rules or programs and files, remedies tried and any upstream report. Make the pinned replacement in one separately reviewed commit; continue independent work and name the unmet adoption goal in the final handoff instead of claiming §12 passed.
- **Formatter:** revert CT-0 only before M1; after M1, fix forward.
- **Cohort upgrades:** qualify Ultracite, Oxlint, Oxfmt and TSRS together in a dedicated, manually pinned change. Review preset and rule diffs, engines, peers, optional packages, bundled revisions and licenses. Rerun managed-formatter trust, shadcn discovery and harness checks if their inputs change. Run VR-1..VR-5, TC-5 parity and fixtures, the formatter fixed point and PF-1; the generated lists are regenerated and diffed. The patch is dropped only when upstream passes VR-1.
- **Hooks:** removing the entry is enough; explicit commands remain the gate.
- **UI bridge:** it stays until W-UI. Reverting the engine switch is a revert of the single W-UI-b commit (D12). That restores the bridge config, its workspace, dependency, task and verifier wiring and the `eslint-*` shadcn directives, with a **zero-debt** ledger; it removes the six rules from the Oxlint full entry and takes the bridge out of `retired.json`. The UI repairs of W-UI-a stay.
- **Never** disable anti-slop wholesale or regrow a baseline.

## 12. Completion checklist

1. **Toolchain:** exact pins from a frozen install. TSRS identity proven on Windows and Ubuntu. No tsgolint.
2. **One policy:** one root policy, through root entries, used everywhere. Unsupported writers are refused or negatively controlled.
3. **Programs:** every TS-family file classified. Zero TS2307/TS7016. Every compiler program blocking; the poison program verified by its harness. No ratchet file.
4. **Anti-slop:** 18 rules active; the patch fixtures pass; the zero-finding sentinels pass.
5. **Policy proof:** every adaptation is effective through each root entry. Tiers, React, Next, Vitest, Playwright, Shadcn and money are proven.
6. **Query:** 7 rules proven.
7. **Compiler:** 7.1-beta green, including per-platform strict builds, the negative fixtures, the generators and RB-1. Classic API intact.
8. **Debt:** zero findings and warnings. No suppression file: the UI bridge and its ledger are retired at W-UI. Every disable and marker classified.
9. **Removals:** Core has no direct Prettier declaration and no command or import that calls it (transitive lockfile entries are allowed); general ESLint is retired; the remaining Query bridge is documented. Every artifact that served only the migration is deleted and listed in `retired.json`, or kept with its maintenance role stated in `docs/ai/rules/code-quality.md` (the `m1` policy, for example, stays for the agent hook, D11). Anything still in place, such as the RS-PACK `.prettierignore` entry before the new pack ships, is reported as unfinished in the final handoff.
10. **Records:** consumers, protected bytes and provenance verified; managed and mirrored trees untouched by lint fixes. Records verified with proofs or notes. The React Doctor ledger was never edited by this change.
11. **Operations:** staging, fixing, hooks, CI events, caches and PF-1 all hold.
12. **Behavior protections:** VR-13 passes; TA-1 and money checks hold; no unexplained test loss; `legacy-directives.json` retired.
13. **Docs:** docs, skills and OpenSpec validated, including the `integrate-design-system-lint` reconciliation. AGENTS byte budget respected.
14. **Close-out:** the independent final review's findings are fixed, and the PR is open with its evidence.

## 13. Handoff recommendations

**Retained:**

- Ultracite + Oxlint + Oxfmt; all 18 anti-slop rules.
- TSRS; compiler 7.1-beta with the TS6 API.
- The two-rule Query bridge.
- Playwright via the JS plugin.
- The Shadcn port and health check.
- Two formatter profiles; the partial-staging guard.
- Landmines not adopted; `prefer-query-options` deferred.

**Changed:**

- **Configs and tooling:**
  - root entry configs with per-run typed flags;
  - `.mts` tooling;
  - the shared quality code in `tooling/quality/`, a directory without a `package.json`, instead of a renamed `@asym/eslint-config` workspace, which survives only as the UI bridge until W-UI.
- **Backend:**
  - reference TSRS;
  - launcher-logic identity;
  - a replacement fallback.
- **Lint execution and CI:**
  - uncached root lint;
  - a per-workspace bridge;
  - event-aware CI.
- **Formatting:** Prettier-default style under Oxfmt. Import and Tailwind sorting are off; `package.json` sorting is on for trusted content only, and all sorting is off for managed content.
- **ESLint:** the general rules retired at CT-0; the shadcn rules kept on the incumbent ESLint UI bridge until W-UI.
- **Records:**
  - hash-bound record families with rebind integrity (the React Doctor ledger excluded by owner ruling);
  - pin amendments covering five pin kinds;
  - mechanical batches verified by `verify-mechanical`.
- **Shadcn debt:** the incumbent count-based ESLint ledger serves as a temporary UI bridge and is retired at W-UI; Oxlint never carries a suppression file.
- **Staging and fixing:**
  - format-and-report staging guarded on policy inputs;
  - private-cwd chunked fixing that accepts new files.
- **Agent hook:** one Node launcher for every harness and shell, with JSON feedback on stdout and a worktree-aware adapter. It writes layout only (the blank-line fix and Oxfmt) and never blocks.
- **Test programs:**
  - transitive ownership;
  - portable declaration paths;
  - blocking/ratchet modes with healthy runs; M2 skips files with diagnostics; M1 and CT-0b may touch them under §5.5’s separate gates.
- **Mocks:**
  - fail-closed network re-installed per test, with job-scoped integration authority (`integration-tier.json`, `CORE_TEST_TIER`) and a process-wide guard for inheriting Node and Bun descendants; VR-13 separately tests enforcement without inherited options;
  - Supabase and Stripe recorder recipes with privilege and tenant assertions.
- **Integrity contracts:**
  - SAFETY markers;
  - class R;
  - typed alias checks;
  - per-scope owners;
  - a no-shrink money scope;
  - raw-input golden hashes;
  - ReUI with the parity rules.

**Rejected:**

- staged autofix;
- fixers run at the ledger cwd;
- subfolder `-c` configs;
- config-level unused-directive reporting;
- Ultracite `fix --hook`;
- root devDependencies for test types;
- a single repo-wide predicate owner;
- inline type imports;
- `non-nullable-type-assertion-style`;
- the stock `proseWrap`/`trailingComma`;
- co-installed tsgolint;
- deleting or loosening acceptance checks;
- a Stripe transport switch;
- a native Oxlint suppression ledger (the incumbent ESLint ledger serves until W-UI);
- whole-tree replay of mechanical batches and registry recordings;
- diff-mapped diagnostic site comparison;
- shell-specific hook wrappers and exit-code feedback;
- global `unstubGlobals`/`unstubEnvs`;
- a `Stripe-Account` assertion (Core isolates tenants by key);
- an env-schema-only guard for the Stripe test endpoint;
- harness-specific path fields in the agent hook;
- a `.cursor/hooks.json` duplicate of the Claude hook;
- code-rewriting lint fixes in the edit hook, and a blocking hook decision (a mid-task rewrite invalidates the agent's next edit; PR #2726's requirement and the arbiter ruling of 2026-11-19);
- copying the research handoff and the owner's assignment into the public repository;
- showing `$0` gifts in this change (filed as a product follow-up);
- a PreToolUse writer guard (documented refusal and controls are enough);
- rebinding or requalifying React Doctor ledger records (owner ruling, 2026-11-18);
- retired ESLint plugins kept installed for the UI bridge (a no-op stub resolves the three vendored comments, E63);
- a test spawn helper with a lint rule (the guard reaches children without editing frozen suites, a child with a replaced environment included, E66, E75);
- listing the whole repository's tests on the lint path (E67);
- a denylist for numeric-truthiness repairs (negative and bigint amounts escape it);
- a rule-level "test-first" label for type-only repairs (classification is per edit, by emitted output);
- hand-written fault patches for every one of about 945 call-shape assertions (patches for the high-risk classes, a reviewed mapping for the rest);
- running Payload fault patches through the local API in the unit tier (it needs Postgres);
- optional presets that Core does not need (PL-1 records each decision): TanStack Router/Start (Core routes with Next), the React Doctor/GitHub/SonarJS bundle enabled wholesale, and other framework or database presets that no Core source or pinned dependency calls for;
- gdp-ts authorization proofs (a separate authorization architecture, outside this migration);
- Turbo `globalDependencies` for lint inputs (they would invalidate every build and typecheck cache; lint tasks are uncached and `lint-query-scope.mts` selects the work).

**Deferred:**

- sorting;
- `prefer-query-options`;
- Landmines;
- the tsgo parser facade;
- React Doctor rule promotion and ledger retirement (owned by `make-react-doctor-advisory`);
- product route validation;
- TSDoc and public-API documentation rules (an optional later policy).

## 14. Risks and uncertainties

- **Scale:**
  - 57,601 post-M1 findings;
  - about 1,000–1,500 test compile errors;
  - 1,703 Shadcn counts;
  - pin and proof churn in CT-0 and M1.

  Mitigated by slices, pilots, review and honest reporting.

- **Parity gaps:** PL-0 lists gaps before A5.
- **[Inf] Typed private-cwd fixes:** with a nonempty precondition and a root-cwd comparison. Fallback: a disposable root-cwd copy, with the patch applied.
- **[Inf] Network-reliant tests:** the deny-all and the per-test refusal record may expose them. The pilot lists them and renames them `*.network.integration.test.ts`, run by the coordinator-owned glob step.
- **[Inf] `next typegen` in typecheck:** adds generation time to each app's typecheck; PF-1 measures it.
- **External:** shadcn rate limits; harness feedback unproven until WF-7; Windows-only failures on develop.
- **UI bridge overlap:** ESLint (six shadcn rules) runs beside Oxlint until W-UI; PF-1 includes both (E61: 120 s on Windows for the six UI workspaces).
- **[Inf] Central Query programs:** `tests/tsconfig.json` (about 994 files) may need splitting; A6 measures it before the dispatcher is gated.
- **[Inf] Proxy variables in tests:** refusing proxies stop git, curl and Bun children in isolation (E66); the Supabase pilot runs the whole unit suite with them. A test that fails only because of them is a network-reliant test and moves to the tier. If a tool misbehaves with a refusing proxy for a reason other than network access, the variables are dropped for that tool and the limit is stated.
- **[Inf] Fault-patch library size:** FP-1's cost depends on how many TA-1 and money functions have a protecting test. A3 reports the protected and unprotected counts before Phase B.
- **[Inf] Lint-job time:** the measured parts suggest pressure on the 25-minute limit; A5 and A6 measure the job and apply the split rule (§7.2).
- **[Inf] The child-process wrapper on the real suite:** E75 proves the mechanism in a fixture. The Supabase pilot runs the whole unit and acceptance suites with it. A suite that asserts its child's exact environment may fail; such a file is fixed, or registered as an exception with the stated limit (§4.7).
- **[U] Spacing cost:** upstream anti-slop issue #54 reports a CPU cost in `require-readable-spacing`, which Core has not reproduced. M1's pinned run and PF-1 show whether it is observable on Core's tree; the agent hook runs the same fix within its 100-second budget (D11).
- **Develop keeps moving:** several owner-directed changes are open on the same surfaces (D13). IN-0 and the generated inventories absorb them; a conflict in a workflow or hook file goes to the named owner.
- **An owner decision is open:** the unratified `enforce-jsx-a11y-lint` proposal targets the ESLint configuration this change retires (D13). Until the owner rules, this change assumes the native Oxlint `jsx-a11y/*` rules are the home of accessibility lint.
- **[U] Feedback visibility:** Claude Code and Codex document `PostToolUse` JSON feedback, and Cursor documents `additional_context`; WF-7 observes each, and a harness that does not surface it is documented as explicit-command only.

## 15. Requirement mapping

The table summarizes the migration. The [clause-by-clause requirement map](requirement-map.md) also covers the council, the ratified plan and the later effort instruction; it distinguishes direct coverage, justified exclusions and unresolved gaps.

<!-- prettier-ignore -->
| Assignment item | Decisions | Tasks | Verification |
|---|---|---|---|
| §1 complete setup, zero debt, behavior preserved | §1, D3–D12, §8 | all | §12 |
| §2–3 council, subscriptions, checkpoints | process | — | council record |
| §4 ground truth before broad edits | §2, D13, §8.1 | IN-0, CTI, AP-1 | refreshed base inventory and evidence |
| §5A versions, presets, 18 rules, crash, evasion | D1, D5, D6, §4.1–4.2 | TC-1, TC-2, PL-1, PL-3, PL-5, FIX-1, PO-1, RD-1 | VR-1, VR-4, VR-13 |
| §5B TSRS, compiler, API, programs, generators | D4, §5 | TC-3..5, FB-1, TS-1, RB-1, TS-2, GEN-1, CT-T | VR-2, VR-7, VR-11 |
| §5C Query, TanStack, architecture, Shadcn, tests, Playwright | §4.2–4.7, D7, D12 | PL-0, PL-2, PL-4, TC-6, W-UI, W-MOCK, GH-1, MI-1, TA-1 | VR-3..5, VR-13 |
| §5D formatter consumers, protected content, skills | D2, D8, D9, §6 | SR-1, SD-1, AP-1, VM-1, CT-0a/b, FM-1..3, M1, RS-PACK, WF-5 | VR-8 |
| §5E hooks, staging, caches, CI, baseline, performance | D3, D10, D11, §7, D12, D13 | WF-1..7, FIX-1, UIB-1, PC-1, IN-0, CT-0a/b, CT-1, W-UI, PF-1 | VR-6, VR-9, VR-10, PF-1 |
| §6 council rounds and ratification | §0, §16 | — | council record and owner ratification; no score for v10 |
| §7 required plan contents | §§1–15 | §10 task ledger | §9 verification matrix and §12 checklist |
| §8 parallel implementation | §8 | RS-*, IN-1 | §8.5 |
| §9 completion | §9, §12 | Close-out | VR-12 on the reviewed commit |
| §10 handoff | §10.3, §12, §13, §16 | Close-out | final handoff and PR evidence |

---

## 16. Council record and ratification

The full record is `council-record.md`. This section is its summary.

**What was asked and what ran.** The assignment asked for Codex GPT 6.2 Astra, Claude Opus 5.5 and Cursor Gemini 4 Carbon, all at extra-high effort. The reviewers named below are what was selected after each provider's effort limits and the owner's later instructions. Where a provider did not report the model and effort it executed, the selection is all that is known. The record names substitutions and their reasons, never an account.

**What the record does not establish.** Which installed guidance each run read, and how each wait and follow-up was handled, were not recorded at the time. They are not claimed here.

**Reviewers.** Each round had three independent reviewers on three providers: Claude Opus 5.5 at xhigh through Claude Code, GPT 6.2 Astra at max through Codex, and through Cursor Gemini 4 Carbon at high, replaced from round 8 by Gemini 4 Neon at xhigh on the owner's instruction. Round 1 was an unscored investigation. Rounds 2 to 10 each scored a frozen plan on eight dimensions, from 0 to 10.

**The pass rule** was a mean of at least 9.2 over the 24 scores, with no hard gate from any reviewer. **No round met it.**

| Round | Plan | Claude | Gemini |  Codex | Mean of 24 | Hard gates (Claude, Gemini, Codex) |
| ----- | ---- | -----: | -----: | -----: | ---------: | ---------------------------------- |
| 2     | v1   |  7.875 | 8.4125 | 7.7375 |     8.0083 | 2, 4, 7                            |
| 3     | v2   |   8.55 |  9.025 | 8.4875 |     8.6875 | 0, 2, 4                            |
| 4     | v3   |   8.65 |   8.65 |  8.025 |     8.4417 | 0, 2, 4                            |
| 5     | v4   |  8.925 |  8.475 | 8.3625 |     8.5875 | 0, 5, 7                            |
| 6     | v5   | 8.9625 |    8.9 |   8.45 |     8.7708 | 0, 4, 6                            |
| 7     | v6   |  8.925 |    8.8 |   8.25 |     8.6583 | 0, 4, 6                            |
| 8     | v7   |    8.9 | 8.5625 | 8.0875 |     8.5167 | 0, 4, 5                            |
| 9     | v8   |    8.8 |    8.5 | 8.3375 |     8.5458 | 0, 3, 4                            |
| 10    | v9   | 8.7125 |   8.55 |  8.625 |     8.6292 | 0, 4, 3                            |

**Earlier rounds: mean by dimension.** Each value is the mean of the three recorded ratings for that dimension, rounded for display only. No scores were added or changed.

| Dimension                   |    R2 |    R3 |    R4 |    R5 |    R6 |    R7 |    R8 |    R9 |
| --------------------------- | ----: | ----: | ----: | ----: | ----: | ----: | ----: | ----: |
| Intent and completeness     | 8.533 | 9.100 | 9.100 | 9.033 | 9.167 | 9.100 | 9.000 | 9.067 |
| Evidence and repository fit | 8.400 | 8.867 | 8.700 | 8.633 | 8.900 | 9.000 | 8.967 | 8.867 |
| Technical coherence         | 7.700 | 8.333 | 8.000 | 8.333 | 8.600 | 8.533 | 8.500 | 8.467 |
| Behavior and integrity      | 7.567 | 8.567 | 8.500 | 8.700 | 8.833 | 8.333 | 8.667 | 8.467 |
| Implementability            | 7.500 | 8.333 | 7.900 | 8.267 | 8.633 | 8.500 | 8.133 | 8.167 |
| Verification quality        | 8.000 | 8.767 | 8.667 | 8.733 | 8.733 | 8.700 | 8.567 | 8.633 |
| Simplicity and maintenance  | 8.667 | 8.967 | 8.600 | 8.800 | 8.867 | 8.700 | 8.300 | 8.533 |
| Operational reliability     | 7.700 | 8.567 | 8.067 | 8.200 | 8.433 | 8.400 | 8.000 | 8.167 |

**Round 10 by dimension** (plan v9):

| Dimension                   | Claude | Gemini | Codex |  Mean |
| --------------------------- | -----: | -----: | ----: | ----: |
| Intent and completeness     |    9.0 |    9.4 |   9.1 | 9.167 |
| Evidence and repository fit |    8.7 |    8.4 |   9.3 | 8.800 |
| Technical coherence         |    8.8 |    8.5 |   8.5 | 8.600 |
| Behavior and integrity      |    8.5 |    8.7 |   8.3 | 8.500 |
| Implementability            |    8.6 |    8.3 |   8.1 | 8.333 |
| Verification quality        |    8.8 |    8.3 |   8.9 | 8.667 |
| Simplicity and maintenance  |    8.3 |    8.9 |   8.8 | 8.667 |
| Operational reliability     |    9.0 |    7.9 |   8.0 | 8.300 |

**Ratification.** During round 10 the owner directed that it be the last round and that the completed plan be ratified after it. Section 0a maps the round-10 findings to decisions and controls. Evidence that reproduces a problem or qualifies a component is not a run of the final acceptance control. **Plan v10 itself was not scored by the council.** It is ratified on the owner's instruction of 19 November 2026, not under the pass rule. After round 10 it was checked by the nothing-lost audit, by two arbiter rulings (§0c) and by a final consistency check. None of those is a council score.

**What stays open.**

- A standing dissent: Codex preferred TSRS fast mode in round 1; D4 keeps reference mode, with the measurements beside the decision.
- An owner decision that does not block batch A1: the unratified `enforce-jsx-a11y-lint` proposal (D13, §14).
- The owner's choice whether the research handoff and the assignment are added to this public repository; the plan identifies the handoff by digest instead.
- Every statement marked [Inf] or [U] in this plan is settled by the task that §14 names for it, not by this ratification.
