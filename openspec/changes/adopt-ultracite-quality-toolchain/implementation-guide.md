# Implementation guide: Core quality-toolchain migration

This is the runbook for plan v10 (`design.md` in this change). The plan decides what is built and why; this guide puts the
work in order and says what to run, what must pass, and what to write down. If the two disagree, the plan wins and this
guide is corrected in the same commit. Section and decision numbers (§4.7, D12) and task IDs (TC-1, CT-0a) are the
plan's. Evidence numbers (E1–E77) are in `evidence.md`.

## 1. Who does what

**The coordinator** is the main agent in the T3 thread that owns this change. Only the coordinator writes:

- `bun.lock`, the root manifest, root configs and `turbo.json`;
- `tooling/quality/**`, `.prettierignore`, the UI-bridge ledger and every registry;
- the mechanical batches (CT-0b, M1, every M2 batch);
- `.github/workflows/**` and the hooks;
- merges, integration and pushes.

**Delegates** work in their own worktrees on disjoint, generated path sets (slices), or on a named tool with its tests
(A4's formatter consumers, PL-2, FP-1). A delegate never edits the files above, except that a slice prunes the UI-bridge ledger for
its owned paths through the ledger transaction (D12); it never pushes and never starts its own
delegates, with one exception: PL-2 and FP-1 write their files under `tooling/quality/**` in their own worktrees, and the
coordinator reviews and commits them. In batch A1 only, a delegate may also draft a named tool's new files and tests in
its own worktree under the conditions of plan §8.4 (E77): the coordinator keeps every manifest, root config, registry
and record, TID-1's test repairs and the AP-1 inventory, and integrates one tool at a time. Each one receives: this guide, the plan with its version, its packet (owned paths, pinned files, registry entries,
counts, the base commit its worktree starts from, the tasks it depends on), the commands it must pass, and what to
return.

**Models.** Delegates are a mix: Codex `gpt-6.2-astra` at `xhigh`, Antigravity `gemini-4-neon` at `xhigh` (its option is named `thought_level`), and Claude
`claude-opus-5-5` at `xhigh` or `high`. No delegate runs at low effort. Call `orchestrator_capabilities` once per thread
before the first `delegate_task`, and use `isolation: "worktree"`. Confirm a quota or availability failure from a provider error or exposed usage data; slowness or a timed-out wait is not proof. Prefer another configured, authorized instance supporting the same model and effort; otherwise use an authorized Claude Code or Codex alternative and record the substitution. Stop or cancel superseded work and confirm its write ownership has ended before reassigning paths. Use the supported `providerInstanceId` on a fresh task. Send the checkpoint and a standalone brief; preserve partial work and require its inspection before completion. Continue unaffected work and do not retry an exhausted instance.
When a provider refuses a model (on 2026-11-19 Cursor refused `gemini-4-neon` although it was still listed, and the owner then moved the Gemini seat to Antigravity), move that
work to another configured Claude or Codex subscription and record it; do not substitute a different model on that
provider without the owner. Keep heavy reading off the coordinator's own subscription: a usage limit there stops the
coordinator and every delegate it is waiting for.

If the coordinator is blocked, use only a continuation or switch exposed by T3; do not assume it can act after inference stops. If a human must select the replacement, leave the exact T3 selection action and a durable checkpoint with the next task before access is lost, where possible. Use only authorized subscriptions: never copy credentials, log out another session, change global account directories, call private APIs or switch to paid API billing.

**Tracker.** `tasks.md` holds every task ID with one status: planned, in progress, implemented, integrated, verified or
blocked. "Verified" needs the command, the revision and the result written next to it. A delegate's report is not
verification; the coordinator reruns the acceptance commands on the integrated tree.

**Checkpoints.** At each batch boundary, and before any long run, append to the change's `checkpoint.md`: branch and
revision, uncommitted changes, plan version, the batch in progress, active delegates with their providers, open
findings and the next step. Include each open task ID and its current owner, and link the evidence already completed for that task. A replacement must be able to locate the work and its results from the checkpoint alone.

## 2. Rules for this machine

These come from the machine's recorded notes (2026-11-19). They are not style preferences; each one has cost a full gate
run before.

1. **Windows cannot pass the pre-push gate.** Develop has about 144 Windows-only unit failures. Edit and run focused
   checks in the Windows worktree; commit and push from a standalone WSL clone (Ubuntu-24.04), not a linked worktree.
   Compare any failing test names with develop's Windows-only set before investigating them.
2. **One pre-push gate at a time on the machine.** Before every WSL push take the shared lock and hold it until the
   push and its hook end: `exec 9>/tmp/core-prepush-gate.lock; flock -n 9 || exit`. If it is held, wait and retry. The
   gate takes about 40 minutes and prints nothing for long stretches; that is normal.
3. **Never kill by process name in WSL.** All sessions share one distro and user. Stop only your own PIDs.
4. **Push settings:** `-c http.version=HTTP/1.1`; the Windows `gh.exe` as the clone's credential helper;
   `GIT_TERMINAL_PROMPT=0`; a refreshed `origin/develop` ref before the gate; private `TMPDIR`, `TEMP`, `TMP` and
   `BUN_INSTALL_CACHE_DIR`, each exported in its own statement.
5. **Never `git add -A`.** Stage named paths. Never use a bare `git stash`. Never use `--no-verify`.
6. **Every new worktree needs `bun install --frozen-lockfile`** before any check. Turbo's cache is shared across
   worktrees, so a poisoned cache crosses them; lint is uncached by design and app typechecks become uncached at A2.
7. **Line endings.** Files written on Windows may be CRLF. Normalize hand-edited files with `tr -d '\r'` before they
   go to the WSL clone; run `skills:sync` and the skill-audit hash tool on Linux only.
8. **`verify:shadcn-diff` depends on `ui.shadcn.com`.** Probe one registry URL first; if the machine is rate-limited,
   wait rather than retry in a loop, then retry later or from another approved network. A skipped networked checkpoint
   is reported as skipped; neither it nor the offline refresh counts as the checkpoint passing.
9. **Typed lint under parallel agents:** set `CORE_LINT_PARALLEL=1` so each TSRS run uses a quarter of the cores (D4),
   and run at most four typed lints or typechecks at once on the machine (plan §8.4).
10. **Shell text:** never put backticks or Markdown in an inline shell command; pass a script file.

## 3. Routines used by every batch

**Start (IN-0).**

1. `git fetch origin`, then merge `origin/develop` into the branch. Record the new base in the checkpoint.
2. Read D13's table against the merged tree: which in-flight changes have landed? Apply the "has merged" column.
3. Regenerate the CTI (the unlimited `git grep` for every path, script and command this batch changes) and AP-1's pin
   inventory. Their output, not the plan's examples, is the batch's work list.

**Commit.** Every commit passes the hooks in force. Inside a batch, commits also pass the batch's stated commit checks.
Nothing is pushed inside a batch.

**End (the batch gate, §8.1).** In this order:

1. the batch's own checks;
2. derived records, last, in the derived-record order of §8.3 (skills, Shadscan while it exists, shadcn, pins, the UI
   ledger), each with a proof (mechanical batch) or a note in `rebind-notes/<batch>.json` (any other batch). One
   exception: while the Shadscan pre-commit step exists, a file that Shadscan cites is rebound in the same commit that
   changes it, or the hook rejects the commit (E21, E32);
3. `bun run lint`, `bun run typecheck`, `bun run format:check`, `bun run verify:quality`;
4. `bun run test:unit` and `bun run test:acceptance` in WSL;
5. tracker and checkpoint updated with commands, revision and results.

**Push.** `bun run ci:preflight` explicitly in the WSL clone, then the push under the gate lock (rule 2). CT-0a and
CT-0b are pushed together.

**When a gate fails.** Find the cause first. A failure the batch caused is fixed in the batch. A failure that also
occurs on develop at the same base is recorded with its evidence and reported, not hidden. Never widen an ignore, add
a suppression or loosen a test to get a pass.

## 4. Phase A: tools, cutover and mechanical batches (coordinator)

Each entry lists the goal, the ordered steps, the gate, and the traps that evidence already found.

### A1. Records, tools and the inactive toolchain

**Goal:** every tool that later batches depend on exists and is tested before any source is touched.

1. IN-0. Create the branch from current develop. Create the OpenSpec change if it is not on the branch yet (OS-1 links
   `integrate-design-system-lint` tasks 5.4–5.10).
2. **TID-1.** Delete the duplicate one-line file `tests/unit/packages/api/missionary-directory.test.ts`; wrap the cases
   of `tests/unit/scripts/supabase-migrations.test.ts` in a `describe`; record both in `test-moves/A1.json`. Add
   `scripts/quality/test-ids.mts`. Check: `vitest list --json` over the whole repository exits 0 on Windows and Ubuntu.
3. **Record tools:** SD-1 (three modes), AP-1 (five pin kinds, `pin-amend-proof.mts`); run AP-1's inventory as soon as
   it exists (A1's IN-0 could not), before step 5 edits the root manifest. SR-1 is not built up front:
   build it only if `tooling/shadscan/findings.json` still exists when step 5 edits the root manifest (D13). No React
   Doctor tool: that ledger is never edited.
4. **VM-1:** `verify-mechanical.mts`, `scratch.mts`, `derived-records.json`, and all controls of §8.3, including the
   changed-lockfile, unformatted-record and React-Doctor-edit failures. Until CT-0a the `oxfmt` replay calls the pinned Oxfmt
   directly, since `bun run format` is still Prettier; the `m1` and `m2:<rule>` replay controls are completed at A3 with FIX-1.
5. **TC-1:** install the cohort of D1 at exact pins with the lockfile in the same commit; Oxfmt installed but inactive.
   **TC-2:** the Ultracite patch with its 15 fixtures. **TC-3:** the first `oxlint.config.mts` (the `core` preset with the D2 spreads; PL-1 completes it at A3) and `lint.mts` (chunker, entry table, writer-flag
   refusal, root-entry guard, path classification, and the exit-code contract: findings exit 1; a crash or setup
   failure exits 2 and never reads as findings or as a pass). **TC-4:** TSRS identity on Windows and in WSL (Ubuntu) here; CT-0a adds the Ubuntu CI step.
   **TC-6:** qualify `@shadcn/lint` 0.2.5 against 0.2.3 with its patch; record the result, apply nothing.
   **FM-1:** write `oxfmt.config.mts` (D8), the `.prettierignore` additions, and the ignore-behavior and
   protected-bytes tests; they stay inactive until CT-0a.
6. **VQ-1:** add `tooling/quality/verify-quality.mts` and the root `verify:quality` script with the A1 rows of the
   activation table (plan §7.1). Gate: §8.1.

**Traps:** `extends` drops `env` and `ignorePatterns` (E47), so every entry spreads them. Typed rules are silent
without `--type-aware` (plan §2, from the round-6 reviews). TSRS finds only directory-rooted `tsconfig.json` files (E28). The anti-slop alias defect
crashes two rules without the patch (E18, E22).

### A2. Compiler upgrade

**Goal:** TypeScript 7.1.0-beta compiles all 16 workspaces; classic 6.0.3 keeps serving the API, parser and editor.

1. IN-0. **TS-1:** the root alias, 16 pins and the lock together; the two type-only Admin repairs (five TS2883 sites
   in two files, E11); `"ES2023.Intl"` in every `lib` declaration, including `packages/eve-runtime`. In the same
   commit: the version verifier and its test (plan §5.2 and §5.3: today's checks kept, plus the roster, the literal
   alias, physical classic resolution and the new negatives); the capability family table; forward-slash specifiers
   in the Principal harness; the TypeScript rulebook, the readiness guide and the shared-config README.
2. App typecheck: add `.next/types/**/*.ts` to the three product apps' `include`; add `tsconfig.typecheck.json` to all
   four apps (`incremental: false`, no `.next/dev/types/**`); set each `typecheck` script to
   `next typegen && tsc --noEmit -p tsconfig.typecheck.json`; declare the four `@asym/<app>#typecheck` tasks in the root
   `turbo.json` with `cache: false`.
3. Negatives: an incompatible route export fails the public `typecheck`; an error injected into `validator.ts` fails a
   direct compile; `--listFilesOnly` lists the validator.
4. **GEN-1a** (a leg that cannot run is reported as unverified); **RB-1** (scratch dry run: pins, alias, lock and
   verifier expectations back to 7.0.2, typecheck green); strict builds per platform: Ubuntu with
   `--force --summarize` and every task a cache miss; win32 clean-state direct builds with logs; Factory Console built
   explicitly.
5. Gate: §8.1 plus the strict builds. Rebind notes for every proof-cited manifest the batch edited.

**Traps:** tsconfig `include` has no brace expansion (E52). The version verifier needs an exact pre-release pattern on
the native side only, and keeps every check it makes today. On Windows the Principal harness breaks unless its module
specifiers use forward slashes. Vendored manifests that declare the alias are not edited.

### A3. Policy, inventories and owners

**Goal:** the full policy exists and is proved rule by rule before it gates anything; every inventory that slices will
be measured against is generated.

1. IN-0. **PL-0..PL-5:** the parity set and gap list; the per-rule anti-slop policy with fixtures; framework scoping
   (delegated); the prescribed repair forms; layers and the composition test; the `core/*` rules of D5
   (`no-module-mock-evasion`, `no-trivial-type-predicate`, `no-generic-primitive-predicate`, `no-silent-catch`,
   `no-cast-helper`, `no-test-double-cast`, `one-assertion-per-safety-marker`).
2. **FIX-1:** the fix entry `oxlint.fix.config.mts`, `fix.mts` (lock with platform, streamed listing, batch and
   explicit-path modes, fixed point) and `staged-guard.mts` (policy-input guard, untracked-config detection, the
   inherited `GIT_INDEX_FILE`); then complete VM-1's `m1` and `m2:<rule>` replay controls.
3. **Inventories:** MI-1 (`money-scope.json`, `numeric-truthiness.json`), TA-1 (`tenant-auth-scope.json`, the Payload
   access wiring check), GH-1 (golden hashes from raw input), `legacy-directives.json`, `handler-inventory.json`.
4. **Owners:** PO-1 (predicate owners and doubles owners), RD-1 (detached owners, reporters, notifiers, failure
   values; review the inventory's "other" group once), RD-2 (`runDetached`).
5. **FP-1** (delegated across the mix, integrated by the coordinator): the fault-patch library and `fault-patch.mts`.
   Every patch must fail at base on its recorded assertion; list the unprotected functions.
6. Gate: §8.1, the composition test, sentinels through each root entry, the golden tests, every library patch failing.

**Traps:** a config-level `reportUnusedDisableDirectives` fails untyped runs on typed disables (plan §2, from the round-6 reviews); use the CLI flag
on typed full-policy runs only. One directive satisfies both cast rules (E19). Mock-detection evasions are invisible to
the stock rule (E20), which is why `no-module-mock-evasion` runs on all files.

### A4. Formatter consumers (worktree delegate, then coordinator)

**Goal:** port the §6 consumers without changing published bytes before CT-0a. Qualify the pinned Oxfmt path on fixtures in A4; activate it at cutover.

1. **FM-2:** add `scripts/lib/format-source.mts` with the `trusted` and `managed` profiles and their error contract;
   it fails closed when the formatter is missing. **FM-3** (worktree delegate): port every §6 consumer with its tests.
   Gate: the consumer tests (VR-8).
2. Run the D8 profile and ignore controls, including root CLI/managed-adapter parity. Run the §6 consumer fixtures against the staged tree; compare published files and audit records before and after each rejection.
3. Review `taste-charts-safety.json`, `taste-preview-safety.json`, `taste-inspect.mjs`, `taste-scenes.mjs` and `taste-preview-boundary.mjs` under `scripts/refresh-overlays` against the raw inputs and expected adapted bytes. Re-attest only reviewed changes through D9. Keep Phase 25 byte-exact.

### A5. CT-0a then CT-0b

**Before starting:** CT-0a edits the same files as the open pull-request stack of D13 (`ci.yml`, `.husky/pre-commit`,
the hook registrations, three contract tests). If that stack is still open at A5's IN-0, hold A5 for up to two working
days, then proceed; later conflicts in those files resolve to develop's version and this change's edits are re-applied.
If PR #2726's edit hook is on develop, CT-0a also switches its Prettier and ESLint calls to Oxfmt and Oxlint, and changes its line "pre-commit's eslint --fix applies them"
to name `bun run fix -- <path>` (D13).

**CT-0a (semantic cutover), in the plan's order.** The steps that round 10 changed:

- Step 1: land the editor settings (`.vscode/extensions.json`, `.vscode/settings.json`; WF-6, D11) in the same commit
  as the formatter, and record the editor check in VS Code and Cursor. The staged runner formats the staged bytes and
  writes only the index. It never runs `git add` or refreshes working files; inspect the named paths before staging anything else (D10). Prove it with the interleaving control before relying on
  the hook.
- In the CTI, inventory ESLint uses of `--fix-dry-run`, `--output-file`/`-o`, `--no-inline-config`, `--no-color`, `--stats` and `--no-warn-ignored`; do not forward them to Oxlint 1.94. Map color through the environment, document unsupported operations, and migrate any report-to-file caller to JSON output and redirection or explicitly retire it with its command. Leave flags used by the surviving ESLint bridges on those bridges; revisit UI callers at W-UI.
- Step 2: remove the general ESLint plugins and `eslint-config-next`; once step 3 has added the `lint:query` dispatcher, run a frozen install and then `lint:ui`,
  `lint:query` and `verify:eslint` to prove nothing still imports one. Write `bridge.config.mjs` exactly as qualified
  (E63): parser, design-system layer, the no-op stub for the nine vendored files.
- Step 2: give `lint.mjs` chunking, `--paths-file`, extension and ignore filtering, `--no-warn-ignored`, the dead-key
  check and the owned-key prune check. Reduce `verify:eslint` to one health run.
- Step 5: convert `eslint-disable*` **and** `eslint-enable*` directives in JS/TS-family sources only. Remove the
  checkout's inline configuration comment and add the `react/refs` override for that file to the transition entry.
- Commit checks: the bridge gate on the converted tree; the seeded ref-read control through both Oxlint entries;
  `oxfmt --list-different .` equal to the regenerated CT-0b inventory.
- Step 6: regenerate Phase 27/28/29 projections with each `render-spec.mjs --write`; regenerate changed roadmap or workflow-studio projections with their Python owners’ `--write` modes. Run `verify:phase25-spec`, `verify:phase27-spec`, `verify:phase28-spec`, `verify:phase29-spec`, `verify:openspec-deltas` and `verify:program-roadmap`.
- Measure the CI lint job (§7.2) on a `workflow_dispatch` run of `ci.yml` on the pushed branch; push events run CI only
  on `develop` and `production`. Above 20 minutes, split it.

**CT-0b (mechanical only).** `bun run format` from the root: Oxfmt over the format scope (D8), which is wider than the
lint scope and includes the canonical skills Oxfmt changes. It is not a `fix.mts` run. The changed files must equal the
reviewed inventory. Then derived records in order (the skill sync and audit hashes first);
`verify-mechanical --transform oxfmt`; the full §8.1 gate; then a follow-up commit adding CT-0b to
`.git-blame-ignore-revs`. Push CT-0a and CT-0b together. Run the networked `verify:shadcn-diff`.

**Traps:** Oxfmt changes about 233 files with the compatible options, and 6,112 with the stock preset (E10); the
config in D8 is the compatible one. Oxfmt would rewrite three archived OpenSpec files and the factory pack, which is
why both are in `.prettierignore`. On Windows the full staged commit only works through path files (round 10).
Revert CT-0 only before M1; after M1, fix forward.

### A6. Test programs (TS-2) and A6b. Parity

1. IN-0. `sync-test-programs.mts`, the program registry, generated paths and excludes, the three import repairs, the
   sentinel program with no suppressions, healthy-run classification, the ratchet file and its `typecheck:ratchet`
   updater; the root program with Node types and the ES2023 library; the Base UI fixture program extended to every
   browser entry.
2. Central `lint:query`: one ESLint process per central program, at most two at once; measure heap and time; split a
   program above 2.5 GB (E23). Retime the complete lint job with the central programs enabled and apply the §7.2 20-minute split rule.
3. Gate: zero TS2307/TS7016; healthy runs; blocking programs exit 0; ratchet recorded.
4. **A6b:** TC-5 (freeze the nonzero A6 full-policy commit and run the §7.4 parity matrix with the same inputs on disposable copies) and the FB-1 dry run in a scratch
   copy. Neither is merged.

### A7. M1 and A8. M2

**Only the coordinator writes.** No delegate and no hook writer runs during a mechanical batch.

1. IN-0. Run the batch through `fix.mts` batch mode. For M2, one rule per batch, then its M1 pass; revert any file that
   fails the M2 gate and record it in the batch record's `reverted` list.
2. Whole-repo Oxlint transition gate; derived records in order; `verify-mechanical`; §8.1.
3. For M1, compare parent and head with TID-1 on the same platform: IDs must match in each entrypoint, with gated IDs compared in their integration job. Run the full-scale Windows hooked-commit rehearsal. Add only the standalone M1 commit to blame-ignore here, never an M2 rule commit.
4. M2 gate: touched files at zero diagnostics before and after; ratchet unchanged; identical test IDs (TID-1) and
   Playwright list; networked `verify:shadcn-diff` when `packages/ui/**` changed.

**Traps:** bulk "type-only" fixes broke 108 compile sites in qualification (E27): that is why the type-import batches
check emitted import order and why M2 skips files that have compile diagnostics. A narrow fix run at the ledger's
working directory wiped ledger entries (E37): fixes run from a private working directory through the root entry.

### A9. Inventory and packets

INV, the slice map and one packet per slice: owned paths, pinned files, registry entries, the per-rule counts with
their prescribed forms, the numeric-truthiness and handler counts, the fault patches that reach the slice's files.
Record the PF-1 baseline revision, command lines, cold/warm setup, thread settings and measurements (§7.4). Keep the same baseline available for the paired C1 and C5 runs.

## 5. Phase B: slices and mock pilots

**Order.** The Supabase and Stripe seam commits come first (W-MOCK-SB with the coordinator's W-MOCK-SB-CI commit, then
W-MOCK-ST). Other pilots and the RS-* slices follow in parallel, with bounded concurrency (§2 rule 9). A slice uses a
mock recipe only after its pilot has landed, and the pilot names the file that proves the recipe. RS-PACK repairs the factory
pack under its own operational review and ships as a new pack.

**No edit hook yet.** The agent hook is activated at WF-2, in Phase C. Until then a slice agent runs
`bun run fix -- <paths>` itself for the reviewed safe fixes and `bun run lint:fast -- <paths>` for the report.

**W-MOCK-SB, in order:** the guard module and setup changes (deny-all re-installed per test, socket guard, refusal
record, process-wide preload, the `node:child_process` wrapper, cleaned environment, proxy variables with port-qualified exemptions); the migration of module-level, hoisted and
`beforeAll` `fetch` replacements from the stub inventory; the registry with its 27 first entries; the three-leg
control; then the recorder recipe on the first Supabase files. Run the whole unit suite once with the proxy variables
and list every test that newly fails: each is a network-reliant test.

**What a slice does, in order:**

1. Read its packet. Run `bun run lint:fast` on its paths to see the full-policy findings.
2. For each finding, use the prescribed form (§4.1, §4.2). Write the test first for a behavior-relevant edit. Never
   repair by `any`, a disguised assertion, an always-true guard, an empty safety comment, a mock-detection dodge, a
   deleted negative test or a removed runtime check.
   For the eight Query findings (§4.4), compare the normalized `donor-feed-posts.ts` fields and the CRM `domainsKey` with the actual fetch inputs; run the CRM domain-order key test. Keep the preview-path function out of the key in `use-published-page-url.ts`; compare `versionsUrl` with the `givingPagesUrl` key in `MissionariesHubView.tsx`. In `admin-crm-infinite.ts` and `admin-contributions-infinite.ts`, test whether depending on the actual `refetch` functions preserves refresh behavior for all three whole-result dependencies.
3. Money and numbers: `isNonZero`, `isNonZeroBigInt`, direct `x !== 0n` on a non-nullable bigint, or an owned predicate on the same operand. Otherwise list the change and test zero, a negative, applicable missing values and (number only) `NaN`.
4. Failure handlers: rethrow, a registered reporter or notifier, a registered failure value, or class R with a linked
   fallback test.
5. Mocks: follow the recipes of §4.7; record the old call-shape assertions as properties before redesigning.
6. UI files: the shadcn debt is repaired at W-UI (D12). If an edit lowers a shadcn count, prune the ledger for owned
   paths only; stage source and ledger
   together.
7. Return the slice ledger: exceptions and markers against the ceilings, doubles-owner call sites, new predicate-owner calls alongside removed `typeof` checks,
   pin amendments, rebind notes, test moves, listed behavior changes.

**Slice acceptance (the coordinator runs it, §8.5):**

- zero full-policy findings and zero compile diagnostics in owned files; no new ratchet key or higher count elsewhere;
- test IDs and Playwright list: every loss mapped; assertion counts not lower without a note;
- covered-branch count per file not lower; added branches covered; changed emitted lines executed;
- select fault patches for edited functions and for test reachability at base or head; each recorded protecting test still fails on its own assertion;
- the exact test named by each new or retargeted link executes that link’s marked code on its own;
- golden hashes unchanged; unit and acceptance tests pass;
- an independent semantic review by a different model than the slice's author.

## 6. Phase C: integration and close-out

- **C1 (IN-1, SW-1).** Merge slices in dependency order. Gate: the C1 list of §8.2, with `lint:new` at zero over the
  whole repository and every central-test program at zero.
- **C2 (CT-1, CT-T).** Flip `lint:ox` to the full entry with unused-directive errors; delete the transition entry and
  `legacy-directives.json`; flip every remaining program to blocking and delete the ratchet file and the `typecheck:ratchet` updater. All three go into
  `retired.json`.
- **C3 (W-UI, serial).** First capture the before screenshots of every route whose markup the repairs may change. Repair
  the UI ledger to zero through the bridge, `packages/ui` first and then its consumers (SD-1 `--amend` for
  registry-owned files);
  convert shadcn directives; move the six rules into the full Oxlint entry, scoped to the six UI workspaces (TC-6's
  choice of version). In that commit `@shadcn/lint` becomes a root devDependency; its patch moves to
  `tooling/quality/patches/` with the `patchedDependencies` entry repointed, or both are removed if 0.2.5 was chosen.
  Run a frozen install, and port the twelve `design-system-*` suites to the Oxlint engine and see them pass with their
  negative controls still failing (D12), before deleting anything. `quality:health` (`tooling/quality/health.mts`, the port of
  `health.mjs`) replaces the bridge's health check. Then delete the bridge, the workspace, and `verify:eslint` with its
  script and its three callers (`validate:full`, `ci-preflight.mjs`, `ci.yml`); record `suppressions.json` and the bridge in `retired.json`; run
  the networked `verify:shadcn-diff`. Do this in two parts. **W-UI-a** is the
  repairs: it ends on a recorded revision where the bridge gate passes with an empty ledger. **W-UI-b** is everything
  from the directive conversion to the deletions, as one commit, so that reverting that commit alone returns to the
  zero-debt bridge and keeps the repairs (§11). W-UI-a may be delegated; W-UI-b edits the lockfile, the root
  manifest, root configs and `ci.yml`, so the coordinator makes it (§8.4, D13).
- **C4 (WF-1..WF-7).** Hooks, skills, editors and docs. WF-2 registers one edit hook per harness, merged into the
  existing registration files with every other key kept (`env.MCP_TIMEOUT` in `.claude/settings.json`). The hook writes
  layout only (the blank-line fix and Oxfmt), never blocks, names the files it rewrote and what it could not check, and
  stops at 100 seconds (D11). If PR #2726's hook is on develop, WF-2 replaces its registrations with the launcher,
  carries its test cases and its requirements' scenarios into VR-10, and deletes its script (D13). WF-7 observes each
  harness on Windows and in WSL in its normal trust and permission mode, records that mode and the hook's wall time,
  relaxes nothing to make a hook load, and decides Cursor's channel; a harness whose feedback the model cannot see is
  documented as explicit-command only. WF-6 repeats the recorded editor check in VS Code and Cursor (the settings landed
  at CT-0a): after W-UI a seeded shadcn finding must appear in the editor through Oxlint.
- **C5.** PF-1 confirmed against the baseline; RB-1 repeated; OpenSpec reconciled; VR-12 on a fresh frozen install of
  the final revision, with Turbo's cache bypassed and the remote CI results for that commit recorded; an independent
  final review by at least two fresh reviewers from the model mix, on different providers; the pull request with the
  council record and evidence. Confirm that the research handoff still matches the digest in the plan's header. Then
  the final handoff (§9 below).

## 7. When each verification runs

<!-- prettier-ignore -->
| Check | First runs | Repeats |
|---|---|---|
| VR-1 anti-slop patch | A1 (TC-2), A3 (PL-1) | cohort upgrades |
| VR-2 TSRS identity | A1 (Windows, Ubuntu) | every CI lint job; A6b (FB-1 dry run); C5 |
| VR-3 import tiers, VR-4 composition and sentinels | A1 (VR-4 for TC-3 and TC-6), A3 | CT-1, W-UI |
| VR-5 Query | A3 (the five Oxlint Query rules, PL-2), A5 (workspaces), A6 (central programs) | C1 |
| VR-6 caches and CI range | A2, A5 | C4 (WF-3, WF-4); C5 |
| VR-7 compiler, strict builds, generators | A2 | A5 (GEN-1b); C5 |
| VR-8 format, consumers, records, `verify-mechanical` | A1, A4, A5 | every mechanical batch |
| VR-9 staging, fixing, UI ledger | A1 (TC-3), A3 (FIX-1), A5 | M1 rehearsal, W-UI, C4 (WF-1) |
| VR-10 agent hook | C4 | — |
| VR-11 programs and ratchet | A6 | CT-T |
| VR-13 behavior protections | A1 (TID-1 test-loss control), A3 (rules), W-MOCK pilots (network, Stripe) | slice acceptance |
| PF-1 | A5 and A6 CI job timing; A9 baseline | C1 integrated rehearsal before CT-1; C5 confirmation (§7.4) |
| VR-12 | C5 | — |

## 8. If something goes wrong

<!-- prettier-ignore -->
| Symptom | Action |
|---|---|
| TSRS identity mismatch, or a missing or substituted launcher (exit 2) | Stop. Do not fall back silently. FB-1 is a replacement transaction rehearsed at A6b; using it is a recorded decision |
| A reproducible TSRS defect that blocks typed lint | If remedies cannot clear the gate, follow design §11 to record, review and report the use of FB-1; the compiler is untouched |
| A reproducible compiler regression still blocks a gate after remedies are tried | Follow design §11 for review and handoff. RB-1 is a narrow forward change that returns the pins, alias, lock and verifier expectations to 7.0.2 and keeps the fixtures, `ES2023.Intl` and the repairs |
| CT-0 must be undone | Revert only before M1; after M1 fix forward |
| `verify-mechanical` fails | The batch contains something the transform did not produce. Find the path; never edit the verifier to accept it |
| A dead UI-ledger key | The owner of that path prunes it; the coordinator prunes paths no slice owns, with a full-scope prune |
| The pre-commit hook says it formatted a file in the commit | The hook writes only the index. The commit holds the formatted staged content and the working file keeps its old layout: run `bun run format -- <paths>`. If the file also has a later edit that belongs in the commit, stage it and commit again |
| The lint job passes 20 minutes | Split `lint:query` and `lint:ui` into parallel jobs in a coordinator commit |
| A hook or workflow file conflicts with #2710 or #2711 (PR #2726) | D13 names the owner: resolve to develop's version and re-apply this change's edits on top |
| An in-flight change's requirements reach `openspec/specs` | At the next IN-0, add this change's MODIFIED delta where D13 says one is needed, and remove any requirement of this change that would then have two homes |
| A network-reliant unit test appears | It moves to the integration tier through a coordinator registry entry, or it gets a recorder |
| A gate dies with SIGTERM in WSL | Another session's kill or load; check other threads before retrying (rule 3) |
| An implementation fact contradicts the plan | Record it in the evidence record, update the affected decisions and tasks (new IDs, none reused), and get a focused independent review of that change only before the affected batch continues. Reopen the full council score only if the change materially invalidates the plan (plan §8.1) |

## 9. What "done" requires

§12 of the plan, on a fresh frozen install of the final reviewed revision, with exact commands, revision, environment
and results recorded, and each check marked as run locally, run in remote CI on that commit, or not run: one policy
through root entries; TSRS proved as the backend on Windows and Ubuntu; the compiler
and the classic API both working; anti-slop, Query, Shadcn, architecture and money checks each catching their seeded
failure; formatter consumers, protected bytes, staging, worktrees, caches and hooks behaving as specified; every gate
green; no suppression, ratchet or bridge file left, every other migration-only artifact deleted or kept with its stated
maintenance role, and anything still in place reported as unfinished. Then the final handoff: what was implemented and
why with exact versions; the council's models, efforts, substitutions, rounds and scores; which handoff recommendations
were kept, changed, rejected or deferred; what was demonstrated and what was not; the commands and the native, T3 and
editor workflow to use from now on; and any remaining blocker, unfinished goal, fallback or manual step.
