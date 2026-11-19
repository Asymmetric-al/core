# Evidence record: Core quality-toolchain migration (E1–E77)

This file joins the evidence notes the coordinator wrote during the council rounds of 2026-11-19: the round-0 snapshot and the addenda that followed. The notes are unedited except that machine-local paths and subscription labels are replaced by placeholders (`SCRATCH`, `<coordinator worktree>`, `<reviewer worktree>`, `<research handoff>`, `<home>`).

Classes: **[X]** executed, **[I]** inspected, **[Inf]** inferred. Facts were taken at Core `develop` `e6a5ce81a4505f134c4266c3e076bfaf744ba540` unless an entry says otherwise.

`SCRATCH` is the coordinator's temporary qualification directory. Its fixtures and raw outputs are not part of the repository. The results quoted here are the record, and each one names the command or fixture that produced it, so that it can be run again.

Later entries sometimes correct earlier ones (for example E26 corrects the sizing in E25, and E70 updates E69). Plan v10 cites the entry that holds.

## Index

<!-- prettier-ignore -->
| ID | Subject | Source note |
|---|---|---|
| E1 | Repository snapshot | `evidence-r0.md` |
| E2 | Active OpenSpec changes that interact with this migration | `evidence-r0.md` |
| E3 | Registry state (npm, 2026-11-19) | `evidence-r0.md` |
| E4 | Candidate toolkit (isolated, not in Core) | `evidence-r0.md` |
| E5 | Anti-slop crash: reproduced on the current cohort | `evidence-r0.md` |
| E6 | Anti-slop raw inventory on the current tree | `evidence-r0.md` |
| E7 | TSRS vs tsgolint on `packages/api` (Ultracite core preset, `--type-aware`) | `evidence-r0.md` |
| E8 | Formatter coupling found beyond the handoff's six consumers | `evidence-r0.md` |
| E9 | Read-only boundary probe for council delegates | `evidence-r0.md` |
| E10 | Oxfmt churn against current Prettier output (whole repository) | `evidence-r1-addendum.md` |
| E11 | TypeScript 7.1.0-beta compiler qualification | `evidence-r1-addendum.md` |
| E12 | Typed lint over all `apps` + `packages` (Ultracite core preset) | `evidence-r1-addendum.md` |
| E13 | Query rules: Oxlint JS bridge vs ESLint projectService bridge | `evidence-r1-addendum.md` |
| E14 | Full-scope native inventory (sizing only, not a proposed policy) | `evidence-r1-addendum.md` |
| E15 | Current enforcement gaps and CI shape | `evidence-r1-addendum.md` |
| E16 | Shadcn upstream status and fix guide | `evidence-r1-addendum.md` |
| E17 | Central tests are not compiler-checked today | `evidence-r1-addendum.md` |
| E18 | Anti-slop #60: broader crash class and a qualified patch | `evidence-r1-addendum.md` |
| E19 | One directive satisfies both cast rules | `evidence-r1-addendum.md` |
| E20 | Mock-detection evasions are invisible | `evidence-r1-addendum.md` |
| E21 | Mechanical batch: spacing autofix + Oxfmt reaches a fixed point | `evidence-r1-addendum.md` |
| E22 | The shared alias defect also crashes `no-known-value-widening`; the patch covers it | `evidence-r1-addendum.md` |
| E23 | Query ESLint bridge cost: one root process OOMs; per-workspace works | `evidence-r1-addendum.md` |
| E24 | Oxlint native suppression pruning is subset-safe | `evidence-r1-addendum.md` |
| E25 | Candidate policy v1 residual (qualification sizing) | `evidence-r1-addendum.md` |
| E26 | Corrected candidate sizing (config at repo root) | `evidence-r2-addendum.md` |
| E27 | Mechanical batches | `evidence-r2-addendum.md` |
| E28 | TSRS discovers only directory-rooted `tsconfig.json`; without it tests run non-strict | `evidence-r2-addendum.md` |
| E29 | Backend identity chain without the headless protocol | `evidence-r2-addendum.md` |
| E30 | Query bridge from a workspace cwd with an absolute config path | `evidence-r2-addendum.md` |
| E31 | `RAYON_NUM_THREADS` caps the TSRS backend | `evidence-r2-addendum.md` |
| E32 | Single-writer formatter handoff commits cleanly through the real hook | `evidence-r2-addendum.md` |
| E33 | Ultracite hook honors a fix-allowlist config via passthrough | `evidence-r3-addendum.md` |
| E34 | Mixed-owner central tests | `evidence-r3-addendum.md` |
| E35 | Oxlint native suppressions: stale and growth both fail; subset prune is safe | `evidence-r3-addendum.md` |
| E36 | Rule metadata is machine-readable | `evidence-r3-addendum.md` |
| E37 | A narrow fix policy run at the ledger's cwd wipes the file's ledger entry; a private cwd does not | `evidence-r4-addendum.md` |
| E38 | Core's type-import style | `evidence-r4-addendum.md` |
| E39 | Root devDependency at the owner's exact version keeps runtime identity and real types | `evidence-r4-addendum.md` |
| E40 | Central-test ownership by transitive `@/` closure | `evidence-r5-addendum.md` |
| E41 | Owner-resolved declaration paths give real types and one identity, with no manifest change | `evidence-r5-addendum.md` |
| E42 | A report-only Oxlint check never writes the ledger | `evidence-r5-addendum.md` |
| E43 | Repository facts used by plan v4 | `evidence-r5-addendum.md` |
| E44 | `.mts` configs and modules load; explicit `sortImports:false` holds | `evidence-r5-addendum.md` |
| E45 | Non-`@/` alias needs: `@payload-config` reaches seven tests, six in `tests/unit/cms` | `evidence-r6-addendum.md` |
| E46 | Strict-build wrapper and UI lint facts | `evidence-r6-addendum.md` |
| E47 | Root-located entry config from a private cwd: overrides and ignores apply; `extends` does not carry ignores; env-selected policy fails closed | `evidence-r6-addendum.md` |
| E48 | React Doctor ledger is ungated and already stale on develop; acceptance pins have an amendment convention | `evidence-r6-addendum.md` |
| E49 | One hook command string works in PowerShell and Git Bash from a subdirectory | `evidence-r6-addendum.md` |
| E50 | Mock transport facts: Vitest unstub semantics and the stripe-node loopback recipe [X] | `evidence-r7-addendum.md` |
| E51 | Env-validation skip defeats a schema-only guard [I] | `evidence-r8-addendum.md` |
| E52 | tsconfig `include` has no brace expansion [X] | `evidence-r8-addendum.md` |
| E53 | A bare PowerShell `if` wrapper loses the hook's exit 2 [X] | `evidence-r8-addendum.md` |
| E54 | Oxlint 1.94 targeted prune also drops entries of deleted, unnamed paths [X] | `evidence-r8-addendum.md` |
| E55 | Next generated validator is outside the product app programs [I] | `evidence-r8-addendum.md` |
| E56 | Existing disable directives at base [X] | `evidence-r8-addendum.md` |
| E57 | Git blob-id pins and stub inventory (round-8 checks) [X/I] | `evidence-r8-addendum.md` |
| E58 | `next typegen` qualification on all four apps, TS 7.1-beta [X] | `evidence-r9-addendum.md` |
| E59 | A shell-agnostic Node hook launcher [X] | `evidence-r9-addendum.md` |
| E60 | The incumbent ESLint shadcn ledger [I] | `evidence-r9-addendum.md` |
| E61 | One non-discoverable UI-bridge config reproduces the incumbent ledger exactly [X] | `evidence-r9-addendum.md` |
| E62 | Directive ownership between the two engines [X] | `evidence-r9-addendum.md` |
| E63 | The UI bridge needs no retired plugin after CT-0a's conversion [X] | `evidence-r9-addendum.md` |
| E64 | Oxlint carries the checkout's `refs` protection natively [X] | `evidence-r10-addendum.md` |
| E65 | ESLint 10.13.0 suppression ledger: subset prune, deleted files, renames [X] | `evidence-r10-addendum.md` |
| E66 | A process-wide network guard reaches every Node and Bun descendant without a spawn helper [X] | `evidence-r10-addendum.md` |
| E67 | `vitest list --json` on the base tree [X/I] | `evidence-r10-addendum.md` |
| E68 | Repository facts checked for round 10 [I] | `evidence-r10-addendum.md` |
| E69 | Owner-directed quality work in flight on 2026-11-19 [I] | `evidence-r10-addendum.md` |
| E70 | Quality pull requests opened on 2026-11-19, after E69 [I] | `evidence-r11-addendum.md` |
| E71 | One wrapper on `net.Socket.prototype.connect` sees every Node client path [X] | `evidence-r11-addendum.md` |
| E72 | Oxlint 1.94.0 writes and silently honors `oxlint-suppressions.json` [X] | `evidence-r11-addendum.md` |
| E73 | Prettier and Oxfmt on this change's own documents [X] | `evidence-r11-addendum.md` |
| E74 | Formatting the staged bytes closes the staging race [X] | `evidence-r11-addendum.md` |
| E75 | The guard reaches a child whose environment was replaced [X] | `evidence-r11-addendum.md` |
| E76 | Port-qualified `NO_PROXY` entries: Bun honors them, curl and git do not [X] | `evidence-r11-addendum.md` |
| E77 | Batch A1 staffing: delegated tool drafts, by an arbiter's ruling [I] | added in batch A1 |

---

# Part: Coordinator evidence, round 0 (2026-11-19), for independent checking (`evidence-r0.md`)

Every item below was executed or inspected by the coordinator on this machine
(Windows 11, Bun 1.4.3, Node 24.22.1 — note root `engines` now requires
`>=24.22.3`). Treat them as leads you may verify, not conclusions to adopt.
Reproduction inputs live under `SCRATCH`.

## E1. Repository snapshot

- Coordinator worktree: `<coordinator worktree>`,
  branch `t3/ultracite-tsrs-ts-migration`, HEAD `e6a5ce81a4505f134c4266c3e076bfaf744ba540`
  (= `origin/develop` tip at 2026-11-18 22:37 +0700). Clean tree. A baseline
  `bun install --frozen-lockfile` completed there (1,941 packages, 81 s), so its
  `node_modules` are readable. Your own isolated worktree is created from the
  same commit but has no `node_modules`; read installed packages from the
  coordinator worktree path above instead. Do not install anything.
- The handoff's inspected revision `2e0c64593f1f…` is an ancestor, 132 commits
  older. Tooling-relevant changes since then are small: Node pin 24.22.1→24.22.3
  (root `engines`, CI), `.prettierignore` dropped `vendor/payload-upstream`,
  new package exports in `packages/{api,auth,env,ui}`; `tooling/eslint-config`,
  root `eslint.config.mjs`, `turbo.json`, `.husky/*`, TypeScript pins unchanged.
- 16 product workspaces pin `"typescript": "7.0.2"`; root has
  `"@typescript/native": "npm:typescript@7.0.2"` and `"typescript": "6.0.3"`;
  `tooling/eslint-config` declares `"typescript": "*"`.
- Lint today: root `eslint.config.mjs` + 16 workspace `eslint.config.mjs`;
  apps/ui/missionary use `node ../../tooling/eslint-config/lint.mjs`, other
  packages `eslint .`; `lint-staged` runs `tooling/eslint-config/lint.mjs --fix`
  then `prettier --ignore-unknown --write` with
  `--concurrent false --no-stash --no-hide-partially-staged`; pre-commit also
  runs `bun run verify:shadscan -- --staged`.
- `.claude/settings.json` (118 bytes), `.codex/config.toml`, `.cursor/mcp.json`
  exist; no `.codex/hooks.json` or `.cursor/hooks.json`.
- `docs/ai/rules/code-quality.md` does not exist (rulebooks: agent-skill-routing,
  async-qa-foreman, backend, frontend, general, openspec-guardian, openspec,
  review-bots, shadcn-studio-mcp, testing, typescript-future-proofing).

## E2. Active OpenSpec changes that interact with this migration

- `integrate-design-system-lint`: tasks 5.1–5.3 done; 5.4–5.10 (admin, donor,
  missionary, shared UI/library debt repair; warnings; guidance; independent
  audit) still open.
- `make-shadscan-advisory` (proposal, ratification task 1.1 unchecked): would
  stop Shadscan blocking pre-commit/push/CI and drop its hash ledger. Its design
  lists "Moving lint to Oxlint" as a non-goal of that change.
- `make-react-doctor-advisory` (proposal, ratification 1.1 unchecked): would
  delete `docs/qa/react-doctor/exceptions.json` and the strict check.
- Until ratified, `tooling/shadscan/findings.json` (hash-bound proofs,
  pre-commit enforced) and `docs/qa/react-doctor/exceptions.json` (whole-file
  hashes) remain live; broad formatting or dependency changes stale them.
- `complete-repository-modernization` task 3.2 (done) qualified TypeScript 7
  product builds plus the maintained JS compiler API boundary.

## E3. Registry state (npm, 2026-11-19)

ultracite latest 8.3.0 (published 2026-11-18); oxlint 1.94.0 (11-16); oxfmt
0.79.0; oxlint-tsgolint 7.0.2007; tsrs: newest `7.1.0-beta.tsrs2` (11-16), but
the `latest` dist-tag still points at `0.25.0-ts7.1.0-beta` and there is no
`next` tag; typescript: latest 7.0.2, beta 7.1.0-beta, next
7.1.0-dev.20261118.1; @typescript/native-preview latest 7.0.0-dev.20260707.2;
@typescript-eslint/parser latest 8.73.0 with peer `typescript >=4.8.4 <6.1.0`;
@tanstack/eslint-plugin-query 5.108.0; eslint-plugin-playwright 2.12.2;
@shadcn/lint latest 0.2.5 (Core pins 0.2.3 + patch); eslint latest 10.15.0
(Core 10.13.0).

## E4. Candidate toolkit (isolated, not in Core)

`SCRATCH\qual\tools` has exact installs: ultracite 8.3.0, oxlint 1.94.0,
oxfmt 0.79.0, tsrs 7.1.0-beta.tsrs2, oxlint-tsgolint 7.0.2007,
@tanstack/eslint-plugin-query 5.108.0, eslint-plugin-playwright 2.12.2
(Windows native binaries present). `tsrs --version` →
`Version 7.1.0-beta (tsrs 7.1.0-beta.tsrs2, microsoft/TypeScript@3e9236361fa9)`.
`tsrs-lint` is a Node launcher that runs `tsrs --lint`.
TSRS README (installed copy): CLI default follows the pinned compiler's checker
settings (four checkers, Go file assignment/history); `--fast`/`TSRS_FAST=1`
enables the fast preset; its lint example sets `TSRS_FAST=1` explicitly;
`--type-check` checks only files Oxlint lints, "so keep a separate
`tsrs --noEmit` run". The Oxc blog says fast mode is "enabled by default" —
these two statements need reconciling against observed behavior.

## E5. Anti-slop crash: reproduced on the current cohort

Fixture `SCRATCH\qual\tools\fx\crash\nested.ts` (the handoff's
`Box<T>`/`ReadonlyBox<T>` example). All 18 rules: exit 1, `Error running JS
plugin … RangeError: Maximum call stack size exceeded` via
`unsafeDirectValue` (plugin.mjs ~lines 764–770). Dictionary rule off: exit 0.
Bundled `plugin.mjs` SHA-256 `9bfb19ea9e86908fdf930103d3f1ee0825e0e0eabdf016ac54bc96ab871884c4`
(identical to the handoff). Upstream dmmulroy/anti-slop#60 is open; no
anti-slop commits since 2026-10-14. Coordinator's reading of the cause:
`aliasSubstitution` binds `Box`'s `T` to `Readonly<T>` in a map that also holds
the caller's `T`, so the inner `T` resolves to itself; `isUnappliedReferenceTo`
only catches a direct `T → T` reference. A correct fix keeps each substitution
paired with its defining scope (as `dictionaryValueTypes` already does); a bare
cycle cut would create false negatives such as `Box<Readonly<T>>` with
`T = unknown`.

## E6. Anti-slop raw inventory on the current tree

Config: only the Ultracite anti-slop preset, `categories.correctness: off`,
targets `apps packages scripts tests tooling`, `.gitignore` respected, no
fixture/generated exclusions. 4,358 files linted in 7.3 s; 54,065 findings in
3,233 files; 42,963 are `require-readable-spacing` (autofix). Non-spacing
(test / product): safety-comment 2,971/1,328; no-runtime-typeof 320/1,238;
no-unsafe-dictionary-type 884/509; no-module-mocking 1,273/0;
no-unknown-parameters 559/438; no-known-value-widening 337/279;
no-chained-type-assertions 239/85; no-unknown-returns 143/74;
no-conditional-empty-object-spread 39/143; no-shape-in-symbol-names 49/69;
no-array-filter-map 33/45; no-object-parameters 15/4; no-reflect-get 17/0;
no-reflect-apply 11/0; the other three 0. Total ≈ 6,890 test + 4,212 product.
By area (non-spacing): tests 6,575; packages/api 1,646; apps/admin 842;
scripts 510; packages/ui 502; apps/factory-console 256; packages/database 181;
others < 100 each. "test" = path under tests/, **tests**, e2e, fixtures, or
`*.test|spec.*`.

## E7. TSRS vs tsgolint on `packages/api` (Ultracite core preset, `--type-aware`)

Backend forced with `OXLINT_TSGOLINT_PATH` (tsgolint.exe or tsrs-lint.exe);
the process list during each run confirms which backend executed
(`tsgolint.exe` vs `tsrs.exe`). 524 files, 475 rules.

- Diagnostics: 7,265 each. Rule/file/line/column/severity identical. Two
  `typescript(no-unsafe-type-assertion)` messages differ only in type-printing
  truncation (TS 7.0 vs 7.1 printer).
- TSRS reference (`TSRS_FAST=0`) vs fast (`TSRS_FAST=1`): identical; repeated
  fast runs identical.
- Wall / backend peak working set (two alternating runs each, light meter
  `SCRATCH\qual\scripts\measure.ps1`): tsgolint 5.9–8.6 s / ~1.22–1.25 GB;
  TSRS reference 2.7–3.6 s / ~480 MB; TSRS fast 2.5–2.9 s / ~435–445 MB.
  Untyped Oxlint on the same scope: 0.7 s. (An earlier CIM-polling meter
  inflated wall time to 70–85 s; those numbers were discarded.)
- Not yet done: other projects, root/test/script programs, `--type-check`,
  safe-fix patch comparison, file-order/worker sensitivity, whole-repo runs.

## E8. Formatter coupling found beyond the handoff's six consumers

- Programmatic or CLI Prettier references: the six named scripts plus
  `scripts/lib/openspec-contracts.mjs`, which emits
  `<!-- prettier-ignore-start --> … <!-- prettier-ignore-end -->` ranges into
  generated OpenSpec Markdown.
- 2,344 `prettier-ignore` directive lines in 172 tracked files (112 under docs,
  47 openspec, 4 tests, 2 scripts, plus skill mirrors).
- Tests assert `.prettierignore` contents (e.g.
  `tests/unit/scripts/copy-maplibre-worker-assets.test.ts`).
- Tracked files: 9,090 `.md`, 4,162 `.ts/.tsx`, 725 JS-family, 1,048 JSON,
  495 YAML, 33 CSS.

## E9. Read-only boundary probe for council delegates

Plan-mode probes on Codex (gpt-6.2-astra), Claude Code (claude-opus-5-5) and
Cursor (gemini-4-carbon): each model declined an explicitly requested file
write because plan mode forbids it; no file was created. Codex reported
sandbox `danger-full-access`, approval `granular`, collaboration mode Plan.
So plan mode is an instruction-level boundary honored by all three, not a
harness-enforced denial. Council delegates therefore run in plan mode, in
isolated worktrees, under a strict read-only brief.

---

# Part: Coordinator evidence addendum (executed during round 1) (`evidence-r1-addendum.md`)

All runs in the disposable qualification worktree `SCRATCH\qual-wt`
(detached at e6a5ce81a, own frozen install) with the toolkit in
`SCRATCH\qual\tools`. Windows 11, Bun 1.4.3, Node 24.22.1.

## E10. Oxfmt churn against current Prettier output (whole repository)

`oxfmt --list-different` with `.prettierignore`/`.gitignore` defaults:

| Configuration                                                      | Files that would change |
| ------------------------------------------------------------------ | ----------------------: |
| Prettier-3-default-compatible options, `sortPackageJson` off       |                     228 |
| + `sortPackageJson` (Oxfmt default on)                             |                     233 |
| + Ultracite `sortImports`                                          |                   1,772 |
| `trailingComma: "es5"` (Ultracite) instead of Prettier 3's `"all"` |                   3,358 |
| `proseWrap: "never"` (Ultracite) instead of `"preserve"`           |                   2,734 |
| Ultracite Oxfmt preset as shipped                                  |                   6,112 |

Core has no Prettier config file (Prettier 3.9.10 defaults). Sampled
compatible-mode differences: Markdown lazy continuation lines inside multi-line
inline code gain the list indent or `>` marker (render-equivalent); long union
aliases break into leading-`|` form; Oxfmt formats TOML (`.codex/config.toml`
arrays collapse); `package.json` dependency keys get sorted; CSS
`font-family` lists collapse to one line. Oxfmt 0.79 CLI has
`--stdin-filepath`, `--migrate=prettier`, `--ignore-path` (default:
`.gitignore` and `.prettierignore` in cwd), `--disable-nested-config`.

## E11. TypeScript 7.1.0-beta compiler qualification

- Baseline TS 7.0.2: all 16 product workspaces `tsc --noEmit` exit 0
  (~50 s sequential).
- Bumped root `@typescript/native` to `npm:typescript@7.1.0-beta` and all 16
  pins to `7.1.0-beta`; `bun install` changed 56/54 lockfile lines. Installed:
  native 7.1.0-beta, root classic `typescript` still 6.0.3.
- 15/16 pass. `apps/admin` fails with 5 × TS2883 ("inferred type of X cannot be
  named without a reference to Y … not portable") in
  `features/support-hub/components/detail/composer/extensions/mention-suggestion.ts:16`
  (TipTap `MentionNodeAttrs`/`MentionOptions` via `packages/ui/node_modules`)
  and `features/support-hub/stores/support-store.ts:49` (TanStack DB
  `Collection`/`NonSingleResult`/`QueryCollectionUtils` via
  `packages/database/node_modules`).
- Package surface: both 7.0.2 and 7.1.0-beta ship only `lib/tsc.js`,
  `getExePath`, `version.cjs` (no classic `lib/typescript.js`); 7.1 renames the
  `./unstable/*` exports to `./sync`, `./async`, `./ast`, … No Core source
  imports those subpaths. Next 16.4.5 type-checks TS 7 via the package's
  `lib/tsc.js` CLI path (`dist/lib/typescript/runTypeScriptCli.js`), which
  7.1.0-beta still provides; no app sets `experimental.useTypeScriptCli`.
- `tests/fixtures/base-ui-compliance` compiles with the 7.1 alias (exit 0).
- `scripts/verify/typescript-toolchain.mjs` fails on the 7.1 cohort (exact
  version regex `^\d+\.\d+\.\d+$`; message "Root tsc must resolve to the
  pinned TypeScript 7 native compiler alias").
- Not yet run: Next builds, Payload/importmap/currency generators,
  capability poison fixtures through TS7, editor behavior.

## E12. Typed lint over all `apps` + `packages` (Ultracite core preset)

2,337 files, 475 rules, `OXLINT_TSGOLINT_PATH` bound per run; process list
confirms executed backend.

- tsgolint vs TSRS: 25,352 diagnostics each; rule/file/line/col/severity
  identical; 4 message differences (3 type-print truncation; 1 semantic:
  `packages/eve-runtime/scripts/build.mjs:38` — tsgolint "error typed value",
  TSRS "any value", same rule fires).
- TSRS with `TSRS_FAST` unset, `=0`, `=1` (two runs each) and earlier ref/fast
  runs: all diagnostic-identical.
- Wall / backend peak (single-machine, sequential):
  tsgolint 54.8 s / 2.44 GB; TSRS `=1` 7.9–9.7 s / 1.83–2.03 GB;
  TSRS unset 6.2–6.6 s / ~2.0 GB; TSRS `=0` 6.4–7.4 s / 1.61–1.69 GB.
  Unset matches the fast-mode memory profile, consistent with fast being the
  lint default; `=0` is the lowest-memory, pinned-checker mode.
- Upstream `tools/tsgolint/README.md`: point `OXLINT_TSGOLINT_PATH` at the
  `tsrs-lint` launcher, not `tsrs`; "cross-mode and cross-thread diagnostic
  stability is not guaranteed"; `--type-check` reports only files Oxlint sends,
  omits global diagnostics, checks out-of-tsconfig files in an inferred program,
  and does not replace `tsrs --noEmit`/a full compiler run. `tsrs --help`:
  `--fast` "may differ from pinned TypeScript behavior".

## E13. Query rules: Oxlint JS bridge vs ESLint projectService bridge

Fixture `qual-wt/packages/database/zz-query-fixture` (type-checks clean):
imported `Promise<void>` queryFn, inline void queryFn, imported
`number | undefined` queryFn, custom-hook wrapper rest destructuring, direct
rest destructuring; valid counterparts.

- Oxlint 1.94 + `@tanstack/eslint-plugin-query@5.108.0` as JS plugin, all seven
  recommended rules, `--type-aware` with TSRS: 1/5 negatives (direct rest only).
- ESLint 10.13 + `@typescript-eslint/parser@8.72.0` (`projectService: true`,
  classic TS 6.0.3) with the two rules: 5/5 negatives, valid file clean.

## E14. Full-scope native inventory (sizing only, not a proposed policy)

Ultracite `core`+`react`+`next`+`vitest` presets extended at root, correctness
category off, typed via TSRS (`TSRS_FAST=0`), targets
`apps packages scripts tests tooling`: 27.8 s, 119,986 diagnostics, 4,362
files, 664 rules. By area: tests 65,746; scripts 27,112; packages/api 7,830;
apps/admin 7,040; packages/ui 3,820; apps/factory-console 2,618; others
< 1,100 each. Largest rules: no-unsafe-member-access 11,068 (mostly untyped
`.mjs` scripts), func-style 10,852, curly 7,746, no-unsafe-assignment 6,772,
require-unicode-regexp 6,418, strict-boolean-expressions 5,965,
vitest/prefer-strict-equal 5,656, vitest/require-mock-type-parameters 4,192,
vitest/max-expects 3,731. Full per-rule table:
`SCRATCH\qual\out\full-all.summary.txt` (raw JSON `full-all.json`).
Anti-slop (E6) and Shadcn (1,703 suppressed counts in 108 files, unchanged)
are additional.

## E15. Current enforcement gaps and CI shape

- `bun run lint` = `turbo run lint` (workspace configs only). Boundaries that
  exist only in root `eslint.config.mjs` (route-handler Supabase bans,
  UI-layer `@supabase/*` and admin/server client bans, `@tanstack/react-table`
  boundary) are therefore not enforced by CI lint; `verify:data-boundary`
  covers part of this separately. Root config ignores `scripts/**`; central
  `tests/` is linted by nothing; lint-staged lints only
  `{apps,packages,tooling}/**`.
- Most shared rules are `warn` (import order, unused imports/vars,
  `no-explicit-any`, consistent-type-imports) and the runner sets no
  max-warnings, so warnings never fail.
- CI: PR lint/typecheck are Turbo `--affected` over apps/packages/tooling with
  remote cache; protected pushes run full. `format` job runs
  `bun run format:check`; `lint` job also runs verify:data-boundary,
  verify:cms-public-sole-entry, verify:workspace-contract,
  verify:bun-lock-drift, verify:eslint.
- Module-mocking targets (E6's 1,273): relative internal 517, `@asym/*` 491,
  `next/*` 109, other vendors 99 (sonner 57, pg 17, @payloadcms/ui 16),
  `@supabase/*` 28, `node:*` 22, service SDKs 5. Core memory records that
  `vi.mock` of `packages/*` internals by relative path silently failed in the
  full CI suite because of Bun's symlink realpath.

## E16. Shadcn upstream status and fix guide

- Core's upstream reports shadcn-ui/lint #129, #134, #135, #136, #137 were all
  closed 2026-11-02; @shadcn/lint 0.2.4 and 0.2.5 were released the same day.
  Whether 0.2.5 makes Core's 0.2.3 patch unnecessary is unqualified.
- `docs/ai/skills/moai-library-shadcn/references/design-system-lint-fixes.md`
  exists at HEAD (the handoff's "missing fix guide" is outdated).

## E17. Central tests are not compiler-checked today

- 1,781 central test `.ts/.tsx` files (largest: unit/apps/admin 294,
  unit/packages/api 256, unit/scripts 233, unit/packages/ui 174). Only the
  rich-text-editor subset is in `tests/tsconfig.json`; workspace `typecheck`
  tasks never include `tests/`.
- `@/` alias use: apps/admin 87 imports, apps/donor 32, apps/missionary 8,
  packages/ui 1, others 0; factory-console maps `@/*` to `./src/*`. Vitest
  resolves `@/` per importing workspace (`vitest.per-importer-alias.mts`).
- Probe: a temporary program for `tests/unit/packages/api/**` (+ `setup/**`)
  extending `library-transitional.json`, TS 7.1-beta: 172 errors in 4.1 s
  (TS2532 37, TS18048 33, TS2322 32, TS2345 21, TS2352 9, …). Extrapolated,
  roughly 1,000–1,500 latent errors across central tests.

## E18. Anti-slop #60: broader crash class and a qualified patch

Dictionary-rule-only fixtures (`SCRATCH\qual\tools\fx\crash2`), Ultracite
8.3.0 bundled plugin vs patched copy (`SCRATCH\council\antislop-60.diff`,
62-line unified diff; generator `SCRATCH\qual\scripts\patch-antislop.mjs`):

| Fixture                                                                                                          | 8.3.0                 | patched   |
| ---------------------------------------------------------------------------------------------------------------- | --------------------- | --------- |
| `Box<Readonly<T>>`, `Box<T \| undefined>`, `Box<Partial<T>>`, default `U = Readonly<T>`, two-level chain (valid) | CRASH ×5              | clean ×5  |
| recursive `Json` union (valid)                                                                                   | clean                 | clean     |
| `Box<unknown>`; pass-through `A<T>=Box<T>`; shadowed `Mid<U>=Outer<Readonly<U>>` with unknown                    | report                | report    |
| `ReadonlyBox<unknown>`, `Opt<unknown>`, default-param `D<unknown>`, chain `B<unknown>`                           | CRASH ×4 (fails open) | report ×4 |

Cause: `aliasSubstitution` copied the caller's map (`new Map(base)`) and
evaluated arguments against the merged map, so the callee's `T` captured the
caller's `Readonly<T>`; `isUnappliedReferenceTo` only caught bare `T → T`.
Fix: fresh map per alias; explicit arguments stored as `{type, substitutions:
callerScope}`, defaults as `{type, substitutions: earlierParams}`; the five
lookup sites evaluate entries in their own scope (as the sibling
`aliasSubstitutions` already does). Whole-tree regression: patched plugin
yields the identical 54,065 diagnostics (zero exact-key differences).

## E19. One directive satisfies both cast rules

`// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: …`
above `raw as Row` (typed, TSRS, `--report-unused-disable-directives`): zero
findings; the same cast without it gets both
`anti-slop(require-safety-comment-for-type-assertion)` and
`typescript(no-unsafe-type-assertion)`.

## E20. Mock-detection evasions are invisible

In one Vitest file: `const v = vi; v.mock(...)`, `import * as t from
"vitest"; t.vi.mock(...)` and `vi.spyOn(namespaceImport, ...)` produce no
finding; plain `vi.mock(...)` does.

## E21. Mechanical batch: spacing autofix + Oxfmt reaches a fixed point

Disposable worktree, patched anti-slop plugin, `require-readable-spacing` only,
then Oxfmt with Prettier-3-default-compatible options (no package sorting):
spacing `--fix` 3,133 files in 6.0 s (exit 0); after Oxfmt 3,248 files,
+43,955/−496 lines; a second full fix+format pass changed 0 files.
Ledger impact of that batch: 112 of the 145 files referenced by
`tooling/shadscan/findings.json` change (proof hashes go stale; pre-commit
Shadscan enforces them); 0 of 184 files referenced by
`docs/qa/react-doctor/exceptions.json`; 16 of 576 files referenced by
`docs/ai/skill-source-audit.json` (managed upstream skill references such as
`docs/ai/skills/better-*/references/upstream.md`, changed by Oxfmt's Markdown
normalization where Prettier left them alone).
Operational note: `git commit` inside any worktree runs the repository's husky
pre-commit (lint-staged Prettier/ESLint `--fix` + Shadscan), which rewrote
staged files and rejected the commit on "Stale evidence: package.json".

## E22. The shared alias defect also crashes `no-known-value-widening`; the patch covers it

Member G's fixture (`type Id<T> = T; type Wrap<T> = Id<Readonly<T>>;` used in a
generic function) crashes all-18 on 8.3.0 (stack overflow); with the E18 patch
it runs clean (only spacing/safety-comment findings), and the negative
`const bad: Wrap<Record<string, number>> = { a: 1 }` reports
`anti-slop(no-known-value-widening)`. So disabling the dictionary rule alone
is not a valid containment; the patch is required for both rules.

## E23. Query ESLint bridge cost: one root process OOMs; per-workspace works

ESLint 10.13 + parser 8.72 (`projectService: true`, TS 6.0.3) with only the two
Query rules:

- One root process over `apps packages`: exit 134 (V8 abort / OOM) after
  139 s at 4.3 GB peak. Not viable without raising the heap.
- Per workspace: apps/admin 750 files 50 s / 2.4 GB; packages/api 521 files
  24 s / 1.8 GB; packages/ui 321 files 21 s / 1.3 GB. Zero Query-rule findings
  in these three. Inline `eslint-disable` comments naming rules absent from the
  bridge config surface as messages, so the bridge needs `--no-inline-config`.
- For comparison, the full Oxlint typed pass over all scopes (core+react+next+
  vitest presets, TSRS) took 27.8 s, and the anti-slop JS plugin over all
  scopes 7.3 s.

## E24. Oxlint native suppression pruning is subset-safe

Three files each with two suppressed `prefer-const` findings
(`--suppress-all`): `oxlint --fix src/one.ts` fixed one.ts and pruned only its
entry (two.ts/three.ts entries intact); a whole-directory `--fix` pruned all
to `{}`. Unlike Core's recorded ESLint subset-prune trap, a scoped Oxlint fix
does not delete other files' entries.

## E25. Candidate policy v1 residual (qualification sizing)

Config `SCRATCH\qual\tools\fx\policy\candidate.config.mjs` (core + patched
anti-slop at root, React `**/*.{tsx,jsx}`, Next four apps, Vitest unit globs,
Core adaptations listed in the file, typed TSRS `TSRS_FAST=0`): raw 96,517
diagnostics (32 s). Safe `--fix` + Oxfmt iterated to a fixed point in 5 passes
(3,361→1,487→87→10→0 files); 3,469 files changed (+85,907/−25,449).
Residual needing judgment: 32,980 diagnostics in 2,795 files (anti-slop
10,168; native 22,812; tests 19,811; scripts 3,734; product ≈9,400). Real
defect classes surfaced: no-floating-promises 68, no-misused-promises 72,
switch-exhaustiveness-check 49, no-unsafe-finally 6, no-unsafe-optional-
chaining 4, no-dupe-keys 1, no-constant-binary-expression 1. Full table:
`SCRATCH\qual\out\cand-residual.summary.txt`.

---

# Part: Coordinator evidence addendum (executed during round 2) (`evidence-r2-addendum.md`)

Disposable worktree `SCRATCH\qual-wt2` (detached e6a5ce81a, own install), config
at the worktree root so path globs resolve from the repository root.

## E26. Corrected candidate sizing (config at repo root)

Candidate v2 (`qual-wt2\zz-candidate-v2.oxlint.mjs`): v1 plus React preset on
all apps/packages/tests TS/JS (hooks rules reach `.ts`), and off/configured:
`promise-function-async`, `unicorn/prefer-dom-node-dataset`,
`jsx-a11y/prefer-tag-over-role`, `oxc/no-barrel-file`, `react/todo`,
`prefer-nullish-coalescing` `ignorePrimitives` (all), `no-floating-promises`
`ignoreVoid:false`. Raw: 100,839 (69 s, typed TSRS ref). Vitest now in scope
(tests/unit 6,033 + workspace tests); E25's v1 run had placed the config in a
scratch folder, so its root-relative overrides (Vitest, Next) were inert.
Next-plugin and `rules-of-hooks` findings are zero → need positive sentinels.
Composition pitfall observed: root-level adaptations are re-enabled by preset
override blocks (`prefer-tag-over-role` still fired); adaptations must be
applied in the final override layer and verified as effective.

## E27. Mechanical batches

- M1 (spacing autofix + Oxfmt only): 3,248 files; post-M1 residual 57,601
  (anti-slop 10,754; native 46,847).
- M2 trial ("type/syntax-only" autofix allowlist incl. curly,
  switch-case-braces, array-type, consistent-type-definitions,
  numeric-separators-style, no-unnecessary-type-assertion (TSRS 7.1 checker),
  consistent-type-imports inline, prefer-string-replace-all, object-shorthand,
  arrow-body-style, prefer-const, vitest consistent-test-it/padding): 2,218
  files; afterwards `tsc --noEmit` (7.0.2) failed in 7/16 workspaces with 108
  errors: TS6133 63, TS6196 15, TS2344 10 (`type`→`interface` loses implicit
  index signature, e.g. `BeginDonationSagaPayload` vs
  `Record<string, unknown>`), TS2322 10, TS2593 4, TS2589 3 (removed assertion bounded
  instantiation depth), TS2352 3. Anti-slop spacing findings rose (brace
  insertion creates new blocks), so mechanical batches must iterate jointly.
- Conclusion: no autofix rule is safe by category; each needs its own commit
  gated by the upgraded compiler and unit tests, with failing sites reverted
  and handled manually; rules whose fixes break assignability are policy
  decisions.
- Post-M2 (broken) residual for reference: 45,795 (anti-slop 13,217; native
  32,578).

## E28. TSRS discovers only directory-rooted `tsconfig.json`; without it tests run non-strict

`tests/unit/packages/api/document-cutover-verify.test.ts` has 20 TS2532 under a
strict `tsc -p` program. `oxlint --type-aware --type-check` (TSRS, ref):
without a directory config → 0 diagnostics (inferred, non-strict program);
with `tests/unit/packages/api/tsconfig.json` (extends library-transitional,
types node + vitest/globals) → exactly the same 20 TS2532. Directory-rooted
`tsconfig.json` files are required for typed lint of central tests; named
configs (`tsconfig.<x>.json`) are invisible to discovery.

## E29. Backend identity chain without the headless protocol

`node_modules/.bin/tsrs-lint.bunx` (UTF-16LE) targets `tsrs\bin\tsrs-lint`
run by `node`; `node_modules/tsrs/package.json` version `7.1.0-beta.tsrs2`;
platform `tsrs(.exe) --version` → `7.1.0-beta (tsrs 7.1.0-beta.tsrs2,
microsoft/TypeScript@3e9236361fa9)`. On POSIX `.bin/tsrs-lint` is the symlink.
(`tsrs-lint.exe --version` exits 1 — headless protocol; Codex R2.) Process
observation during a run shows `tsrs`/`tsrs-lint` children (E7 meter).

## E30. Query bridge from a workspace cwd with an absolute config path

From `packages/database`, `eslint --no-config-lookup --no-inline-config -c
<absolute root>/tooling/quality/eslint-query.config.mjs zz-q`: 5/5 negatives,
valid clean; config `ignores` for .next/dist/out/coverage/payload-types;
parser resolves classic TypeScript 6.0.3.

## E31. `RAYON_NUM_THREADS` caps the TSRS backend

Product typed lint: uncapped backend peak 1,517 MiB; `RAYON_NUM_THREADS=2`

- `--threads 2` → 766 MiB; diagnostics identical (zero exact-key diff).
  (Wall times in this pair were inflated by concurrent machine load.)

## E32. Single-writer formatter handoff commits cleanly through the real hook

Disposable worktree: `bun add -d --exact oxfmt@0.79.0` (lockfile stays v1),
lint-staged `*` → `oxfmt --write --no-error-on-unmatched-pattern`,
`.oxfmtrc.json` Prettier-compatible options, Oxfmt applied to package.json,
8 `package.json` proof hashes in `tooling/shadscan/findings.json` rebound with
the policy's own `readProofFile`/`proofHash` (prototype
`SCRATCH\qual\scripts\rebind-shadscan-proofs.mjs`), a Prettier/Oxfmt
disagreement file (`apps/admin/app/(app)/crm/types.ts`) edited and staged.
Ordinary `git commit` (husky pre-commit: ESLint `--fix`, Oxfmt, staged
Shadscan) → exit 0 in 167 s; committed `types.ts` is Oxfmt-canonical
(leading-pipe union); index = worktree = HEAD; no stale evidence.

---

# Part: Coordinator evidence addendum (executed during round 3) (`evidence-r3-addendum.md`)

## E33. Ultracite hook honors a fix-allowlist config via passthrough

Fixture with a discoverable `.oxlintrc.json` (curly, prefer-const,
prefer-template) and `src/a.ts` containing `if (a) return "x" + a` and
`let y = 1`. `ultracite fix --hook -c fix.config.json` (fix config: curly,
prefer-const only; Claude-style PostToolUse payload): exit 0; braces added,
`let`→`const`, file formatted; `"x" + a` left untouched (prefer-template is
not in the fix config). Ultracite requires a discoverable linter config in cwd
("No linter configuration found" otherwise). Its CLI help: "Unknown options are
passed to the underlying linter." The hook does not report findings of rules
outside the fix config, so feedback needs a separate full report pass.

## E34. Mixed-owner central tests

Four tracked central files import product sources from more than one app:
`tests/unit/apps/account-recovery-copy.test.tsx` (admin, donor, missionary),
`tests/unit/apps/shadscan-framework-contracts.test.tsx` (admin, donor,
missionary), `tests/fixtures/base-ui-compliance/shadscan-contracts.tsx` and
`workspace-main.tsx` (donor, missionary). Compiled together with no `paths`:
6 errors, incl. 3 TS2307 for transitive `@/components/app-shell`,
`@/components/navigation-search`, `@/lib/route-policy`. Central tests contain
zero direct `@/` imports (Codex R3 AST scan). A single `paths` map cannot
resolve several owners' `@/`; Vitest resolves by importing file.

## E35. Oxlint native suppressions: stale and growth both fail; subset prune is safe

Fixture (no-debugger, `--suppress-all` over three files). A check without
`--fix` after one file's count dropped: exit 1, "There are suppressions that do
not occur anymore"; after a count rose: exit 1, "There are new violations not
covered by the suppressions file". `oxlint --prune-suppressions src/one.ts`
updated only one.ts's entry (2→1), left the others (including a stale one)
untouched, and a check of one.ts + two.ts then passed. Owners can therefore
prune exactly their own files; unpruned stale entries of other files fail only
when those files are checked (whole-repo gate).

## E36. Rule metadata is machine-readable

`oxlint --rules --format=json` (1.94.0): 872 rules with `scope`, `value`,
`category`, `type_aware` (61 true — the TSRS/tsgolint set) and `fix` kind
(none 458, pending 77, fixable_fix 130, conditional_fix 45, suggestion and
dangerous variants). JS overrides (all type-aware rules off) and the autofix
classification can be generated from this list instead of hand-maintained.

---

# Part: Coordinator evidence addendum (executed during round 4) (`evidence-r4-addendum.md`)

## E37. A narrow fix policy run at the ledger's cwd wipes the file's ledger entry; a private cwd does not

Fixture: `src/one.ts` with one each of no-debugger, curly, prefer-const;
ledger via `--suppress-all` under the full config (all three rules).

- `oxlint -c fix.json --fix src/one.ts` from the repository cwd (fix config =
  curly + prefer-const only): the ledger became `{}` — the entry for the
  unobserved `no-debugger` rule was removed too.
- The same fix run from a separate empty cwd with absolute config and target
  paths: exit 0, fixes applied (braces, const), ledger byte-identical. A
  subsequent full check at the repository cwd reports the now-stale curly and
  prefer-const entries until the owner runs `--prune-suppressions` for that
  file under the full policy (E35: subset-safe).
  Conclusion: every fixer runs from a private cwd while a ledger exists; only an
  explicit owned-file prune under the policy that produced the ledger writes it.

## E38. Core's type-import style

`git grep` over apps/packages/tests/scripts: 1,768 lines `import type { … }`
(top-level) vs 218 single-line inline `import { …, type X }` lines plus ~797
continuation lines of multi-line imports containing `type X`. Ultracite core
sets `import/consistent-type-specifier-style: ["error","prefer-top-level"]`
and `typescript/consistent-type-imports: "error"`. The majority convention is
top-level; under `verbatimModuleSyntax: true` an inline-only type import still
emits a runtime (side-effect) import, while `import type` does not.

## E39. Root devDependency at the owner's exact version keeps runtime identity and real types

Disposable worktree: `bun add -d --exact @ui-sdk/core@0.1.0-beta.2` (the
version `packages/ui` declares). `realpath(node_modules/@ui-sdk/core)` equals
`realpath(packages/ui/node_modules/@ui-sdk/core)` (same `.bun` store entry), so
Vitest's runtime pin and the root resolution are one physical package. A probe
under `tests/` with `import { setPlatform } from "@ui-sdk/core/testing";
setPlatform("invalid-control");` compiled with the native 7.0.2 compiler
reports `TS2345: Argument of type '"invalid-control"' is not assignable to
parameter of type '"apple" | "other"'` — package `exports` resolution with real
types, unlike the TS7016 implicit-any that a `paths` copy of the Vitest file
pin produced (Codex R4).

---

# Part: Coordinator evidence addendum (executed between rounds 4 and 5) (`evidence-r5-addendum.md`)

## E40. Central-test ownership by transitive `@/` closure

Script `SCRATCH\qual\scripts\test-owner-graph.mjs` (classic TS
`preProcessFile`, static + dynamic imports; relative, `@/` per containing
workspace's `paths`, `@payload-config`, and `@asym/*` via each workspace's
`exports`) over all 1,788 tracked code files under `tests/` at e6a5ce81a.
Output `SCRATCH\qual\out\test-owner-graph.json`.

- Files whose closure reaches a file that uses `@/`: 51 (admin 21, donor 22,
  missionary 7, packages/ui 1); 1,737 reach none. **Zero files need more than
  one owner's `@/`.**
- Only 26 product files using `@/` are reachable from tests at all.
- Every owned file lies under its owner's directory partition
  (`tests/unit/apps/<app>/…`, `tests/unit/packages/ui/…`) except two:
  `tests/fixtures/base-ui-compliance/workspace-main.tsx` (missionary, via
  `apps/missionary/app/_providers/missionary-layout-shell.tsx`) and
  `tests/unit/acceptance/issue-2364/donor-pages.acceptance.test.tsx` (donor,
  via `workers-client.tsx`).
- Files that import another app's sources but reach no `@/` (e.g.
  `tests/unit/cms/public-content.test.ts`, `public-page-media.test.tsx`,
  `tests/unit/packages/ui/base-ui-select-nullability.test.tsx`,
  `searchable-select-consumer-null-policy.test.tsx`) need no `@/` mapping and
  compile in any program; an "imports another app" ban is the wrong rule.
- Only one internal specifier did not resolve
  (`@asym/database/collections/support-hub`); about 60 test imports point at
  workspace `node_modules` by relative path (resolved by TS to adjacent
  declarations).
- Specifiers unresolvable from the root `node_modules` (Bun isolated store):
  `payload`, `@payloadcms/db-postgres`, `@tanstack/react-query`,
  `@ui-sdk/core/testing`, `stripe`, `zod`, `@supabase-labs/tanstack-db`,
  `@sentry/nextjs`, `web-vitals`, `recharts`, `@tanstack/react-table`,
  `@stripe/stripe-js`, `nuqs/adapters/react` (already mapped in the Base UI
  fixture config), Node built-ins without `node:` in `tests/e2e`, the Vite
  virtual module `virtual:base-ui-styles`, plus workspace packages not linked
  at the root (`@asym/missionary`, `@asym/mock-data`, `@asym/eve-runtime`).

## E41. Owner-resolved declaration paths give real types and one identity, with no manifest change

Script `SCRATCH\qual\scripts\gen-owner-paths.mjs`: for each specifier above,
`ts.resolveModuleName(spec, <workspace>/__owner_probe__.ts, <workspace
compilerOptions>)` from **every** workspace that declares the package. All 12
resolve to exactly one declaration file across all declaring workspaces (e.g.
`@tanstack/react-query` from six workspaces → one `.bun` store
`build/modern/index.d.ts`; `zod` from eight → one `index.d.cts`). A probe
program outside the repository whose `paths` map each exact specifier to that
file, compiled with the native 7.0.2 compiler:

- `setPlatform("invalid-control")` → TS2345 (`"apple" | "other"`); payload
  `CollectionConfig` slug number → TS2322; `Stripe.Customer["id"] = 5` →
  TS2322; `z.string().parse()` into `number` → TS2322 (real types).
- `invalidateSupabaseTableQuery(new QueryClient(), …)` — `QueryClient` from the
  mapped path passed to `packages/database/query-keys.ts`, which imports it
  normally — compiles clean (one type identity, because both resolve to the
  same real file).
  No root `package.json`/`bun.lock` change, so no Shadscan/React Doctor proof
  churn and no GraphQL 16/17 or TanStack runtime-identity exposure.

## E42. A report-only Oxlint check never writes the ledger

Fixture copy (`fx/supp4`; ledger with three files) and the flags
`-c … --no-error-on-unmatched-pattern --disable-nested-config --deny-warnings`
at the ledger's cwd, **without** `--fix`: a stale count (exit 1, "suppressions
that do not occur anymore"), a matching file (exit 0), an all-ignored target
(exit 0), and growth (exit 1, "new violations not covered") all leave the
ledger byte-identical (sha256 prefix `9a3832ab88b57298` throughout). With E37
(private-cwd fix keeps the ledger) and E35 (owned-file prune is subset-safe),
the only ledger writer can be an explicit owned-file prune.

## E43. Repository facts used by plan v4

- Workspace graph: `env`, `email` are leaves; `database → env`;
  `auth → database, env`; `config → env`; `lib → auth, database, env`;
  `ui → auth, database, lib`; `api → auth, config, database, email, env, lib, …`.
  A single shared predicate owner in `@asym/lib` cannot serve auth, database,
  env, email or config.
- `lint:ui` = `node tooling/eslint-config/lint.mjs`.
- Ultracite's Oxfmt preset spreads `ignorePatterns` from
  `ultracite/config/shared/ignores.mjs` (incl. `**/*.generated.*`,
  `**/dist`, lock files) and enables `sortImports` and `sortTailwindcss`;
  Oxfmt has no `extends`. Tracked files hit by those ignores:
  `packages/database/types/currency-foundation.generated.ts` and vendored
  `vendor/react-pdf-packages/*/dist/**`. The currency generator writes raw
  template bytes; the committed file is the Prettier-formatted form.
- Codex hooks (learn.chatgpt.com/docs/hooks, redirected from
  developers.openai.com/codex/hooks): commands run with the **session cwd**;
  `commandWindows` is an optional Windows override; PostToolUse input carries
  `tool_input.command` for `apply_patch`; exit 2 + stderr is feedback.

## E44. `.mts` configs and modules load; explicit `sortImports:false` holds

Fixture `SCRATCH\qual\tools\fx\mtscfg` (Node 24.22.1, candidate toolkit):
`oxlint.config.mts` (`defineConfig` from `oxlint`) importing
`./tooling/layers.mts` (type annotations) is auto-discovered and enforces its
rules (curly, no-debugger reported, exit 1). `oxfmt.config.mts` spreading
`ultracite/oxfmt` with `sortImports:false, sortTailwindcss:false` is
auto-discovered; `--write` formats the file and leaves the unsorted imports
(`./b` before `./a`) in place.

---

# Part: Coordinator evidence addendum (executed during/after round 5) (`evidence-r6-addendum.md`)

## E45. Non-`@/` alias needs: `@payload-config` reaches seven tests, six in `tests/unit/cms`

`SCRATCH\qual\scripts\test-alias-graph.mjs` (E40 traversal extended to record
every workspace `paths` alias by specifier and target). Tests whose closure
reaches `@payload-config` (→ `apps/admin/payload.config.ts`):
`tests/unit/apps/admin/web-studio-preview-page.test.tsx` (also Admin `@/`) and
six under `tests/unit/cms/` (`payload-route-database-guard`, `public-content`,
`public-missionary-project-pages-route`, `public-navigation-route`,
`public-pages-route`, `public-updates-route`). No specifier needs two
different targets anywhere (the one "conflict" row is `@/`→admin plus
`@payload-config`→admin). Confirms Codex R5 HG3: exact alias mappings must be
emitted per program from (specifier, target) needs, not by owner directory.

## E46. Strict-build wrapper and UI lint facts

- `scripts/verify/ci-build.mjs` builds fresh Turbo argument arrays and spawns
  with `{ ...process.env, ...environment }` (line 202–205); it forwards no
  `--force` (Codex R5).
- `tooling/eslint-config/lint.mjs` supports `--raw` (temporary private copy
  without suppressions, line 175) and `--prune-suppressions`; its default
  target list covers six workspaces (line 89; `design-system.mjs:14`).

## E47. Root-located entry config from a private cwd: overrides and ignores apply; `extends` does not carry ignores; env-selected policy fails closed

Fixture `SCRATCH\qual\tools\fx\rootcfg` (fake root): root `oxlint.fix.config.mts`
(`ignorePatterns: ["**/dist/**"]`, override `files: ["tests/unit/**"]` enabling
`curly`, `extends: [base]` where `tooling/base.mts` declares
`ignorePatterns: ["**/gen/**"]`, policy selected by `CORE_FIX_POLICY`). Run from a
fresh temp cwd with absolute `-c` and absolute targets:

- `vendor/x/dist/a.js`: ignored (no findings) and byte-unchanged under `--fix`.
- `tests/unit/a.test.ts`: `curly` reported and fixed; `src/b.ts`: `curly` not
  applied (override scoped correctly), unchanged under `--fix`.
- `gen/c.ts`: **reported** — the extended config's `ignorePatterns` are not
  inherited (Gemini R5 F1); ignores must be declared on the root entry config.
- Without `CORE_FIX_POLICY` the config throws at load (fails closed).
  Together with Codex/Gemini R5 (subfolder `-c` configs make root-relative
  overrides and ignores inert), every `-c` entry point must live at the root.

## E48. React Doctor ledger is ungated and already stale on develop; acceptance pins have an amendment convention

- No hook, preflight stage or CI job runs `react-doctor:check`; the open
  `make-react-doctor-advisory` proposal (unratified) records 182/254 records
  stale on develop, 536 unrecorded diagnostics, and `react-doctor:check`
  stopping at an evidence-hash mismatch.
- Acceptance suites pin bytes and workflow fingerprints and amend them with a
  reviewed entry and comment when an authorized change moves them (e.g.
  `issue-2153/ci-workflow.acceptance.test.ts:198-202` "Amended by AL-2674 … with
  that line put back, this fingerprint is the reviewed 4ba5d2d04cd567d3";
  `issue-2155/postgres-ecr-gates.acceptance.test.ts:336-351` appended surface
  entries). Byte pins of protected files exist, e.g.
  `issue-2364/static.acceptance.test.ts:122-129` (`donate.ts` + three tests).

## E49. One hook command string works in PowerShell and Git Bash from a subdirectory

`node "$(git rev-parse --show-toplevel)/tooling/quality/agent-hook.mts" claude`
run from `apps/admin` in PowerShell 7 and in Git Bash both pass the absolute
root path (`<coordinator worktree>/tooling/quality/agent-hook.mts`) and `claude` to Node
(`$(…)` is a subexpression in both shells). The command needs no environment
variable and resolves the checkout of the session's working directory, so a
session working in a worktree targets that worktree.

---

# Part: Evidence addendum for round 7 (plan v6) (`evidence-r7-addendum.md`)

## E50. Mock transport facts: Vitest unstub semantics and the stripe-node loopback recipe [X]

**Vitest 5.0.5** (`node_modules/.bin/vitest --version` → `vitest/5.0.5 win32-x64 node-v24.22.1`).
Fixture `SCRATCH\qual\fx-r7\vitest-unstub` (`unstubGlobals: true`, `globals: true`):

- `setup.mjs` installs a deny-all `fetch` with `Object.defineProperty` (not `vi.stubGlobal`).
- `stubbed-first.test.mjs`: test 1 stubs a recorder with `vi.stubGlobal`; test 2 calls `fetch`
  and gets `DENY-ALL network: …`. The setup deny-all is what unstubbing restores.
- `stubglobal-deny.test.mjs`: a **module-level** `vi.stubGlobal("fetch", …)` is already undone
  before the first test; the second test logs
  `SECOND-TEST fetch error: DENY-ALL network: http://127.0.0.1:1/`, i.e. the module-level stub is silently discarded and the setup
  deny-all applies. Consequence: module-level and `beforeAll` stubs must move into
  `beforeEach` or the test body (plan §4.7); a deny-all installed through `vi.stubGlobal` would
  be restored to the real `fetch` (fails open).
- Command: `node_modules/.bin/vitest run --root <fixture> --config <fixture>/vitest.config.mjs --reporter=verbose`
  from the Core worktree. 4/4 tests pass.

**stripe-node 22.2.0** (installed path `node_modules/.bun/stripe@22.2.0+664724dec0ad8d9e`).
Script `SCRATCH\qual\fx-r7\stripe-loopback.mjs <core-root>` resolves `stripe` from
`packages/api`, starts a `127.0.0.1` HTTP recorder, and constructs
`new Stripe(sk_test_…, { apiVersion, host: "127.0.0.1", port, protocol: "http" })`.
`customers.create({ email }, { stripeAccount: "acct_tenantA", idempotencyKey: "idem-1" })`
returns the recorder's object, and the recorder sees `POST /v1/customers`,
`Authorization: Bearer sk_test…`, `Stripe-Account: acct_tenantA`,
`Idempotency-Key: idem-1`, `Stripe-Version: 2025-01-27.acacia`, form body
`email=a%40example.test`. Core's factory today is
`packages/api/src/stripe/client.ts:5-7` (`new Stripe(secretKey, { apiVersion })`), so the
recipe adds only validated `host`/`port`/`protocol` options under the test-only guard.

---

# Part: Evidence addendum for round 8 (plan v7) — coordinator reproductions of round-7 findings (`evidence-r8-addendum.md`)

## E51. Env-validation skip defeats a schema-only guard [I]

`packages/env/src/schema.ts:414-416` sets `skipValidation` when `SKIP_ENV_VALIDATION` is `1`/`true`;
`vitest.config.mts` `test.env` sets `SKIP_ENV_VALIDATION: "1"` (reviewers also cite
`playwright.config.ts:64`, `ci.yml:220`, `release.yml:178`, `qa-smoke-preview-deploy.yml:739`).
Core's own defence in depth for `E2E_AUTH_BYPASS` (`schema.ts:430-441`) is a separate runtime check.
`vitest.config.mts` sets `clearMocks: true` only — no `unstubGlobals`/`unstubEnvs`.
`packages/api/src` never passes `stripeAccount`; tenant isolation is the per-tenant secret key with no
platform-key fallback for a missing tenant (`packages/api/src/stripe/tenant-client.ts:16-18`).

## E52. tsconfig `include` has no brace expansion [X]

Fixture `SCRATCH\qual\fx-r8\brace` (`src/a.ts`, `src/b.mts`): `"include":["**/*.{ts,mts}"]` →
`error TS18003: No inputs were found` (exit 1, classic 6.0.3; Codex R7 reports the same on 7.1.0-beta);
`["**/*.ts","**/*.mts"]` lists both files, exit 0.

## E53. A bare PowerShell `if` wrapper loses the hook's exit 2 [X]

`SCRATCH\qual\fx-r8\exit2.mjs` writes to stderr and exits 2.
`powershell -NoProfile -Command "$f = …; if (Test-Path $f) { node $f codex }"` → exit **1**;
adding `; exit $LASTEXITCODE` inside the block → exit **2**; absent file → exit 0.

## E54. Oxlint 1.94 targeted prune also drops entries of deleted, unnamed paths [X]

Fixture `SCRATCH\qual\fx-r8\prune` (`no-debugger`, three files): `--suppress-all a.js b.js c.js`, then
delete `c.js`, repair `b.js`, run `oxlint --prune-suppressions b.js` → exit 0 and the ledger keeps only
`a.js`: the `c.js` entry was removed although `c.js` was not named. A report-only run over `a.js b.js`
exited 1 (stale `b.js`).

## E55. Next generated validator is outside the product app programs [I]

`apps/{admin,donor,missionary}/tsconfig.json` include `".next/types/**/*.d.ts"` only (TS wildcards skip
dot-directories, so `**/*.ts` does not reach `.next/`); `apps/factory-console/tsconfig.json:31-32`
already includes `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`. Each app's `typecheck` script is
`tsc --noEmit` (no `next typegen`). `next/dist/cli/next-typegen.js:104,131` writes
`<distDir>/types/validator.ts`. Codex R7 placed a TS2322 in Admin's `validator.ts`: exit 0 until
`.next/types/**/*.ts` was included.

## E56. Existing disable directives at base [X]

`git grep -E "(eslint|oxlint)-disable"` over authored JS/TS (excluding `docs/**`): 267 directives in 141
files; 251 carry a `--` reason; 13 are file-wide. By rule: `no-restricted-imports` 230,
`@typescript-eslint/no-explicit-any` 9, `shadcn/no-inline-styles` 2, `import-x/no-duplicates` 2,
`@typescript-eslint/consistent-type-imports` 2, `@next/next/no-img-element` 2, others 1 each
(`react-hooks/refs`, `react-hooks/exhaustive-deps`, `no-control-regex`, …).

## E57. Git blob-id pins and stub inventory (round-8 checks) [X/I]

- `tests/unit/acceptance/issue-2258/harness.ts:36-54` `UNEDITED` pins seven paths by 40-hex git blob id
  (`git ls-tree 88eefbd9 <path>`): `tests/unit/auth/membership-rpc-contract.test.ts`,
  `tests/unit/packages/api/auth/get-auth-context-request-propagation.test.ts`,
  `tests/unit/security/authz-definer-execute-grants.test.ts`, three `issue-2270` files and
  `packages/api/src/projection/types.ts`; asserted by `rpc-contract.acceptance.test.ts:517-521` (A R8).
- `git grep -c 'vi.stubGlobal('` over `tests packages apps`: 469 calls in 194 files (all globals, all scopes).
  v7's "stubGlobal (18) / spyOn (49) / direct (15)" mixed scopes; the seam inventory must be generated.

---

# Part: Evidence addendum for round 9 (plan v8) (`evidence-r9-addendum.md`)

## E58. `next typegen` qualification on all four apps, TS 7.1-beta [X]

Disposable `SCRATCH\qual-wt` hard-reset to `e6a5ce81a` (0 tracked changes; TS 7.1.0-beta installed).
For each of admin, donor, missionary, factory-console: `rm -rf .next/types`, then
`env -i PATH SYSTEMROOT TEMP TMP USERPROFILE APPDATA LOCALAPPDATA CI=true node ../../node_modules/next/dist/bin/next typegen`
(no service variables, no `.env` files) → exit 0, "Types generated successfully"; writes
`.next/types/{cache-life.d.ts,root-params.d.ts,routes.d.ts,validator.ts}`. Tracked drift afterwards: 0 files
(`apps/{admin,donor}/public/maplibre` output is already git-ignored).
A scratch `tsconfig.typegen-check.json` per app (extends `tsconfig.json`, adds `.next/types/**/*.ts`):
`--listFilesOnly` lists `validator.ts` in every app; `tsc --noEmit` (7.1.0-beta): donor, missionary,
factory-console exit 0; admin exit 2 with exactly the five known TS2883 sites (E11; repaired in TS-1),
zero diagnostics in `.next/types`. Logs: `SCRATCH\qual\fx-r9\{typegen,tsc}-<app>.log`.

## E59. A shell-agnostic Node hook launcher [X]

Fixture `SCRATCH\qual\fx-r9\hook` (a git repo whose `tooling/quality/agent-hook.mts` echoes the payload path as
Claude-style JSON on stdout with exit 0). Launcher (`boot.js.txt`, 422-character command):
`node -e "<walk up from cwd to .git (dir or gitfile); exit 0 if none or if tooling/quality/agent-hook.mts is absent;
spawnSync(process.execPath, [hook, harness], { stdio: 'inherit', cwd: root })>" claude` — no `$`, backticks or
double quotes inside the script. Run from `apps/admin/src` with `GIT_DIR=/nonexistent` and a Cursor-style
`{ "tool_input": { "path": … } }` payload on stdin:

- Git Bash, Windows PowerShell 5 (`powershell -NoProfile -Command`), PowerShell 7 (`pwsh`), and `cmd.exe`
  (via Node `spawnSync(cmd, { shell: "cmd.exe" })`): JSON on stdout, exit 0, root found without git.
- Adapter absent (older branch): exit 0, no output.
  (A direct `cmd //c` call from Git Bash mangles the quotes; that is MSYS argument conversion, not a harness path.)

## E60. The incumbent ESLint shadcn ledger [I]

Every workspace `lint` script runs `node ../../tooling/eslint-config/lint.mjs` (Factory Console with explicit
paths), which runs ESLint with `--suppressions-location tooling/eslint-config/suppressions.json`, validates the
file, runs `health.mjs`, and supports `--raw` (empty ledger) and `--prune-suppressions`. The ledger holds 1,703
counts in 108 files, all `shadcn/*` (`no-restyle` 1,329, `no-raw-colors` 244, `no-arbitrary-values` 103,
`require-static-classes` 17, `no-unknown-classes` 6, `no-inline-styles` 4). The shadcn layer lives in
`tooling/eslint-config/design-system.mjs` (plus exceptions and patches).

## E61. One non-discoverable UI-bridge config reproduces the incumbent ledger exactly [X]

Fixture `SCRATCH\qual\fx-r10\bridge.config.mjs` (placed at `qual-wt/tooling/eslint-config/bridge.config.mjs`, qual-wt at
base `e6a5ce81a`): repo-root `basePath` ignores (base.mjs list plus `.eve/vercel-services`, `.vercel/output`),
`@typescript-eslint/parser` with JSX for TS files and JSX parsing for JS, the retired `@typescript-eslint`, `react-hooks`
and `unused-imports` plugins **registered with every rule off** (so legacy inline directives resolve),
`reportUnusedDisableDirectives: "off"`, then `designSystemConfig()` (which already scopes each UI workspace by `basePath`).
`eslint --config tooling/eslint-config/bridge.config.mjs` over the six UI workspaces (ESLint 10.13.0):

- with `--suppressions-location tooling/eslint-config/suppressions.json`: exit 0, zero messages, 120 s on Windows;
- with an empty ledger: 1,703 `shadcn/*` findings in 108 files — `no-restyle` 1,329, `no-raw-colors` 244,
  `no-arbitrary-values` 103, `require-static-classes` 17, `no-unknown-classes` 6, `no-inline-styles` 4 — identical per rule to
  the ledger; zero fatal parse errors; zero non-shadcn messages (no "Definition for rule … was not found").

## E62. Directive ownership between the two engines [X]

**Oxlint 1.94** (`configuration_schema.json:17249`, `OxlintOptions.respectEslintDisableDirectives`, root config only,
default `true`). Fixture `SCRATCH\qual\fx-r10\oxlint-directive-ownership` with `--report-unused-disable-directives-severity=error`:

- `true`: an `eslint-disable-next-line shadcn/no-inline-styles` in `ui.tsx` is reported "Unused eslint-disable directive" (exit 1).
- `false`: Oxlint ignores every `eslint-*` directive — the shadcn directive is not reported, and an `eslint-disable` for an
  Oxlint rule no longer suppresses it (`no-debugger` reported); `oxlint-disable` still suppresses, and a stale `oxlint-disable`
  is still reported.

**ESLint UI bridge** (`SCRATCH\qual\fx-r10\bridge.config.mjs`, updated from E61): `reportUnusedDisableDirectives: "error"` for
all files, `"off"` only for the vendored `reuiDataGridFiles` (basePath `packages/ui`). Gated run over the six UI workspaces:
exit 1 with exactly two reports — `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/relationship-filter-options.ts:129`
(`react-hooks/exhaustive-deps`) and `packages/ui/components/shadcn/data-table/types.ts:164` (`@typescript-eslint/no-unused-vars`,
`unused-imports/no-unused-vars`). The two `shadcn/no-inline-styles` directives (`apps/admin/app/(payload)/layout.tsx:168`,
`packages/ui/components/shadcn/chart.tsx:114`) are live (not reported). The vendored `data-grid.tsx:202,966,977` directives are
exempt; no "definition not found" errors.

## E63. The UI bridge needs no retired plugin after CT-0a's conversion [X]

In `SCRATCH\qual-wt` (base), CT-0a's directive work was simulated on the six UI workspaces: every non-shadcn `eslint-disable*`
**and `eslint-enable*`** comment outside the vendored ReUI files became `oxlint-*`, and the inline configuration comment
`/* eslint react-hooks/refs: "error" */` (`apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:4`, AL-1958) was removed
(the plan ports it to an Oxlint override). Files touched by the simulation: `SCRATCH\qual\fx-r11\simulated-ct0a-files.txt`
(the simulation also hit `apps/missionary/.eslint-missionary.json`, a tracked report artifact — the real conversion is limited to
JS/TS-family sources). Base inventory of non-shadcn ESLint comments in the UI workspaces: `importMap.js:1` (generated),
`relationship-filter-options.ts:129`, `checkout-client.tsx:4` (inline config) and `:2341`, `data-table/types.ts:164` (block
disable) with its `eslint-enable` at `:180`, and the vendored `data-grid.tsx:202,966,977`.
Config `SCRATCH\qual\fx-r11\bridge-noplugins.config.mjs`: imports only `@typescript-eslint/parser`, `design-system.mjs` and
`reui-data-grid-exceptions.mjs`; repo-root ignores; TS/JSX parsing; `reportUnusedDisableDirectives: "error"`; for the 9 vendored
ReUI files only, an **inline no-op stub plugin** (`"@typescript-eslint": { rules: { "no-explicit-any": { create: () => ({}) } } }`)
so their upstream comments resolve, with unused-directive reporting off there; then `designSystemConfig()`.

- Gated (incumbent ledger): exit 0, **zero messages**.
- Raw (empty ledger): 1,703 `shadcn/*` findings in 108 files, identical per rule to the ledger; zero fatal.
- Stale-directive control: a file holding only `// eslint-disable-next-line shadcn/no-raw-colors` fails (exit 1, unused directive).
  So `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks` and `eslint-plugin-unused-imports` can be removed at CT-0a
  with the general ESLint machinery; the bridge keeps only `eslint`, `@typescript-eslint/parser` and `@shadcn/lint` (+ patch).

---

# Part: Evidence addendum, round 10 (E64–E69) (`evidence-r10-addendum.md`)

Executed by the coordinator on 2026-11-19 while round 10 ran and after its first two reviews returned. Fixtures:
`SCRATCH\qual\fx-r11\`. Base for repository facts: Core `e6a5ce81a` in the coordinator checkout; `origin/develop` was
`182eb0338` when these were recorded. E63 (the bridge without retired plugins) is in `evidence-r9-addendum.md`.

## E64. Oxlint carries the checkout's `refs` protection natively [X]

Ultracite 8.3.0's React preset sets `"react/refs": "error"` (`ultracite/config/oxlint/react/index.mjs:100`).
Fixture `SCRATCH\qual\fx-r11\refs` (Oxlint 1.94.0, config: React plugin, `react/refs: error`,
`options.respectEslintDisableDirectives: false`, `--report-unused-disable-directives-severity=error`):

- a seeded ref read during render is reported (`a-seeded.tsx:4:17 Cannot access refs during render`);
- `// oxlint-disable-next-line react/refs -- …` suppresses it, and so does the alias form
  `// oxlint-disable-next-line react-hooks/refs -- …`; neither is reported as unused;
- `// eslint-disable-next-line react-hooks/refs` does **not** suppress it (the directive-ownership rule, E62).
  On the real file `apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx` at base:
- with ESLint directives ignored, Oxlint reports exactly one finding, `2342:61 Cannot access refs during render`, the
  same site the ESLint rule reports (round-10 reviewer A reproduced the ESLint side);
- with ESLint directives respected (Oxlint's default), zero findings.
  So the AL-1958 inline configuration comment on line 4 (`/* eslint react-hooks/refs: "error" */`) can be replaced by a
  root-relative Oxlint override for that file in the transition entry (the full entry already has the rule), and line 2341
  becomes an `oxlint-disable-next-line react/refs` directive. The protection is kept and proved by a seeded control.

## E65. ESLint 10.13.0 suppression ledger: subset prune, deleted files, renames [X]

Fixture `SCRATCH\qual\fx-r11\eslint-supp` (flat config, `no-var: error`, `--suppressions-location supp.json`; three files
seeded with `--suppress-all`).

| Case                                                                                                                      | Result                                                          |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| One of two violations fixed in `a.js`, gate without prune                                                                 | exit 2, "There are suppressions left that do not occur anymore" |
| `--prune-suppressions a.js` (subset)                                                                                      | `a.js` count 2→1; the `b.js` and `c.js` entries are untouched   |
| A violation added beyond the count                                                                                        | exit 1                                                          |
| `c.js` deleted, whole-directory gate without prune                                                                        | **exit 0, no message**: the dead key is accepted                |
| `--prune-suppressions b.js` after `c.js` was deleted                                                                      | the unnamed `c.js` key is **removed**                           |
| Suppressed `b.js` renamed to `b2.js`, violation kept                                                                      | reported as a new error                                         |
| Suppressed `b.js` renamed and cleaned                                                                                     | **exit 0**; the `b.js` key stays as a dead key                  |
| Consequences for the UI bridge: a subset prune is safe for files that exist; ESLint itself neither rejects a ledger key   |
| whose file is gone nor limits a prune to the named paths. `lint.mjs` must check that every ledger key exists on disk, and |
| a path-limited prune must be verified to have changed only keys under the named paths.                                    |

## E66. A process-wide network guard reaches every Node and Bun descendant without a spawn helper [X]

Fixture `SCRATCH\qual\fx-r11\childguard` (Vitest 5.0.5, Node 24.22.3, Bun 1.4.3, Windows): one module, `preload.mjs`,
installs the deny-all `fetch` and a `net.Socket.prototype.connect` guard and appends each refusal to the file named by
`CORE_TEST_REFUSAL_LOG`. The Vitest setup file imports that module (in-process guard), appends
`--import <file URL of the module>` to `process.env.NODE_OPTIONS`, sets `BUN_OPTIONS=--preload <path>`, and deletes
sample service variables from `process.env`. Tests then use **raw** `spawnSync`/`execFile`:

1. a child's `fetch` is refused (child exit 7) and one refusal is recorded;
2. a child that catches its refusal exits 0, and the refusal is still in the record, with the child's pid;
3. a grandchild (Node spawning Node) is refused and recorded;
4. a raw socket to `127.0.0.1:54321` in a child is refused (`DENY-ALL network (socket): 127.0.0.1:54321`);
5. a child `fetch` to a parent's local server is refused until the port is added to `CORE_TEST_LOOPBACK_PORTS`
   in `process.env`, and then succeeds;
6. **limit:** a child started with an environment built from scratch (`env: { PATH, SystemRoot }`) has no preload;
7. a Bun child is refused through `BUN_OPTIONS`. On Windows the preload path must use forward slashes: with
   backslashes Bun reports `preload not found "C:Users<user>…"`;
8. the in-process `fetch` is denied by the same module.
   8 of 8 pass. `net.connect()` passes one normalized array to `Socket.prototype.connect`, so the guard must read
   `args[0][0]` when `args[0]` is an array (the first prototype missed that and refused registered ports).
   **Non-Node children** (executed from a shell with `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` and their lowercase forms set to
   `http://127.0.0.1:9`, a closed port, and `NO_PROXY=127.0.0.1,localhost,::1`): `git ls-remote https://github.com/…` fails in
   under a second (exit 128, "Failed to connect … over proxy 127.0.0.1"); `curl https://example.com` fails (exit 7); a Bun
   `fetch` fails with `ECONNREFUSED`; a Node `fetch` **ignores** the proxy variables (status 200), so Node children depend on
   the preload. Tools that speak other protocols (psql) are not affected by proxy variables and rely on the cleaned environment.
   Consequence: `tests/support/spawn.ts` and `core/no-raw-test-spawn` are not needed, the 65 acceptance files that spawn
   processes (91 call lines; "Owned by Acceptance") need no edit, and children started by code under test are covered.

## E67. `vitest list --json` on the base tree [X/I]

Reviewer G executed `vitest list --json` over the whole repository at base: exit 1, empty stdout, 43 s; `--filesOnly`
exits 0 in 2 s. The coordinator confirmed both causes by inspection:

- `tests/unit/packages/api/missionary-directory.test.ts` is a one-line file,
  `import "../../../../packages/api/tests/unit/missionary-directory.test";`, added in `26302de8a`; the package test it
  imports is already collected directly by the root `vitest.config.mts` include;
- `tests/unit/scripts/supabase-migrations.test.ts` defines only top-level `itPosix` cases
  (`const itPosix = process.platform === "win32" ? it.skip : it`, line 36), with no `describe`, so on Windows the file
  has no collectable suite.
  Also from the reviewer [X]: Vitest 5 `--json` takes an optional file argument, so file filters must come before it
  (`vitest list <files> --json`); `describe.skipIf` suites list no test IDs when their gating variable is absent; a file in
  `test.exclude` selected on the command line gives "No test files found" (exit 1) before any setup file runs; adding
  `exclude` without spreading `configDefaults.exclude` drops the default `**/node_modules/**` exclusion.

## E68. Repository facts checked for round 10 [I]

- App scripts at base: `typecheck` is `tsc --noEmit` in all four apps; `lint` is `node ../../tooling/eslint-config/lint.mjs`
  (Factory Console passes `src tests next.config.ts playwright.config.ts vitest.config.ts`).
- `turbo.json` exists in `apps/{admin,donor,missionary}`, `packages/{eve-runtime,missionary,ui}` and
  `tooling/eslint-config`; `apps/factory-console` has none.
- `"incremental": true` is set in `tooling/typescript-config/base.json:18`, `nextjs.json:23` and
  `apps/factory-console/tsconfig.json:14`.
- `scripts/verify-eslint-config.mjs:308-311` runs `verifyDesignSystemHealth` once for the root and once per UI workspace
  (seven runs).
- `.husky/pre-commit` is `bunx lint-staged --concurrent false --no-stash --no-hide-partially-staged` followed by
  `bun run verify:shadscan -- --staged`; `.husky/pre-push` is `node scripts/git/pre-push.mjs "$@"`.
- 25 tracked `*.realstack.*` / `*.integration.*` test files. 65 files under `tests/unit/acceptance` contain a
  process-spawn call (91 lines); 131 other test files import `node:child_process`.
- Two Stripe suites call the real Stripe test API when `STRIPE_SECRET_KEY` is set:
  `packages/api/tests/unit/donate-payment-intent.stripe-live.test.ts` and `donate-checkout-elements.stripe-live.test.ts`.
- A frozen `bun install` of a fresh worktree took 105 s here (`SCRATCH\qual-wt-install.log`).

## E69. Owner-directed quality work in flight on 2026-11-19 [I]

`origin/develop` moved from `e6a5ce81a` to `182eb0338` (#2718 Next.js agent skills, #2720 membership authority,
#2721 factory Node 24.22.3). Open work that touches this plan's surfaces (GitHub, read on 2026-11-19):
<!-- prettier-ignore -->
| Item | State | What it changes | Effect on this plan |
|---|---|---|---|
| #2704 / PR #2723 `chore/AL-2704-react-doctor-advisory-apply` | PR open | React Doctor becomes an on-demand advisory report; `docs/qa/react-doctor/exceptions.json`, `react-doctor:check` and the ledger code are retired | No React Doctor record is ever rebound here (owner ruling 2026-11-18: never rebind or requalify React Doctor ledger records in any branch). RDL-1 and RDX-1 are dropped |
| #2706 / PR #2716 `chore/AL-2706-acceptance-pins-review-fixes` | PR open | Byte, fingerprint and diff-scope assertions leave the acceptance suites; structural workflow invariants stay | Most AP-1 workflow and byte-pin amendments disappear once it merges |
| #2707 (issue) | open, no PR yet | Shadscan leaves pre-commit, the local preflight and the required CI path; floors, policy file and `tooling/shadscan/findings.json` are retired (sections 1, 2 and 4 of `make-shadscan-advisory`). Section 3 (`jsx-a11y` in ESLint with a debt baseline) is **not ratified** and is split out | SR-1 and the hook's `verify:shadscan --staged` step exist only while the ledger does |
| #2710 (issue) | open | A fast pre-push profile; agent-harness edit hooks that format and lint the edited file through one shared script | Same surface as D11/WF-2 and `.husky/pre-push`: one owner is needed |
| #2711 (issue) | open | Acceptance tests run once; script and tooling tests scoped by path on PRs; shorter required integration path; one axe spec and `verify:shadcn-config` become required | Same files as §7.2 and the integration tier (`ci.yml`, `ci-integration.yml`) |
| #2709 / PR #2722 | PR open | The factory merges through a GitHub merge queue when one is required | `merge_group` events become routine; §7.2 already handles them |
| #2719 `chore/AL-2715-skills-quality-review-fixes` | PR open | Eight skills retired, others repaired | Skill inventory and audit records change under WF-5 and the skill-audit family |
The owner ruling on React Doctor (2026-11-18) is recorded in the owner's own notes, outside this repository.

---

# Part: Evidence addendum, ratification (E70 onward) (`evidence-r11-addendum.md`)

Recorded by the coordinator on 2026-11-19 between the end of round 10 and ratification. Repository facts were read from
GitHub and from fetched pull-request heads; nothing was checked out or changed.

## E70. Quality pull requests opened on 2026-11-19, after E69 [I]

`origin/develop` was still `182eb0338` at 12:45 UTC. Every pull request below was open, unmerged and based on `182eb0338`.
Three were opened after E69 was written.

<!-- prettier-ignore -->
| Item | Head (short) | What it changes | Effect on this plan |
|---|---|---|---|
| PR #2725, `chore(AL-2707)`: Shadscan advisory | `86b3e26b4` | Removes `verify:shadscan` from `.husky/pre-commit` (which then runs `lint-staged` only), from the preflight and from the required CI path. Deletes `tooling/shadscan/findings.json`, `tooling/shadscan/policy.json`, `scripts/verify/shadscan.mjs`, `scripts/verify/shadscan-policy.mjs` and four test files. Shadscan becomes an advisory report. | Once merged: no SR-1, no Shadscan rebinds, no `verify:shadscan --staged` hook step, no Shadscan checkpoint. Until then SR-1 is conditional, as D9 says. |
| The same PR adds the OpenSpec change `enforce-jsx-a11y-lint` | — | Section 3 of `make-shadscan-advisory`, moved into its own change on 2026-11-18. **Proposed, not ratified.** It would enforce `eslint-plugin-jsx-a11y` recommended rules through `@asym/eslint-config`, with a mapping from shared `packages/ui` components to native elements, an alias restriction, and a line-anchored debt baseline `tooling/eslint-config/a11y-debt-baseline.json`. Its non-goals include "Moving lint to Oxlint". Its task 2.5 expects the checkout file's `/* eslint react-hooks/refs: "error" */` comment to stay. | It targets the ESLint configuration that CT-0a retires and W-UI deletes, and it keeps an inline configuration comment that CT-0a removes. If the owner ratifies it, it has to be re-proposed on the Oxlint policy (the native `jsx-a11y/*` rules, the class-based directive contract, no new baseline), or sequenced before CT-0a and then migrated. This is an owner decision; D13 records it. |
| PR #2726, `ci(AL-2710, AL-2711)`: fast pre-push, edit hooks, CI scope | `df5d56645` | **Pre-push:** `.husky/pre-push` calls `scripts/git/pre-push.mjs`; routine pushes run a fast profile (format on changed files, affected lint and typecheck, verifiers selected by their inputs); `bun run ci:preflight` stays the full profile. **Edit hooks:** one shared script `scripts/agent-hooks/after-edit.mjs`, registered in `.claude/settings.json` (`PostToolUse`, matcher `Edit\|Write`, exec form with `${CLAUDE_PROJECT_DIR}`), `.codex/hooks.json` (`apply_patch`, `node "$(git rev-parse --show-toplevel)/…" codex`) and `.cursor/hooks.json` (`afterFileEdit`). The script runs Prettier `--write` on the edited files, then an ESLint report through the root `eslint.config.mjs` and `tooling/eslint-config/suppressions.json`; it applies no lint fix, never blocks, always exits 0, returns `hookSpecificOutput.additionalContext` to Claude Code and Codex and writes to stderr for Cursor. **CI:** `test-unit` becomes a three-shard matrix; acceptance stays its own job; the Shadcn configuration check moves into the required lint job. It also edits `scripts/verify/ci-build.mjs`, `ci-build-policy.mjs`, `ci-preflight.mjs`, `unit-tests.mjs`, `shadcn-diff.mjs` and `format-gate.contract.test.ts`, and adds the OpenSpec changes `speed-up-local-gates` and `rebalance-ci-test-scope`. It is stacked on #2725, which includes #2716. | The edit-hook surface, the pre-push profile and both workflow files now have a concrete owner in an open pull request. If it merges first: its script and registrations are the single edit hook; CT-0a must switch the script's Prettier and ESLint calls (it reads two files CT-0a deletes or changes); WF-2 adapts it instead of registering another hook; steps this plan adds to the unit-test job must run once per event, outside the shard matrix; the new verifiers must be entered in the fast profile's input table. |
| PR #2727, `test(AL-2708)`: API contracts against PostgREST | `409d98243` | Adds an advisory workflow `api-contract.yml`, `scripts/api-contract/stack.mjs`, live suites `tests/integration/api-contract/*.live.test.ts` under their own `vitest.config.mts`, and unit tests under `tests/unit/api-contract/`. | A third Vitest entrypoint with real loopback services. If it merges first, W-MOCK-SB registers its live suites in the integration-tier registry, TID-1 lists the entrypoint, and TS-2 gives `tests/integration/api-contract/` a test program. |
| PR #2723 (`AL-2704`), PR #2716 (`AL-2706`), PR #2722 (`AL-2709`), PR #2719 (`AL-2715`) | `31b7d55db`, `d199c14cf` | Unchanged since E69: all open. | As in E69. |

Read with `gh pr view`, `gh pr diff --name-only` and `git show <fetched head>:<path>` for the hook registrations, the hook
script, the pre-commit and pre-push hooks, the CI job list and the two proposals.

## E71. One wrapper on `net.Socket.prototype.connect` sees every Node client path [X]

Asked by the version 6 and 7 audit (finding V67-02): earlier plans hooked `tls.connect` as well as the socket prototype.
A probe replaced `net.Socket.prototype.connect` with a wrapper that records its target and throws before the original
runs, so nothing left the machine. Node v24.22.3 on Windows; the target host was `service.invalid`.

| Client call                            | Wrapper calls | Receiver class | Result                               |
| -------------------------------------- | ------------- | -------------- | ------------------------------------ |
| `net.connect({ host, port })`          | 1             | `Socket`       | refused                              |
| `net.createConnection(port, host)`     | 1             | `Socket`       | refused                              |
| `new net.Socket().connect(port, host)` | 1             | `Socket`       | refused                              |
| `tls.connect({ host, port })`          | 1             | `TLSSocket`    | refused                              |
| `http.request`                         | 1             | `Socket`       | refused                              |
| `https.request`                        | 1             | `TLSSocket`    | refused                              |
| built-in `fetch`, `https:`             | 1             | `TLSSocket`    | `fetch failed`, cause is the refusal |
| built-in `fetch`, `http:`              | 1             | `Socket`       | `fetch failed`, cause is the refusal |
| `net.connect` to `127.0.0.1:54322`     | 1             | `Socket`       | refused                              |

So the socket guard needs one hook, not two: TLS sockets inherit the wrapped method, and the HTTP agents and the
built-in `fetch` connect through it. The probe is `socket-hook-coverage.mjs`.

## E72. Oxlint 1.94.0 writes and silently honors `oxlint-suppressions.json` [X]

Asked by the same audit (finding V67-04). `oxlint --help` lists no suppression flag, but the flag exists. In an empty
directory with one file containing `debugger;` and a config that sets `no-debugger` to `error`:

- a plain run reports the error;
- `oxlint --suppress-all a.js` writes `oxlint-suppressions.json` in the working directory
  (`{ "a.js": { "no-debugger": { "count": 1 } } }`) and reports nothing for that rule;
- a later plain run in that directory no longer reports the error and prints no notice that a finding was suppressed;
- `--prune-suppressions` is accepted too.

A suppression file in a runner's working directory therefore hides findings without any sign in the output. The plan
has no Oxlint suppression file at any point, so its presence must itself be a failure, permanently and not only until
the UI cutover.

## E73. Prettier and Oxfmt on this change's own documents [X]

A rehearsal placed the change directory in a clean Linux clone of `develop` (`182eb0338`) and ran the repository's
gates on it. Nothing was committed.

- **Strict validation:** `openspec validate --strict` rejects a requirement whose text is longer than 500 characters.
  Five requirements in the first draft of the spec delta were; they were split, and the delta now has 15 requirements,
  each under 500 characters.
- **Table alignment:** Prettier 3.9.10 pads every cell of a Markdown table to its column's widest cell. The plan grew
  from 200,871 to 337,189 bytes and the council record from 84,879 to 177,326. With `<!-- prettier-ignore -->` before
  each table that would gain 1,500 characters or more (26 tables across three files), the plan is 205,767 bytes after
  formatting. The repository's ADRs already use that comment.
- **Oxfmt 0.79.0** with the planned options left seven of the eight Prettier-formatted files byte-identical, wide
  tables included, so it honors the same comment. It changed two lines in the evidence record: a code span broken
  across two lines inside a list item, which Prettier leaves at column 0 and Oxfmt indents. Both source lines were
  reflowed so that no code span crosses a line break.
- **Gates:** after those changes `openspec validate --strict`, `verify:openspec-deltas`, `prettier --check` on the
  directory and `vitest run tests/unit/docs` all passed.

## E74. Formatting the staged bytes closes the staging race [X]

Round-10 reviewer C found that a pre-commit hook which formats working-tree files and then stages them can stage an
edit the author never selected, if an editor or agent writes to the file between the guard and `git add`.
Fixture `SCRATCH\qual\fx-r12\staged-bytes` (a scratch git repository, Oxfmt 0.79.0, Windows). The prototype hook reads
each staged blob (`git cat-file blob`), formats those bytes (`oxfmt -c <config> --stdin-filepath=<path>`), writes the
result into the index (`git hash-object -w --stdin`, `git update-index --cacheinfo`), and touches the working-tree file
only if it still holds the staged content. It never runs `git add`.

- **Race case:** an unrelated line is appended to `a.ts` after the staged blob was read. The index then holds exactly
  the formatted staged bytes (`const a = { x: 1, y: 2, z: 3 };`), without the appended line; the working tree keeps
  the appended line; `git status` shows `MM a.ts`.
- **Normal case:** `b.ts` is formatted in the index and in the working tree, and is clean afterwards.
- **Ignore and type handling:** for a path matched by `.prettierignore`, stdin mode returns the input unchanged
  (exit 0); for an unsupported type (`notes.sql`) it exits 1 with "Unsupported file type for stdin-filepath".
- **Line endings:** with `core.autocrlf=true` a working file that differs from its blob only by CRLF has a different
  raw hash but the same `git hash-object --path=<file> <file>` hash as the staged blob, and `git checkout-index -f`
  writes the working file from the index with the conversion applied. The comparison and the refresh must therefore
  go through git, not through raw bytes.
- **Cost:** one stdin process per file took about 470 ms here (60 files, serial). The package's JavaScript API,
  `format(fileName, sourceText, options)`, formatted 600 small files in 86 ms in one process.
  Consequence: the staged runner formats staged bytes in process through the format adapter and stages only what it
  derived from them. A parity test must show that the adapter and the command-line formatter produce the same bytes.

## E75. The guard reaches a child whose environment was replaced [X]

The final check of plan v10 pointed out that E66 case 6 leaves a hole: a child started with an environment built from
scratch gets no preload, so "every descendant is guarded" was not true. Fixture `SCRATCH\qual\fx-r12\childguard2`
(Vitest 5.0.5, Node 24.22.3, Bun 1.4.3, Windows). The guard module now also wraps `spawn`, `spawnSync`, `exec`,
`execSync`, `execFile`, `execFileSync` and `fork` of `node:child_process` and calls `syncBuiltinESMExports()`. Each
wrapper merges the guard into whatever environment the caller passed: it appends its own `--import` to the caller's
`NODE_OPTIONS`, adds the Bun preload, and copies the refusal-log and loopback-port variables. Because the module is
preloaded into each child, a child's own spawns are wrapped too. Tests use the ordinary `node:child_process` API:

1. a child started through a named ESM import with `env: { PATH, SystemRoot }` is refused and recorded;
2. the same through `execFileSync` and through the default import;
3. a grandchild that its parent starts with another from-scratch environment is refused, and its swallowed refusal is
   recorded;
4. the caller's own variable survives, and its `NODE_OPTIONS` value is extended, not replaced;
5. calls with no options object and with options that have no `env` are guarded;
6. a Bun child with a from-scratch environment is refused.
   6 of 6 pass. No test imports a helper and no acceptance suite needs an edit. The limit that remains is a process that a
   non-Node program starts with a cleared environment.

## E76. Port-qualified `NO_PROXY` entries: Bun honors them, curl and git do not [X]

Fixture `SCRATCH\qual\fx-r12\noproxy`: two local HTTP servers, one "registered" and one "unregistered"; all proxy
variables point at a closed port.

- With `NO_PROXY=127.0.0.1:<registered port>`: a Bun `fetch` reaches the registered server and is refused
  (`ECONNREFUSED`) for the unregistered one. `curl` and `git` (libcurl) ignore the port-qualified entry and go to the
  proxy for both, so both fail.
- With the blanket `NO_PROXY=127.0.0.1`: `curl` reaches the unregistered server.
  Consequence: a blanket loopback exemption lets a proxy-aware child reach any local listener, for example a local
  database API. Port-qualified entries for the registered recorder ports keep Bun exact and keep curl and git closed.

# Part: Implementation evidence, batch A1 (added in the repository)

Entries from here on were written during implementation, in the batch each one names.

## E77. Batch A1 staffing: delegated tool drafts, by an arbiter's ruling [I]

**The flaw.** Plan section 8.2 gives batch A1 to the coordinator, and section 8.4 as ratified made the coordinator the
only writer under `tooling/quality/**`. A1 holds about a dozen separate tools, each with its tests. The coordinator is
one agent on one subscription. Twice during the ratification work a burst of work on that subscription ended in a
five-hour usage limit, which stopped the coordinator and every delegate it was waiting for. The guide's section 1
already says to keep heavy work off that subscription; as written, the plan put its heaviest tool batch there.

**The ruling** (2026-11-19). An independent arbiter (GPT 6.2 Astra at xhigh) was given sections 8.1, 8.2 and 8.4 and
the A1 rows of section 10.1 of the plan, section 1 and the A1 section of the guide, and the coordinator's
recommendation. Three options were put: the coordinator writes every A1 file; delegates draft named tools under the
shape of the existing PL-2 and FP-1 exception; delegates also edit shared files. The arbiter chose the second, for
batch A1 only, with these conditions:

- A delegate gets a packet naming its base commit, its dependencies and its disjoint paths. It writes only the tool's
  new files and new tests or fixtures. `scripts/verify/shadcn-diff.mjs` (SD-1) is the only existing file a delegate
  edits. No delegate commits to the integration branch or pushes.
- The coordinator keeps TC-1 in full; every manifest and lockfile edit, including the TC-2 patch registration and the
  VQ-1 root script; the root configs, including those of TC-3 and FM-1; `turbo.json`; `.prettierignore`; workflows
  and hooks; every registry; the UI-bridge ledger; every hash-bound record; TID-1's two test repairs with
  `test-moves/A1.json`; VM-1's `derived-records.json`; and the AP-1 inventory run before the root manifest edit.
- The coordinator reviews each contribution, has it reviewed by a model other than its author, integrates and commits
  one tool at a time in dependency order, and reruns the task's checks on the integrated tree before marking it
  verified. Controls that belong to a later batch are not A1 passes.
- The amendment is recorded here before any delegated write, and in design section 8.4, the guide's section 1 and
  `tasks.md`.

The arbiter also corrected the coordinator's brief: the ruling covers batch A1, not every Phase A tool, and the guide
reserves every registry to the coordinator, not only those two tasks share.

**Effect.** Design sections 0d, 8.2 (the A1 row) and 8.4, the guide's section 1 and the A1 heading of `tasks.md` carry
the amendment. No decision D1 to D13 changes.
