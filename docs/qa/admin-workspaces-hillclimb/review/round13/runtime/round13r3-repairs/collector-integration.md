# R13r3 collector integration

November 12, 2026 (Asia/Bangkok). **Source integration and deterministic harness verification only; not collected runtime evidence or acceptance.**

All work is confined to `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Q below means `docs/qa/admin-workspaces-hillclimb`. This report follows the existing [catalogue/setup repair report](catalogue.md); that report is not modified.

## Owned changes

Only these existing files and this new report are edited:

- `Q/capture-workspaces.mjs`
- `Q/check-workspaces.mjs`
- `Q/harness-runners.test.mjs`

No product/shared UI, catalogue/setup/inventory modules, fixture definitions, manifests, frozen artifacts, prior evidence, ledger, environment or provider configuration are changed. Concurrent changes are preserved. No child agents, real browser, server, provider operation or Git write is used.

## Integrated contracts

- Both collectors use the real `catalogue-inventory.selectStates` API with raw CLI area/name strings. The shared selector owns trimming and validation: empty/whitespace/trailing-empty selections, unknown/retired names or areas, duplicate tokens, duplicate catalogue names, empty catalogues and name/area mismatches fail. They cannot silently capture a valid subset or report an empty success.
- Selection and optional eligibility validation finish before `mkdirSync`, fixture-proof writes and browser launch. Existing evidence and fixture-proof bytes are untouched on selection failure. The existing mandatory `prepareFixtureBundle()` still precedes selection; its candidate type proof, in-memory fixture regeneration and verification are not bypassed.
- Both collectors call the exact supported factory API `createStates(fixtures.captureMeta, fixtures)`. This binds the preflight bundle into the real `giftMenuSetup(meta, bundle)` closure used by `state.setup(page)`; no invented setup-context argument or replacement anchor API is introduced. Route fixtures receive that same bundle object.
- The real gift-menu setup must qualify the current donor/gift-specific amount/date/fund accessible name and menu postconditions. Generic/other-gift buttons cannot substitute. Binding failures remain fatal before screenshot, measurement or axe for the failed pair.
- `createOptionalCrmStates(fixtures)` is imported directly from `workspace-catalogue-setups.mjs` and called only when the explicit state-name argument contains the exact trimmed name `crm-fund-correction`. Defaults and area-only requests never construct it or require its eligibility. No environment switch or new CLI parameter is added.
- An explicit optional request still passes through strict selection. Its factory must establish donor membership and real `fund_correction.available === true` before launch or output writes. The actual setup runs freshly at desktop and mobile widths and must expose the shared shell, exact heading, Destination fund and Reason. Tests click only the anchored menu trigger and Correct fund designation, never submission.
- The historical `contribution-fund-correction` Hub state remains in the base catalogue with both desktop/mobile widths and `NOT_EXERCISED_UNAVAILABLE_HUB_ENTRYPOINT`. Selecting it fails explicitly without actions or false form evidence, even when the optional CRM name is requested alongside it. CRM coverage is additive, not a replacement or denominator reduction.
- Iteration uses only the validated state list. Studio reset is conditional on a selected Studio state, not merely the broader area string. Legacy default areas, whitespace-normalized batches, original widths, incremental JSON preservation, route-error behavior and bounded browser cleanup remain covered.

## Meaningful collector test seam

The existing Node VM harness evaluates the actual collector source. Strict selection, workspace-state construction, gift anchoring and optional setup factories are real imports. Browser/axe, fixture preflight and route-installation boundaries are fakes; no real collector entrypoint is launched.

Tests exercise navigation, setup, screenshot/measurement/axe calls and real temporary JSON persistence. Gift pages retain query strings so the real donor-route guard executes. Disposable `.harness-test-*` directories stay inside Q and are removed by test cleanup; the final leftover check finds none. These JSON files are test outputs, not runtime evidence.

Additional regressions cover mixed valid/invalid selections, prior proof/evidence preservation, optional eligibility and selection failures, fresh per-width setup, blocked gift-menu availability, incorrect form/menu postconditions, unavailable Hub selection alone and alongside CRM, and preservation of completed pairs without publishing the failed pair.

## TDD record

All commands below run from the authorized checkout, against `Q/harness-runners.test.mjs`, with the prefix `node --experimental-vm-modules --test --test-reporter=spec`:

1. `--test-name-pattern='rejects invalid CLI selection'`: **RED**, 26 cases fail with Missing expected rejection against the legacy filters. After selector integration, the expanded pattern `rejects invalid CLI selection|keeps comma-separated|preserves the legacy default areas` passes all 30 cases.
2. `--test-name-pattern='binds the preflight fixture bundle'`: **RED**, both collectors fail through the real gift setup with Gift setup requires its current bound fixture bundle. After the supported two-argument factory call, both cases pass.
3. `--test-name-pattern='explicitly opts into|rejects optional CRM correction|does not construct optional'`: **RED**, six failures expose Unknown or retired state: crm-fund-correction, with two no-opt-in controls passing. After explicit-name factory integration, all eight pass.
4. Additional completed-pair/Hub/catalogue/preservation and normalized/default-batch regressions pass before the final combined suite. No source-string assertions substitute for collector behavior.

## Exact final checks

Toolchain observed: Node `v24.22.1`, Bun `1.4.3`, ESLint `10.13.0`, Prettier `3.9.10`.

The three-file verification set is exactly the owned JavaScript list above. Commands use repository-root paths:

```powershell
$owned = @(
  'docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs',
  'docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs',
  'docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs'
)
foreach ($path in $owned) { node --check $path }
bunx --no-install eslint --max-warnings=0 @owned
bunx --no-install prettier --check @owned
```

- Syntax: all three individual `node --check` invocations exit 0.
- ESLint: exit 0 with zero warnings.
- Prettier: exit 0, all matched files formatted. The first check identified only the expanded runner test; formatting was applied before final verification.

Final regression command:

```powershell
node --experimental-vm-modules --test --test-reporter=spec `
  docs/qa/admin-workspaces-hillclimb/catalogue.test.mjs `
  docs/qa/admin-workspaces-hillclimb/catalogue-setups.test.mjs `
  docs/qa/admin-workspaces-hillclimb/catalogue-inventory.test.mjs `
  docs/qa/admin-workspaces-hillclimb/workspace-catalogue.test.mjs `
  docs/qa/admin-workspaces-hillclimb/briefs.test.mjs `
  docs/qa/admin-workspaces-hillclimb/harness.test.mjs `
  docs/qa/admin-workspaces-hillclimb/harness-runners.test.mjs
```

**138 tests passed; zero failed, cancelled, skipped or todo; exit 0.** Node emits its expected experimental VM Modules warning; it is not suppressed or treated as runtime qualification.

Cleanup verification: `Get-ChildItem -LiteralPath docs/qa/admin-workspaces-hillclimb -Directory -Filter '.harness-test-*'` returns no directories. This report also receives an installed Prettier check separately.

## Checked source identity

SHA-256 of each owned JavaScript file after final syntax/lint/format/tests:

- `Q/capture-workspaces.mjs`: `3c4c22df2c926c5be3bcd49ec88504c9cb9137e7baa94d7686f5ac5ad4649e85`
- `Q/check-workspaces.mjs`: `1ae80d2748f34cabdb83beef1503e1cd1d1a1c8d286162c1f45c894506895df1`
- `Q/harness-runners.test.mjs`: `4941cb960508ad8c91052a28b9ada6dd8e58a52f35a70bc7d800c5e28395cfe9`

These identify only this checked source set, not a product freeze, emitted fixture identity, complete harness identity or successful runtime run. The existing catalogue report's different owned-source hash is not refreshed or repurposed.

## Remaining limitations

- No real fixture preflight/type proof, browser, server, capture, checker, screenshots, axe scan or provider operation runs. In-memory test fixtures do not establish the current sanctioned runtime bundle's eligibility, UI behavior or operation context.
- The exact form/menu selectors and setup postconditions execute against deterministic page fakes, not an actual Base UI accessibility tree. Rendering, responsive layout, focus containment, keyboard behavior, WCAG and actual correction behavior remain unverified.
- The collectors' legacy generic warning-only ready/settled handling is unchanged. Fatal gift/form/Hub setup guards do not prove every legacy readiness failure is fatal.
- No durable failed-pair diagnostic artifact or termination-provenance scheme is added. Fatal setup failures preserve earlier completed rows and propagate; an unavailable Hub pair still cannot produce successful evidence. A whole-catalogue run that reaches that Hub entrypoint is intentionally not a clean success.
- No full app typecheck/build, monorepo unit gate, broad lint gate or CI preflight runs; validation is scoped to these collectors and the relevant deterministic harness suites.
- Root-owned fresh collection and reconciliation under separately attributed product, fixture and complete harness identities remain necessary. This integration does not reopen round13r2, rewrite frozen artifacts/ledger, establish baseline equivalence or visual scores, or grant acceptance.
