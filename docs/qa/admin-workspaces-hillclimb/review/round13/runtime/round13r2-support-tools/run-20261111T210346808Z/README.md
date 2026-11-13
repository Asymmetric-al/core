# Round13r2 Support + Tools: partial fresh evidence

**NOT VERIFIED as a complete catalogue handoff.** All 34 selected metric/viewport-PNG pairs and 21 full PNGs exist, but only 25 of 34 check pairs ran. The intended PDF Export menu never opened. File completeness is not semantic completeness, and an exit code of zero is not an accessibility or usability pass.

## Scope and ownership

- Checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.
- Existing root-provided candidate: `http://localhost:3031`. No access to or termination of 3030, no server start/restart, no provider operation, no children/delegation.
- All task evidence is under this owned run directory. No product/test/harness/ledger/env/Git changes. Root aggregates are deliberately left to root.
- Read the applicable root/admin instructions, testing rules and verification/browser skills, freshness plan section 5, and root scheduling decision.
- Root permits disjoint collectors to overlap on the shared development runtime. This lane used its own contexts and did not pause other collectors. Other lanes were not timed or audited here; do not assume exclusive/sequential server execution or infer a performance benchmark.
- No Studio selection, CMS reset/mutation or installed CMS journey. No Save, Send, export execution, download or real OS clipboard action was performed.

## Frozen identity and freshness

- Frozen files: **1,038**.
- Manifest SHA256: `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0`.
- Diff SHA256: `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b`.
- Bounded-plan SHA256: `feca3e2985c7aff03b7267a6d503cab437538fbe87903752c9c608992378166b`.
- Common fixture bundle SHA256, every performed collector and separate supplemental extraction: `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b`.
- Each of the nine collector invocations used mandatory fresh fixture preflight. Its original phase proof and a uniquely preserved `logs/{tag}.fixture-proof.json` match. Every `verifiedAt` is inside that invocation's UTC start/end, realpath `repoRoot` is r12, typecheck passed, and all **1,645 fixture contract checks** passed. These are fixture gates, not a full application typecheck or integration claim.
- Explicit state completion lines, all 25 per-width check measurement lines, per-batch expected/observed key sets, duplicate checks, PNG IHDR dimensions, artifact hashes and invocation-window mtimes validate. The original per-batch files/proofs/logs remain; merged audit JSON alone is not the proof.
- Twelve recorded before/after batch freeze checks (including the unattempted Support check continuation bracket) pass. The supplemental manual session has its own before check; the final verification also brackets its end.
- Final freeze: 2026-11-11T22:55:44.069Z through 2026-11-11T22:55:45.113Z, exit 0, 1,038 files, no mismatches or extra files.
- All **500 recorded input hashes** still match. This independently hashed list is not exhaustive: the initial traversal missed the database package's top-level hooks/types layout. The frozen manifest separately covers 22 database source/type files. See `final-source-check.json` for the concrete list and coverage limit; do not call this a hash of all repository/transitive node_modules inputs.
- Browser discovery inherited correct `PROGRAMFILES`, `PROGRAMFILES(X86)` and normal `LOCALAPPDATA`. No discovery failure, installation, retry, env-file change or harness change was needed. Only process-level `CAPTURE_BASE_URL=http://localhost:3031` was supplied to collectors.

## Exact batch and pair inventory

| Batch      | States | Capture metric/viewport pairs | Full PNGs | Check pairs | Qualification                                |
| ---------- | -----: | ----------------------------: | --------: | ----------: | -------------------------------------------- |
| support-01 |      4 |                           9/9 |         6 |         9/9 | No setup warning in logs                     |
| support-02 |      4 |                           5/5 |         5 |         5/5 | No setup warning in logs                     |
| support-03 |      2 |                           2/2 |         2 |         2/2 | Close warning retained; no capture rerun     |
| tools-01   |      4 |                           9/9 |         8 |         9/9 | No setup warning in logs                     |
| tools-02   |      3 |                           9/9 |         0 |         0/9 | PDF menu captured as-is; check not attempted |

Widths are exactly **1440x1000**, **1024x900**, **640x900**, **390x844**, only where declared by each frozen state. Totals: Support 10 states / 16 pairs; Tools 7 states / 18 pairs. **55 PNGs = 34 viewport + 21 full**. No duplicate metric/check keys or extra/missing expected capture PNG names. One of those viewport files is semantically unqualified: `pdf-export-menu@desktop`.

Unattempted checks, all from `tools-02`:

- `email-studio@desktop`
- `email-studio@intermediate`
- `email-studio@small-tablet`
- `email-studio@mobile`
- `pdf-studio@desktop`
- `pdf-studio@intermediate`
- `pdf-studio@small-tablet`
- `pdf-studio@mobile`
- `pdf-export-menu@desktop`

`pair-inventory.json` retains all 34 expected/observed pair records, source PNG SHA256 values, per-batch exact sets, freeze brackets and the missing-check list. No new values have been invented for those nine checks.

## Actual collector timings and exits

All timestamps below are **November 11, 2026 UTC** (the run is November 12 in Asia/Bangkok). Exact ISO timestamps, argv, PID, bounded timeout, environment override and stdout/stderr paths are in `logs/{tag}.termination.json` and `invocation-audit.json`. All nine collectors terminated without a process timeout; two supervisory stops are retained separately. These durations are not performance measurements.

| Invocation         | UTC start     | UTC end       | Elapsed ms | Exit |
| ------------------ | ------------- | ------------- | ---------: | ---: |
| support-01-capture | 21:03:49.149Z | 21:07:48.093Z |  238943.19 |    0 |
| support-01-check   | 21:07:48.319Z | 21:15:55.257Z | 486937.852 |    0 |
| support-02-capture | 21:15:58.597Z | 21:19:51.685Z |  233088.79 |    0 |
| support-02-check   | 21:19:51.958Z | 21:24:32.824Z | 280865.221 |    0 |
| support-03-capture | 21:24:35.924Z | 21:26:52.471Z | 136547.186 |    0 |
| support-03-check   | 21:32:02.628Z | 21:33:54.406Z | 111777.465 |    0 |
| tools-01-capture   | 21:33:57.377Z | 21:37:42.004Z | 224626.744 |    0 |
| tools-01-check     | 21:37:42.423Z | 21:45:43.772Z | 481348.428 |    0 |
| tools-02-capture   | 21:45:46.615Z | 21:48:54.757Z | 188141.957 |    0 |

## Preserved failures and stop decisions

1. `support-03-capture` exited 0 but warned **browser close did not finish in 20s; continuing**. The initial supervisor stopped with exit 1. Its original stopped status and logs remain. The continuation ran only previously unattempted jobs under the unchanged eight-hour deadline; no capture rerun or clean browser-lifecycle claim.
2. `tools-02-capture` exited 0 but logged **setup missing: Export (disabled)** and **setup triggers not found (captured as-is)** for `pdf-export-menu`. Actual `pdf-export-menu--desktop.png` contains the editor with no open Export menu. The continuation supervisor stopped with exit 1 after the after-batch freeze check. The `tools-02` checker was not started, rather than silently accepting or retrying the failed setup.
3. Source is consistent with an initialization/setup-order limitation: `capture-workspaces.mjs:190` and `check-workspaces.mjs:241` run setup before their state-settled wait; `module-states.mjs:384` defines the PDF menu and line 387 waits for Save only after setup. This is not proof the menu interaction succeeded. Any product/setup correction requires root authorization and a new freeze/run; none was made here.
4. Supplemental T3 navigation timed out for `/email` at 15,000 ms and `/reports` at 30,000 ms. Later observations were possible; those original timeouts remain in `manual-readonly-measurements/observations.json`. Four actual Reports GET responses were 503 before the narrow browser-memory fixture. These do not become successful live transport evidence.
5. An offline final-audit command initially assumed the wrong full-PNG suffix (`--full` instead of committed `-full`) and exited 1. `artifact-audit-attempt-01.json` preserves it. The corrected **audit command only**, not any source/harness/fixture/capture, passes in `artifact-audit-attempt-02.*`. Final freeze/input checks completed before that offline audit error and were not overwritten.

## Actual PNG review and concrete measurements

Actual generated PNGs were inspected, including Email and PDF at every declared width, the failed PDF-menu file, Reports desktop/mobile/full views, Automations/failing and Workflows, and Support inbox/conversation/table/reports/settings. The observations below distinguish original PNG evidence from supplemental DOM geometry. No visual score is assigned.

### Email

- Original 640 PNG shows a collapsed, unreadable template-name field. Supplemental native Email DOM: **25.6x36 CSS px**, client width 24 versus scroll width 127, enabled input with value `Untitled email`, overflow-x clip. At 390 the input is 320x36; this is not a general claim that all widths fail.
- Original mobile PNG shows the placeholder extending beyond the editor. Supplemental 390 DOM: editor **326 px** wide / **324 px client** / **600 px scroll**; paragraph **600 px** wide, right edge **632.8 px**; outer page client/scroll width both 390. At 640 the editor client/scroll widths are 574/600. A false page-overflow flag does not establish contained editor content.
- Supplemental 640 More menu opened at x86.40/y140.80, **206.49x82.60 CSS px**, contained. New template and Export as HTML were present, neither aria-disabled; no item was selected. Escape closed it and focus returned to More email template actions. This is menu presence/focus evidence, not export correctness.

### PDF

- The original 390 PNG visibly clips the embedded Add Row control/text. `pdf-visible-add-row-pixel-measurements.json` decodes the original lossless PNGs with installed sharp and scans exact RGB `(0,108,190)`:

| Width | Visible blue-fill x/y | Visible blue-fill width x height |
| ----: | --------------------- | -------------------------------- |
|  1440 | 517 / 266             | 236 x 30 px                      |
|  1024 | 508 / 266             | 164 x 30 px                      |
|   640 | 300 / 315             | 254 x 30 px                      |
|   390 | 300 / 335             | 17 x 30 px                       |

- These are bounds of visible matching pixels, not the hidden logical button bounds, touch reach, successful editing or responsiveness of the third-party editor.
- The free-mode banner explicitly says PDF export requires a paid plan and HTML remains available. No export ran. The named PDF Export-menu capture is **not** an open-menu capture.

### Reports mobile heading jump and chrome clearance

- Catalogue PNGs show mocked main report data and six fund entries, while the separate lower card says **Net giving by month could not load**. That card remains an error, not loaded giving.
- Separate read-only T3 geometry at inner viewport **390x844**: visible Reports H1 at y64.80; Funds H2 (`#report-funds`, tabindex -1, scroll-margin-top 80px) starts at y1062.36. Clicking the actual Jump to funds link changes the fragment and focuses that H2.
- After the jump: heading top **79.9625 CSS px**, sticky app-header bottom **48.8000 CSS px**, clearance **31.1625 CSS px**, window scrollY **982.4000**. Document client and scroll widths are both 380 (a vertical scrollbar in the 390-wide viewport). The heading is not covered in this measured setup.
- This supplemental browser is Electron Chrome **152**, DPR **2.5**, light, reduced motion **false**; the committed collectors use installed Chrome **157**, DPR **1**, reduced motion. Do not transplant the exact geometry to the catalogue browser or call it a matched cross-browser result.
- The supplemental main report used only the exact committed module fixture response in a narrow in-memory GET override after fresh preflight; the body SHA256 matches the extracted response. It did not alter the server or recover the lower giving-trend endpoint. No missing catalogue check is filled by this measurement.

### Support and measured check limits

- All **25 performed check pairs** report no page-level horizontal overflow and no unexpected route-error heading. This does not contradict clipped inner Email/PDF content, whose nine catalogue checks were not run.
- Axe reports serious **aria-prohibited-attr** on the two Unassigned markers (`conv-1004`, `conv-1012`) in all four inbox widths and the desktop conversation scan: five scans, two targets each. Source: `apps/admin/features/support-hub/components/board/BoardCard.tsx:172`, an aria-label on a generic span.
- Mobile conversation: fixture `conv-1001`, title Receipt for my March gift; dialog width **390 px**, contained, no internal X overflow, **0 escapes in the runner's 12-Tab probe**, and Escape closes. Other `keyboard` fields in the 25 check rows are null; no full row-keyboard or screen-reader coverage is inferred.
- Support table has 14 rendered rows. Tools checks have Reports 6 desktop rows / 6 responsive cards; Automations 6 rows/cards; failing-filter 1 row; Workflows 7 rows/cards. These are fixture-backed DOM counts, not live tenant-data or financial correctness proof.
- Axe incomplete results are retained, not dismissed: mobile conversation `aria-hidden-focus:4`, `color-contrast:76`; Support reports desktop/mobile contrast 17/15; agents 9; Reports desktop/intermediate/small-tablet/mobile contrast 24/22/12/10; inbox intermediate/mobile 1/1; Automations mobile 2; Workflows mobile 1. See each original check row and `check-findings.json`.
- Support settings visibly disclose Saved, not applied yet; notifications disclose sending unavailable. No settings were saved or sending/provider effects exercised. Development widgets/chrome are visible in captures; this is not production evidence.

## Evidence map and remaining limits

- `expected-inventory.json`: original state/width/full selection and frozen identity.
- `batches/{batch}/{capture|check}/`: original fresh PNGs/metrics/checks/proof; original `*-audit.json` holds per-invocation artifact hashes and expected/observed keys.
- `logs/`: exact process terminations, raw stdout/stderr, before/after freeze results, and nine unique preserved collector proofs.
- `pair-inventory.json`: complete/missing pair ledger, semantic exception, exact PNG sets and source PNG hashes.
- `invocation-audit.json`: every performed invocation, proof/window/root/typecheck/contracts/bundle validation, explicit log completions and original-artifact hash comparison.
- `final-source-check.json`: final 500-file hash comparison and frozen identity; `check-findings.json`: all original measured row summaries including axe incompletes.
- `manual-readonly-measurements/`: separate supplemental preflight/proof, exact response extraction, tool timeouts/503s, menu geometry and Reports jump measurements. The owned preview tab was closed.
- `artifact-hashes.json` and `artifact-hashes.sha256`: final owned-run file inventory; the JSON excludes itself and its detached hash to avoid a recursive self-hash.
- **Not established:** complete 34-pair checks, PDF Export-menu exercise, separate loaded-giving transport, real OS clipboard, send/save/export/provider effects, installed CMS journeys, full keyboard/screen-reader/zoom/a11y conformance, tenant integration, performance, production readiness or a visual score.

Root should preserve this partial set and decide whether the PDF setup needs an authorized refreeze before any fresh distinct continuation/retry. Do not merge these files into a declaration that every named menu/check passed.
