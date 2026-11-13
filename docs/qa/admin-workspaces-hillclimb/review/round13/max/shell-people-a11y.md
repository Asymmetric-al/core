# Round 13 — independent Shell / People accessibility check

Date: 2026-11-11. Final source spot-check: 21:55 +07:00. This is a focused source/test review, **not a visual score, completed council, WCAG-conformance claim, or final approval**. Builders were editing concurrently; the reads and test run are not an atomic snapshot.

Application and tests were read-only. The only authored file is this report in the `t3-5a24111d-r12` worktree. The parent `t3-5a24111d` checkout remained frozen/read-only. No browser, dev server, localhost request, production service, turbo, subagent, workflow, git mutation, or credential change was used.

Applied the canonical [accessibility-review skill](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/ai/skills/accessibility-review/SKILL.md:1), applicable repository/app/shared-UI instructions, frontend/testing rules, relevant OpenSpec, and installed Next.js 16.4.2 navigation/error-handling documentation. The reviewed implementation continues to compose shared Core UI; no alternative primitives, styling system, or permission relaxation is proposed.

## Findings requiring follow-up

### 1. P2 — Copied giving summaries lose the incomplete/unknown-data warning

**Verified source defect, independently reproduced at the pure model boundary.** [ReportsPageView:200](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:200>) builds a summary whenever there are rows, and [the summary action:217](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:217>) does not require known-complete data. The page correctly warns about capped/unknown totals at [page-client.tsx:259](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:259>), but [buildGivingSummaryText:145](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/report-model.ts:145>) never checks completeness. Its [exported wording:155](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/report-model.ts:155>) presents net giving, average, and top-fund share without that qualification.

For identical synthetic figures, complete, explicitly capped, and missing-completeness reports produce **byte-identical** copy beginning `Giving summary, all time`. Someone pasting this into an email/board report loses the essential limitation that was visible on the page. This finding concerns the copy-summary path, not an independently established CSV-export defect.

**Follow-up:** include the appropriate cap/unknown warning in the copied text, or withhold the summary until completeness is confirmed. Add capped and missing-metadata summary regressions; do not infer completeness from the presence of rows.

### 2. P2 — Legacy HTML private care notes still render as literal markup

**Source-confirmed conditional rendering defect; no live private data was inspected.** The recent-activity fix handles legacy HTML through [plainText:182](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:182). However, the private-notes tab still routes non-TipTap strings directly into a paragraph at [PersonnelProfile.tsx:838](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:838). A stored `<p>A &amp; B</p>` therefore remains literal markup/entity text there rather than readable note text. The server read passes the stored content through at [member-care.ts:353](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/member-care.ts:353); the shared editor explicitly recognizes legacy HTML as a supported input format at [helpers.ts:41](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/rich-text-editor/helpers.ts:41).

This is a readability/format-compatibility bug, **not demonstrated XSS**: React escapes the literal fallback. The activity fix does not cover this second reader.

**Follow-up:** use the safe legacy-to-text path, or an established safely parsed shared viewer, for private-note HTML too. Preserve literal non-HTML angle-bracket text. Cover legacy HTML, entities/paragraph breaks, and TipTap private notes separately. The profile suite mocks `RichTextViewer` at [personnel-profile.test.tsx:59](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:59), so its pass is not a full renderer/sanitization audit.

### 3. P2 — Staff-directory advice sends access management to a read-only synced directory

**Verified source mismatch, not a permission bypass.** The compact roles note says “Website editing access is managed in Web Studio editors” and links to `cms-users` at [teams/page-client.tsx:258](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/teams/page-client.tsx:258>). The destination defines its identity fields as sign-in-synced, with `syncedOnly` always false at [cms-users.ts:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/cms-users.ts:11). Its role field is both non-updatable and read-only at [cms-users.ts:75](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/cms-users.ts:75), as are email/sign-in/tenant fields. Following the advice cannot change an existing person's website editing access there.

The real platform-administrator/provider guidance immediately above is an improvement, but the additional website-access promise remains false. The passing [directory test:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/admin-teams-page.test.tsx:64) verifies the link, not the destination's capability.

**Follow-up:** describe the link as reviewing synced website editor accounts, and direct changes to the actual owning provider/platform-administration process. Do not make the synced identity fields editable as a shortcut.

## Acceptance review: fixes visible in current source

- **Home width and disclosure:** [TileCard:48](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/tiles/tile-card.tsx:48) retains native list semantics and min-width-safe content; [shortcuts:79](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/tiles/tile-card.tsx:79) now always occupy their own `basis-full` row. At the requested 1440/1024/640/390 targets, no viewport rule reintroduces the old side-by-side action/text competition. The Home grid no longer forces items to start-align, and phone disclosure does not cap the wider-screen directory. This establishes a structural response to the frozen regression, **not measured card heights or live reflow at those widths**.
- **Honest Home promises:** [moduleCountSummary:110](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/tiles/mission-control-home.tsx:110) excludes unavailable modules from the openable count and separates “not set up” from role limits. [Mobilize tile copy:130](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/config/tiles.ts:130) promises Locations, not an operational applicant pipeline; [Events:225](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/config/tiles.ts:225) is explicitly unavailable. Common tasks now link to connected work at [tiles.ts:23](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/lib/mission-control/tiles.ts:23); Ministry Updates/Tasks descriptions and actions are limited to review/follow-up rather than disabled publishing/team-task promises.
- **One failed dashboard read:** the shared failure branch replaces both metrics and the chart at [Home:192](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/tiles/mission-control-home.tsx:192). [DashboardFiguresUnavailable:412](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/tiles/mission-control-home.tsx:412) names what is missing, exposes one retry, and supplies status text. Passing tests cover this rendered failure/retry contract; actual router-refresh completion and screen-reader announcement timing remain unverified. Separate failures from separate reads should not be conflated with this duplicate-failure fix.
- **Staff semantics and permission-aware links:** the phone card is an `Item render={<div />}` at [Teams:212](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/teams/page-client.tsx:212>), leaving one list item per person to the grid. The directory is admin-only at [Teams:89](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/teams/page-client.tsx:89>), consistent with the [users GET gate:40](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/users.ts:40). [Profile shortcuts:89](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/mc-shell.tsx:89) derive from permitted Administration nav; [navigation:358](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/config/navigation.ts:358) and [tile shortcuts:193](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/config/tiles.ts:193) withhold Staff directory/Eve from finance. This is a bounded link/gate check, not a whole-app authorization audit. The duplicate fallback brand line is also conditional now at [mc-shell.tsx:281](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/mc-shell.tsx:281).
- **Care activity/mobile/date:** legacy activity HTML is converted to escaped readable text; TipTap thread content retains the shared viewer. [PersonnelMobileRow:208](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/care-personnel-grid.tsx:208) places the wrapping name before badges instead of squeezing an ellipsized name beside them. The goal date uses labelled shared Popover/Calendar controls, a dialog title, selection, and Clear date at [PersonnelProfile.tsx:704](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:704). See finding 2 and the remaining acceptance checks below.
- **Mobilize/Locations honesty:** [Mobilize:18](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/mobilize/page-client.tsx:18>) now describes connected Locations and an unconnected pipeline without promising applicant progression. [LocationsMapLegend:67](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/mobilize/locations/page-client.tsx:67>) derives its textual legend from present marker types, and omits the legend on failed/empty reads; it does not imply a Partner marker exists. Location tests use a mocked map and synthetic input events, not actual keyboard traversal or MapLibre rendering.

## Reports wave A / wave B status and retained follow-up

- **Completeness guard — implemented in source and covered:** [reportCompleteness:90](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:90>) safely distinguishes complete/capped/unknown. Unknown metadata gets an inline notice rather than crashing; incomplete/unknown charts are withheld. The missing-field regression is explicit at [reports-page.test.tsx:215](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:215). Do not repeat the superseded frozen fixture-capture failure as a current production defect. Finding 1 remains a separate money-truth gap.
- **`reports-url-state` — no longer unimplemented:** [search-param parsers:78](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:78>) and [useQueryStates:343](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:343>) retain grouping/period in the URL, validate enums, and fall back to defaults. Tests cover URL initialization, changes retaining the other selection, and unknown values at [reports-page.test.tsx:247](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:247). “All time” is supplied through Select items. **Remaining acceptance:** actual reload/share/back-forward behavior and preservation of unrelated query parameters were not exercised here; add the unrelated-param case and later permitted browser navigation coverage.
- **`reports-trend-placement` — source treatment present:** [FundsGrid:326](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:326>) now precedes the trend; [null-trend state:30](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/giving-trend-refresh.tsx:30>) is compact, and [scopeNote:52](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/giving-trend-refresh.tsx:52>) explains that grouping/period do not change the trend. Current [shared trend description:160](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/components/giving-trend-card.tsx:160) explicitly says refunds are applied but approved corrections are not, and includes its own loaded period. Preserve that financial distinction rather than blindly relabelling the trend as identical to corrected grouped totals. **Remaining acceptance:** capture the loaded trend, its period/scope/correction disclosure, and the compact failure state after builders settle. The final description was source-checked after the test run; it is not a frozen tested snapshot.
- **`reports-phone-header` — retain as open visual acceptance, not a verified current defect:** [toolbar:215](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:215>) is still wrapping flex content. JSDOM cannot establish the number of control rows, clipping, touch targets, or funds-list depth. Capture 390/640/1024/1440 with Fund/Missionary/Donor and a non-default period; confirm header usability and that data is no longer unnecessarily displaced. No current pixel-distance claim is made.

## Omitted acceptance checks / limits

1. **Date clearing is not actually proved by the named test.** At [personnel-profile.test.tsx:328](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:328), selecting day 15 is followed by submitting the goal, which resets the date. Clear date is then clicked on an already empty selection. Add select → reopen → clear **before submit**, and assert the next mutation receives no target date. This is a coverage omission, not evidence that the implemented clear handler fails.
2. **Keyboard/focus remains unverified live.** Later permitted checks must exercise Tab/Shift+Tab, Enter/Space, calendar arrows, Escape, initial focus, visible focus, and focus restoration; also inspect list/map alternatives, directory links, and Reports controls. Synthetic `fireEvent` interactions and mocked map/editor tests do not establish these claims.
3. **Responsive/perceptual accessibility remains unverified live.** No round-13 browser screenshots, zoom/reflow, contrast measurement, screen-reader run, touch-target measurement, or axe run was performed. Frozen screenshots only establish the old baseline. These limits also apply to the mobile name-priority and Home equal-height treatment.
4. The 12-suite pass below is a bounded regression check, not a build/typecheck/full-suite gate. Concurrent code can change after a file is imported or read; the lead should verify the settled combined candidate rather than treating this report as a final sign-off.

## Frozen evidence used

Scope/acceptance came from the frozen [implementation brief](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/IMPLEMENT-BRIEF.md:1), [Shell wave A](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-a-shell.md:1), [People wave A](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-a-people-tools-support.md:1), and [wave-B pending list](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-b-pending.md:1). Referenced frozen [Shell review](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-shell.md:1), [People review](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-people.md:1), and [Tools re-run](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-tools.md:1) were read. The superseded Reports capture was not treated as current runtime evidence.

Frozen images were opened locally, not through a browser:

- [Home intermediate](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/home--intermediate-full.png): squeezed descriptions, duplicated failed-load surfaces, disconnected promises.
- [Care directory phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/care-directory--mobile.png) and [care profile desktop](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/care-profile--desktop-full.png): squeezed names and literal activity HTML. [Care plan phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/care-profile-plan--mobile.png) is a static layout baseline only.
- [Reports phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/reports--mobile-full.png) and [Staff directory phone](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/admin-teams--mobile-full.png): raw period label/large failed trend and the previous oversized unavailable note/dead-end advice.
- [Mobilize desktop](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/mobilize--desktop.png) and [Locations desktop](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/locations--desktop.png): old pipeline-copy contradiction and legend including an absent Partner type.

## Exact verification commands and results

All commands below ran in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Installed runner: Vitest 5.0.5; Bun 1.4.3. Caches, bundled-config output, and coverage output were disabled for the targeted test invocation. No full gate, browser/a11y suite, install, server, or turbo command was run.

### Existing focused regression suites

```powershell
node ./node_modules/vitest/vitest.mjs run --config vitest.config.mts --configLoader runner --no-cache --no-fsModuleCache --no-coverage --no-file-parallelism --maxWorkers 1 tests/unit/apps/admin/mission-control-home.test.tsx tests/unit/apps/admin/mission-control-catalog.test.ts tests/unit/apps/admin/mc-shell-navigation-names.test.tsx tests/unit/apps/admin/app/admin-teams-page.test.tsx tests/unit/apps/admin/app/reports-page.test.tsx tests/unit/apps/admin/app/reports-giving-trend.test.tsx tests/unit/apps/admin/app/reports/reports-charts-layout.test.tsx tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx tests/unit/apps/admin/features/mission-control/care/care-workspace.test.tsx tests/unit/apps/admin/app/mobilize/mobilize-remove-candidate.test.tsx tests/unit/apps/admin/app/mobilize/locations-page.test.tsx tests/unit/apps/admin/features/mission-control/locations/location-table.test.tsx
```

**Result:** exit 0; **12 files / 186 tests passed**. Started 21:48:27 +07:00; duration 102.09 seconds. JSDOM emitted `Not implemented: navigation to another Document` three times; this was not a browser navigation test and is not reported as an application failure. No test files were added or changed.

### In-memory completeness/copy diagnostic

```powershell
$previousCachePath = [Environment]::GetEnvironmentVariable('BUN_RUNTIME_TRANSPILER_CACHE_PATH', 'Process'); $env:BUN_RUNTIME_TRANSPILER_CACHE_PATH = '0'; try { $source = @'
import assert from "node:assert/strict";
import { buildGivingSummaryText } from "./apps/admin/app/(app)/reports/report-model.ts";
const base = {
  filters: { dateFrom: null, dateTo: null, search: null },
  slice: "funds",
  rows: [{ id: "test-fund", label: "Synthetic fund", amountCents: 12345, giftCount: 2, donorCount: 1, lastGiftAt: null, metadata: {}, status: null }],
  totals: { amountCents: 12345, giftCount: 2, donorCount: 1, rowCount: 1 },
};
const complete = buildGivingSummaryText({ ...base, completeness: { complete: true, donationLimit: 50000, includedGiftCount: 2 } });
const capped = buildGivingSummaryText({ ...base, completeness: { complete: false, donationLimit: 2, includedGiftCount: 2 } });
const unknown = buildGivingSummaryText(base);
assert.equal(capped, complete);
assert.equal(unknown, complete);
console.log(JSON.stringify({ cappedEqualsComplete: capped === complete, unknownEqualsComplete: unknown === complete, copiedText: capped }, null, 2));
'@; bun -e $source; $resultCode = $LASTEXITCODE } finally { [Environment]::SetEnvironmentVariable('BUN_RUNTIME_TRANSPILER_CACHE_PATH', $previousCachePath, 'Process') }; exit $resultCode
```

**Result:** exit 0, confirming the defect (not asserting desired product behavior):

```json
{
  "cappedEqualsComplete": true,
  "unknownEqualsComplete": true,
  "copiedText": "Giving summary, all time\nNet giving (after refunds): $123.45 from 2 gifts by 1 donor.\nAverage gift: $61.73.\nTop fund: Synthetic fund, $123.45 (100.0% of giving)."
}
```

The fixture is synthetic; no tenant data or secrets were used. The process-local transpiler-cache setting was restored. No application/test edit accompanies these recommendations.
