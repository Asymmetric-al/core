# Core quality-toolchain migration: plan v11 (lean)

**Status.** Plan of record from 2026-11-20. It replaces plan v10, which the owner ratified on 2026-11-19 and then
judged over-engineered. Three independent reviewers agreed, a skeptic tested each cut, and an arbiter ruled on three
questions of scope (section 12, evidence E79). Plan v10 remains in this change's git history.

**What v11 keeps from v10:** the tools and their exact versions, the crash patch, TSRS as the typed-lint backend, the
compiler upgrade, the Prettier-compatible formatter with its protected content, the formatter consumers, the Query
bridge, the per-rule policy, and a zero-debt end state. **What it drops** is the control layer built around them:
section 11 lists every removal and what stands in its place.

**Evidence.** `evidence.md` (E1 to E80). Classes: **[X]** executed, **[I]** inspected, **[Inf]** inferred, **[U]** unverified. Facts were
taken at Core `develop` `e6a5ce81a` unless an entry says otherwise; implementation started from `d2402280c`.

**Companions.** `tasks.md` (the tracker), `implementation-guide.md` (how to work on this machine and in this
repository), `council-record.md` (the ten council rounds and the simplification review).

The repository is public. The owner's research handoff and assignment are not copied into it; the handoff is
identified by its date and digest (2026-11-18, SHA-256 `1ba77b0e3d5c129e8697fffb114e5e59470f2b67494ea9f007d1ad7d39b42c20`).

---

## 1. Outcome and definition of done

Core lints with Oxlint under the Ultracite policy, formats with Oxfmt, runs type-aware lint on TSRS, and compiles
with the TypeScript 7.1-beta native compiler, while the classic TypeScript 6.0.3 API keeps serving the tools that need
it. The repository passes that policy with no baseline. The old general ESLint rules, the direct Prettier dependency
and every Core caller of Prettier are gone; Prettier may remain as a dependency of other packages.

Done means all of the following, on a fresh frozen install of the final reviewed revision, each recorded with its
command, revision, environment and result, and marked as run locally, run in CI on that commit, or not run:

1. The tools are installed at the exact pins of section 3 and `oxlint-tsgolint` is not.
2. One root lint policy and one root formatter config are what every command, hook, editor and CI job uses.
3. TSRS is shown to be the backend that runs, on Windows and Ubuntu (VR-2).
4. All workspaces compile on 7.1-beta; the strict builds, the generators and the negative compile fixtures pass; the
   classic API consumers still work (VR-7).
5. The policy of section 4 reports zero findings and zero warnings over its whole scope, and the pending list of
   L5 is empty and deleted. The one baseline that remains is the shadcn ledger this change inherited, reported with
   its raw count and its owner (L10).
6. The seeded failures still fail: the import boundaries (VR-3), one per anti-slop rule and the Playwright rules
   (VR-4), the shadcn rules through their bridge (VR-4), and the Query rules (VR-5).
7. Formatter consumers, protected bytes and skill provenance are intact (VR-8); staging, the edit hook, editors and
   caches behave as section 7 says (VR-6, VR-9, VR-10).
8. `lint`, `format:check`, `typecheck`, `test:unit`, `test:acceptance` and `ci:preflight` pass, and the CI runs on
   that commit pass (VR-12).
9. An independent final review by at least two fresh reviewers on different providers has run and its findings are
   fixed.
10. Anything not finished is named in the final handoff as not finished.

---

## 2. Ground truth

- **Repository.** Bun 1.4.3 and Turborepo; four Next.js apps and shared packages, 16 workspaces with a TypeScript
  pin; about 18,000 tracked files (E1).
- **Today's tools.** ESLint 10.13.0 with general plugins and one shared config workspace; Prettier 3.9.10;
  `lint-staged` 17.6.0 in the pre-commit hook; the native compiler alias at `npm:typescript@7.0.2` with classic
  `typescript@6.0.3` at the root (E1, E11).
- **The crash.** Two bundled anti-slop rules overflow the stack on an alias that passes a wrapped parameter on, and
  the real finding in that file is then never reported (E5, E18, E22). Ultracite 8.3.1 ships the same plugin bytes
  (E78).
- **Backend.** On apps and packages TSRS and tsgolint gave identical diagnostics; TSRS in reference mode took 6.4 to
  7.4 s at about 1.6 GB, tsgolint 54.8 s at 2.4 GB (E7, E12). Ultracite's initializer would add `oxlint-tsgolint`
  (E3, E4), so the cohort is pinned by hand.
- **Config semantics.** `extends` does not carry `env` or `ignorePatterns` (E47); a preset's override block re-enables
  a rule turned off at the top level (E26); Oxlint does not read `.prettierignore`; TSRS finds only a directory's
  `tsconfig.json` (E28); Oxlint honors an `oxlint-suppressions.json` in its working directory without saying so
  (E72); Oxlint exits 1 both for findings and for a crashing plugin (E5).
- **Formatter.** With Prettier-compatible options Oxfmt changes about 233 files; with the stock preset, 6,112 (E10).
  Six scripts and several renderers call Prettier programmatically (E8).
- **Compiler.** 7.1-beta fails at five sites in two Admin files and needs `ES2023.Intl`; the package has no classic
  API or language server (E11). `next typegen` works without service variables (E58).
- **Query.** Oxlint's JS plugin misses the imported-void and typed-wrapper cases of two Query rules (E13); one ESLint
  process over the whole repository runs out of memory, one per workspace does not (E23).
- **Findings.** A raw inventory with the full native preset reports about 120,000 diagnostics, 77% of them in
  `tests/` and `scripts/` (E14); that is an inventory, not the repair count. Under v10's candidate policy 57,601
  remained after the spacing fix and formatting alone (E27), and 32,980 after a trial of all safe fixes (E25). The repair count under v11 is **[U]** until PL-1 sizes it. A bulk "type-only" autofix broke 108 compile sites
  (E27).
- **Module mocks.** The mock rule has 1,273 findings, all in tests; 1,008 of them replace one of Core's own modules
  (E6, E15). Three ways around the stock detection are known (E20).
- **Shadcn.** Six shadcn rules run on an ESLint bridge with a count ledger of 1,703 suppressed findings in 108 files,
  with no growth allowed; the active change `integrate-design-system-lint` owns that repair (E60 to E63).
- **Tests.** Two test files could not be collected by `vitest list` (E67; repaired). The 1,781 central test files
  under `tests/` are not compiled today; one probe of the API tests found 172 type errors (E17). A file outside every
  program is checked by TSRS against a non-strict default and reports nothing (E28).
- **Work in flight.** The owner's open pull requests #2716, #2723, #2725 and #2726 retire byte pins and two hash
  ledgers, add a fast pre-push profile and add an agent edit hook, on files this change also edits (E69, E70).

---

## 3. Decisions

### L1. Versions

<!-- prettier-ignore -->
| Package | Pin | Role |
|---|---|---|
| `ultracite` | 8.3.0, with the patch in `tooling/quality/patches/` | presets and anti-slop rules |
| `oxlint` | 1.94.0 | linter |
| `oxfmt` | 0.79.0 | formatter |
| `tsrs` | 7.1.0-beta.tsrs2 | typed-lint backend only |
| `@typescript/native` | `npm:typescript@7.1.0-beta` | root compiler |
| `typescript` in 16 workspaces | 7.1.0-beta | workspace compiler |
| `typescript` at the root | 6.0.3, unchanged | classic API, parser, editor |
| `eslint`, `@typescript-eslint/parser` | 10.13.0, 8.72.0, unchanged | the Query bridge and the shadcn bridge |
| `@tanstack/eslint-plugin-query` | 5.108.0 | Query rules |
| `eslint-plugin-playwright` | 2.12.2 | Playwright rules, as an Oxlint JS plugin |

The cohort is pinned by hand at exact versions, and the lockfile changes in the same commit as the manifest. Neither
`ultracite init` nor `ultracite upgrade` is run against Core. `oxlint-tsgolint` is never installed. A cohort upgrade
is its own change: qualify the four tools together, rerun VR-1 to VR-5 and VR-8, and drop the patch only when an
upstream release passes VR-1.

### L2. One lint config

`oxlint.config.mts` at the repository root is the only lint policy, and the only path passed to `-c`.

- It starts from the Ultracite `core` preset and spreads `env` and `ignorePatterns` in explicitly (E47).
- It sets `options.respectEslintDisableDirectives: false`, so Oxlint reads only `oxlint-*` directives and the two
  ESLint bridges keep theirs.
- Core's adaptations (section 4.2) sit in one final override block, after every preset block (E26). Narrow scoped
  overrides come last.
- Ignores, each with a one-line reason in the file: generated files; local outputs; the managed and mirrored trees
  (`.agents/**`, `.claude/**`, `.cursor/**`, `.next-docs/**`, `docs/**`, `tests/fixtures/skills/**`); negative
  fixtures; evidence trees; the nine vendored ReUI files for new-policy rules; `scripts/archon-factory/pack/**`
  (a changed pack is a new release under its own review).
- Typed rules and JS-plugin rules are off in `*.{js,mjs,cjs,jsx}`, where they have no types to work with.
- Policy fragments too long for one file live beside the launcher in `tooling/quality/` and are imported by the root
  config. There is no second entry config, no fix config and no nested config.

### L3. How lint runs

- **The launcher** `tooling/quality/lint.mts` is small. It resolves the pinned `tsrs-lint` launcher, deletes inherited
  `OXLINT_TSGOLINT_*` and `TSRS_*` variables, sets `OXLINT_TSGOLINT_PATH` and `TSRS_FAST=0`, and starts Oxlint from
  the root with `--disable-nested-config --deny-warnings` and, for typed runs, `--type-aware`. It refuses to run when
  an `oxlint-suppressions.json` exists (E72). **Exit codes:** findings exit 1; a plugin crash, a config failure or a
  backend failure exits 2 with the original message, read from Oxlint's output (E5). A crash never reads as findings
  or as a pass. `CORE_LINT_PARALLEL=1` makes a run use a quarter of the cores, for agents working in parallel.
- **Commands.** `bun run lint` is the typed Oxlint run over the repository, then `lint:query`, then `lint:ui`.
  `bun run lint:fast -- <paths>` is the untyped run on named paths. `bun run format` and `format:check` are Oxfmt
  from the root. Workspace `lint` scripts call the launcher on their own directory so `turbo run lint --filter=…`
  keeps working.
- **The gate is one root run, uncached.** CI and `ci:preflight` run the typed launcher once from the root over the
  whole scope (about 28 s, E14), not `turbo run lint --affected`: a change to the root config, the patch or another
  workspace's types would neither re-key a workspace's cache nor mark it affected. Workspace `lint` tasks are
  `cache: false`.
- **`bun run fix -- <paths>`** applies Oxlint's safe fixes to the named paths and formats them. No hook runs it.
  Every autofixing rule is qualified on the whole tree first (M2); a rule whose fix broke the compile there is listed
  in the rulebook as repaired by hand, and the rulebook tells authors to run `typecheck` after `fix`.
- **Typed lint runs only where a program exists.** Hooks and editors run untyped, so no backend runs there. Files
  outside every `tsconfig.json` would be checked by TSRS against a non-strict default and report nothing (E28), so
  the config turns typed rules off for them explicitly instead of leaving them quietly weak.
- **Disable directives.** A directive names its rule and gives a reason after `--`. `unicorn/no-abusive-eslint-disable`
  stays an error, and the config smoke test fails on a directive with no reason. Unused directives become errors
  through the command-line flag on the typed run (a config-level setting would fail untyped runs on typed
  disables), and only once the pending list (L5) is empty: a directive for a pending rule reads as unused.

### L4. TSRS is proved, not assumed

The launcher binds the backend (L3). The proof that TSRS is what executes (VR-2), run on Windows and Ubuntu when the
launcher lands and again at completion:

1. with an invalid inherited `OXLINT_TSGOLINT_PATH`, the launcher ignores it, runs the pinned backend and reports a
   finding that only a typed rule can produce;
2. the same run with a missing file supplied through the trusted `run(argv, { backendPath })` option exits 2;
3. through that same option, supply a shim that records its invocation and starts the pinned `tsrs-lint`. Verify
   that the root script, CI and workspace `lint` call this launcher; check the shim's record for each invocation
   and for a call from outside the repository;
4. `tsrs --version` reports the pinned version;
5. `oxlint-tsgolint` and `@oxlint-tsgolint/*` are not installed.

Checks 4 and 5 also live in the existing `scripts/verify/typescript-toolchain.mjs`, which every gate already runs.
The launcher deletes inherited `TSRS_*` variables because the pinned `tsrs` launcher runs whatever `TSRS_BINARY`
names.

**One backend comparison** (BC-1), at the linter-cutover revision with the pending list emptied in a scratch copy,
so that there are findings to compare: TSRS against a scratch-installed tsgolint on the same inputs, with reversed
input order, one worker against many, semantic reporting on and off, the safe-fix patches, and the list of files
checked. About eight short runs. This completes what E7 and E12 left open.
**Fallback:** if a reproducible TSRS defect still blocks a gate after remedies are tried, record the cause, the
reproducer, the coverage affected and the remedies, replace `tsrs` with the pinned `oxlint-tsgolint@7.0.2007` in one separately reviewed
commit, and name the unmet goal in the final handoff. The compiler is not involved.

### L5. Existing violations: staged enablement, no ledger

At the linter cutover the root config enforces every rule the incumbent ESLint configs enforce at `error`, in the
same scope, so the general ESLint configs and plugins can be retired that day. PL-0 lists each such rule with its
Oxlint equivalent. Every rule name maps except `react-hooks/config` and `react-hooks/gating`, which validate a
React Compiler setup Core does not use, and two rules that report nothing. Oxlint's React Compiler rules are
reimplementations, so before ESLint is retired one seeded violation per incumbent rule must fail through Oxlint, and
anything more that Oxlint finds for those rules is repaired in the cutover. **A rule the repository enforces today
is never pending.**

Every other rule of the policy that still has findings is listed in **one pending list**,
`tooling/quality/pending.json`, which the root config reads to turn it off in its last override block: one entry per
rule, or per rule and workspace where a rule is large, each naming the task that will clean it. A repair pull
request cleans an entry's scope and deletes the entry; from that commit the rule is an error there. Completion means
the list is empty and the file is deleted.

- **The list only shrinks.** `verify:lint-pending`, a script of a few lines in `ci:preflight` and CI, compares the
  list with the one at the merge base and fails when an entry was added or its scope widened. Findings can still
  grow inside a pending scope; the task that owns the entry repairs them.
- **Removing an entry is proved.** The pull request that deletes an entry adds a seeded violation for that rule to
  the config smoke test, which must fail through the root config. Without it a rule that another layer also turns
  off would stay off unnoticed (E26).
- There is no transition config, no legacy-directive list, no ratchet file and no suppression file.
- A rule that cannot reach zero for a stated semantic reason gets a narrow override in the config with that reason
  beside it, which is a permanent exception and is listed in the final handoff.
- The pending list is this change's only temporary baseline. Its owner is the coordinator, its no-growth rule is
  the check above, and its retirement is close-out.

### L6. Policy scope

Arbiter ruling of 2026-11-20 (E79). The full policy applies to product code: `apps/**` and `packages/**`, outside
test files. Test files (`tests/**`, `**/*.test.*`, `**/*.spec.*`, `**/tests/**`) and operational scripts
(`scripts/**`, `tooling/**`) each get a profile.

- **The test for an exemption:** a rule is turned off in a profile only if the reason would still hold for a new,
  clean file of that kind. "It has many findings" is not a reason. PL-1 evaluates all 18 anti-slop rules and every
  other rule of the policy against that test, from fresh counts, and records for each its scope, behavior,
  exceptions, repair cost and severity.
- **Defect checks stay on in tests and scripts:** the correctness rules, the promise-safety rules, the Vitest and
  Playwright rule sets as adapted in section 4, the import boundaries, and formatting.
- **No grandfathered files.** Within the accepted policy nothing is baselined and no ordinary finding is left.

**Module mocking is enforced here.** Most mock findings replace one of Core's own modules, so a test can swap out
the behavior it claims to protect. A mock that isolates a real external boundary (a payment provider's SDK, a
database client constructor, a framework module that cannot run in a unit test) may stay, with a narrow, reviewed
reason. A mock of Core's own code is repaired (section 4.5). "Hard to migrate" is not a reason.

### L7. Formatter

- `oxfmt.config.mts`: Ultracite's formatter preset with `trailingComma: "all"`, `proseWrap: "preserve"`,
  `sortPackageJson: true`, `sortImports: false`, `sortTailwindcss: false`. The shared ignores are kept, except that
  `packages/database/types/currency-foundation.generated.ts` is un-ignored because its generator formats it.
- `.prettierignore` (which Oxfmt reads) gains: `*.toml`; `docs/qa/**`; `docs/ops/phase-evidence/**`; the hashed
  Support Hub Phase 26 records; the two verbatim skill assets, named explicitly; `openspec/changes/archive/**`; and
  `scripts/archon-factory/pack/**` (a changed pack is a new release under its own review).
- Every Oxfmt run uses the repository root as its working directory and passes
  `--no-error-on-unmatched-pattern --disable-nested-config`.
- **Programmatic formatting in JavaScript and TypeScript** goes through one adapter, `scripts/lib/format-source.mts`, with two fixed profiles.
  `trusted` uses the root options. `managed` treats imported bytes as data: no source-local config or plugins and no
  sorting. It fails closed when the formatter is missing, and a malformed supported input fails before any write.
- Consumers beyond the six (E8): `openspec-contracts` and the Phase 27/28/29 renderers use the trusted profile.
  The two Python renderers (`docs/prds/program-roadmap/tools/render-phases.py` and
  `docs/prds/workflow-studio/tools/render.py`) call `bunx --no-install oxfmt --stdin-filepath <path>` from the root
  with the flags above. A formatter failure stops publication. FM-3 finds every consumer by reference search before
  it ports any.
- Each port keeps its consumer's behavior and tests it where it applies. The upstream refresher fails on a symlink
  or an inventory mismatch and leaves the published tree byte-identical. The managed-skill normalizer repairs
  nested fences before formatting. Each Taste adapter replacement matches exactly once, and mixed or drifted input
  fails. Raw upstream hashes never change; only adapted hashes are re-attested.
- The formatting change is **one mechanical commit** by one writer from a clean tree, with nothing else in it, and a
  blame-ignore entry in the next commit. **Every mechanical commit is replayed once by its reviewer:** the reviewer
  runs the command stated in the commit message on the parent commit and compares the result with the commit; only
  the record files of L12 may differ, and a second pass changes nothing. A formatting commit refreshes pins that
  exist to prove security tests were not edited, so without the replay a refreshed pin could hide an edit.
- A wide Markdown table carries `<!-- prettier-ignore -->` on the line before it (E73).

### L8. Compiler

TypeScript 7.1.0-beta compiles all 16 workspaces. Classic 6.0.3 stays at the root for the compiler API, the parser
and the editor. TS-1 lands as one revertible commit (section 6). **Rollback** is one forward commit that returns the
pins, the alias, the lockfile and the verifier's expected versions to 7.0.2 and keeps the fixtures, `ES2023.Intl` and
the two Admin repairs; it is rehearsed once, in a scratch copy, when TS-1 lands.

### L9. Compiled programs

Arbiter ruling of 2026-11-20 (E79). TS-3 inventories every authored TypeScript scope by actual program membership.

- Root configuration files, `scripts/` and `tooling/` get real compiled programs, wired into `typecheck` and CI.
  Every program compiled today, and every intentional-failure fixture, stays as it is.
- Central tests under `tests/` become **lint-context-only programs**: each group gets a directory-rooted
  `tsconfig.json` with strict options and the aliases of the code it tests, so that typed lint checks it strictly
  (E28, E40). For each group the inventory records why it is lint-only, and a failing and a passing typed control
  prove that typed lint runs strict there with the right aliases. These programs are not compiled as a gate, there
  is no error ceiling, and the tests keep running under Vitest. A passing test run is not a compiler pass.
- Compiling the central tests is the follow-up **Central test compiler coverage**, owned by this change's
  coordinator, with its own issue; the final handoff lists the uncompiled scopes.
- Generated output and intentional negative fixtures are listed as such in the same inventory.

### L10. Query and shadcn stay on ESLint bridges

- **Query.** Five Query rules run in Oxlint through the JS plugin (`exhaustive-deps`, `no-unstable-deps`,
  `stable-query-client`, `infinite-query-property-order`, `mutation-property-order`). Two stay on ESLint because
  Oxlint misses their typed cases (E13): `no-rest-destructuring` and `no-void-query-fn`, run per Query-using
  workspace as a Turbo `lint:query` task with `cache: false` and one config, `tooling/quality/eslint-query.config.mjs`, never as one
  process over the repository (E23). `prefer-query-options` is deferred.
- **Shadcn** (arbiter ruling of 2026-11-20, E79). The six shadcn rules stay on the ESLint bridge, in all six UI
  workspaces, with the patched rules, component discovery, the health check and their positive and negative
  controls in the required workflow. The bridge's behavior is preserved, not its config bytes: at the linter cutover
  its config is reduced to what it needs (the parser, the design-system layer and a stub for three vendored
  comments; E63), so every general ESLint plugin can be removed. The cutover verifies both the gated result and the
  raw count, and no per-file or per-rule allowance rises. A repair elsewhere that touches a UI file reviews that
  file's raw findings, since replacing an old violation with a new one leaves the count unchanged; a regression this
  change introduces is fixed here. The 1,703 legacy findings and the ledger's retirement stay with
  `integrate-design-system-lint` (tasks 5.4 to 5.10). The final handoff reports the actual raw count, the owner and
  the open tasks: enforcement preserved, legacy cleanup not done here.

### L11. Staging, hooks and editors

- **Pre-commit is a read-only check.** Refuse and name any staged, lint- or format-eligible file with unstaged
  changes. Run `lint-staged --concurrent false --no-stash --fail-on-changes --no-hide-partially-staged` with
  `oxfmt --check` for supported staged files and the untyped launcher for staged JS and TS in scope. Recheck for
  unstaged changes to those files before accepting the commit. Do not hide or restore edits or write to the index.
  A format or lint finding names `bun run format` or `bun run fix`; the author stages again. VR-9 checks that a
  partially staged eligible file is refused by name and that an editor save between patch capture and checking is
  neither lost nor staged. It also exercises a rename, a deletion, an empty stage and a failing tool.
- **Agent edit hook.** One edit hook per harness: the one pull request #2726 adds. This change swaps its two tool
  calls to Oxfmt and the untyped launcher, corrects its message about pre-commit applying fixes, and keeps its
  rules: layout only, never blocking, bounded in time. It calls only installed binaries; it never installs or fetches. #2726 registers the hook for Cursor twice over (Cursor also
  runs the Claude registration), so observe Cursor in each context in use and keep exactly one registration that fires per edit.
  If #2726 has not merged when the linter cutover lands, the rulebook documents the explicit commands and the hook
  is adapted when it merges.
- **Editors.** `.vscode/extensions.json` recommends the Oxc extension; `.vscode/settings.json` makes it the default
  formatter, turns the ESLint and Prettier extensions off, applies no fix on save, and points the TypeScript SDK at
  the root classic 6.0.3. The settings land with the formatter cutover. The six shadcn rules and the two Query
  bridge rules have no editor feedback; the rulebook names the commands that report them.

### L12. Hash-bound records and work in flight

- When a commit changes a file that a live record hashes, the committer re-checks that the record's claim still
  holds and refreshes the hash in the same commit, with the record's own verifier or generator: the Shadscan ledger
  while it exists, the shadcn upstream baseline (through the two refresh modes of SD-1), the skill audit (through
  `skills:sync` and `update-skill-audit-hashes.mjs`), and pinned acceptance tests (the check kept, with a comment
  naming this change, as Core does today). No hash is updated to hide an unexplained change.
- The React Doctor ledger is never edited by this change (owner ruling of 2026-11-18).
- The formatter and linter cutovers edit files the open stack also edits (`ci.yml`, `.husky/pre-commit`, hook
  registrations, three contract tests). They wait for that stack for up to two working days, then proceed; a later
  conflict keeps the applicable edits from develop, each lower pull request and this change.
- This change never re-creates what develop retired.

### L13. Delivery and ownership

- **Stacked pull requests into develop**, each small enough to review and safe to merge on its own: the plan; the
  tools, inactive; the compiler; the formatter; the linter; mechanical fixes; repairs by area; close-out.
- **The coordinator** alone edits the lockfile, manifests, root configs, `turbo.json`, workflows, hooks and
  `.prettierignore`, makes the mechanical commits, integrates and pushes. **Delegates** work in their own worktrees on
  disjoint paths with a brief that names their base, their paths, their checks and what to return; they never push.
- Delegates are a mix of GPT 6.2 Astra at xhigh, Gemini 4 Neon at xhigh through Antigravity and Claude Opus 5.5 at
  xhigh or high. A review uses a different model from the work's author. The coordinator reruns the checks on the
  integrated tree before a task is marked verified.
- Before deleting or renaming a path, script or command, search every tracked file for references to it.

---

## 4. Policy

### 4.1 Anti-slop rules

Counts are raw findings in tests and in product code at the plan's base (E6); PL-1 refreshes them. "Product" proposes an error in product code; it does not turn the rule off in tests or scripts.

<!-- prettier-ignore -->
| Rule | Tests / product | Scope | Repair |
|---|---|---|---|
| `require-readable-spacing` | 42,963 in all | everywhere | the mechanical fix (M1) |
| `require-safety-comment-for-type-assertion` | 2,971 / 1,328 | product | remove the cast where the type can be fixed; otherwise a `SAFETY:` comment that states why the cast is sound |
| `no-runtime-typeof` | 317 / 893 | product, TypeScript only | parse at the boundary, or remove with type evidence; never remove a check on `unknown`, `any` or I/O data |
| `no-unsafe-dictionary-type` | 884 / 509 | product | an owned value type, a recursive `Json` type for validated JSON, or `Map` |
| `no-unknown-parameters` | 559 / 438 | product | a precise type; parse at decode |
| `no-known-value-widening` | 337 / 279 | product | `satisfies` or a named return type; never delete a validator call |
| `no-chained-type-assertions` | 239 / 85 | product | fix the declaration; for money, pass the exact decimal string, never `Number(decimal)` |
| `no-unknown-returns` | 143 / 74 | product | decode with a schema at the boundary |
| `no-conditional-empty-object-spread` | 39 / 143 | product | build the object under the original condition, same key order; test key absence against a present `undefined` |
| `no-shape-in-symbol-names` | 49 / 69 | product | rename owned names, not wire keys or library props |
| `no-array-filter-map` | 33 / 45 | product | fuse only when both callbacks ignore the index; keep two passes if order or effects would change |
| `no-object-parameters`, `reflect-get`, `reflect-apply` | 15 / 4, 17 / 0, 11 / 0 | product | capability types for trusted objects; keep proxy receiver, `this` and argument order |
| `no-reduce-accumulator-copy`, `no-unknown-type-aliases`, `no-widen-then-assert` | 0 | everywhere | one seeded failing fixture each |
| `no-module-mocking` | 1,273 / 0 | tests | section 4.5, "Module mocks" |

The Scope column is a starting proposal, not an exemption. PL-1 keeps each rule on in the test and script profiles
unless it records a reason that would hold for a new, clean file of that kind (L6), and updates this table in the
same pull request.

### 4.2 Adaptations to the Ultracite preset

Each adaptation is in the final override block with its reason.

<!-- prettier-ignore -->
| Why | Rules turned off or configured |
|---|---|
| The repair changes behavior with no defect to show for it | `require-await`, `typescript/promise-function-async`, `no-await-in-loop`, `require-unicode-regexp`, `unicorn/no-array-sort`, `unicorn/no-array-reverse`, `unicorn/prefer-dom-node-dataset`, `jsx-a11y/prefer-tag-over-role`, `unicorn/prefer-number-coercion` |
| It contradicts a Core convention or another rule | `func-style`, `unicorn/filename-case`, `no-inline-comments`, `no-warning-comments`, `prefer-named-capture-group`, `oxc/no-barrel-file`, `typescript/consistent-type-definitions`, `typescript/non-nullable-type-assertion-style`; `no-use-before-define` for classes only; `eqeqeq` with `null` ignored |
| It is an arbitrary metric or style | `complexity`, `class-methods-use-this`, `prefer-destructuring`, `no-plusplus`, `no-bitwise`, `unicorn/no-await-expression-member`, `unicorn/consistent-function-scoping`, `promise/avoid-new`, `unicorn/no-array-for-each`, `react/jsx-handler-names`, `react/todo`, `vitest/require-mock-type-parameters` |
| It weakens tests | `vitest/prefer-to-be-truthy`, `vitest/prefer-to-be-falsy`, `vitest/prefer-strict-equal`, `vitest/max-expects`, `vitest/require-top-level-describe`, `vitest/prefer-import-in-mock`, `vitest/prefer-describe-function-title` |
| Configured | `strict-boolean-expressions` allows nullable strings and booleans, never numbers; `prefer-nullish-coalescing` ignores primitives; `no-confusing-void-expression` allows arrow shorthand; `no-floating-promises` with `ignoreVoid: false`; `return-await` always; `object-shorthand` ignores constructors; `ban-ts-comment` allows only a described `@ts-expect-error` |

**Framework scoping.** React rules that inspect JSX apply to `*.{tsx,jsx}`; the rest of the React preset applies to
all TypeScript in apps, packages and tests. The Next preset applies to the four apps, resolved from the root. The
Vitest preset applies to the Vitest globs, not to e2e files. `react/no-danger` stays an error.

**Playwright.** The recommended rules of `eslint-plugin-playwright` apply only to spec and test files under
`tests/e2e/`, `tests/fixtures/base-ui-compliance/specs/` and `apps/factory-console/tests/e2e/`, with
`settings.playwright.globalAliases` set, `missing-playwright-await` including page locator methods, and conditional
skips allowed. Warnings fail the run.

### 4.3 Import boundaries

Four tiers, composed as the union of the bans that apply to a path (a later `no-restricted-imports` setting replaces
an earlier one, so each path's block carries the full list):

0. packages never import `apps/*`; `motion/react` only in `packages/lib/motion*`;
1. app-wide: no cross-app imports, no raw Twenty client, no direct `@tanstack/react-table`;
2. UI layer (`components`, `features`, `packages/ui`): no `@supabase/*` and no admin or server database clients;
3. route handlers: no Supabase clients, except the health route's probe.

`verify:data-boundary`, `verify:service-role-clients` and `verify:cms-public-sole-entry` stay as independent gates.

### 4.4 TanStack libraries

<!-- prettier-ignore -->
| Library | Files | Lint | What must keep working |
|---|---:|---|---|
| Query | 80 | the five Oxlint rules and the two bridge rules | keys, invalidation, cancellation, pagination, optimistic updates; no functions or whole option objects added to a key to quiet lint |
| Table | 12 | the direct-import ban; `react/incompatible-library` | the shared `useTable` adapter and React Compiler annotation mode |
| DB | 15 | the data-access boundaries | one DB runtime and one QueryClient across collections; the offline first-load suites |
| Form | 6 | React and `jsx-a11y` rules | labels, errors and focus; async validation |
| Virtual | 2 | `react/incompatible-library` | measurements and keyboard focus after a row changes height |
| Store | 1 | React Compiler rules | its subscription test |

A repair in a file that imports one of these runs that library's existing suites before review.

### 4.5 Repairs

**Never** repair a finding by: replacing a useful type with `any`; a disguised assertion or a cast helper; an
always-true guard; an empty or boilerplate safety comment; a way around mock detection; deleting or loosening a
negative test; removing a runtime check. Every repair brief carries this list, and every review checks the diff
against it. A reviewer reliably sees `any`, a chained assertion and a deleted test; an always-true guard, an
overloaded cast helper and a boilerplate safety reason are easier to miss, so the reviewer reads every new type
guard, helper and `SAFETY:` comment in the diff. A lint rule is added only if a review finds one of these actually
being done; Oxlint 1.94.0 has no `no-restricted-syntax`, so such a rule would be `no-restricted-properties`,
`vitest/no-restricted-vi-methods` or a small JS-plugin rule.

**Behavior-relevant repairs are made test-first.** When emitted JavaScript changes but behavior must not, write a
preservation test that passes before and after the repair and fails for a deliberately wrong variant. Only an
established defect needs a test that fails before the fix and passes after. Rules to watch: `strict-boolean-expressions`,
`no-floating-promises`, `no-misused-promises`, `return-await`, `no-runtime-typeof`,
`no-conditional-empty-object-spread`, `prefer-template`, `prefer-number-properties`, `require-array-sort-compare`,
`no-non-null-assertion`, `switch-exhaustiveness-check`, `only-throw-error`, `eqeqeq`.

**Rules for the sensitive cases:**

- **Money and numbers.** A truthiness check on a nullable number becomes `x != null && x !== 0 && !Number.isNaN(x)`
  through one small owned helper; a bigint uses `x != null && x !== 0n`. Negative amounts and bigint money are live
  in Core, so `> 0` is a behavior change and needs a test that pins zero, a negative value, a missing value and
  `NaN`. Never `Number(decimal)`. Showing a `$0` gift where nothing shows today is a product change and is not made
  here.
- **Tenant, auth and client privilege.** A repair in a function that filters by tenant, checks a role or permission,
  or constructs a database or Stripe client gets a test that fails for the wrong tenant, the wrong role or the wrong
  client. The reviewer reads the test-file diff for a weakened assertion (an exact match turned into
  `toBeDefined()`).
- **Sorting.** Preserve today's order: the default sort compares string forms, so the preserving comparator compares
  strings; a numeric comparator is a behavior change. Never `localeCompare` on keys, hashes or persisted paths.
- **Hashing and keys.** Before a repair in a file that hashes, fingerprints or builds a query key, pin its output on
  a raw input with extra and permuted keys. Key order and the stripped-key set do not change.
- **Failure handling.** A repair may not turn a reported or rethrown failure into a silent one.
- **Module mocks.** MK-1 first sorts the findings into mocks of an external boundary and mocks of Core's own
  modules, and closes the three known ways around detection (E20) before any repair starts: the stock
  `vitest/no-restricted-vi-methods` deny list, and one small JS-plugin rule for an aliased `vi` and for `vi.spyOn` on
  a module namespace, which reads like a correct repair and is not one. An external-boundary mock stays with a
  narrow reviewed reason. A mock of Core's own module is repaired by driving the real module through its inputs:
  an injected dependency, a fake at the external boundary, or an existing test double. The repaired test is shown to
  still fail for the wrong behavior it protects; no assertion is weakened to remove a mock. No test reaches a real
  service: the unit setup already deletes the service-role key, and MK-1 adds the payment secret key to it.
- **Non-null assertions.** Keep the failure: narrow and then throw. No `?.` or `??` default in its place.

**Every repair pull request** is reviewed by a model other than its author, passes the existing suites for what it
touched, and states which pending lines it removes.

---

## 5. Transition

1. **Tools, inactive** (done for the pins and the patch). Nothing calls the new tools.
2. **Compiler.** Independent of lint and format.
3. **Formatter cutover.** Oxfmt replaces Prettier in `format`, `format:check`, `lint-staged`, CI and the editors;
   consumers move to the adapter or the Python CLI calls of L7; the direct Prettier dependency is removed; then the
   one mechanical commit.
4. **Linter cutover.** Oxlint replaces the general ESLint configs and plugins at parity, with the pending list for
   everything else; the two bridges stay; non-shadcn `eslint-disable` and `eslint-enable` directives in authored
   sources become `oxlint-*`; the one ESLint inline configuration comment (the checkout file's `react-hooks/refs`)
   becomes a root-config override for that file (E64).
5. **Mechanical fixes.** The spacing fix with formatting, to a fixed point (M1). Then safe autofix rules, each in its
   own commit gated by typecheck and tests, with failing files reverted and left to manual repair (M2; E27).
6. **Repairs**, by area, each deleting pending lines.
7. **Close-out.** The pending list is deleted; unused-directive errors turn on; the rulebook, the skill and the
   OpenSpec specs are updated; the final verification and review run.

**Temporary measures and when each ends:** the pending list (close-out); the lint and format ignores for the factory
pack (until the factory reviews and releases a new pack); the Shadscan hash refreshes (when #2725 merges). **Permanent after completion:** one lint
config, one formatter config, the launcher, the format adapter, the patch until upstream fixes the defect, the Query
bridge, the shadcn bridge until its owning change retires it.

---

## 6. Tasks

Stable IDs. A task is verified only when the coordinator has rerun its check on the integrated tree and recorded the
command, revision and result in `tasks.md`.

<!-- prettier-ignore -->
| ID | Task | Pull request | Verified by |
|---|---|---|---|
| OS-1 | This OpenSpec change; reconciled at close-out with the related active changes | plan | `openspec validate --strict`, `verify:openspec-deltas` |
| TC-1 | The exact pins of L1 with the lockfile; nothing calls the tools (done) | tools | frozen install; `verify:bun-lock-drift` |
| TC-2 | The Ultracite patch with its test: crash inputs, false-finding inputs, installed-bytes equality (done) | tools | VR-1 |
| TC-3 | The first root `oxlint.config.mts` and the launcher `tooling/quality/lint.mts` (L2, L3) | tools | VR-4 (first config, launcher exit codes and suppression-file refusal) |
| TC-4 | The TSRS proof on Windows and Ubuntu (L4), and checks 4 and 5 in `typescript-toolchain.mjs` | tools | VR-2 |
| TF-1 | Repair the two test files Vitest cannot collect (E67): delete the one-line duplicate, wrap the other in a `describe` | tools | `vitest list` exits 0 for both |
| TS-1 | The compiler cohort: the alias, 16 pins and the lockfile; the two Admin repairs; `ES2023.Intl` in every `lib`; `.next/types/**/*.ts` in the three product apps' `tsconfig.json` and `next typegen` before `tsc`; the version verifier and its tests; the compiler-family fixtures; the Windows fix in the Principal harness; the TypeScript rulebook and readiness guide | compiler | VR-7 |
| GEN-1a | Payload types present and absent; the import-map producer equals the committed file | compiler | VR-7 |
| RB-1 | The compiler rollback, rehearsed once in a scratch copy | compiler | VR-7 |
| TS-3 | The program inventory of L9: compiled programs for root config, `scripts/` and `tooling/`, wired into `typecheck` and CI; strict lint-context programs for the central test groups, each with a failing and a passing typed control and its recorded reason | compiler | VR-6, VR-7 |
| FM-1 | `oxfmt.config.mts`, the `.prettierignore` additions, the ignore and protected-bytes tests | formatter | VR-8 |
| FM-2 | `scripts/lib/format-source.mts` with its two profiles | formatter | VR-8 |
| FM-3 | Find all formatter consumers by reference search. Port each with its test: the two Python renderers use the CLI; the others use the adapter (L7). | formatter | VR-8 |
| GEN-1b | The currency generator and the import-map postprocessor format through the adapter | formatter | VR-8 |
| SD-1 | `--refresh-local` and `--refresh-diffs` for the shadcn baseline | formatter | its tests |
| FC-1 | Formatter cutover: commands, `lint-staged`, CI, editor settings, contract tests and docs; the direct Prettier dependency removed, and a reference search finds no Core caller of Prettier | formatter | VR-8, VR-9 |
| FC-2 | The one formatting commit, then its blame-ignore entry; records refreshed as L12 says | formatter | the reviewer's replay (L7); `format:check`; a second pass changes nothing |
| PL-0 | The parity list: every rule the incumbent ESLint configs enforce at `error`, with its scope, mapped to Oxlint, to a bridge, or to a stated gap | linter | VR-4 |
| PL-1 | The per-rule policy from fresh counts: section 4 in the config, the test and script profile with a reason per rule, `tooling/quality/pending.json` with a task per entry, and `verify:lint-pending` | linter | VR-4 |
| PL-2 | Framework scoping, Playwright scope and the four import tiers, with a failing and a clean fixture each | linter | VR-3, VR-4 |
| QB-1 | The Query bridge config and the uncached per-workspace `lint:query` task | linter | VR-5 |
| BC-1 | The one backend comparison of L4, in a scratch copy at the cutover revision | linter | its record |
| LC-1 | Linter cutover: `lint` and workspace scripts, `lint-staged`, CI, directive conversion, the reduced shadcn bridge config, general ESLint removed, contract tests and a first `docs/ai/rules/code-quality.md` | linter | VR-4, VR-6, VR-9 |
| WF-2 | The edit hook of #2726 adapted (L11) | linter, or after #2726 | VR-10 |
| M1 | The spacing fix with formatting, to a fixed point, as one commit | mechanical | the reviewer's replay (L7); typecheck; tests; the test names in the unit run's report unchanged, on one platform |
| M2 | Safe autofix rules, one commit each, compile-gated; failing files reverted | mechanical | the reviewer's replay; typecheck; tests |
| MK-1 | Module mocks: sort the findings into external-boundary and internal mocks; add the evasion checks; add the payment key to the unit setup's deleted keys | repairs | VR-4 fixtures for the three evasions |
| RS-\* | Repairs by area (one pull request per workspace or rule group), each deleting pending entries and adding their seeded violations | repairs | section 4.5; the area's suites; test names and the Playwright list compared before and after for changed test files; independent review |
| WF-5 | The rulebook, AGENTS routing, the canonical Ultracite skill through `skills:sync`, the OpenSpec specs | close-out | `skills:verify`; docs tests |
| WF-7 | Observe each harness in normal use, once natively and once under T3 where both are in use. Record the settings file, profile and worktree of each run. The hook runs once per edit and its report reaches the model. | close-out | VR-10 |
| PF-1 | Time and peak memory of `lint`, `format:check` and `typecheck`, before and after, on one machine | close-out | the two records |
| CL-1 | Close-out: pending list deleted, unused-directive errors on, VR-12, the independent final review, the handoff. The factory owns the pack release. Its lint and format ignores remain; neither cleanup is done here. The handoff is short and links `design.md` and `evidence.md`. It gives what was built and why, with the exact versions in L1; the council's models, efforts, substitutions, rounds and scores (§12); what became of the research handoff's recommendations (§10); what was demonstrated, what passed and what remains unverified (§1); the daily commands and the native, T3 and editor workflow (L3, L11); and every blocker, unfinished goal, fallback and manual step. It also confirms that the research handoff still matches the digest in the design header. | close-out | section 1 |

**Withdrawn, never reused:** AP-1, SR-1, VM-1, VQ-1, TID-1, TC-5, TC-6, FB-1, PL-3, PL-4, PL-5, MI-1, TA-1, FP-1,
GH-1, PO-1, RD-1, RD-2, FIX-1, UIB-1, PC-1, CT-0a, CT-0b, CT-1, CT-T, TS-2, INV, IN-0, IN-1, SW-1, CTI, the W-MOCK
tasks, W-UI, RS-PACK, WF-1, WF-3, WF-4, WF-6 as a separate task, and the earlier withdrawals RDL-1, RDX-1, REC-1 and
PRUNE-1. Section 11 says what replaced each.

---

## 7. CI, caches and resources

- CI keeps every gate it has. The lint job runs the typed launcher over the repository, the Query bridge per
  workspace and the shadcn bridge; the format job runs `format:check`. This change edits workflows only in
  coordinator commits, on develop's current job structure.
- Typecheck stays a cached Turbo task. One demonstration (VR-6) shows that it reruns after each of five changes: an
  imported type in another workspace, a shared tsconfig preset, the compiler pin, an app route, and a type change in
  a workspace that a `scripts/` or `tooling/` program imports. The lint gate, `lint:query` included, is uncached
  (L3, L10).
- At most four typed lints or typechecks run at once on one machine; parallel agents set `CORE_LINT_PARALLEL=1`.
- If the lint job passes 20 minutes, the two bridges move to parallel jobs.

---

## 8. Verification

<!-- prettier-ignore -->
| ID | What it shows |
|---|---|
| VR-1 | The patch: two inputs that crash the unpatched plugin report the exact unsafe line when patched; two false findings are gone; the installed bytes equal the patched plugin |
| VR-2 | TSRS executes (L4), on Windows and Ubuntu |
| VR-3 | Each import tier: a forbidden import fails and a permitted one passes, for value, type, re-export and dynamic imports |
| VR-4 | The config smoke test, through the real root config: one known-bad fixture per rule group reports and its clean twin does not; one seeded violation per rule removed from the pending list; each adaptation is effective on a sample file; a warning-level finding fails the run; a typed rule is silent without `--type-aware`; every tracked JS or TS file is linted or matched by an ignore with a reason; every disable directive gives a reason. The launcher exits 2 on a plugin crash or an unloadable config and refuses to start with `oxlint-suppressions.json` in its working directory. Shadcn, through `lint:ui` after LC-1 reduces the config: each of the six rules reports a seeded case and its clean twin passes in each of the six UI workspaces, including Factory Console. A missing theme import, an unresolved primitive and a weakening config entry each make the health check fail. A new component is discovered, the raw count does not exceed the ledger's count, and no allowance rose. |
| VR-5 | Query: the five Oxlint rules and the two bridge rules each fail on a seeded case, including the imported-void and typed-wrapper cases, through the public command. A valid twin of each case passes through the same command. |
| VR-6 | Caches: `typecheck` reruns after a change to an imported type, a shared tsconfig preset, the compiler pin, an app route, and a type in a workspace that a `scripts/` or `tooling/` program imports; the lint gate, `lint:query` included, is uncached |
| VR-7 | Compiler: all workspaces on 7.1-beta; strict builds on Ubuntu; generators; negative fixtures exact per compiler family; an incompatible route export fails the public `typecheck`; the classic API consumers resolve 6.0.3; the rollback rehearsal. The TS-3 inventory classifies every tracked `.ts`/`.tsx` file by actual program membership, including generated output and intentional negative fixtures. Seed a type error separately in a root config file, in `scripts/` and in `tooling/`. Each error fails both the public `typecheck` and the CI job. For every central-test lint-context program, the failing typed control reports and its passing twin does not. |
| VR-8 | Formatter: `format:check` passes and a second pass changes nothing; each ignore class is neither reported nor changed; protected bytes are kept; each consumer's test; a missing formatter fails closed. A managed-profile run over a directory that carries its own formatter config and plugin loads neither. |
| VR-9 | Staging: a partial stage, a rename, a deletion, an empty stage and a failing tool, on Windows and Linux; no unselected change is staged |
| VR-10 | Edit hook, with the network off: one run per edit; layout only; never blocks; its report reaches the model in each native or T3 context in normal use, with the settings file, profile and worktree recorded. In VS Code with the committed settings, the Oxc extension reports a seeded finding and formats a file on command, and the TypeScript SDK in use is the root 6.0.3. |
| VR-12 | The final revision: fresh frozen install, uncached runs of every gate of section 1 item 8, and the CI results for that commit |

---

## 9. Rollback and maintenance

- **Compiler:** RB-1 (L8). **Backend:** the fallback of L4. **Formatter:** revert the cutover before the formatting
  commit; after it, fix forward. **Linter:** revert the cutover pull request; the repairs made since stay valid under
  ESLint. **Hook:** remove its registration; the commands remain.
- **Upgrades:** the four tools together, in their own change (L1).
- Never turn the anti-slop rules off wholesale, and never add a baseline.

---

## 10. What became of the handoff's recommendations

**Kept:** Ultracite with Oxlint and Oxfmt; the anti-slop rules; TSRS; the 7.1-beta compiler with the classic API
kept; the two-rule Query bridge; Playwright through the JS plugin; two formatter profiles; partial staging
preserved.

**Changed:** one root config with typed flags per run, in place of a package of configs; TSRS in reference mode;
Prettier-default style under Oxfmt, with import and Tailwind sorting off; general ESLint retired at the cutover and
the shadcn rules left on their existing bridge; existing violations handled by staged enablement in the config, with
no baseline file; `lint-staged` kept; the edit hook that develop already has, adapted.

**Rejected:** a suppression baseline in any tool; a fixer in the staged hook; subfolder configs; co-installed
tsgolint; Ultracite's `fix --hook`; inline type imports; the stock `proseWrap` and `trailingComma`; loosening or
deleting acceptance checks; a Stripe endpoint switch in production code; rebinding React Doctor records; copying the
owner's documents into the repository; optional presets that Core has no source for.

**Deferred, each with a follow-up issue:** compiling the central tests (Central test compiler coverage); the legacy
shadcn repair and any port of those rules to Oxlint (with `integrate-design-system-lint`); import and class sorting;
`prefer-query-options`; a process-wide network guard for unit tests.
The optional Landmines preset is deferred because its comment ban conflicts with the required `SAFETY:` comments.

---

## 11. What v11 removed from v10, and what stands in its place

<!-- prettier-ignore -->
| Removed | In its place |
|---|---|
| The fault-patch library, per-test coverage attribution, covered-branch and assertion-count gates | test-first repairs; a failing test for a wrong tenant, amount, permission or retry decision; independent review of the test-file diff |
| The child-process network guard, proxy variables, the integration-tier registry, the Stripe endpoint override | nothing here; a follow-up issue |
| The content-pin scanner, the proof tool, amendment and rebind-note files, the Shadscan rebind tool, `derived-records.json` | the committer re-checks the claim and refreshes the hash with the record's own verifier (L12) |
| The replay verifier and its scratch worktree | one writer, a clean tree, one transform per commit, the command in the message, typecheck and tests after it |
| The custom staged runner, the staged guard, the fix service and its lock | `lint-staged` with new commands, tested on the five staging cases (L11) |
| A second edit hook with its launcher and a ten-cell harness matrix | the hook of #2726, adapted; one observation per native or T3 context in normal use (WF-7) |
| Nine exception classes, linked tests with coverage, marker contracts and ceilings; four owner registries; `runDetached` | a disable names its rule and gives a real reason; unused disables are errors; review |
| Eight custom lint rules | the list of forbidden repairs in every brief and review; a rule only when an evasion is seen |
| `verify:quality` with its activation table and registries | two checks in the existing toolchain verifier; the config smoke test as a unit test |
| The transition config, the legacy-directive list, the typecheck ratchet | the pending list (L5) |
| Compiling all central tests, with a generator and a ratchet | programs for root config, scripts and tooling; strict lint-context programs for central tests; the compile gate as a named follow-up (L9) |
| The shadcn repair, the engine port and the health-tool port | the existing bridge kept; the repair left with its owning change (L10) |
| The mock program's pilots, recipes, recorders, resolution snapshot and 945-property mapping | the mock rule enforced, with the repair rule of section 4.5 and one small evasion rule (MK-1) |
| The whole policy applied identically to tests and scripts | profiles for tests and scripts; an exemption only where its reason would hold in a new, clean file (L6) |
| Four extra app tsconfigs and uncached app typechecks | `.next/types` added to the existing configs; typecheck stays cached |
| The backend parity matrix and repeated performance campaigns | the recorded comparison (E7, E12); one comparison and one before-and-after measurement at completion |
| The money and tenant inventories, the numeric-truthiness list, golden-hash pre-work, the emit-diff tool, the test-ID tool | the repair rules of section 4.5 |
| Sixteen batches on one long-lived branch, with a merge, a full inventory and a gate at each | stacked pull requests into develop (L13) |
| About 660 KB of plan documents | this design, a tracker, a short guide, the evidence record and the council record |

---

## 12. Review record

- **The council.** Three reviewers on three providers scored plans v1 to v9 over ten rounds. No round met the pass
  rule of a 9.2 mean with no hard gate; round 10 scored 8.63. The owner directed that round 10 be the last and that
  the plan be ratified once every finding was resolved; v10 was that plan, and it was not scored.
  `council-record.md` §§1–2 give the requested and selected settings and substitutions. Where a provider did not
  report the model and effort it ran, the selection is all that is known. Which installed guidance each run read,
  and how each wait and follow-up was handled, were not recorded at the time and are not claimed.

  <!-- prettier-ignore -->
  | Round 10 (plan v9) | Claude | Gemini | Codex | Mean |
  |---|---:|---:|---:|---:|
  | Intent and completeness | 9.0 | 9.4 | 9.1 | 9.17 |
  | Evidence and repository fit | 8.7 | 8.4 | 9.3 | 8.80 |
  | Technical coherence | 8.8 | 8.5 | 8.5 | 8.60 |
  | Behavior and integrity | 8.5 | 8.7 | 8.3 | 8.50 |
  | Implementability | 8.6 | 8.3 | 8.1 | 8.33 |
  | Verification quality | 8.8 | 8.3 | 8.9 | 8.67 |
  | Simplicity and maintenance | 8.3 | 8.9 | 8.8 | 8.67 |
  | Operational reliability | 9.0 | 7.9 | 8.0 | 8.30 |
  | Reviewer mean | 8.71 | 8.55 | 8.63 | 8.63 |

- **The simplification** (E79). The plan had grown from 50 KB to 277 KB while its score stayed between 8.4 and 8.8
  from round 3 on. On 2026-11-19 the owner said it may be over-engineered. Three reviewers, each told to look only
  for what could be removed, estimated that between a quarter and two thirds of the effort was removable, and agreed
  on most of the cuts. A fourth reviewer then tried to show that each cut does harm; it refuted none and attached a small condition to
  twelve, all adopted. An arbiter ruled on three questions of scope (L6, L9, L10), and overruled the coordinator on
  one: module mocking stays in scope. The owner said: "update the plan and proceed." Plan v11 was not scored.

---

## 13. Risks and open points

- **Scale.** The repairs are thousands of sites, and the module-mock repairs alone touch about 400 test files. PL-1
  and MK-1 size them before any repair starts. **[U]** Most of the remaining effort is expected here.
- **Parity gaps.** **[U]** A rule the old ESLint configs enforce may have no Oxlint equivalent; PL-0 lists each one before
  the cutover, and a gap that matters keeps the cutover from retiring that rule's plugin.
- **Reviews carry the weight** that tooling carried in v10. A repair that passes its tests and reads well can still
  be wrong; the sensitive cases of section 4.5 are the ones to read hardest.
- **Develop keeps moving.** Several sessions merge into develop daily; stacked pull requests and the bounded wait of
  L12 are how this change follows it.
- **Open for the owner**, none blocking: the unratified `enforce-jsx-a11y-lint` proposal targets the ESLint config
  this change retires, while the Oxlint policy already carries the native `jsx-a11y` rules; and whether the research
  handoff and the assignment are added to this public repository.

---

## 14. Requirement mapping

<!-- prettier-ignore -->
| Assignment | Decisions | Tasks | Verification |
|---|---|---|---|
| 1. Goals, authority, what to preserve | sections 1, 4.5; L5, L6 | all | section 1; VR-12 |
| 2 and 3. Council and subscriptions | section 12; L13 | — | the council record |
| 4. Ground truth, one plan, compact records, the map | section 2; this section | OS-1 | `openspec validate` |
| 5A. Ultracite, Oxlint, Oxfmt, the 18 rules, the crash, forbidden repairs, optional presets | L1, L2, L5, L6; sections 4.1, 4.2, 4.5 | TC-1, TC-2, PL-1, M1, M2, RS-\* | VR-1, VR-4 |
| 5B. TSRS, the compiler, three responsibilities, programs, comparison, fallback | L3, L4, L8, L9 | TC-3, TC-4, TS-1, TS-3, GEN-1a, RB-1, PF-1 | VR-2, VR-7 |
| 5C. Query, six TanStack libraries, boundaries, shadcn, Vitest and Playwright | L10; sections 4.2 to 4.4 | QB-1, PL-0, PL-2 | VR-3, VR-4, VR-5 |
| 5D. Formatter consumers, protected content, skills, convergence | L7, L12 | FM-1 to FM-3, GEN-1b, SD-1, FC-1, FC-2, WF-5 | VR-8 |
| 5E. Hooks, staging, caches, CI, temporary baseline | L5, L11; section 7 | FC-1, LC-1, WF-2, WF-7 | VR-6, VR-9, VR-10 |
| 6. Council rounds and scoring | section 12 | — | the council record |
| 7. What the plan contains | this document | — | — |
| 8. Implementation in parallel, ownership, tracking | L13; section 6 | all | `tasks.md` |
| 9. Completion on the integrated result | section 1 | CL-1, PF-1 | VR-12; the final review |
| 10. Final handoff | section 1 item 10 | CL-1 | — |

**Not done here, by the arbiter's ruling:** compiling the central tests, and the legacy shadcn repair with its
ledger's retirement (section 10, "Deferred"). Each is reported in the final handoff as not done by this change, with
its owner. The clause-by-clause map is `requirement-map.md`.
