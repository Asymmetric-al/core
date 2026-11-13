# Round13r2 Tools qualification: Email640, PDF390, Export setup

Date: November 12, 2026 (Asia/Bangkok). Qualification only; no repairs applied.

## Boundary and evidence

Work is confined to `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Applicable root/admin/shared-UI instructions, frontend/testing rules and accessibility guidance were read. Only this new report is written. Product, tests, harness, ledger and existing evidence remain untouched by this work. No children, browser, collector, server, Git, environment-configuration or provider operations; no tests run. Other collectors and the installed Studio journey were not contacted or changed.

The [existing report:70][existing-failures] preserves the failed Export setup. Its [inventory:35][existing-inventory] records **tools-02 checks 0/9**, not a passing Tools round. The original viewport PNGs below were opened locally, not recaptured. Supplemental DOM geometry and original screenshot pixels have different provenance.

| Finding                   | Qualification                                              | Confidence / limit                                                         |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| Email640 template name    | Product header layout defect                               | High for visible collapse; exact 25.6px is supplemental DOM evidence.      |
| PDF390 Add Row blue fill  | Product legacy-editor containment defect                   | High for visible clipping; logical bounds and interaction remain unproved. |
| Disabled PDF Export setup | Harness readiness/order defect; named menu capture invalid | High for recorded setup failure and source sequence; no live retry.        |

## 1. Email640: product header collapse

**Image:** [email-studio--small-tablet.png][email640-image] (640x900). The template-name field beside the document icon is visibly collapsed and its value unreadable, independently of the DOM measurement.

[Supplemental observations:44][email640-measurement] record an enabled input containing `Untitled email`: **25.6x36 CSS px**, clientWidth 24, scrollWidth 127, overflow-x clip. At [390:107][email390-measurement] it is 320x36 with client/scroll widths both 318. This is a breakpoint-specific finding, not failure at every width. The [supplemental browser context:4][measurement-context] is Electron Chrome152/DPR2.5 without reduced motion; original collectors used Chrome157/DPR1/reduced motion. Do not attribute the exact 25.6px number to the original PNG.

**Owner / mechanism:** [email-studio-header.tsx:96][email-header] wraps the header, but its identity group at [line 98][email-identity] combines `min-w-0`, `sm:w-auto` and `sm:flex-1`. The name wrapper at [line 103][email-name] is `min-w-0 w-full max-w-xs`: a maximum is not a usable minimum. The shared [input styles:1][input-styles] also allow shrinking. This explains the observed allocation without blaming the shared Input primitive. The field already has the correct accessible name and controlled value at [line 105][email-label]. A 25.6x36 box alone does not prove a sub-24px target or a particular WCAG failure.

**Smallest future repair candidate:** only the identity group's class at line 98: add `sm:min-w-80`, leaving mobile full width, header wrapping, Input, labels and pending-state guards intact. Reserve a usable name allocation and let adjacent action groups wrap instead. This candidate is not browser-validated, especially with the Unsaved badge; do not treat the class itself as acceptance or globally widen Input. Separate Email body overflow is outside this repair.

**Coverage / meaningful acceptance:** [header tests:48][email-unit] cover actions/readiness, [line 94][email-input-test] covers the named field/value, and [line 102][email-pending-test] covers pending Save semantics. [Email E2E:46][email-e2e] covers workflow, not responsive geometry; the inspected suites have no bounding-box/clientWidth/scrollWidth regression.

In a future authorized browser regression, wait for the named textbox to be enabled; test 639/640/641 plus 390/1024/1440, clean and Unsaved. For a short reference name require `scrollWidth <= clientWidth + 1`, a practical allocation (e.g. at least 160 CSS px at normal text size), viewport containment and no action overlap. Tab to it, edit only local metadata, assert value/accessibility/focus, and check zoom/text reflow. No Save/Send is needed. Long names may legitimately scroll; a class-string assertion alone would miss the defect.

## 2. PDF390: legacy-editor clipping, not measured target size

**Images:** [pdf-studio--mobile.png][pdf390-image] (390x844) visibly clips the blue Add Row control/text. [pdf-studio--small-tablet.png][pdf640-image] (640x900) shows its complete label. [Original-PNG pixel measurements:3][pdf-pixels] scan exact RGB `(0,108,190)`: at 390 the matching visible fill is x300/y335, **17x30 pixels**; at 640 it is 254x30, at 1024 164x30, and at 1440 236x30. These are visible color bounds, not DOM/button bounds, a 17px logical hit target, or proof that keyboard access/panning is impossible.

**Owner / mechanism:** [PDF page-client.tsx:1925][pdf-host] clips the editor host with `overflow-hidden`. Its [legacy branch:1934][pdf-legacy] embeds `LegacyUnlayerDocumentEditor` absolutely; [appearance:1940][pdf-appearance] docks tools right and starts them uncollapsed. [UnlayerDocumentEditor.tsx:18][document-wrapper] delegates to the legacy email wrapper with document mode. That wrapper [sets readiness:199][unlayer-ready], [uses displayMode and version latest:242][unlayer-options], and [renders the embedded editor at 100% width:392][unlayer-frame]. This is the legacy iframe integration, not the separate native PDF editor. The narrow-screen [note:659][pdf-narrow-note] promises that the editor remains available; a larger-screen warning does not establish usability.

**Smallest app-owned future containment trial:** change only this route's legacy branch, preserving the native branch and shared wrapper lifecycle/options. Add a named, keyboard-focusable local horizontal scroll region (`absolute inset-0 overflow-x-auto overflow-y-hidden`); place a `relative h-full min-w-5xl lg:min-w-0` canvas inside, with the existing legacy editor still absolute inside that canvas. Give the flex host `min-w-0` for containment. Align the narrow-screen note to the same breakpoint and explain local scrolling. Keep semantic tokens/shared focus treatment and Base UI; no iframe-internal CSS patch or provider change.

The 64rem canvas is a concrete trial supported by a visually non-clipped 1024 capture, **not an established vendor minimum**. Reject it if real interaction acceptance fails; merely hiding the rail/banner or making page-overflow false is insufficient. The precise internal vendor contribution is uncertain: remote `latest` is not frozen by repository hashes.

**Coverage / meaningful acceptance:** [legacy E2E:39][pdf-e2e] checks title/error/Export visibility and iframe presence, not enabled menu, mobile geometry or Add Row usability. [header unit test:13][pdf-mocked-editor] mocks this editor away. [native editor test:9][pdf-native-test] exercises a different public editor/serialization path.

Future regression must load the real legacy editor at 390 plus 640/1024/1440; assert no page overflow AND a usable named local viewport. After local panning, the entire Add Row control/label must be visible, unobscured by the rail and reachable. In an explicitly authorized disposable unsaved design, activate Add Row and observe its result; verify keyboard/focus entry and exit, loading and native/desktop behavior. Do not Save, export or touch the installed journey. Color-pixel width, iframe counts and axe alone cannot accept this repair.

## 3. PDF Export: harness setup race, intentional product guards

**Image/log:** [pdf-export-menu--desktop.png][pdf-menu-image] shows the editor/free-mode warning, **no open menu**. [tools-02 stderr:1][pdf-setup-log] records the visible Export trigger as disabled and the named state captured as-is. [page-metrics.json:118][pdf-menu-metrics] names the state but supplies no menu postcondition. Filename, exit 0 and no page overflow cannot qualify menu semantics.

**Exact sequence:** [module-states.mjs:384][pdf-menu-state] declares setup via `clickFirst(Export)` but waits for enabled Save only in `settled`. [capture-workspaces.mjs:190][capture-order] and [check-workspaces.mjs:241][check-order] execute setup first. [clickFirst:98][click-first] returns false immediately for a visible disabled trigger at line 104; these callers do not enforce that result. The later settled wait never retries the menu. This is a harness setup-order/evidence failure, not evidence that a ready product menu cannot open.

**Product guard is correct:** [initial state:322][pdf-initial-ready] starts not-ready; [onReady:1512][pdf-ready-callback] dispatches readiness. [Export trigger:552][pdf-export-trigger] is disabled only while not ready or exporting (line 562). In free legacy mode the [PDF item:580][pdf-disabled-item], not the whole ready menu, is disabled/described by the persistent note; [HTML:590][pdf-html-item] remains available. [pdf-export.ts:16][pdf-export-policy] owns the configured-account policy. Do not remove the readiness guard, enable blocked PDF export or configure a paid plan to mask setup failure.

**Smallest exact future harness repair:** only replace this legacy state's `setup` at module-states lines 388-389 with an async readiness wait, click and semantic postconditions. The already-imported [waitForEnabledButton:89][wait-enabled] waits on the named button AND `:enabled`; reuse it. Proposed body:

```js
setup: async (page) => {
  await waitForEnabledButton(page, /^export$/i);
  await page.getByRole("button", { name: /^export$/i }).first().click();
  await page.getByRole("menu").waitFor({ state: "visible" });
  await page.getByRole("menuitem", { name: "Export as PDF", exact: true })
    .waitFor({ state: "visible" });
  await page.getByRole("menuitem", { name: "Export as HTML", exact: true })
    .waitFor({ state: "visible" });
},
```

This is a proposal, not an edit or executed script. Keep existing post-setup settled handling. Timeout/missing menu must throw, never become captured-as-is success. The shared state fixes both collectors without global setup-order changes, fixed sleeps or forced clicks.

**Coverage / meaningful acceptance:** [header export tests:47][pdf-export-unit] use a helper [always ready:65][pdf-test-ready]; [free case:100][pdf-free-test] already checks disabled PDF, stable describedby and enabled HTML, but not startup timing. No matching harness setup regression was found in the scoped unit-test search.

Add a focused unit regression against the actual `createModuleStates()` entry: controlled readiness/menu promises prove no click before readiness, exactly one click afterward, and no success before the menu/items exist; absent/permanently disabled trigger or missing menu must reject. Extend header tests through not-ready -> ready and exporting, keeping free PDF blocked/HTML available and the disabled PDF callback uncalled. After authorization and a new freeze, a distinct desktop capture/check must show the actual menu, disabled-described PDF item and enabled HTML; Escape closes and returns focus. Do not select either export item or initiate a download. Existing 0/9 checks and failed PNG remain unchanged.

## Integrity and remaining uncertainty

Scoped offline SHA-256 checks matched six selected product/test files to [round13r2-manifest.json][freeze-manifest], four harness files to [input-hashes.json][input-hashes], all four PDF Studio PNGs to pixel-measurement hashes, and Email640/failed-menu PNGs to [artifact hashes:514][artifact-hashes]. Manifest SHA-256: `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0`.

Legacy wrappers and inspected E2E files are not entries in the modified-file manifest: they establish current ownership, not an independently verified base match. No Git/base comparison or full new freeze audit was performed. Proposals require future red/green behavioral and real-layout checks; none is verified here. This report neither promotes partial evidence to acceptance nor qualifies unrelated Support, Reports, Studio journeys or successful exports.

## Evidence links

[existing-failures]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/README.md:70
[existing-inventory]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/README.md:35
[email640-image]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/email-studio--small-tablet.png
[email640-measurement]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/manual-readonly-measurements/observations.json:44
[email390-measurement]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/manual-readonly-measurements/observations.json:107
[measurement-context]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/manual-readonly-measurements/observations.json:4
[email-header]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/email/email-studio-header.tsx:96
[email-identity]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/email/email-studio-header.tsx:98
[email-name]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/email/email-studio-header.tsx:103
[email-label]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/email/email-studio-header.tsx:105
[input-styles]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/lib/input-styles.ts:1
[email-unit]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/email/email-studio-header.test.tsx:48
[email-input-test]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/email/email-studio-header.test.tsx:94
[email-pending-test]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/email/email-studio-header.test.tsx:102
[email-e2e]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/e2e/admin-email-studio.spec.ts:46
[pdf390-image]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/pdf-studio--mobile.png
[pdf640-image]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/pdf-studio--small-tablet.png
[pdf-pixels]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/pdf-visible-add-row-pixel-measurements.json:3
[pdf-host]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:1925
[pdf-legacy]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:1934
[pdf-appearance]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:1940
[document-wrapper]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/studio/legacy/UnlayerDocumentEditor.tsx:18
[unlayer-ready]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:199
[unlayer-options]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:242
[unlayer-frame]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:392
[pdf-narrow-note]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:659
[pdf-e2e]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/e2e/admin-pdf-studio-legacy.spec.ts:39
[pdf-mocked-editor]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:13
[pdf-native-test]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/studio/pdf-editor-upstream.test.tsx:9
[pdf-menu-image]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/pdf-export-menu--desktop.png
[pdf-setup-log]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/logs/tools-02-capture.stderr.log:1
[pdf-menu-metrics]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/page-metrics.json:118
[pdf-menu-state]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/module-states.mjs:384
[capture-order]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs:190
[check-order]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs:241
[click-first]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:98
[pdf-initial-ready]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:322
[pdf-ready-callback]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:1512
[pdf-export-trigger]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:552
[pdf-disabled-item]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:580
[pdf-html-item]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:590
[pdf-export-policy]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/pdf-export.ts:16
[wait-enabled]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:89
[pdf-export-unit]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:47
[pdf-test-ready]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:65
[pdf-free-test]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:100
[freeze-manifest]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/snapshots/round13r2-manifest.json:1
[input-hashes]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/input-hashes.json:1
[artifact-hashes]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-support-tools/run-20261111T210346808Z/artifact-hashes.json:514
