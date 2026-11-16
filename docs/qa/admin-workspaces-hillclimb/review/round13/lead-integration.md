# Round 13 integration record

All implementation is in `t3-5a24111d-r12`. The parent `t3-5a24111d`
remains frozen evidence. This record does not establish the 9.5 visual target.

## Verified lead fix: actual refund totals

The focused finance review found that `contributions/hub-model.ts` capped
actual refunds at the corrected effective gift amount. A gift corrected to
7,500 cents with 8,000 cents actually refunded therefore displayed only
7,500 cents refunded. The lead changed the summary to add actual refund
cents independently of the effective amount. Provider execution and the
existing received-total calculation are unchanged.

Regression: `contributions-hub-model.test.ts` now asserts the 7,500/8,000
case returns 8,000 refunded and zero received. It first failed with the
expected 8,000 versus actual 7,500 mismatch, then passed after the fix.

Validation completed after the change:

- Hub model and API refund-basis suites: 2 files, 22 tests passed.
- Focused source lint: exit 0.
- Prettier on the source and test: clean.
- `bunx tsc --noEmit --incremental false -p apps/admin`: exit 0.

The original finance review is retained under `max/finance-review.md` as
evidence of the pre-fix defect. Its finding is resolved by this change.

## Builder handoffs received

- CRM reports five fixes, 18 suites / 265 tests passing; source inspection
  confirms missing commitment summaries are unavailable, rather than zero,
  and the spacing and pinned note context changes are present. Receipt
  summary clipping belongs to Contributions and was routed there.
- Shell reports 23 targeted suites / 240 tests passing and clean admin,
  config and lib typechecks. Reports phone controls still occupy two rows;
  the estimated Funds position must be measured in a browser. Navigation
  and shared attention vocabulary changes fit Shell ownership.
- Studio reports the Account route-context crash and type error fixed,
  with clean final admin typecheck. Its route-level regression exercises
  the registered view through Payload's RenderServerComponent. Independent
  browser verification remains required.

Shell's broad test run reported failures in concurrent Care, Support
settings, Contributions and Automations edits. These were routed to the
respective active owners; that run is not an integration acceptance pass.

## Corrected historical review status

The four newly launched corrected round 12 CRM/Contributions comparisons
(both reviewer seats) were cancelled before returning results. No scores,
approvals or successful review completion are attributed to those runs.
Their corrected briefs and evidence hashes remain available. The final
round 13 candidate still requires its own independent reviews.

## Pending integration and browser work

- Capture and inspect Home, CRM, Contributions, Reports, Studio, People,
  Tools and Support at 1440, 1024, 640 and 390 after builders settle.
- Verify receipt dialog initial scroll position, focus and summary visibility
  at 1440 and 390; inspect CRM gift menu placement and long note scrolling.
- Verify Home directory heights, shortcut alignment and phone disclosure,
  one failed-statistics alert, sidebar tenant fallback, phone email tiles,
  and Staff directory access as admin and finance.
- Verify Reports query state across reload, loaded and unavailable trend,
  period disclosure and phone Funds position. A compact failure state and
  moved trend are implemented; their dimensions remain unmeasured.
- Verify Studio Account form and preferences inside its Account page;
  Users and Organizations use the shared Studio grid. This supersedes the
  older verification wording describing all three as stock route views.
- Investigate assistant-button overlap with right-aligned Studio row content.
- Requalify React Doctor exceptions for the changed native document view
  against a fresh diagnostic and current source/evidence hashes. Do not
  refresh hashes without adjudicating the exact finding.
- Run the changed profile-menu e2e assertion for Staff directory.
- The corrected round 12 run retains its disclosed 55/56-check limit;
  cancelled reruns supply no additional approval. Independently review the
  new candidate after browser acceptance. No final visual score has been
  established by the source/unit checks above.
