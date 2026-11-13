# Regression contracts: specification only

No tests, product or harness changes are implemented here. Paths resolve inside
`C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`; Q means
`docs/qa/admin-workspaces-hillclimb`. Implement only after root authorizes a new
scope/identity. Use red-green-refactor at the nearest stable existing seam.

## R01 - Real catalogue and explicit unavailable-workflow register

Future seam: NEW `Q/module-states.contract.test.mjs`, alongside the existing
`Q/harness-runners.test.mjs`. The latter mocks catalogue definitions at line 142
and therefore cannot alone lock real module names/selectors.

- Import real definitions without browser, network, services or providers.
  Assert exact names/areas/routes/widths/full flags and preservation metadata
  against the root-approved proposal: 44 states, 80 pairs, 133 PNGs, including
  the exact per-area and per-width sets in `proposed-inventory.json`.
- Require unique IDs/pairs, valid viewport names, nonempty widths and all nine
  obsolete hook IDs in the explicit unavailable-workflow register. Old IDs must
  not execute or alias new staff filters into old dialogs.
- Lock all unchanged entries, four base rekeys, two new staff states and seven
  consolidations. Keep connected Locations, ALL-width Reports/Email/PDF studio,
  Care plan DM/full and PDF Export desktop. Preserve support-conversation
  keepScroll and mobile-nav freshness; add freshness to Care plan.
- Future capability implementation must explicitly reconcile this contract and
  domain intent; these guards do not permanently prohibit missing features.

Evidence: `Q/module-states.mjs:18`, `Q/module-states.mjs:129`,
`Q/module-states.mjs:282`, `Q/module-states.mjs:372`,
`Q/module-states.mjs:384`, `openspec/project.md:5`.

## R02 - Semantic setup failure cannot publish qualified evidence

Future seam: extend the fake page/process tests in `Q/harness-runners.test.mjs`;
do not run a live collector to test bookkeeping. Preserve partial-write and
route-error contracts at lines 191 and 481.

- For both runners exercise: missing trigger; hidden-only trigger; disabled
  trigger that never enables; click rejection; wrong/missing resulting panel;
  readiness timeout; settled timeout. All yield explicit unqualified pair and
  reason plus unsuccessful invocation; earlier completed pairs stay intact.
- `clickFirst` returning false cannot count as success. Successful click with
  wrong content also fails. A generic heading, metric row, screenshot existence
  or exit 0 cannot substitute for a declared positive state assertion.
- Diagnostics may survive under failed/unqualified status but cannot enter the
  qualified pair set. Do not invent a completed row for an unfinished viewport,
  silently retry, merge failed/successful phases, or infer an interrupted exit.
- Lock event order: viewport -> navigation/readiness -> trigger readiness ->
  action -> actual state assertion -> metrics/image. Do not globally reverse
  every setup/settled pair: some UI settles after its action.

Evidence: `Q/workspace-states.mjs:98`, `Q/workspace-states.mjs:122`,
`Q/capture-workspaces.mjs:190`, `Q/capture-workspaces.mjs:295`,
`Q/check-workspaces.mjs:241`, `Q/check-workspaces.mjs:368`.

## R03 - Staff search is distinct from team dialogs and load failures

Future seam: extend `tests/unit/apps/admin/app/admin-teams-page.test.tsx:52`
and focused catalogue setup tests. Existing role, real-account, failure/retry,
phone sorting and paging tests at lines 105, 114, 140, 152 and 191 stay intact.

- Use current authorized staff fixture; require loaded Staff directory with
  Dana Reyes and Naomi Achterberg before either filter. Role searchbox/name
  Search people is the actual control. Fill Dana Reyes, await the control's own
  filtering/debounce and require only Dana's data row/card, Naomi absent.
- Start the no-results case independently loaded. Fill catalogue-no-staff-match;
  require No matching staff accounts and Try a different name, email or role.
  Pending, Could not load staff and No staff accounts found cannot pass it.
- Non-admin notice cannot qualify as populated directory/search. Do not change
  role identity or authorization. Assert no Create/New team or Manage Executive
  Leadership dialogs and no team/role write requests during setup.

Evidence: `apps/admin/app/(app)/admin/teams/page-client.tsx:89`,
`apps/admin/app/(app)/admin/teams/page-client.tsx:128`,
`apps/admin/app/(app)/admin/teams/page-client.tsx:157`,
`apps/admin/app/(app)/admin/teams/page-client.tsx:185`,
`apps/admin/app/(app)/admin/teams/page-client.tsx:230`,
`packages/ui/components/data-grid-panel/data-grid-toolbar.tsx:74`,
`Q/fixtures/module-fixtures.mjs:470`.

## R04 - Honest disconnected pages and loaded follow-up list

Future seams: preserve/extend existing
`tests/unit/apps/admin/app/mobilize/mobilize-remove-candidate.test.tsx:15`,
`tests/unit/apps/admin/app/events/events-venues-tab.test.tsx:6`,
`tests/unit/apps/admin/app/tasks/tasks-content.test.tsx:100`. Their historical
filenames are not evidence of current candidate/venue/to-do workflows.

- Mobilize: require Pipeline not connected yet and Manage locations ->
  /mobilize/locations, without clicking it. No candidate fetch, fake applicant,
  detail or creation. Keep separate connected Locations list/editor coverage.
- Events: require unconnected message, unavailable attendance/totals and Open
  CRM -> /crm. No old three tabs, fake metrics or attendee inference from donors.
- Tasks: existing needs-attention response must render real linked items,
  Needs attention, recent/open/100-item/retired-issues-excluded disclosure. No
  New mission task/New task or old task-detail button/drawer; links do not
  substitute for task editing. Assert no mutation or linked-record navigation.
- Pending/error/loaded-empty/loaded-populated are distinct; only declared
  loaded-populated fixture meets the proposed C11 contract. Retain existing
  failure/pending tests at
  `tests/unit/apps/admin/app/tasks/tasks-content.test.tsx:167` and
  `tests/unit/apps/admin/app/tasks/tasks-content.test.tsx:178`.
- Unavailable page assertions do not prove the shared staff task model complete
  or ratify its retirement. Domain-owner resolution remains separate.

Evidence: `apps/admin/app/(app)/mobilize/page-client.tsx:26`,
`apps/admin/app/(app)/events/page-client.tsx:26`,
`apps/admin/app/(app)/tasks/tasks-content.tsx:25`,
`apps/admin/app/(app)/tasks/tasks-content.tsx:35`,
`apps/admin/app/(app)/tasks/tasks-content.tsx:55`,
`apps/admin/app/(app)/tasks/follow-ups-grid.tsx:68`,
`Q/fixtures/route-fixtures.mjs:831`, `Q/fixtures/crm-contrib-fixtures.ts:4194`,
`openspec/specs/platform-boundaries/spec.md:284`.

## R05 - Fresh mobile Care plan, not desktop selection resized

Future seams: catalogue setup unit contract and fake runner viewport tests. A
later committed Playwright journey can cover real Base UI behavior only under
separately authorized runtime work.

- Desktop 1440x1000 selects the visible Care plan tab and verifies active panel.
- Mobile 390x844 is set BEFORE page open/setup; hidden desktop tabs are not
  eligible. Open Profile section combobox, choose Care plan, require its actual
  Goals and contact schedules content. Option label alone is insufficient.
- Missing/disabled trigger, missing option or unchanged panel fails; no force
  click or desktop resize workaround. Capture runs fresh setup at BOTH widths
  via freshPerWidth; checker independently reaches the same state at each width.
  Keep two viewport AND two full PNGs for this state.

Evidence: `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:621`,
`apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:953`,
`apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:971`,
`Q/capture-workspaces.mjs:244`, `Q/check-workspaces.mjs:214`,
`Q/harness-runners.test.mjs:223`.

## R06 - Ready PDF menu is not export success

Future seams: catalogue setup unit contract plus existing
`tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:87` and
`tests/unit/apps/admin/app/pdf/pdf-export.test.ts:21`. Preserve existing native,
free-mode and configured header assertions at lines 88, 100 and 129 of the
header test; extend rather than duplicate their coverage.

- Model Export initially disabled then enabled. Setup must await the exact
  enabled trigger BEFORE click, then require actual visible menu/items. The
  later Save wait cannot repair a missed click. Keep product disabled guards.
- Never-enabled Export times out within explicit 120,000 ms, causes no click,
  publishes no qualified menu row and never relabels editor screenshot as menu.
  Save enabled while Export is still exporting is insufficient: guards differ.
- Free Unlayer: menu can open with disabled Export as PDF; require real disabled
  item explanation and Export as HTML. Null config or disabled trigger alone
  does not prove free mode. Configured Unlayer cannot be mislabeled free.
- Native engine requires Test render with sample data / Export as JSON, not
  Unlayer labels. Unit mocks may model these existing engine branches; actual
  collection must use its reported engine/config, not spoof it for acceptance.
- Zero export/save/provider handler calls, export requests, downloads or new
  template writes. Do not click any menu item. This is menu-open coverage only.
- PDF studio retains four widths and existing Save readiness; settled timeout
  is unqualified, not removed. No Email/PDF layout/scroll/canvas diagnosis here.

Evidence: `Q/workspace-states.mjs:89`, `Q/module-states.mjs:375`,
`Q/module-states.mjs:384`, `apps/admin/app/(app)/pdf/page-client.tsx:562`,
`apps/admin/app/(app)/pdf/page-client.tsx:580`,
`apps/admin/app/(app)/pdf/page-client.tsx:600`,
`apps/admin/app/(app)/pdf/page-client.tsx:1880`,
`apps/admin/app/(app)/pdf/pdf-export.ts:16`.

## R07 - Positive postconditions for eight supported hooks

Future seam: focused real-catalogue setup contracts using existing mocks/Base UI
tests, not new component implementations.

- Search -> navigation dialog; profile -> menu; mobile nav -> Sidebar sheet.
  No sign-out or destination navigation to prove overlay availability.
- Care thread -> selected content; Locations List -> list/table selected;
  Add location -> new-location sheet, no save/marker placement.
- Support Table -> selected table layout via current button; legacy radio
  fallback is acceptable only if the resulting state is the same.
- Automation fixture has one failing rule (rule-2), two failed runs. Require
  Show all rules plus only that failing rule, not two invented failing rules.
  Empty/error/no-attribution data cannot satisfy or delete this state.

Evidence: all eight supported rows in README carry exact catalogue/product
file:line references. Additional concrete anchors:
`apps/admin/features/support-hub/components/toolbar/LayoutToggle.tsx:33`,
`apps/admin/app/(app)/automations/page-client.tsx:50`,
`apps/admin/app/(app)/automations/page-client.tsx:182`,
`Q/fixtures/module-fixtures.mjs:1871`.

## R08 - Exact sets, unknown selections, bounded plans and provenance

Future seams: real catalogue/plan structural tests plus fake runner tests.

- Expected sets derive from approved states, widths/full flags, NOT observed
  files. Require exact per-area/per-width pair/PNG equality, no duplicates,
  missing, unexpected, unknown state filters or zero-state success. Retired ID
  selection fails before browser launch, rather than silently selecting none.
- Every proposed batch is nonempty, <=4 and covers each state exactly once in
  each phase. Only a NEW plan omits empty people-06. Do not truncate frozen jobs.
- Exact modules: metrics 44 keys/80 widths, checks 80 unique rows, PNGs 80
  viewport + 53 full. Conditional whole: 124/227/312, only if other areas stay
  unchanged. Preserve width unions, not just grand totals.
- Retain raw partials/diagnostics with failed or unqualified status and exact
  termination/setup reasons. Interrupted exit provenance does not become 0 by
  a count match; changed expectations cannot fill missing historical checks.
- Record product AND separate harness/catalogue/fixture input identities.
  Never rewrite old source hashes, catalogue, frozen ledger or runs into a pass.
- Baseline mapping labels new searches no-equivalent-workflow, base rekeys
  changed-purpose pages, unavailable workflows not exercised. No successful old
  dialog aliases or B measurements copied into A. Matching names is not semantic
  or accessibility qualification.

Evidence: `Q/capture-workspaces.mjs:241`, `Q/check-workspaces.mjs:303`,
`Q/capture-workspaces.mjs:263`,
`Q/review/round13/runtime/refreeze/fresh-evidence-plan.md:62`,
`Q/review/round13/runtime/refreeze/fresh-evidence-plan.md:181`,
`Q/review/round13/runtime/refreeze/fresh-evidence-plan.md:189`.

## R09 - Gift row menu targets the actual labeled gift

Future seams: existing CRM gift-history component tests, catalogue setup contract,
and guarded browser regression after authorization. This does not alter counts.

- Render two gift rows. Each menu trigger has the distinct More actions for
  amount/date/fund accessible name; the generic fallback is covered separately
  when no gift label is supplied. Exact old More gift actions is not assumed
  when a row supplies a label.
- Bind the catalogue fixture gift to its actual visible accessible name and
  open that menu. Assert role menu and expected operation items; the underlying
  donor drawer, a different row's menu or a closed menu must fail qualification.
- Blocked items remain disabled with the server-computed reason; the menu-only
  state executes no operation, receipt send, correction or provider call.

Evidence: `Q/workspace-states.mjs:924`,
`apps/admin/app/(app)/crm/gift-history-rows.tsx:166`,
`apps/admin/app/(app)/crm/gift-history-rows.tsx:212`,
`apps/admin/app/(app)/crm/gift-inline-action-controls.tsx:193`,
`apps/admin/app/(app)/crm/gift-inline-action-controls.tsx:226`.

## R10 - Eligible correction form and Hub entry-point gap stay distinct

Future seams: fixture/catalogue contract, existing shared operation-shell tests,
and guarded desktop/mobile browser regression. Core C17 needs explicit approval.

- Original Nikhil/split Hub detail with no correction control must remain
  unqualified for correction-form coverage. No widened regex, fake availability,
  receipt/refund shell or existing amount-approval request may satisfy it.
- New crm-fund-correction precondition verifies the saved eligible gift ID still
  belongs to the anchored donor and its actual fund_correction availability is
  true. An absent, blocked or mismatched gift fails before capture; changing the
  fixture to force success is prohibited.
- Open from the exact gift's real enabled Correct fund designation menuitem at
  each declared width, using a fresh context. Require the shared shell, exact
  heading, Destination fund and Reason. Check the donor_crm_record context and
  donation identity. Submit no operation and send no notification.
- Keep the unavailable Hub-direct entry point in the explicit register, label
  the new route/anchor as comparison loss, and keep historical failed catalogue
  keys separate from the saved focused-form successes. Apply the exact optional
  pair/PNG/batch deltas, never equivalent aliases.
- The two saved Core invocation timeouts are neither impossible workflows nor
  evidence of repaired setup; retain missing/provisional partitions and keys.

Evidence: `Q/workspace-states.mjs:579`,
`Q/fixtures/crm-contrib-fixtures.ts:4451`,
`apps/admin/app/(app)/contributions/contribution-detail-overlay.tsx:397`,
`apps/admin/app/(app)/crm/gift-history-section.tsx:164`,
`Q/review/round13/runtime/round13r2-core/focused-acceptance.mjs:43`,
`Q/review/round13/runtime/round13r2-core/focused-acceptance.mjs:155`,
`Q/review/round13/runtime/round13r2-core/focused-acceptance.mjs:205`,
`Q/review/round13/runtime/round13r2-core/report.md:58`,
`Q/review/round13/runtime/round13r2-core/report.md:66`,
`openspec/specs/contribution-operations/spec.md:69`.

## Verification boundary

After authorization, run focused existing/new tests, then proportional repository
gates, recording actual results. Fresh collection additionally needs root-owned
source/runtime identity and semantic evidence. None of those operations ran in
this report task. Structural/unit guards alone are not visual, browser, WCAG,
provider, shared-task-domain or product-scope acceptance.
