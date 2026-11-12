# Round 13 focused QA harness implementation

2026-11-11. Worktree: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.
This is an independent source and deterministic local check. App owners were
editing concurrently. It is not a visual score, live-route verification, or
completed council.

## Done

- **`studio-new-page-template-picker`:** both runners now share
  [the readiness helper](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:122).
  New page, its validation state and its template-picker state wait for the
  exact heading role, which excludes hidden navigation duplicates. The picker
  declaration is at
  [workspace-states.mjs:798](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:798).
- **Mandatory candidate fixture regeneration/type proof:**
  [fixture-preflight.mjs:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs:11)
  checks the API/database workspace links, typechecks the fixture project,
  rebuilds to stdout, then verifies that exact bundle through stdin. Every
  failing step stops execution. The candidate initially lacked the fixture
  source directory; six source/config files were copied from the frozen tree,
  then adapted locally. No generated fixture JSON was copied or written.
- The gate runs before browser launch in
  [capture-workspaces.mjs:37](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs:37)
  and
  [check-workspaces.mjs:48](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs:48).
  Both inject the verified in-memory bundle into the route installer. Future
  runs write `fixture-proof.json` to their output directory with candidate
  root, check time, bundle SHA-256 and verification result. There is no
  preflight bypass or saved-JSON fallback in either runner.
- **Unexpected route headings:**
  [route-errors.mjs:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/route-errors.mjs:3)
  matches the current route/global/not-found boundaries and Next's default
  application-exception heading. Both runners skip flyout setup when already
  on a boundary, log the state/width, record `unexpectedRouteErrorHeadings`,
  preserve the error-page evidence, and finish with exit 1 if any measured
  state has an unexpected route heading. Capture recording is at
  [capture-workspaces.mjs:269](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs:269);
  check recording is at
  [check-workspaces.mjs:313](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs:313).
- **Intentional failures preserved:** failed CRM/templates lookups, unavailable
  figures and validation messages are not matched as route crashes. The
  failure-scenario module fixture still returns its intentional HTTP 500.
  These cases, heading readiness, gate ordering and failure of each gate step
  are covered by
  [harness.test.mjs](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/harness.test.mjs:9)
  (8 tests).

## Not needed / existing checks reused

- The corrected Reports module fixture already supplies `completeness` at
  [module-fixtures.mjs:1927](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixtures/module-fixtures.mjs:1927).
  It was not added again. The deterministic test checks 537 included gifts,
  10,562,800 integer cents and the deliberate API error scenario.
- The existing fixture verifier already checks freshness against a rebuild,
  determinism, UUIDs, integer cents, list/detail coverage, pagination and
  intercepted query behavior. It is reused rather than replaced. Its new
  input mode is at
  [verify-fixtures.ts:38](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixtures/verify-fixtures.ts:38).
  [export-fixtures.ts:21](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts:21)
  adds stdout mode; existing manual file-writing mode remains available.

## Missing future captures — separate lead work

These are evidence gaps, not verified product regressions.

1. **Email/PDF widths:** capture both studios at 1024, 640 and 390 px after
   the candidate is stable, including PDF's export menu as appropriate. The
   current catalogue is still desktop-only at
   [module-states.mjs:372](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/module-states.mjs:372).
   Neither capture runner was run in this task.
2. **Reports grouping and non-default period:** the sole Reports state is
   the default route at
   [module-states.mjs:342](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/module-states.mjs:342).
   Before adding Missionary/Donor/period evidence, extend the fixture to
   represent those requests honestly: it currently returns `FUND_ROWS` for
   every requested slice and sets all filters to null at
   [module-fixtures.mjs:1920](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixtures/module-fixtures.mjs:1920).
   That is a verified harness limitation; it does not establish a bug in the
   product's grouping or filtering.
3. **Reports loaded trend:** the trend is read on the server through auth
   and `loadDashboardStats` at
   [giving-trend-section.tsx:10](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/giving-trend-section.tsx:10>),
   then streamed by
   [reports/page.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page.tsx:14>).
   Adding a browser `page.route` response alone cannot populate that server
   read. The lead and owning app builder need an approved isolated server
   fixture seam, or must record loaded-state evidence as unavailable. No
   auth or data boundary was changed here.
4. **Fund correction on an eligible gift:**
   [workspace-states.mjs:579](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:579)
   still uses `contributionSheetId`; its builder anchor is the two-line split
   card gift at
   [crm-contrib-fixtures.ts:4451](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixtures/crm-contrib-fixtures.ts:4451).
   The frozen reviews say this anchor did not offer the action. Current
   live eligibility was not tested while app code was changing. Select a
   gift whose real projected contract offers the action, assert that the
   correction dialog actually opens, then capture it. Do not force permission
   or eligibility flags to obtain a screenshot.

## Verification and exact commands

All commands ran with the r12 worktree as their working directory. No dev
server, browser, localhost request, turbo, git mutation or other agent was used.

```powershell
node --test docs/qa/admin-workspaces-hillclimb/harness.test.mjs
```

Result: exit 0, 8 passed. The first readiness test was observed failing before
its helper existed; the route/gate tests were also observed failing before
their modules existed. An additional child-environment assertion failed before
the fixture-only environment was supplied, then passed.

```powershell
node --input-type=module -e "import { prepareFixtureBundle } from './docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs'; const { proof } = prepareFixtureBundle(); console.log(JSON.stringify(proof, null, 2));"
```

Result: exit 0. Targeted TypeScript proof passed; `verify-fixtures: all 1645
checks passed (hooks: no zod; ids: zod uuid + client UUID_PATTERN)`.
Proof time: `2026-11-11T08:41:18.019Z`.
Bundle SHA-256: `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b`.
The gate's child commands are the installed TypeScript 7 compiler with
`--noEmit --incremental false -p docs/qa/admin-workspaces-hillclimb/fixtures/tsconfig.json`,
then Bun `--no-env-file` export `--stdout` and verify `--stdin`.
Earlier integration failures (missing `bundle` JSDoc option, then shared env
validation without `.env` loading) were corrected before this passing run.

```powershell
node tooling/eslint-config/lint.mjs docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs docs/qa/admin-workspaces-hillclimb/workspace-states.mjs docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs docs/qa/admin-workspaces-hillclimb/route-errors.mjs docs/qa/admin-workspaces-hillclimb/harness.test.mjs docs/qa/admin-workspaces-hillclimb/fixtures/crm-contrib-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/verify-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/route-fixtures.mjs docs/qa/admin-workspaces-hillclimb/fixtures/module-fixtures.mjs
```

Result: exit 0, zero errors, three carried source warnings: unused
`compareText` (two rules) in the builder, and the verifier's Zod import order.
An initial lint session became unavailable (`Unknown process id`), so its
result was not claimed; the command above was rerun successfully.

```powershell
$harnessChecks = @('capture-workspaces.mjs', 'check-workspaces.mjs', 'workspace-states.mjs', 'fixture-preflight.mjs', 'route-errors.mjs', 'harness.test.mjs', 'fixtures/route-fixtures.mjs', 'fixtures/module-fixtures.mjs'); foreach ($harnessCheck in $harnessChecks) { node --check "docs/qa/admin-workspaces-hillclimb/$harnessCheck"; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }; Write-Output 'Syntax: 8 files passed'
```

Result: exit 0, all 8 JavaScript files passed syntax checking.

```powershell
bunx --no-install prettier --write docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs docs/qa/admin-workspaces-hillclimb/workspace-states.mjs docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs docs/qa/admin-workspaces-hillclimb/route-errors.mjs docs/qa/admin-workspaces-hillclimb/harness.test.mjs docs/qa/admin-workspaces-hillclimb/fixtures/crm-contrib-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/verify-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/route-fixtures.mjs docs/qa/admin-workspaces-hillclimb/fixtures/module-fixtures.mjs docs/qa/admin-workspaces-hillclimb/fixtures/tsconfig.json docs/qa/admin-workspaces-hillclimb/fixtures/README.md
```

Result: exit 0. Harness tests and lint were rerun after formatting.

```powershell
bunx --no-install prettier --write docs/qa/admin-workspaces-hillclimb/review/round13/max/evidence-harness.md
bunx --no-install prettier --check docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs docs/qa/admin-workspaces-hillclimb/workspace-states.mjs docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs docs/qa/admin-workspaces-hillclimb/route-errors.mjs docs/qa/admin-workspaces-hillclimb/harness.test.mjs docs/qa/admin-workspaces-hillclimb/fixtures/crm-contrib-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/verify-fixtures.ts docs/qa/admin-workspaces-hillclimb/fixtures/route-fixtures.mjs docs/qa/admin-workspaces-hillclimb/fixtures/module-fixtures.mjs docs/qa/admin-workspaces-hillclimb/fixtures/tsconfig.json docs/qa/admin-workspaces-hillclimb/fixtures/README.md docs/qa/admin-workspaces-hillclimb/review/round13/max/evidence-harness.md
```

Result: exit 0 for both commands; all 14 owned files pass formatting.

## Limits and handoff

- The type proof covers the CRM/Contributions builders and real response
  contracts, not every handwritten module response. The Reports regression
  test adds focused structural protection, not comprehensive module typing.
- Heading detection deliberately recognizes specific route boundaries. It is
  not a universal console-error, hydration, network or partial-render detector.
  Existing readiness warnings remain warnings. No claim is made that current
  routes are crash-free.
- The fixture proof identifies the builder checkout; it does not establish
  which revision the live server serves. Bind the future capture server to the
  same stable candidate and use these candidate scripts. Existing processes
  using frozen scripts are unaffected.
- No app or shared UI files, other reports, run log, captures, checkpoints,
  comparisons, fixture data outputs, `.env` files or production data were
  edited. The frozen parent was read only. Full app typecheck/build, runtime
  accessibility and final visual review remain outside this focused task.
