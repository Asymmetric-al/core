# Harness durability and declared-viewport repair

Date: November 12, 2026 (task-local Asia/Bangkok date).

Worktree: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only.

## Outcome and boundaries

This is a harness-only repair with offline regression verification, not fresh
capture, accessibility, interaction, product, or frozen-source evidence.

Read the root instructions, testing/general rules, OpenSpec project and relevant
principle clauses, current harness/preflight/catalogues, `core-evidence/report.md`,
and `studio-evidence/README.md`. The core report identifies metrics written only
after shutdown as the reason its interrupted capture retained PNGs but no metrics.
The Studio report identifies the checker's independent desktop/mobile list as the
reason declared 1024px/640px pairs were excluded from check coverage.

No Git, server/service, environment configuration, provider, or live browser
operations were performed. No child agents were used. No capture or check CLI was
executed against a browser. No freeze, refreeze, restore, checkpoint rewrite, or
qualification retry was performed. Existing evidence, fixtures, state catalogues,
and concurrent product/test work were not modified. Root retains the freeze and
later runtime-evidence boundary after the concurrent product fixes.

## Exact changed files

Paths are relative to the worktree above.

- `docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs`
  imports the persistence helper and saves after each completed state/viewport
  measurement, before page teardown, later viewport work, or Studio cleanup. The
  final save remains for the existing end-of-run/empty-result behavior.
- `docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs`
  imports the same `VIEWPORTS` as capture, removes its independent two-width list,
  and uses atomic persistence for its existing incremental save.
- `docs/qa/admin-workspaces-hillclimb/harness-results.mjs`
  is a new shared helper. It stages JSON in a unique, exclusively created file in
  the destination directory, requests a synchronous file flush, then renames it
  over the destination. Handled write/rename failures clean the temporary file
  and propagate. Capture merges by state **and viewport**, preserving saved
  sibling widths and other bounded batches instead of replacing an entire state.
  Empty in-progress states are not added to saved metrics.
- `docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs`
  adds 24 offline regressions that execute the actual CLI source modules in
  isolated VM module contexts, with allowlisted in-memory browser/preflight/axe
  doubles and real temporary JSON files inside this worktree. Unknown imports
  fail. Screenshot methods do not create images. Test directories are removed
  after asserting their parent is the authorized harness directory.
- `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/harness-durability-repair.md`
  is this report.

The existing `harness.test.mjs` was run, not edited. No fixture content, state
selection/setup semantics, product code, package manifests, lockfiles, shared
dependencies, historical reports, or runtime evidence outputs were edited.

## Preserved behavior

Both entrypoints still accept the unchanged positional interface:

```text
capture-workspaces.mjs <outDir> [area,...] [state,...]
check-workspaces.mjs <outDir> [area,...] [state,...]
```

Default areas, comma-separated area/state subsets, module-state inclusion,
`CAPTURE_BASE_URL`, output filenames and JSON shapes remain unchanged. Bounded
state batches can accumulate completed pairs in the same output directory.

The checker now intersects each state's actual `widths` with capture's shared
catalogue: desktop 1440x1000, intermediate 1024x900, small-tablet 640x900, and mobile
390x844. It does not force four widths onto narrower states. It retains setting
the requested dimensions before navigation and restoring them after setup.
Capture's fresh-per-width, full-page, scroll, readiness and fixture paths were not
changed.

Mandatory `prepareFixtureBundle()` still precedes browser launch in both CLIs;
there is no saved-bundle fallback, skip flag, or alternate preflight path. Route
error detection still skips setup for failed routes, records the unexpected
headings, logs the error, and causes unsuccessful exit on a completed run with a
recognized route error. Axe incomplete IDs remain incomplete IDs. Existing
missing-setup/readiness warnings and measurement semantics are unchanged.

An interrupted or failed viewport does not become an empty successful record.
Already persisted pairs survive a later navigation, screenshot, measurement,
scan, or teardown failure. Corrupt prior JSON fails rather than being silently
overwritten. A failed write/replacement retains the prior destination JSON and
does not turn the run into a success.

## Tests and exact verification commands

All commands used the worktree above. Installed runtimes report Node `v24.22.1`
and Bun `1.4.3`. Bun tool invocations used `--no-env-file`; no dependencies were
installed and no configured environment file was changed.

### Red/green evidence

Before implementation, this command exited 1 with exactly two intended
regressions: the first completed capture viewport had no durable metrics file
after a simulated later timeout; checker output contained only desktop/mobile
instead of all four declared widths.

```powershell
node --experimental-vm-modules --test docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
```

After implementation the same two tests passed. Expanded coverage and the final
post-format combined run exited 0: **32 passed, 0 failed, 0 skipped** (24 new
runner tests and 8 existing harness tests).

```powershell
node --test docs/qa/admin-workspaces-hillclimb/harness.test.mjs
node --experimental-vm-modules --test docs/qa/admin-workspaces-hillclimb/harness.test.mjs docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
```

Coverage includes completed-pair preservation on later failures; no invented
unfinished entries; all declared checker dimensions before/after setup;
single-width and comma-separated module/state batches; prior-pair replacement
and retention; legacy default areas; preflight failure before launch/write;
route-error recording/exit/setup guards; corrupt prior JSON; flushed staging and
write/rename failures; and preservation of axe incomplete IDs. An intermediate
test-double failure used a row-probe state unintentionally; its synthetic default
test name was corrected without changing product or catalogue semantics.

### Syntax and lint

Each syntax check exited 0. The checks were executed in a PowerShell file loop;
the individual command arguments are listed exactly here.

```powershell
node --check docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs
node --check docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs
node --check docs/qa/admin-workspaces-hillclimb/harness-results.mjs
node --check docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
bun --no-env-file ./node_modules/eslint/bin/eslint.js docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs docs/qa/admin-workspaces-hillclimb/harness-results.mjs docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
```

Scoped ESLint exited 0 with no findings, including the post-format rerun.

### Formatting

The first source formatting check identified only the two new JavaScript files.
Those two files were formatted; the post-format four-file check exited 0. The
report is checked separately with the final command.

```powershell
bun --no-env-file ./node_modules/prettier/bin/prettier.cjs --check docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs docs/qa/admin-workspaces-hillclimb/harness-results.mjs docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
bun --no-env-file ./node_modules/prettier/bin/prettier.cjs --write docs/qa/admin-workspaces-hillclimb/harness-results.mjs docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
bun --no-env-file ./node_modules/prettier/bin/prettier.cjs --check docs/qa/admin-workspaces-hillclimb/review/round13/runtime/harness-durability-repair.md
```

## Limitations and remaining ownership

- The new tests use synthetic browser, DOM, screenshot, preflight and axe
  collaborators. They verify harness execution/persistence and existing
  preflight wiring, not actual fixture type proof, a live capture/check run,
  runtime accessibility, keyboard behavior, visual quality, or product readiness.
  The 8 existing tests exercise their real helper code with their existing
  isolated collaborators; they are not fresh runtime evidence either.
- `--experimental-vm-modules` is required only for the new offline runner tests
  and emits Node's expected experimental warning. Production CLI invocations do
  not require that flag or any new flag.
- No process was forcibly killed and no power-loss/filesystem-crash test was
  performed. Tests inject failures around real flushed file writes and renames
  on Windows. Same-directory replacement protects the previous JSON while a
  replacement is staged; it does not guarantee directory-metadata durability
  after physical power loss. A hard kill can leave a uniquely named `.tmp`
  staging file and lose the currently uncommitted pair; temporary files are not
  accepted as completed evidence. PNGs and JSON are not a multi-file transaction.
- The existing incremental merge contract preserves prior completed pairs, not
  proof that they were remeasured in the latest invocation. It adds no run-wide
  completion flag or freshness/provenance ledger. Fresh qualification still
  requires root's fixture proof, source freeze, intended inventory, logs, and
  complete fresh evidence; retained earlier pairs must not be counted as fresh
  just because the merged file exists. The historical core metrics remain
  missing and the historical Studio checks remain unrun.
- Atomic replacement is not a cross-process merge lock. Use sequential bounded
  batches or separate output directories for simultaneous writers; this repair
  does not claim race-free multi-writer aggregation into one JSON path.
- No repository-wide test suite, build, typecheck, full lint/format gate,
  fixture regeneration, freeze verification, runtime recapture, or check sweep
  was attempted. No visual score, WCAG conformance, real auth/tenant/provider
  success, or new frozen-source qualification is claimed. Root owns the next
  freeze after concurrent product fixes and any subsequently authorized capture.
