# Round 13 money/browser evidence

## Outcome and stop boundary

Priority receipt, eligible fund-correction, CRM note, Reports URL/history and unavailable-trend evidence is retained. The clean Contributions matrix covers **28 loaded layouts** (7 cardinalities × 4 widths), plus **6 keyboard/receipt-confirmation cases**. This is local intercepted-fixture evidence, **not a final visual score**, provider-success test, auth/tenant integration test or WCAG-conformance claim.

**Further capture is blocked by frozen-source drift.** The supplemental full-page card attempt stopped at its mandatory preflight, before launching a browser, at **November 12, 2026, 02:04:54 +07:00** (`2026-11-11T19:04:54.968Z`). Three files no longer matched the 1,032-entry manifest:

- `packages/api/src/admin/contribution-operations/route.ts`
- `packages/api/src/reads/dashboard-stats.ts`
- `tests/unit/packages/api/reads/dashboard-stats.test.ts`

Exact expected/current hashes are in [post-capture-frozen-source-proof.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/post-capture-frozen-source-proof.json). The unchanged diff hash is `8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547`; manifest hash is `c26908234e2630b4491c5956357277e0effdf2f9c592e1259915687873756d8a`. No edits were restored and no browser work continued after the mismatch. Root must reconcile or refreeze before supplemental capture.

Successful runs passed their own startup frozen check. No independent **end-of-run** frozen proof was retained, so this report does not certify that the candidate stayed frozen throughout or remains frozen now. Extras were not independently recomputed because git operations were prohibited.

## Evidence entrypoints

- [evidence-summary.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/evidence-summary.json): clean layout/row/child widths, spans, fill ratios, content checks, keyboard results, receipt geometry, eligible gift fields and Reports transitions.
- [artifact-index.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/artifact-index.json): exact SHA256, byte length and PNG dimensions, including retained failed/partial runs.
- [visual-review.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/visual-review.json): native images actually inspected, with readiness and occlusion qualifications. A file merely appearing in the hash index does not mean it was visually inspected.
- [offline-verification.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/offline-verification.json): link/hash/input/matrix structural checks. Its success is not a product pass.

## Method, provenance and safety

All browser runs target **http://localhost:3031**, not port 3030. Isolated Playwright Chrome contexts use DPR 1, light appearance and reduced motion. Captures use the explicit local admin demo-session surface and existing route/module interception helpers. Unhandled `/api/**` calls are guarded with 503 responses. Money-operation writes would be recorded and fulfilled in memory; no correction, refund, receipt-confirmation or provider action was submitted. The long note was created only in the fixture's memory. No CMS mutation, privileged key, environment change, server/Postgres lifecycle action, git mutation or subagent was used.

Only the Next development portal was hidden. The actual floating product launcher remains visible and sometimes obscures lower-right content. Protected-shell readiness can take approximately 50 seconds; earlier short readiness assumptions are retained as probe failures, not product failures.

Every browser runner imports the owned preflight wrapper, which calls committed `prepareFixtureBundle` before capture/check. Proof records typecheck passed and **1,645 fixture checks passed**. Bundle SHA256: `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b`. See [prepared fixture proof](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/fixture-proof.json) and [regenerated inspection](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/regenerated-fixture-inspection.json). Existing route/module fixture schemas and committed harness were not changed.

Exact successful scripts, not the subsequently amended working copies:

| Evidence                             | Retained script                                                                                                                                                           | SHA256                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Receipt, eligible fund, menus, notes | [browser-probes.v5.mjs](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/browser-probes.v5.mjs) | `7a6e5c6d59de1209d401c9e14864a5bdcb3189051f50bc01331a4d2e362c9e80` |
| Reports and manual phone fund top    | [browser-probes.mjs, v6](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/browser-probes.mjs)   | `c15c8142d0b3f894358d27e7a83c659a94abf92895c677d68dc096b6b294e24b` |
| Counts 1/2/4/5/7                     | [cards-batch.v1.mjs](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch.v1.mjs)       | `fc8b822ae17daf2fd15801256b2ceb0c9e717c2381370a311b241cfc8759e3ec` |
| Counts 6/10 and keyboard             | [cards-batch.v2.mjs](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch.v2.mjs)       | `acdc8159dba302c8146b7e3a16333bd33f0b8517c9f5fdb5d7deb1ff3f9b2445` |

The current [cards-batch.mjs, v3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch.mjs) adds full-page capture/scroll reset, but its browser behavior is **not validated**: preflight aborted before launch. It did not produce clean supplemental images. Browser operations were bounded and tool polling stayed below 60 seconds; the committed capture wrapper's total eight-minute watchdog timed out and is disclosed below.

## Findings requiring attention

### 1. Resend receipts open at the top, but summary container clearance fails

All four states—async-loaded and cached at 1440/390—open at **scrollTop 0**. The async scenario gates the actual detail GET and releases it after observing loading. Cached reopening keeps the detail request count **1 → 1**, establishing the no-refetch case rather than merely repeating a fresh open.

| Width | Detail state  | Heading bottom | Summary top | Container overlap | Text below heading |
| ----- | ------------- | -------------- | ----------- | ----------------- | ------------------ |
| 1440  | Async loaded  | 443            | 435         | 8px               | Yes                |
| 1440  | Cached reopen | 443            | 435         | 8px               | Yes                |
| 390   | Async loaded  | 327            | 319         | 8px               | Yes                |
| 390   | Cached reopen | 327            | 319         | 8px               | Yes                |

**The requested “summary fully below sticky heading” is not confirmed.** The top border/container is covered by 8px; the actual current amount, designation and receipt text remain fully below the heading and readable. Images show $1,000.00 / Clean Water Initiative / Sent and contained controls. Distinguish readable text from complete summary-container clearance.

Evidence: [measurements](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/results.json), [async desktop](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/receipt-async-1440.png), [async phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/receipt-async-390.png), [cached desktop](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/receipt-cached-1440.png), [cached phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/receipt-cached-390.png).

Owning layout: [operation-shell.tsx:1768](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:1768>) sticky header / negative margins, [operation-shell.tsx:1832](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:1832>) form body, and shared [dialog.tsx:62](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/dialog.tsx:62) padded grid popup. These identify the layout seam; no source fix was attempted.

### 2. Genuine phone correction form initially skips its summary; sticky bodies bleed above headings

The verified correction opens a real operation form, not the gift detail sheet. At 390px its natural initial **scrollTop is 439**, with the **Reason textarea focused**; current gift summary and destination are above the viewport. They are recoverable by scrolling up. The separate manually-scrolled-top image is explicitly **not** the initial state; it shows heading bottom 172 / summary top 164 (the same 8px overlap).

Natural phone correction and bottom-scrolled long-note images visibly show body text through the approximately 25px padded strip **above** the pinned header. Long-note header/footer stay present, but their visual context is not cleanly isolated from scrolling body text. This is a visual observation, not inferred solely from DOM coordinates.

Evidence: [natural correction phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/eligible-fund-390.png), [manually scrolled top](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/fund-top-v6/eligible-fund-390-top.png), [manual-top measurements](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/fund-top-v6/results.json), [desktop note bottom](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/long-note-1440-bottom.png), [phone note bottom](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/long-note-390-bottom.png).

Owning focus behavior: [operation-shell.tsx:1629](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:1629>) and [operation-shell.tsx:1754](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:1754>) focus the first editable control. Sticky layout seam: [notes/page-client.tsx:199](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/notes/page-client.tsx:199>) and shared [dialog.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/dialog.tsx:64).

### 3. Phone “Jump to funds” hides the heading beneath the application header

The link correctly retains query parameters and adds `#report-funds`, but the Funds heading lands at **viewport y16**, beneath the **48px sticky application header**. The heading is hidden while its subtitle/list remain visible. [Screenshot](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/reports-v6/reports-390-after-jump.png) and [recorded coordinates/URL](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/reports-v6/results.json) establish this separately from URL persistence. The target uses `scroll-mt-4` at [funds-grid.tsx:263](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/funds-grid.tsx:263>).

## Eligible gift, CRM placement and long-note context

Eligible fixture anchor: **gift `e0a15e46-a328-4b24-a921-681c12884ef6`**, CRM donor **`8aa9e048-5433-409a-aacc-13729d8b2478`**, Margaret Okonkwo-Hale, October 25, 2026, **$1,000.00**, Clean Water Initiative.

Eligibility is explicit in the regenerated service/detail and CRM inline fields: `fund_correction.available: true`, `blockedReason: null`, `nextStep: null`, `riskLevel: high`. Payment is one-time/card/completed; staged gift and CRM post status are posted; receipt is sent; designation has one line. Shared `correctionState` is **pending**: this report does not invent eligibility heuristics from status alone or hide that field. Exact fields remain in [money-v5/results.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/results.json).

The actual gift-specific trigger is “More actions for $1,000.00 gift on Oct 25, 2026 to Clean Water Initiative”; its menu genuinely contains **Correct fund designation**. Desktop row actions sit on the right; phone actions follow the gift summary. Menus open upward and stay inside the viewport. [Desktop menu](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/gift-menu-1440.png), [phone menu](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/gift-menu-390.png), and [desktop correction form](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/eligible-fund-1440.png) show real warnings, destination selection, receipt choices, reason, review confirmation and disabled primary action. **Nothing was submitted.**

The historical `nikhil-1` helper's absent trigger is not proof that this current fixture gift is ineligible. Older `contribution-fund-correction--*.png` from the committed runner shows **detail**, not a correction form; it must not be relabeled as successful form evidence.

The 2,927-character “Year-end call notes” scrolls **0 → 290** at 1440 (scrollHeight 1,256 / clientHeight 966) and **0 → 924** at 390 (1,734 / 810). Header top stays 41; Close remains in its pinned footer. Actual context reads **Mission Control · Updated Nov 1, 2026 · Visibility Standard**; **Linked record is “— / Not set”**. No linked-donor-context success is claimed. [Desktop top](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/long-note-1440-top.png) and [phone top](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/money-v5/long-note-390-top.png) were read in addition to both bottom images.

## Reports URL, history and unavailable trend

Both 1440/390 use actual controls, not URL-only assertions:

1. Open `/reports?group=donors&period=90d&probe=round13&keep=two`; Donor is pressed and Last 90 days is selected. Reload retains URL and selections.
2. Click Missionary and select Last 30 days; URL becomes `group=missionaries&period=30d`, preserving `probe` and `keep`. Reload retains actual selections.
3. Select Fund; the default `group` parameter is removed, while `period=30d` and unrelated parameters remain.
4. History length stays **2** during filter selections/reload: this reflects existing **replace semantics**, not a requirement that each selection push history. Navigate to Contributions, Back restores the final Reports URL (including phone hash); Forward restores the neighbor route.

Intercepted report requests reflect `slice=donors`, `slice=missionaries`, `slice=funds` and the nondefault `dateFrom`. At capture time the 90-day and 30-day bounds were `2026-08-14T17:00:00.000Z` and `2026-10-13T17:00:00.000Z`. [Full transition measurements](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/reports-v6/results.json) retain complete requests, selections, URL parameters and history lengths. No horizontal page overflow was measured.

**Fixture limitation:** the existing module fixture returns static fund rows and null date bounds, so “All time” copy and fund labels can appear under donor/missionary selections. This proves control/URL/request behavior, **not actual donor/missionary aggregation, date filtering or financial reconciliation**.

Funds precedes the unavailable monthly trend: at 1440, Funds document top **770**, notice top **1,206**, height **106.75**; at 390, Funds top **1,104**, notice top **1,874**, height **129.5**. The notice and Try again fit without a large empty chart. Phone grouping/period/Summary/export and Giving/Donors controls fit. [Desktop Funds full](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/reports-v6/reports-1440-funds-30d-full.png), [phone Funds full](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/reports-v6/reports-390-funds-30d-full.png), [phone compact notice](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/reports-v6/reports-390-trend-unavailable.png).

A loaded server trend is **not expected or established** in this backend-unavailable environment; the other worker's transport fixture is outside this task's evidence.

**Visual readiness qualifications:** donor-90d captures have loaded controls/totals with chart skeletons. Desktop missionary-30d later `-full.png` has bars/table, with the static-fixture caveat. Phone `reports-390-missionaries-30d.png` is a **loading** image; its later full image still has a chart skeleton/incomplete page capture. “Observed” scenario status must not be interpreted as every screenshot being fully settled. The visual-review ledger marks these partial states.

## Contributions: clean layout matrix

Use only [cards-batch-v1 results](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch-v1/results.json) **for 1/2/4/5/7** and [cards-batch-v2 results](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch-v2/results.json) **for 6/10**. Each count retains its exact `input-rows-{count}.json` and SHA. Inputs are unmodified regenerated typed rows sliced in fixture memory; no schema or product data fields were changed. Existing aggregate/attention templates stay unchanged, so these cardinalities are not a claim of aggregate reconciliation or every real filtering pathway.

All 28 native grid images were read. Names, money, gift date, receipt/payment/recurrence context are useful; Northfield Community Bank and Margaret Okonkwo-Hale wrap. DOM checks confirm every expected name/money and no horizontal page overflow in each of the 28 layouts. Actual child-card widths match their wrappers.

| Loaded rows | 1440 row pattern | 1024 row pattern         | 640 / 390 |
| ----------- | ---------------- | ------------------------ | --------- |
| 1           | 1 full width     | 1 full width             | 1 column  |
| 2           | 2                | 2                        | 1 column  |
| 4           | 2 + 2            | 2 + 2                    | 1 column  |
| 5           | 3 + 2            | 2 + 2 + 1 full width     | 1 column  |
| 6           | 3 + 3            | 2 + 2 + 2                | 1 column  |
| 7           | 3 + 2 + 2        | 2 + 2 + 2 + 1 full width | 1 column  |
| 10          | 3 + 3 + 2 + 2    | 2 + 2 + 2 + 2 + 2        | 1 column  |

Measured list widths are **1,142 / 726 / 558 / 324px** at 1440/1024/640/390. Desktop has six CSS tracks about **180.328px** with 12px gaps; effective occupied cards are about **372.66px**, **565px** or full width. At 1024, two **357px** tracks have a 12px gap and an odd last item spans 726px. Narrow lists are one column with 8px gaps. Per-cell widths, actual row grouping, CSS spans, wrapper/child equality, occupied-width ratio and within-row width range are preserved in the summary, rather than inferring balance from column count alone. This is descriptive layout evidence, **not a numeric visual-quality score**. Shared owner: [data-grid-panel.tsx:241](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/data-grid-panel/data-grid-panel.tsx:241).

**Capture limitations:** element screenshots can auto-scroll under sticky app chrome. In 7×640, 7×390 and 10×390, the first name is partly/fully obscured; 10×640 shows sticky chrome across the middle of the tall grid. These artifacts do not establish missing DOM data. Actual [10×390 viewport](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch-v2/cards-10-390.png) and [10×640 viewport](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch-v2/cards-10-640.png) show the first name/money/receipt and fitting controls; lower cards need scrolling. The real floating launcher also overlaps some lower-right card details. The blocked v3 supplemental run was intended to reduce ambiguity, not to hide these caveats.

### Keyboard, selection and receipts

Six clean cases: counts **6/10** at **1440/1024/390**. Focusing view-switch buttons and pressing Space changes table/cards, with correct pressed state and visible table. Below `md` (including 640/390), the toggle is intentionally hidden and the responsive gift list remains available; no missing-phone-toggle defect is inferred.

Focusing the first checkbox and pressing Space sets `aria-checked=true` and shows the selection bar; Space clears it to false. Enter on its receipt action opens the actual **alertdialog**. The confirmation reads already sent **1**, ready to send **0**, requires an unchecked explicit resend opt-in, and has a disabled primary action. Escape closes it in all six cases. No confirmations were submitted. This uses real keyboard keys after locator focus; it is **not a full Tab-discoverability or screen-reader tour**.

The actual Theodore product search narrows the ten-row fixture to one loaded result; recorded separately from in-memory cardinality setup. Selection/confirmation/search native PNG review is listed in the visual ledger.

## Required committed helpers, incomplete and failed scenarios

The committed runners were used before the supplemental probes; they were not bypassed or patched:

- **Capture runner:** SHA `59a0ce8239cc144336c7ee37d1b63f8939af4a7115b794a1f2903a5770d2cdde`. It timed out after 480 seconds, leaving PNGs but no final metrics. [Execution](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/committed-capture-execution.json), [log](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/committed-capture.log). Historical fund-correction detail is not form evidence. Its old “More gift actions” selector also differs from the actual gift-specific accessible name.
- **Focused check runner:** SHA `962d38001f367e4bc3146517a6b68a235632cf09fe56f3044054003511647195`. Exit 0 for CRM resend receipt desktop/phone; no horizontal overflow, dialog widths 512/358, contained Tab sequence and Escape close. Axe records zero violations but **incomplete `aria-hidden-focus` and `color-contrast`**. [Checks](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/committed-check-focused/workspace-checks.json), [execution](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/committed-check-focused-execution.json). This does not override the observed 8px visual overlap or establish WCAG conformance.
- **Earlier card probes:** v1 counts 6/10 incorrectly waited for role `dialog` instead of `alertdialog`; the still-open modal contaminated later widths. Those images/results are preserved but excluded from the clean matrix. Earlier default-limit probes did not force six rows because the product explicitly requests `limit=100`; earlier phone-toggle waits ignored its intentional breakpoint. These are probe mistakes, not product findings.
- **Earlier money/Reports probes:** loading/readiness assumptions and the initial “giving trend” detector were wrong; v6 uses the actual `Net giving by month` region. Results/logs remain in their original directories, including failed/partial states. The first manifest inspector mishandled explicit `sha256: absent` entries; [initial inspector error](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/initial-inspector-error.json) is a probe error, unlike the later three actual content-hash mismatches.
- **Supplemental full-page capture:** [cards-batch-v3.log](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/cards-batch-v3.log) records the preflight stop. There is no successful `cards-batch-v3` capture directory. No attempt was made to bypass the freeze or clean up someone else's files.
- **Offline index first pass:** two bookkeeping failures (a mistyped search screenshot filename and checking the not-yet-written verification file) were corrected in the owned indexer. [Initial log](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/offline-index.initial.log) and [initial verification](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/offline-verification.initial.json) remain preserved; these are evidence-tool errors, not product findings.

## Offline verification and handoff

[build-evidence-index.mjs](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/build-evidence-index.mjs) reads saved artifacts only; it does not import the preflight, regenerate fixtures or contact any service. It verifies exact script/input SHA, unchanged fixture-row subsets, 28 clean layouts, six keyboard cases, readable linked artifacts and the complete hash index. Run from the authorized checkout:

```powershell
bun docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser/build-evidence-index.mjs
```

The index excludes itself, its post-write verification JSON and the active offline log to avoid recursive/changing hashes. All changes for this task are confined to the owned evidence directory. No product/tests/source were changed to fix or force the observed cases. Further settled Reports/full-page card capture requires root's frozen-candidate reconciliation; it must rerun mandatory fixture preflight, not reuse a stale proof.
