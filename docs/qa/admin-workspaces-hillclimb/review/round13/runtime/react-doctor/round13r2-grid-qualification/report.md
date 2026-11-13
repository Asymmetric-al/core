# Round13r2: individual grid source qualification

## Decision and authority

This is a read-only qualification of **two independently unresolved errors**, not a fix, exception approval, runtime certification, new audit, or release acceptance. Work is confined to new evidence in this directory. Frozen product source, tests, existing harness, ledger, configuration, manifests and Git state are not edited. No application server, browser, listener, provider operation, child agent, commit or branch operation is used. The only execution beyond read-only collection is two narrow invocations of existing unit tests.

| Finding                             | Qualified disposition                                                                                                                                                                                                                                                                                                       | Next action after collection                                                                                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1, header `columnOrder` dependency | **Real ineffective memo / bounded performance debt.** The dependency is freshly allocated on each inner render. No ordering corruption, render loop or material timing regression is demonstrated. Not a false positive; no exception justified.                                                                            | Remove the redundant menu memo boundary without changing ordering or handlers; verify the exact scanner result and preserve public header behavior.                                                                         |
| G2, scrollbar `observe` cleanup     | **Unresolved lifecycle qualification.** Normal allocations have matching source-level teardown, and the sole current first-party caller disables this particular effect. Neither an after-unmount leak nor a complete false positive is proved. A source-level rebinding gap in the public opt-in mode needs investigation. | Keep unexcepted. Add actual enabled-mode ownership/rebinding tests in a separately authorized candidate; repair a reproduced gap or, only with complete positive lifecycle evidence, request review of this exact identity. |

The supplied [fresh audit][fresh-report] has **four errors in its full census**, not two. Its [independent unresolved review][fresh-unresolved] leaves 629 diagnostics, including these two errors, after a mechanically exact prior-record subset. The whole exception ledger is invalid because evidence changed; there is no official successful `actionable.json`. This report does not clear either diagnostic or ratify the other two errors' historical records. Severity, `Bugs` category and `test-noise` tags are not behavior evidence or waiver authority. The [exception policy][exception-policy] excludes unknown/deferred real findings and requires individual source/behavior evidence for lifecycle claims.

## Exact frozen binding

| Field                       | Value                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Checkout                    | `C:\Users\Conrad\.t3\worktrees\core\t3-5a24111d-r12`                                                                 |
| Checkpoint / branch         | `round13r2` / `t3/admin-ux-round12`                                                                                  |
| HEAD / base                 | `8368004b339384eb98129a086ca71b7db88534ed`                                                                           |
| Manifest SHA256             | `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0`                                                   |
| Frozen diff SHA256          | `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b`                                                   |
| Audit-source inventory      | 2,379 files; SHA256 `a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3`                               |
| Canonical ledger SHA256     | `16a0c7614cfc967c2c1a30a2133bfd17fc7b1dfe5588853136dd4d66a1914f62`                                                   |
| Doctor configuration SHA256 | `9593037aa41b52d104aeea055158d7046dc23cfe6b202ce74fa22e0423b54f98`                                                   |
| Git index SHA256            | `6bbc6569730f496e067bb56e7dc3ca0d341ce33190ed8a1dcb74c9689fca8a17`                                                   |
| Installed versions          | Node `v24.22.1`, Bun `1.4.3`, scanner/plugin `0.9.18`, Vitest `5.0.5`, TanStack React Table `9.3.1`, Base UI `1.9.0` |

[Before binding output][binding-before] is an exact match to the fresh audit's binding. The inspected existing [read-only helper][binding-helper] checks all 1,038 manifest entries including deletions, the complete inventory and 158 control hashes. Independent snapshots compare every audit-source hash, 1,705 existing test/script file hashes, HEAD, branch and index. [Final comparison][binding-comparison] is the authoritative end checkpoint; every field must be true for the unchanged-binding statement. [After metadata][binding-after-command] records the actual execution time. Checkpoints do not prove absence of edit-and-restore between them. Other workers' pre-existing work is preserved; a globally clean worktree is neither expected nor claimed.

## Exact identities

Complete original identity strings and diagnostic objects are copied, not reconstructed, in [diagnostics.json][diagnostics]. Both target `packages/ui`, severity `error`.

### G1

- Owner: [data-grid-column-header.tsx:398:5][header-deps]. Rule `react-doctor/no-effect-with-fresh-deps`; end line 398; offset 14026; length 11.
- Fingerprint: `b5ff73a52b63d47980896d361a46bfac6619860eeb07720f79a4c621d3cfebb7`.
- ID: `components/reui/data-grid/data-grid-column-header.tsx::398:5::react-doctor/no-effect-with-fresh-deps::4fef0a3f530b6f5b4764b1b4b17d2096b60059110b09f021b03ee068ec57e79c`.
- Whole-file SHA256: `d6a79a6944c3403ad75a8a6ff6262e3732fd80d58d8a3954b615b39b7cced05a`.
- Message: “Your useMemo runs every render because dep `columnOrder` is a new array built fresh each time, so `===` always fails.”

### G2

- Owner: [data-grid-scroll-area.tsx:296:3][scroll-effect]. Rule `react-doctor/effect-needs-cleanup`; end line 385; offset 10587; length 2857.
- Fingerprint: `74660959941b3c4ac0324d1cc15f2868e66b8d6ab7523a8b14c15b4fd2f59205`.
- ID: `components/reui/data-grid/data-grid-scroll-area.tsx::296:3::react-doctor/effect-needs-cleanup::ed5c11865fc9a280ae13ffafdfd9cf1d6b18535e3341544139e1050c31537d5e`.
- Whole-file SHA256: `4c9693dd9fbc7a1d90ff31efbc8d9c6af59e0a9300efffca9a01436fc561d235`.
- Message: “`observe` creates a subscription in useEffect without guaranteed cleanup. Return a cleanup function that owns every allocation so it does not leak after unmount.” `test-noise` does not establish this production file's contract.

## G1: complete input and closure trace

The complete 525-line owner is preserved with original line numbers in the [header snapshot][header-snapshot]. Analysis includes the entire menu factory, not just line 398.

1. [Lines 79–87][header-order] read current state order, derive all leaf definition IDs and complete state order with omitted definition IDs. The completed `columnOrder` is an array literal **on every inner-component invocation**, even if state and definitions are unchanged. The definition-order chain allocates too. The file opts out of React Compiler with `use no memo` at line 4.
2. [Lines 107–151][header-peers] resolve grouping policy, visible leaves in the column's start/end/center pin bucket, header spans, same-level peer arrays and rendered neighbours. `leftNeighbour`/`rightNeighbour` are also fresh nested arrays when present. Stabilizing only `columnOrder` does not reliably stabilize the menu memo.
3. [Lines 157–166][header-move] create a new order on a move click, preserve other columns, find a rendered neighbour and call `setColumnOrder`. This is an event handler, not an effect/render-time state write. No stale-order failure is established in this frozen source.
4. The [factory at 223][header-menu] builds filter, sort, pin, move and visibility sections through 381. It captures current table/column getters, state, ordering helpers, flags, filter and labels/i18n. Dependencies 382–400 include fresh peers/order, but do not independently enumerate all closure inputs such as i18n/grouping/definition changes. Stabilizing selected dependencies without a complete input model risks introducing stale closures currently masked by the ineffective memo.
5. The [wrapper at 505][header-subscribe] subscribes to sorting, pinning, order and visibility, passing subscribed state into the memoized inner component. The [provider][grid-provider] publishes committed table/props/i18n. “Every render” means each **actual inner render**, not every unrelated ancestor render, notification or animation frame.
6. The factory runs before the has-controls branch at 402, so paths without an opened menu still pay its construction cost. The focus layout effect at 95 and unpin click/RAF handoff at 435 are separate owners; do not remove them as collateral cleanup.

**Impact:** `useMemo` cannot skip its factory when the inner component renders. Repeated menu JSX and dependency bookkeeping are real performance/maintainability debt. There is no demonstrated infinite loop, wrong rendered order or measured material delay. No timing profile/browser measurement was taken.

### Minimal exact future G1 candidate

In the shared owner, replace `const menuItems = useMemo(() => { ... }, [...])` at 223–400 with a per-render local builder, e.g. `const menuItems = (() => { ... })()`, preserving the entire body/closures. Remove the unused `useMemo` import at 19 and now-unused `columnVisibilityKey` calculation at 88–91. Retain completed order, peer logic, wrapper subscription, `memo`, focus effect, Base UI composition and `use no memo`. Do not substitute raw state order, which may omit new leaves.

This is a behavior-preserving repair of an ineffective cache, **not** a claim that construction will run less frequently. Avoid an unmeasured multi-memo optimization, `[table]` shortcut, module-level mutable order, or exception based on currently disabled movement controls.

### Meaningful future G1 red/green

- **Scanner red/green:** this exact diagnostic is the recorded RED. Run the pinned supported public audit on a separately collected candidate for GREEN at this owner/rule, without suppressions/scope changes. Targeted disappearance is not a passing whole-ledger gate. Do not manufacture a behavioral failure for removing a cache that never hit.
- At the existing UI unit seam, render the real shared header/provider/engine, not a mocked header. Exercise empty/partial order; add a column definition; hide a neighbour; pin start/end peers; move a visible centre peer. Assert store/render order, no lost/duplicate IDs, preserved hidden/pinned positions, first/last disabled moves, sibling boundaries, grouped-header disabled behavior and `meta.headerColSpan` peer integrity. Do not invent group-header movability.
- Keep an open menu current through sort/pin/visibility, locale labels and filter replacement, with handlers targeting current state. Preserve unpin focus handoff. These preservation tests may already be green and are not recomputation proof.
- If actual caching is selected later, first add a recomputation-count/identity RED for unchanged semantic inputs and invalidation tests for all state/definition/group/span/locale inputs. That larger optimization is not the minimal recommendation here.

## G2: complete ownership trace, not a cleanup-presence waiver

The [complete numbered scrollbar owner][scroll-snapshot] includes the inputs, callbacks, flagged effect and rendered nodes. The warning covers the whole effect at 296–385, not a separately identified allocation at 322 or 370.

| Owner / input               | Source-level evidence and consequence                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mode                        | [Orientation defaults to `both` at 126][scroll-inputs]; `showVertical` is false for `horizontal` at 147; the custom path additionally requires `tableLayout.headerSticky` at 148–149. Container, viewport, overlay, metrics, drag and queried-node refs are instance-owned at 130–144.                                                                                                                                     |
| Separate direction observer | [Layout effect at 166–186][scroll-direction] observes document `dir` attributes and returns its own disconnect. This is not the effect at 296 and is not covered by its disabled-mode return. Base UI can also own resources independently.                                                                                                                                                                                |
| Geometry inputs             | [Sync callback at 212–294][scroll-sync] reads the live container/viewport, but reads header, table and horizontal bar from `observedElementsRef.current` at 221. It derives header/footer offsets and overflow from DOM geometry; equality-gates metrics at 279 and overflow state at 289. CSS writes target only the overlay at 286. Dependencies are `resetMetrics`, `showHorizontal` and custom-mode enablement at 294. |
| Before allocation           | [Effect at 296][scroll-effect] captures the exact container/viewport once. Missing nodes return at 300. Disabled custom mode resets metrics and returns at 302–305. Both returns precede this effect's RAF, observers and scroll listener.                                                                                                                                                                                 |
| RAF and listener            | Local frame at 307; `scheduleSync` cancels the prior frame and requests one current sync at 309–312. Initial sync is scheduled at 355; the captured viewport gets the same local handler, passive, at 356. Cleanup cancels the latest frame at 374 and removes that handler from that captured viewport at 377. No capture option is set on either listener operation.                                                     |
| Resize subscriptions        | Optional local `ResizeObserver` at 314–317; a local Set deduplicates `observe` at 320–325. `resolveObservedElements` queries/caches header, horizontal bar, table and table viewport at 327–341. It observes header/table/table viewport at 343–345, plus the captured viewport at 352. Cleanup disconnects this local observer at 375.                                                                                    |
| Late-node discovery         | The local `MutationObserver` exists only when header/table were not initially resolved, at 361–370. It watches container child-list/subtree mutations. On resolution its callback disconnects before clearing the variable at 365–366 and schedules a sync at 367. Cleanup disconnects a still-retained discovery observer at 376. It is intentionally one-shot, not a persistent node-rebinding owner.                    |
| Effect replacement          | Dependencies at 380–385 include the callbacks and custom-mode flag, but not children, queried-node identities, or a table key. A horizontal/vertical or sticky-mode change can replace this effect through those inputs; replacing only a child table/header need not do so. The viewport is an unconditional owned child at [485][scroll-render]; external children are inside its content at 489–491.                    |
| Drag lifetime               | [Clear callback at 188–192][scroll-drag] clears the drag ref and empties body selection styles. Pointer down captures at 415 and writes those styles at 423–424; pointer-up/cancel/lost-capture handlers are wired at [547–551][scroll-pointer]. The effect calls clear at 378. This is not evidence that other owners' prior body styles are restored, or that all active-drag/unmount sequences have been tested.        |

### What is and is not established

Normal same-instance source paths pair the local allocations with a returned cleanup, including the discovery observer's disconnect-before-null success branch. There is **no demonstrated after-unmount leak**. Conversely, neither a paired cleanup in source nor a currently dormant caller proves full ownership across enabled mount, callback delivery, rerender, replacement, dependency cleanup and StrictMode replay. The existing tests described below do not supply that evidence. This finding therefore stays **unresolved and unexcepted**, not admitted as a false positive or reclassified as a confirmed leak.

There is a concrete **source-level rebinding gap to reproduce** in the exported opt-in mode: after an initial successful resolution, no persistent subtree observer re-queries replacements; the cached header/table at 221 can remain the detached old nodes. The observed Set only grows within the effect, with no `unobserve`/deletion. Even a later scroll sync does not itself re-query a replaced header. Replacing a keyed table/thead while keeping the wrapper, mode and viewport geometry stable can therefore leave the old resize targets and header measurements active until effect replacement/unmount. This is a bounded stale-geometry / in-lifetime retention risk, **not** proof of the scanner's asserted after-unmount leak and not an observed current first-party incident. No replacement invariant in the inspected public props/children or current source eliminates this case; external/deployed use and a definitive product requirement were not established.

### Minimal exact future G2 candidate and decision sequence

1. At the shared owner/test seam, first reproduce the replacement case below with actual enabled custom mode and real child replacement, keeping the effect dependencies unchanged. Separately characterize ordinary cleanup; do not turn an unproven scanner concern into a speculative cleanup rewrite.
2. **Only if the replacement RED is reproduced and this public child-replacement contract is supported**, change the block at 318–370: keep one container-scoped child-list/subtree discovery/rebinding observer for the enabled effect's lifetime, instead of creating it only while initially unresolved and disconnecting on first success. No document-wide polling or new package is needed.
3. In `resolveObservedElements`, compare the four queried identities (including horizontal bar) with the previous cache; reconcile the resize-target Set to the captured viewport plus current header/table/table-viewport. `unobserve` and delete obsolete targets, observe new targets, and replace the cached refs, including null on removal. Schedule a geometry sync on initial resolution and subsequent identity changes, not on every unrelated child mutation. This keeps current RAF coalescing and avoids an observer-driven feedback loop.
4. Retain captured-viewport listener pairing, both observer disconnects, latest-frame cancellation, drag cleanup, disabled-mode behavior and public Base UI composition. Add a disposed guard only if a realistic callback-delivery test demonstrates a need; do not base a fix on a fake that delivers work contrary to disconnect semantics.
5. Recheck the pinned public scanner against a separately collected candidate. The behavior repair is **not guaranteed to silence** this exact rule. If it persists, isolate which resource/path the rule cannot prove using the supported public CLI, then review source and lifecycle evidence for that candidate's new exact identity. Do not add an inline disable or exception merely to make the red output disappear.

If no real leak or supported replacement defect is reproduced, retain the exact unresolved identity until complete positive lifecycle evidence and scanner-path reasoning support an individual false-positive review. That is a future decision, not approval in this report.

### Meaningful future G2 red/green

- Render the real `DataGridScrollArea` with the real provider/engine and `orientation="both"` (also `vertical`) plus `headerSticky: true`. Use deterministic DOM geometry/RAF control and stateful observer fakes that respect targets, options, unobserve and disconnect, or real jsdom MutationObserver delivery. Do not mock the owner. Distinguish this effect's resources from the independent document-direction and Base UI observers.
- **Predicted behavior RED; not executed:** mount header height 24, viewport client height 200 and scroll height 600; flush the initial frame and verify the enabled overlay. Replace the keyed table/thead with a header height of 60, without changing wrapper/mode or viewport size. Deliver actual child-list mutation records and RAF; require the new nodes to become resize targets, the detached nodes to be unobserved, and `--data-grid-scrollbar-header-height` to become `60px`, without a manual rescue scroll/resize. Repeat table → empty → table. Frozen source has no persistent discovery path after initial success; the proposed identity reconciliation supplies GREEN if reproduced.
- Ownership characterization: enabled mount, scroll/resize bursts coalescing to one live frame, repeated ordinary rerenders, late initial header/table, true unmount, StrictMode mount/cleanup/remount, `headerSticky` toggles, `both`/`vertical`/`horizontal` transitions, and absent ResizeObserver/MutationObserver APIs. Require exact captured target/handler listener removal, disconnect of every allocated custom observer, zero retained custom targets/pending frames after cleanup, and no post-cleanup metrics/state/DOM writes under valid callback semantics.
- During a real captured drag, exercise pointer up, cancel, lost capture, disabling custom mode and unmount; assert drag/body-style cleanup and no unintended writes by stale callbacks. Characterize competing prior body styles rather than assuming empty-string cleanup restores them. Do not expand this proposed patch into an unrelated global-style ownership redesign without a reproduced failing assertion and authorization.
- Most ordinary cleanup characterization cases may **already pass** the frozen implementation. The proposed replacement case and pinned scanner output are distinct RED candidates; no lifecycle regression test or source fix has been added or claimed to pass here.

## Actual consumers and activation boundaries

The saved [direct-consumer search][consumer-search] and [feature-flag search][flag-search], with exact arguments in [analysis-commands.json][analysis-commands], cover current repository TS/TSX importers and callsites. Source hashes are retained in [analysis inputs][analysis-inputs] and the [additional/corrective evidence][additional-evidence]. This is a repository-source inventory, not proof of all external, dynamic or deployed consumers.

**Scrollbar:** the sole direct runtime importer found outside its owner is [DataGridPanel:13][panel-import]. The nonvirtual branch explicitly renders `orientation="horizontal"` at [432–434][panel-scroll]. That makes `showVertical` and custom-mode enablement false, so this particular effect returns before allocating even if sticky headers are requested. The virtual branch at [423–430][panel-virtual] uses `DataGridTableVirtual`, a different scrollbar/viewport owner, not this custom effect. Do not infer that Base UI or the separate direction effect creates no observers. The [package wildcard export][ui-exports] and exported props/default `both` preserve a public opt-in path; a dormant first-party branch is not deletion or blanket-exception authority.

**Header:** sixteen direct admin importer files were found, with import start lines below. Each imports the shared ReUI owner, not the alternate shadcn grid. Complete matches, rendered header sites and panel importers are retained in the search output.

| Consumer                          | Import source                                                 |
| --------------------------------- | ------------------------------------------------------------- |
| CRM records                       | [crm/columns.tsx:11][crm-columns]                             |
| CRM notes                         | [crm/notes/columns.tsx:4][crm-notes]                          |
| CRM relationships                 | [crm/relationships/columns.tsx:4][crm-relationships]          |
| Contributions                     | [contributions/columns.tsx:10][contribution-columns]          |
| Native Web Studio collection grid | [NativeCollectionGrid.tsx:14][studio-grid-import]             |
| Missionaries Web Studio flow      | [MissionariesHubView.tsx:12][missionaries-flow]               |
| Support reports                   | [ReportTable.tsx:11][support-report]                          |
| Support tickets                   | [SupportTicketsTable.tsx:11][support-tickets]                 |
| Support table column definitions  | [support-hub/components/table/columns.tsx:8][support-columns] |
| Mission Control locations         | [LocationTable.tsx:16][locations]                             |
| Mission Control workflows         | [WorkflowSummariesTable.tsx:14][workflows]                    |
| Mission Control care personnel    | [care-personnel-grid.tsx:17][care-personnel]                  |
| Follow-up tasks                   | [follow-ups-grid.tsx:15][follow-ups]                          |
| Fund reports                      | [funds-grid.tsx:16][funds]                                    |
| Automation rules                  | [rules-grid.tsx:15][rules]                                    |
| Admin teams                       | [page-client.tsx:15][teams]                                   |

The actual NativeCollectionGrid renders a shared header at [339][studio-grid-header], constructs the table with `useTable` at [852][studio-grid-table], and renders the shared panel at [1169][studio-grid-panel]. Contributions constructs its real table at [1419][contribution-table] and conditionally enables pinning through `columnsOverflow` at [1636][contribution-layout]. No app `columnsMovable` enablement was found by the saved static search. [Defaults at 1239–1249][grid-defaults] include sticky=false, pinning=false and movement=false; visibility is enabled. Disabled movement in current apps does not make G1's menu memo effective, and future fixes must preserve public movement behavior.

## Existing tests: relevance and limits

| Existing seam inspected                                                                                                 | What it exercises                                                                                                                                                                                                                                         | What it does not establish                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [data-grid-context-publication.test.tsx:314][context-tests]                                                             | Real shared provider/engine publication, abandoned/suspended renders, committed notifications, StrictMode and sizing behavior. Eight cases were run.                                                                                                      | Does not render/exercise the flagged menu or enabled custom scrollbar ownership. Provider StrictMode coverage is not custom-effect StrictMode coverage.                                               |
| [data-grid-panel.test.tsx:58][panel-tests]                                                                              | Shared panel/table interactions, state, keyboard and column options. Fixture columns use string headers at 114/121; resize stub at 195–199 is no-op; the virtual fixture at 244 uses a stand-in virtual body. Inspected, not run here.                    | Does not prove the shared header menu's dependency behavior or enabled custom-path observer/RAF lifecycle.                                                                                            |
| [contributions-hub-grid.test.tsx:14][contribution-tests]                                                                | Real Contributions MainBody, shared headers and shared panel; stateful ResizeObserver stub at 19–82, with adapted browser seams, not a mocked owner. Selected visibility case at 736 and pinning case at 811 were run with its basic grid rendering case. | The real panel path disables this custom vertical effect. A stateful resize stub in a consumer test is not enabled-mode teardown/rebinding proof; geometry/focus in an actual browser was not tested. |
| [web-studio-collection-grid.test.tsx:51][studio-tests]                                                                  | Native collection consumer with Payload/routing seams mocked and no-op ResizeObserver at 111–115. Inspected, not run here.                                                                                                                                | No custom-mode or observer-ownership proof.                                                                                                                                                           |
| [ui-improvement-grid-headers.test.tsx:6][alternate-header-tests] and [react-cleanup-grid.tsx:3][alternate-grid-fixture] | Import `components/shadcn/data-grid/data-grid`, inspected as a different implementation, not a ReUI re-export. The related E2E name is not sufficient ownership evidence. Neither was run.                                                                | Cannot be counted as lifecycle/menu evidence for these ReUI files merely because filenames say grid/headers/cleanup.                                                                                  |

Additional exports, row-processing and auto-view tests were inspected for ownership/import relevance; no inspected existing test supplies the enabled custom-effect matrix or the proposed fresh-dependency red/green. The initial hash inventory includes one unavailable, incorrectly navigated header-test path; `additional-evidence.json` explicitly records the correct `tests/unit/packages/ui` file and its hash. The original capture is preserved rather than silently rewritten. This is not a claim that no other test could exist.

## Executed checks and preserved output

Only two narrow, existing unit invocations were executed. Both used one worker, no file parallelism, no watch/browser/UI/API mode, no environment override, disabled result/filesystem-module caches, and `configLoader=runner` to avoid bundled-config temporary files. No new audit, private scanner execution, browser, application server, listener, build, full suite, formatter or broader gate was run.

| Run                                   | Actual UTC time                          | Exit / result                    | Exact evidence                                                                                              |
| ------------------------------------- | ---------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Context publication                   | 2026-11-11 22:52:14.773Z → 22:52:18.897Z | 0; 8 passed                      | [argv/metadata][context-command], [stdout][context-output], [stderr (empty)][context-stderr]                |
| Contributions selected consumer cases | 2026-11-11 22:52:18.901Z → 22:52:27.641Z | 0; 3 passed, 44 filtered-skipped | [argv/metadata][contribution-command], [stdout][contribution-output], [stderr (empty)][contribution-stderr] |

Copy-pastable PowerShell equivalents of the exact argv (the JSON command files are authoritative):

```powershell
node node_modules/vitest/vitest.mjs run --configLoader runner --no-cache --no-fsModuleCache --fsModuleCachePath "C:\Users\Conrad\.t3\worktrees\core\t3-5a24111d-r12\docs\qa\admin-workspaces-hillclimb\review\round13\runtime\react-doctor\round13r2-grid-qualification\disabled-module-cache" --maxWorkers=1 --no-fileParallelism --reporter=verbose --no-color tests/unit/packages/ui/data-grid-context-publication.test.tsx
node node_modules/vitest/vitest.mjs run --configLoader runner --no-cache --no-fsModuleCache --fsModuleCachePath "C:\Users\Conrad\.t3\worktrees\core\t3-5a24111d-r12\docs\qa\admin-workspaces-hillclimb\review\round13\runtime\react-doctor\round13r2-grid-qualification\disabled-module-cache" --maxWorkers=1 --no-fileParallelism --reporter=verbose --no-color tests/unit/apps/admin/app/contributions-hub-grid.test.tsx -t "renders every gift through the ReUI grid|keeps a View choice to show Fund / designation|pins the donor and the row actions"
```

**Total: 11 passing cases, 44 filtered-skipped; not 55 passing cases, not a full consumer suite, not proof of enabled scrollbar cleanup, and not executed future RED/GREEN.** No code change or measured speedup follows from these passes. The runner's full captured output, not a summary-only success claim, is retained.

## Exact pinned scanner implementation

The inspected installed primary source is the [cached `oxlint-plugin-react-doctor@0.9.18` bundle, index.js:1][scanner-bundle], SHA256 `d492f67cb7e9d54c72108d2e0b976bd5a4e04c6a255a276ab144b9de136a1f4c`. [scanner-excerpts.json][scanner-raw] preserves exact symbol initializers, bundle offsets and metadata; [scanner-excerpts.md][scanner-readable] is formatting-only readability evidence. No private scanner API, synthetic scanner run, version upgrade or network lookup was used.

- **G1:** [`uXe`/`dXe`/`fXe`][scanner-fresh] recognizes fresh literal kinds, resolves the local identifier's variable initializer, and reports an array dependency as an error. It does not measure runtime cost or establish an ordering defect. The recorded `columnOrder` input is exactly such a local fresh array; the scanner's dependency-identity assertion is supported by source. Its rule identifier says effect, but the actual implementation covers `useMemo` too, as this diagnostic shows.
- **G2:** [`cp`][scanner-cleanup] collects/checks effect resources through `Zde`, `Qde` and `Bfe` before reporting the enclosing hook. [`Zde`][scanner-collect] follows selected reachable nested callback resources; [`Qde`][scanner-immediate] removes immediately cleaned candidates; [`bf`/`Bfe`][scanner-cfg] analyze cleanup/CFG paths. [`Sf`/`Ff`][scanner-match] map observer `observe` to disconnect/unobserve and match resource receivers/arguments. The matcher explicitly has optional-chain handling, so “optional chaining confused it” is not an established explanation.
- The fresh diagnostic does **not** identify whether nested ResizeObserver `observe` at 322, discovery MutationObserver `observe` at 370, or an associated proof path produced the failure. Static bundle inspection plus source pairing is not a rule-path execution trace. This report has not isolated that internal failed proof, and therefore does not assert that the exact warning is a demonstrated scanner false positive. Conversely, the error message alone does not prove an actual retained subscription after unmount.

## Post-collection handoff and limitations

- G1 is a **source-supported, ineffective-memo performance/maintainability finding** with a narrowly specified behavior-preserving candidate; no exception is justified. Do not promise material runtime improvement without measurement.
- G2 remains **unresolved**, with source teardown pairing, a dormant current caller, a reproducible-in-principle public-mode rebinding risk, and a concrete lifecycle test plan. No individually justified exception is established. Fix a demonstrated supported defect, or bring complete positive lifecycle and scanner-path evidence for an exact-identity exception review; do not batch-waive observer warnings.
- All proposed source/test work is for a separately authorized **post-collection candidate**. This report does not change frozen round13r2, implement tests/fixes, add ledger entries, relax the scanner, certify strict acceptance, or authorize publication. Candidate source changes require their own binding/evidence and the repository's relevant gates.
- The source/consumer/test inspection and the 11 existing passes do not cover actual browser geometry, ResizeObserver delivery, pointer capture, keyboard/focus/zoom/accessibility, external/deployed use, or full enabled custom-effect lifecycle. No full build/typecheck/unit coverage or dependency-security certification is implied. Relevant OpenSpec project/keyword searches were inspected, but no definitive child-table replacement contract or comprehensive domain-contract review was established.
- [Final binding comparison][binding-comparison] records **all six comparisons true**; [final command metadata][binding-after-command] records exit 0. The after checkpoint exactly matches the fresh audit binding and preserves manifest/diff/inventory/controls, all 2,379 source hashes, 1,705 test/script hashes, HEAD/branch and index. Pre-existing work is preserved. This checkpoint evidence, not a globally clean status or historical memory, bounds the frozen-source claim.

## Evidence links

[fresh-report]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/report.md:1
[fresh-unresolved]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/v2-unresolved-review.json:1
[exception-policy]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/guides/development/react-doctor.md:37
[binding-before]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/binding-before.stdout.log:1
[binding-helper]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/read-binding.mjs:1
[binding-comparison]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/binding-comparison.json:1
[binding-after-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/binding-after.command.json:1
[diagnostics]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/diagnostics.json:1
[header-deps]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:398
[header-snapshot]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/sources/header-owner.txt:1
[header-order]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:79
[header-peers]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:107
[header-move]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:157
[header-menu]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:223
[header-subscribe]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:505
[grid-provider]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid.tsx:1080
[scroll-effect]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:296
[scroll-snapshot]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/sources/scroll-owner.txt:1
[scroll-inputs]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:126
[scroll-direction]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:166
[scroll-sync]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:212
[scroll-render]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:485
[scroll-drag]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:188
[scroll-pointer]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:547
[consumer-search]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/direct-consumers.stdout.log:1
[flag-search]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/feature-flags.stdout.log:1
[analysis-commands]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/analysis-commands.json:1
[analysis-inputs]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/analysis-inputs.json:1
[additional-evidence]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/additional-evidence.json:1
[panel-import]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/data-grid-panel/data-grid-panel.tsx:13
[panel-scroll]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/data-grid-panel/data-grid-panel.tsx:432
[panel-virtual]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/data-grid-panel/data-grid-panel.tsx:423
[ui-exports]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/package.json:19
[crm-columns]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/columns.tsx:11
[crm-notes]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/notes/columns.tsx:4
[crm-relationships]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/relationships/columns.tsx:4
[contribution-columns]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/columns.tsx:10
[studio-grid-import]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionGrid.tsx:14
[missionaries-flow]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx:12
[support-report]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/reports/ReportTable.tsx:11
[support-tickets]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/tickets/SupportTicketsTable.tsx:11
[support-columns]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/table/columns.tsx:8
[locations]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/locations/components/LocationTable.tsx:16
[workflows]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx:14
[care-personnel]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/care-personnel-grid.tsx:17
[follow-ups]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/tasks/follow-ups-grid.tsx:15
[funds]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/funds-grid.tsx:16
[rules]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/rules-grid.tsx:15
[teams]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/teams/page-client.tsx:15
[studio-grid-header]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionGrid.tsx:339
[studio-grid-table]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionGrid.tsx:852
[studio-grid-panel]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionGrid.tsx:1169
[contribution-table]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/main-body.tsx:1419
[contribution-layout]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/main-body.tsx:1636
[grid-defaults]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid.tsx:1239
[context-tests]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/data-grid-context-publication.test.tsx:314
[panel-tests]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/data-grid-panel.test.tsx:58
[contribution-tests]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-hub-grid.test.tsx:14
[studio-tests]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/web-studio-collection-grid.test.tsx:51
[alternate-header-tests]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/ui-improvement-grid-headers.test.tsx:6
[alternate-grid-fixture]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/e2e/fixtures/react-cleanup-grid.tsx:3
[context-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/context-publication.command.json:1
[context-output]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/context-publication.stdout.log:1
[context-stderr]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/context-publication.stderr.log:1
[contribution-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/contributions-consumer.command.json:1
[contribution-output]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/contributions-consumer.stdout.log:1
[contribution-stderr]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/contributions-consumer.stderr.log:1
[scanner-bundle]: C:/Users/Conrad/.bun/install/cache/oxlint-plugin-react-doctor@0.9.18@@@1/dist/index.js:1
[scanner-raw]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.json:1
[scanner-readable]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:1
[scanner-fresh]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:1482
[scanner-cleanup]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:1392
[scanner-collect]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:98
[scanner-immediate]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:185
[scanner-cfg]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:1055
[scanner-match]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification/scanner-excerpts.md:1161
