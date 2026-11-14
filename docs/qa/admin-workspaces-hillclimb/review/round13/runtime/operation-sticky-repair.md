# Round 13 Contribution operation sticky/focus repair

Date: November 12, 2026 (Asia/Bangkok). Checkout: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12 only.

## Verdict and boundary

**INCONCLUSIVE: the repaired browser geometry has not been measured.** The local operation-shell regressions pass, but jsdom does not implement sticky layout, native focus scrolling, or a phone keyboard. This report is not a browser pass, visual score, provider-success result, or accessibility-conformance claim.

Claim for later acceptance: at widths 1440 and 390, opening a receipt review or eligible fund correction with either delayed or cached detail starts at scrollTop 0 with popup focus; the complete current-values container is below the header with 0px overlap; scrolling does not expose body text above the pinned header.

The retained [money-browser/report.md](money-browser/report.md) and [evidence-summary.json](money-browser/evidence-summary.json) record the baseline, not this treatment. Their saved freeze check failed at November 12, 2026, 02:04:54 +07:00 (2026-11-11T19:04:54.968Z): three source entries differed in a 1,032-entry manifest despite an unchanged diff hash. That is historical failed-preflight evidence, not a fresh check here. No browser was launched, the manifest was not updated, and no freeze/preflight bypass was used. Root must reconcile concurrent work and authorize a new freeze before any follow-up browser run.

No server, environment, provider, or Git mutations; no new children; no live money submissions. CRM notes, Reports, shared primitives, API behavior, and the original money-browser artifacts are not edited. Existing unit submission cases use mocked fetch responses rather than a real service.

## Retained baseline

| Case                                            | Initial scrollTop | Header bottom | Summary top | Container overlap |
| ----------------------------------------------- | ----------------- | ------------- | ----------- | ----------------- |
| Receipt, async, 1440                            | 0                 | 443           | 435         | 8px               |
| Receipt, cached, 1440                           | 0                 | 443           | 435         | 8px               |
| Receipt, async, 390                             | 0                 | 327           | 319         | 8px               |
| Receipt, cached, 390                            | 0                 | 327           | 319         | 8px               |
| Eligible correction, 390, manually scrolled top | 0, manually set   | 172           | 164         | 8px               |

Receipt summary text was readable below the header; the complete container was not clear of it. Cached receipt reopening retained one detail request before and after reopening. The genuine phone correction naturally opened at scrollTop 439 with the Reason textarea focused, before manual interaction. Its separate manually-scrolled-top capture is not initial-state evidence. Correction screenshots also show body content through the roughly 25px strip above the header. Earlier detail-sheet captures must not be relabeled as genuine correction-form evidence.

## Exact repair

### operation-shell.tsx

- Change the plain inner sticky header from top-0 to -top-6, retaining its -mt-6/-mx-6 full-bleed margins, opaque bg-background, border, and stacking order. This compensates for the shared popup's p-6 scrollport inset instead of letting the sticky rule displace the negative-margin header downward. At the captured base size, the 24px inset consumes the 16px inter-section gap, consistent with the observed 8px overlap. This is a source-level diagnosis, not a treatment measurement.
- Preserve shared DialogContent spacing, scrollable behavior, width, and the existing -bottom-6 actions row. A provisional p-0 override failed shadcn/no-restyle and was discarded; no suppression or primitive fork replaces it. The final code uses the existing base-maia/Base UI composition and semantic tokens.
- Set initialFocus to the popup ref for all operations. Base UI's installed focus implementation supplies preventScroll for popup focus. Remove firstOperationField, its selector, and useFocusFirstFieldWhenFormAppears so delayed detail cannot move focus into Reason or Amount after opening.
- Exclude the popup itself from revealFocusedOperationField. Preserve field reveal on focus/resize, exclusions for header/actions controls, and the existing manual-scroll protection.

### contribution-operation-shell.test.tsx

- Add two real-shell fund-correction cases: uncached detail gated until popup focus is observed, and cached detail. Both wait for Base UI's asynchronous focus, assert popup focus with preventScroll, retain scrollTop 0, and assert no actions request. The focus spy models the recorded 439px textarea jump; that is not a browser measurement.
- Change the existing refund first-field-focus expectation to popup focus rather than Amount.
- Extend the existing ResizeObserver/focused-field test to ensure focusing the popup never scrollIntoView's the whole dialog. Retain the actual field, pinned-actions, header-obscuration, and manual-scroll cases.
- Guard the rendered shared-padding/header-inset contract: popup p-6, no p-0, and sticky -top-6/-mt-6/-mx-6. These are structural CSS guards, not proof of rendered pixel geometry.

The third owned edit is this report. Inspected authority includes the applicable AGENTS/rulebooks, OpenSpec project and contribution-operations contract (shared core, money/identity truth, high-risk reason/confirmation, visible consequences), and the tdd/verify-this skills. Installed Next 16.4.2 use-client documentation was read locally before editing the client shell; no Next routing/cache API changed. Shared dialog configuration and installed Base UI 1.9.0 focus behavior were inspected, not upgraded.

## Red-green and targeted validation

All commands run from the checkout named above using the repository runner and installed tools.

| Check                                                                                            | Result                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus regression before the focus repair: fund correction async/cached plus refund initial focus | RED: 3 failed as expected; controls rather than the popup received focus.                                                                                                                                                                       |
| Popup exclusion before the reveal-helper repair                                                  | RED: 1 failed; ResizeObserver scrolled the focused popup itself.                                                                                                                                                                                |
| Shared-padding geometry guards after rejecting provisional padding overrides                     | RED: 2 failed, then GREEN with the final header inset and preserved footer.                                                                                                                                                                     |
| Six focused geometry/focus/reveal cases after the final production repair                        | PASS: 6 passed, 68 skipped.                                                                                                                                                                                                                     |
| Full owned operation-shell suite after the final test timing correction                          | PASS: 74 passed, no skips.                                                                                                                                                                                                                      |
| Production-source lint through lint:ui                                                           | PASS, exit 0.                                                                                                                                                                                                                                   |
| Combined production/test lint through lint:ui                                                    | FAIL, exit 1: only three unchanged no-restricted-imports findings at test lines 15, 16, 17, importing contribution-detail-query, operation-shell, and use-admin-contributions from the app. No rule/config bypass or unrelated import refactor. |
| Installed Prettier check over the two owned code files and this report                           | PASS.                                                                                                                                                                                                                                           |

The first full-suite pass was followed, after the geometry revision, by a run with 73 passed / 1 failed: the new cached-detail case asserted focus before Base UI's asynchronous initial focus completed. Waiting explicitly for popup focus fixed that test timing race; the final full run above passed all 74 cases. Earlier geometry probes used the runner's default coverage output; subsequent runs explicitly disable coverage. Generated coverage artifacts are not deleted or treated as owned source changes.

Reproduction commands (the combined lint limitation above is intentional disclosure, not a clean-gate claim):

```powershell
bun run test:unit tests/unit/apps/admin/app/contribution-operation-shell.test.tsx -t 'opens a fund correction at the summary|opens a refund on the popup|scrolls the focused field clear|pins the title|keeps the refund submit row pinned' --coverage=false
bun run test:unit tests/unit/apps/admin/app/contribution-operation-shell.test.tsx --coverage=false
bun run lint:ui 'apps/admin/app/(app)/contributions/operation-shell.tsx'
bun run lint:ui 'apps/admin/app/(app)/contributions/operation-shell.tsx' 'tests/unit/apps/admin/app/contribution-operation-shell.test.tsx'
bun node_modules/prettier/bin/prettier.cjs --check 'apps/admin/app/(app)/contributions/operation-shell.tsx' 'tests/unit/apps/admin/app/contribution-operation-shell.test.tsx' 'docs/qa/admin-workspaces-hillclimb/review/round13/runtime/operation-sticky-repair.md'
```

Final owned code SHA-256 values recorded after unit/source-lint validation:

- operation-shell.tsx: b42fd4ee2021a91a655de112e14c9ca862675aee8cf649705eb2d2a7593e5900
- contribution-operation-shell.test.tsx: e95838753b4fe630a85d48a41dfa91e02a4ac13ef9ec61de5addfb66706b62e9

No full-repository check, app-wide typecheck/build, or renewed browser/device run was performed. Passing unit tests and production lint do not resolve the browser verdict or the existing test-file lint findings.

## Later browser acceptance, after root-authorized refreeze only

1. Root incorporates this repair and other concurrent work, records a new source identity, and passes the authorized harness's frozen-source preflight. Do not reuse or bypass the old round13 freeze. Use a new evidence directory and retain the original baseline unchanged. Preserve intercepted fixture safety; deny money/action mutations and require moneyWriteCount 0. Never press final receipt-send, refund, or correction submission controls.
2. Use the genuine eligible fixture gift e0a15e46-a328-4b24-a921-681c12884ef6, USD 1,000.00, Clean Water Initiative, October 25, 2026, with fund_correction.available true. Enter through the actual operation trigger and verify the correction heading, current values, Destination fund, and Reason exist inside the operation popup, not only in the underlying detail sheet.
3. Capture all eight initial-open cases: receipt and eligible fund correction, each at 1440 and 390 widths, each with delayed and cached detail. Keep the retained harness's corresponding viewport heights. In delayed cases gate the actual detail GET, observe loading, then release it. In cached cases reopen with the same query client and record the detail GET count before/after; do not substitute another fresh load for a cache hit.
4. Before any manual focus/scroll, record activeElement, focus events, scrollTop, popup/header/summary rectangles, computed popup padding, and a screenshot. After detail renders, require popup focus, scrollTop 0 (at most 1px rounding tolerance), and max(0, header.bottom - summary.top) = 0px for the complete summary border/container. The summary text and values must also be visible. Do not force scrollTop back to zero or focus the popup to manufacture initial-state success. On an actual phone, verify opening does not summon the keyboard; desktop viewport emulation alone cannot prove that.
5. At top, middle, and bottom scroll positions, require abs(header.top - (popup.top + borderTopWidth)) <= 1px and visually verify no body text appears in the upper strip. Keep the title, donor/date, and Close contained and visible; require the actions row inside the popup and no horizontal overflow. The expected initial section gap is the existing gap-4, not an 8px overlap.
6. Tab and Shift+Tab through Close, Destination fund, receipt options, Reason, confirmation, and Cancel without submitting. Require focus containment, visible focus clear of both sticky edges, accessible title/description, Escape dismissal, and focus restoration to the originating trigger. Repeat the natural open for refund and blocked/error/loading content; do not make a live refund to test these states.
7. Focus a genuine editable control, shrink/restore the viewport or use a real phone keyboard, and confirm the field is revealed without moving either pinned edge out of view. Focus on the popup/header/actions must not trigger whole-dialog scrolling. After a deliberate wheel/touch scroll away from a focused field, resizing must not snap back; a later deliberate field-focus move may reveal that field again.
8. Save the initial (not manually repaired) screenshots, mid/bottom-scroll screenshots, rectangles, scroll/focus history, request counts, zero-money-write proof, viewport dimensions, and the new frozen-source identity. Report any failed measurement as a failure, not as a screenshot-only pass. Root separately owns CRM notes and Reports acceptance; this repair does not close those findings.
