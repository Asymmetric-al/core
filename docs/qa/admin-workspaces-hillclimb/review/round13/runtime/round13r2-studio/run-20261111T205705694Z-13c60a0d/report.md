# Round13r2 Studio fresh runtime evidence

## Disposition and scope

**VERIFIED: the Studio catalogue's fresh evidence set is structurally complete against the frozen round13r2 inputs. NOT VERIFIED: full behavioral/accessibility acceptance or the separate installed published-address journey.** No visual score, winner or production-readiness claim is assigned.

This report covers Studio only: **47 states, 82 capture state/width pairs, 82 check pairs, 96 catalogue PNGs**, plus a separately attributed four-PNG synthetic secondary-publication-status retry probe. It does not claim the root plan's seven-area totals. All paths and newly authored evidence remain in the owned Studio namespace. No source, test, harness, canonical ledger, environment-file or Git edits; no server/restart, provider operation or child agent was used. The committed Studio runners performed their required scratch CMS fixture/reset work. No other collector's CMS mutation/reset was taken over.

Times are UTC throughout; the collection's local date is **November 12, 2026, Asia/Bangkok**. The run's actual times are not replaced by report-generation time. [Run metadata][run] records localhost:3031 and the r12 checkout; port 3030 was not used.

## Frozen identity and final gates

| Item                                                               | Retained identity                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Checkpoint / tracked file inventory                                | round13r2 / 1038 files                                             |
| Manifest SHA-256                                                   | `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0` |
| Diff SHA-256                                                       | `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b` |
| Bounded batch plan SHA-256                                         | `feca3e2985c7aff03b7267a6d503cab437538fbe87903752c9c608992378166b` |
| 226-file helper/fixture/catalogue/config/source inventory identity | `3a8d15f05590e9048366392ecb0dc1dda0dee471ed53f1fb6d118a7dd5cd167e` |
| Common fixture bundle SHA-256                                      | `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b` |

[Concrete input hashes][inputs] pin both catalogues, runners, fixture preflight and imported local dependencies, builder/export/verifier/types, result writer, probes, composer, brief generator and planning inputs. Product freeze alone was not treated as covering excluded helper bytes.

There are **48 before/after catalogue invocation gates**, and **two additional gates** bracketing the supplemental browser invocation. Each gate verifies the product freeze and pinned inputs; all pass with no mismatches. Two later final freeze checks also pass: the independent audit at 22:14:02.101-22:14:03.193Z and the [handoff gate][final] at **22:47:13.197-22:47:14.089Z**, exit 0, raw monotonic elapsed **890.6636 ms**. The latter rehashes all 226 inputs before and after, with the same inventory identity and no drift. This is a point-in-time freeze attestation, not proof that the development-server build/cache bytes independently match every frozen file.

## Per-invocation freshness, termination and scheduling

The unchanged committed capture and check runners ran in **12 planned batches of at most four states**, into **24 initially absent, distinct invocation output directories**. Every invocation ran its own mandatory fixture preflight. Its original proof was immediately preserved to a unique proof path after process termination, before continuing; no final merged JSON or final single proof is used as a substitute.

The [invocation audit][invocations] independently revalidates all 24 original/preserved proof pairs: matching bytes/hashes, distinct proof records, realpath repoRoot equal to the r12 checkout, `typecheck: passed`, successful fixture-contract verification, and `verifiedAt` inside that process's recorded start/end interval. Every proof records the common bundle above and **all 1645 fixture checks passed**. These are fixture typecheck/contracts, not an assertion that a broad workspace code gate ran. A [sample preserved proof][proof] is linked for navigation; every other proof is retained individually.

Per-process `*.command.json`, `*.started.json`, stdout/stderr, unique `*.proof-validation.json`, and before/after gate files retain executable, exact argv, cwd, PID, UTC interval, full-precision elapsed time, exit/signal/timeout state, log hashes and preservation time. Each `studio-NN-{capture,check}.inventory.json` retains selected states, exact expected/observed key and PNG sets, differences, state-level capture completions, explicit check log keys and artifact SHA-256/mtime inventory. All prior files remain unchanged.

| Batch     | States | Pairs expected/capture/check | PNG expected/observed | Capture / check seconds (rounded) | Exit capture/check |
| --------- | -----: | ---------------------------: | --------------------: | --------------------------------: | -----------------: |
| studio-01 |      4 |                     10/10/10 |                 18/18 |                   40.213 / 79.159 |                0/0 |
| studio-02 |      4 |                        5/5/5 |                   5/5 |                   33.281 / 42.913 |                0/0 |
| studio-03 |      4 |                        9/9/9 |                 11/11 |                  35.180 / 419.621 |                0/0 |
| studio-04 |      4 |                        8/8/8 |                   8/8 |                   29.636 / 58.841 |                0/0 |
| studio-05 |      4 |                        7/7/7 |                   7/7 |                  45.925 / 186.025 |                0/0 |
| studio-06 |      4 |                        5/5/5 |                   5/5 |                   37.947 / 42.680 |                0/0 |
| studio-07 |      4 |                        9/9/9 |                 13/13 |                   62.045 / 77.725 |                0/0 |
| studio-08 |      4 |                        5/5/5 |                   5/5 |                 152.505 / 280.786 |                0/0 |
| studio-09 |      4 |                        6/6/6 |                   6/6 |                 340.838 / 350.374 |                0/0 |
| studio-10 |      4 |                        7/7/7 |                   7/7 |                 166.344 / 182.757 |                0/0 |
| studio-11 |      4 |                        6/6/6 |                   6/6 |                   42.908 / 61.059 |                0/0 |
| studio-12 |      3 |                        5/5/5 |                   5/5 |                   47.422 / 53.813 |                0/0 |

All **24 processes terminate with exit 0; zero process timeouts, retries or Chrome-discovery failures** occurred. State-level capture completion lines cover all 47 selected states; separate PNG/metric sets establish declared-width coverage. All 82 checks have their own explicit state/viewport completion line. Original artifact mtimes fall inside the associated invocation windows; log and hash attribution, not mtime alone, establishes freshness.

The [root scheduling decision][schedule], preserved with its [receipt/hash][scheduleReceipt], supersedes the earlier sequential-only assumption: disjoint non-Studio collectors may overlap on 3031 using separate contexts, and preflight builds fixture data in memory/stdout. Studio invocations here were serialized with one another; **global sequential execution is not claimed** and other collectors' intervals are not independently inventoried here. Only Studio owns scratch CMS resets/mutations. No wait or pause was introduced for another area.

`CAPTURE_BASE_URL` was process-only. Main collector command records show that override. The supplemental command additionally records process-only normal `PROGRAMFILES`, `PROGRAMFILES(X86)` and `LOCALAPPDATA` prefixes; the observed supplemental Chrome version is **157.0.8103.50**, Node **v24.22.1**. No installation, env-file edit or harness workaround was needed. The root's distinct-retry contingency for discovery failure was not exercised.

Catalogue process span: **2026-11-11T21:01:49.878Z through 21:50:38.511Z**. Sum of exact process elapsed values: **2869995.572800001 ms**; wall span: **2928633 ms**. These include fixture validation, waits, axe and shared development-server/CPU effects. **They establish no performance benchmark.**

## Exact pair and image inventory

The [saved expected catalogue][expected] and [independent pair/PNG inventory][pairs] reconcile the frozen catalogue factory and unchanged plan by exact key sets, not totals alone. All missing, unexpected and duplicate-key/filename lists are empty for both collectors and the catalogue images.

| Declared viewport        | Capture pairs | Check pairs | Viewport PNGs | Full-page PNGs |
| ------------------------ | ------------: | ----------: | ------------: | -------------: |
| desktop, 1440 x 1000     |            42 |          42 |            42 |              4 |
| intermediate, 1024 x 900 |             4 |           4 |             4 |              3 |
| small-tablet, 640 x 900  |             4 |           4 |             4 |              3 |
| mobile, 390 x 844        |            32 |          32 |            32 |              4 |
| **Total**                |        **82** |      **82** |        **82** |         **14** |

Not every Studio state declares every viewport; the exact set, not 47 multiplied by four, is the obligation. Full-page eligibility derives from the catalogue, not the batch JSON. PNG headers/dimensions and per-invocation artifact hashes independently match. Supplemental images are kept separate, not used to fill catalogue keys.

There are four repeated-image digest groups, not duplicate evidence keys: Pages desktop viewport/full, Pages intermediate viewport/full, Template gallery desktop viewport/full, and the two distinct mobile new-page/page-create entries. Both latter PNGs were directly inspected and show the same intended template-based New page form; their digest is `9cb9b6f49b14f0d9b90791f7a8808a56a34077b52d212df57b8d3c846cd9f241`. Separate creation windows/logs remain attributable. Identical pixels do not establish copied evidence, nor a distinct installed create journey. All duplicate groups and exact paths remain in [measurements][measurements].

## Measurements and unresolved qualifications

The [measurement ledger][measurements] retains every pair and source JSON. The [audit's structural completion][audit] is not a behavioral all-clear; its empty structural-failure list does not erase the qualifications below.

- **Axe:** results for all 82 check pairs, zero axe execution errors and zero pairs with reported violations under the configured WCAG 2A/AA/2.1AA tags. **33 pairs contain incomplete results** requiring review. Zero reported violations is not accessibility conformance.
- **Overflow/route headings:** zero horizontal-overflow pairs in either 82-pair set; zero unexpected route-error headings. These measurements do not prove absence of every clipping, scrolling or application error.
- **Rendered rows:** Pages has ten rendered desktop/intermediate table rows and ten small-tablet/mobile cards; Missionaries has seven rows/cards, Giving pages one desktop row, Account no data rows. These are rendered-page counts, not total database records.
- **Heading count:** Account's raw h1 count is two at each width. That raw count is not proof of a visible duplicate-title hierarchy; actual Account PNGs were inspected.

Incomplete families overlap between pairs; summed candidate nodes below are **not unique defect counts**:

| Incomplete rule         | Affected pairs | Summed candidate nodes |
| ----------------------- | -------------: | ---------------------: |
| `aria-valid-attr-value` |             20 |                     93 |
| `color-contrast`        |             27 |                    213 |
| `aria-hidden-focus`     |             10 |                    115 |
| `aria-prohibited-attr`  |              1 |                      1 |

Eight limited row-keyboard probes reach a row and move with ArrowDown: Pages desktop/intermediate/small-tablet/mobile after **35/35/11/10** Tab stops; Ministry updates desktop/mobile after **34/10**; Missionaries desktop/mobile after **26/6**. This is not exhaustive keyboard or screen-reader coverage.

### Dialog and focus qualifications

Six detected-dialog measurements are retained. Pages workspace desktop/mobile, Columns desktop, and Web Studio mobile navigation are geometrically contained, report no internal horizontal overflow, no escapes across the 12-Tab probe, and `closedByEscape: true`.

**Template picker desktop/mobile remains a focus qualification, not a pass:** both detected dialogs are named Choose an option, widths **542/324 px**, geometrically contained, with no internal X overflow. Both raw probes record **12 tabEscapes**, sample destinations **none/none/none**, and `closedByEscape: true`. No focus-containment pass or actual Escape-dismissal pass is claimed. The role-based picker can be absent after Tab before the final Escape measurement; without a separate reproduction, the product root cause is not established.

**Bulk publish is visually present but unmeasured by the role probe.** The PNG shows a Confirm publish modal over the two selected pages Year-End Giving and Kenya School Build, with Cancel/Confirm. Both capture/check `dialog` and check `dialogFocus` are null in the [raw bulk check output][bulk]. Thus opening the intended confirmation is visually evidenced; its geometry, 12-Tab containment and Escape behavior are not measured. Confirm was not clicked; publication is not proved. Do not classify it as an exercised focus pass or a missing setup trigger.

### Readiness diagnostics preserved, not cleared

Independent raw stdout/stderr review finds **13 ready-text warnings across eight invocations**:

| Invocation        | Lines | Retained ready-text diagnostic |
| ----------------- | ----: | ------------------------------ |
| studio-03-check   |     3 | Document state                 |
| studio-05-check   |     1 | /document state                | workspace/i |
| studio-08-capture |     1 | New template                   |
| studio-08-check   |     2 | New template                   |
| studio-09-capture |     2 | /document state                | workspace/i |
| studio-09-check   |     2 | /document state                | workspace/i |
| studio-10-capture |     1 | New giving page                |
| studio-10-check   |     1 | New giving page                |

The original per-invocation `inventory.warnings` arrays total zero because that summarizing regex omitted these lines. The independent [raw-warning audit][warnings] corrects the interpretation without modifying original evidence or harness source. It finds no other matching missing-setup, disabled/unresolved/loading/not-settled/route-error warning lines; that does not mean every control was exercised. Intended editor Details, preview menu, New template and giving-page validation forms were visible in inspected capture PNGs despite warnings. A capture image does not disprove a readiness warning in the separate check process; warnings remain for root qualification. Exit 0 does not clear them.

## Direct PNG semantic inspection

The [visual qualification inventory][visual] records **16 directly inspected PNGs**, each with exact path, digest, dimensions and concrete observation. This is representative inspection, not a claim that every PNG was visually reviewed. It includes:

- **Account at 1024 and 640:** synced identity fields and preferences, with Language, Enhanced Contrast and Reset preferences visible in the 640 full-page PNG. No preference persistence/save journey is established.
- **Local CMS Home editor at 1024/640:** seeded title, slug, Published state, Edit/Versions/API and form fields. Mobile Details shows document/organization/version ID 1; the mobile preview menu shows both preview and published-page choices, not destination traversal.
- **Template picker desktop/mobile:** visibly open Search/options, Standard Page Template selected; this semantic presence does not override the focus caveat.
- **Bulk confirmation and New giving page validation:** correct modal/form pictured, not a route-error page. Bulk confirmation remains unmeasured as described; required missionary error is visible.
- **Secondary-version Unavailable/retry:** actual failure and post-click recovery PNGs at desktop/mobile, qualified separately below.
- **Two identical mobile create entries:** same visible form, not distinct installed-journey evidence.

## Separate synthetic secondary-version retry evidence

Catalogue `studio-missionaries-status-error` fails the **primary** giving-page GET. It does not establish failure/recovery of the **secondary** versions lookup. A separately attributed inline repository Playwright probe covers that secondary distinction; [source transcript][secondarySource], [runtime metadata][secondaryRuntime], [summary][secondary] and [artifact inventory][secondaryInventory] are retained unchanged.

The supplemental invocation ran **2026-11-11T22:00:09.559-22:00:21.272Z**, exit 0, no timeout, raw elapsed **11712.837800000001 ms**, with a fresh mandatory fixture preflight in that browser process, immediate unique preserved proof, common bundle, and its own before/after freeze/input gates. It has four exact distinct stage/width keys and four new PNGs; it is not a replacement for any of the 82 catalogue keys and carries no separate axe audit.

The primary GET is synthetically supplied with three giving-page rows: Grace published (130201), Daniel draft (130202), Priya draft with published history (130203). Missionary names use the unchanged committed fixture installer. The secondary versions GET first responds **503**, showing seven missionary names, an explicit secondary-publication-status warning and Retry. Daniel and Priya are Unavailable; Grace stays Published. Existing Edit giving page hrefs are preserved.

The probe clicks the actual accessible **Retry publication status** control. The secondary GET then responds **200** with published parent 130203; the primary is also refetched. Assertions and inspected desktop PNGs show Daniel **Draft**, Priya **Changed**, Grace **Published**, warning/Retry absent, and unchanged names/Edit hrefs. Mobile PNGs show Daniel/Grace; Priya is below their viewport and is verified by DOM assertions rather than claimed visible there. The expected synthetic 503 console resource error is retained, not hidden as an unexpected failure or called a clean console.

This is a **synthetic UI fault/recovery probe** with no CMS document mutation or Edit-link traversal. It does not establish an installed giving-page document, a successful live publish, or a public published-address response.

## Limits and root handoff

- **Catalogue does not prove the separate installed published-address journey.** That installed CMS create/edit/publication/address traversal remains unrun here. Visible Preview/View live/Open published page controls are not destination proof. No publish, revert, unpublish, destructive bulk confirmation, provider-side or tenant-integration outcome is claimed.
- Runtime metadata identifies the r12 admin path and localhost:3031, but not an independent build/cache-to-freeze attestation. All claims are bounded to observed fixture runtime and recorded times.
- Limited axe, row and role-based dialog probes do not cover full keyboard, screen reader, zoom, cross-browser/theme combinations, real auth/permissions or production integration. Account preferences were pictured, not changed and persisted.
- Readiness warnings, axe incompletes, picker focus samples and the bulk-modal role gap are preserved for root. Resolving product/setup issues would require authorized changed inputs and a new freeze/run; none was repaired or relabeled mid-run.
- Other areas, historical A supplementation, root aggregates/ledgers, sheets, briefs and installed journeys remain outside this Studio handoff. The scheduling decision permits overlap; it does not authorize source/runtime changes or confer a performance claim.

[Final retained-artifact manifest][manifest] hashes the owned run's files, with explicit self/receipt/report-validation exclusions. Its [verification receipt][receipt] binds the manifest and structural report check. [Report/link validation][reportValidation] is documentation/evidence structural verification only; no additional product tests or source edits are implied. Existing raw logs, partial probe findings and all original per-invocation evidence remain available for root aggregation.

## Evidence navigation

The [exact pair/PNG inventory][pairs], [all invocations/proofs/gates][invocations], [measurement ledger][measurements], [readiness warning audit][warnings], [PNG qualifications][visual], [secondary retry summary][secondary] and [final handoff gate][final] are the primary navigation points. This report is an evidence-completeness handoff with explicit limits, not acceptance or a visual score.

[run]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/run.json
[audit]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/audit-20261111T221401484Z-5ea8ef9c/audit.json
[pairs]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/audit-20261111T221401484Z-5ea8ef9c/pair-inventory.json
[invocations]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/audit-20261111T221401484Z-5ea8ef9c/invocation-audit.json
[measurements]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/audit-20261111T221401484Z-5ea8ef9c/measurements.json
[warnings]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/audit-20261111T221401484Z-5ea8ef9c/warnings.json
[expected]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/expected-catalogue.json
[inputs]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/input-hashes.json
[final]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/final-gate.json
[visual]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/visual-qualifications.json
[schedule]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/scheduling-decision.md
[scheduleReceipt]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/scheduling-decision-receipt.json
[secondary]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/audit-20261111T221401484Z-5ea8ef9c/secondary-status-audit.json
[secondaryRuntime]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/secondary-status-20261111T220008244Z-12f7657d/browser/runtime.json
[secondarySource]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/secondary-status-20261111T220008244Z-12f7657d/invocation-source.txt
[secondaryInventory]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/secondary-status-20261111T220008244Z-12f7657d/inventory.json
[proof]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/proofs/studio-01-capture.fixture-proof.json
[bulk]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/studio-12-check/workspace-checks.json
[manifest]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/artifact-manifest.json
[receipt]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/artifact-manifest.receipt.json
[reportValidation]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/handoff-20261111T224713154Z-38fc3c28/report-validation.json
