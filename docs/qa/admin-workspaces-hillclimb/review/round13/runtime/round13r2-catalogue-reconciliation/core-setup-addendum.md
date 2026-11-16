# Core setup addendum: report-only C16/C17

Received after the primary nineteen-module-hook audit. All paths are relative
to the sole inspected r12 checkout; Q means `docs/qa/admin-workspaces-hillclimb`.
This adds source-backed proposals, not browser observations, product fixes,
retries or acceptance. The separate Email/PDF layout owner is not duplicated.

## Closed Core evidence is not a complete catalogue pass

Saved evidence: `Q/review/round13/runtime/round13r2-core/report.md:36` records
33 states / 65 expected pairs, 63 completed captures, 61 checks, 59 complete
pairs and only 56 intended-setup-qualified pairs. Its line 42 records 82/83
catalogue PNGs, with focused evidence kept separately. `pair-inventory.md:41`,
`pair-inventory.md:69` and `pair-inventory.md:70` are the three wrong-state pairs.
The saved author inspected the PNGs; this task has not opened them.

`report.md:58` reports an underlying donor drawer rather than a gift menu.
`report.md:59` reports underlying Nikhil Patel/$600 split-gift details rather
than fund-correction forms. `report.md:60` distinguishes the existing amount
correction approval request from a new actual fund-correction form.
No focused-form success is substituted into those failed catalogue keys.

The two invocation timeouts remain separately unresolved, not deletions:
`report.md:66` has crm-01-check (5/9 checks) and `report.md:67` has
crm-04-capture (6/7 raw artifact pairs). Missing checks are crm-kanban mobile,
crm-drawer desktop/mobile and crm-drawer-properties desktop; relationships-more
desktop is provisional and mobile is absent (`report.md:44`, `report.md:49`).
No source proves these workflows impossible. Keep their widths and keys;
do not enlarge timeouts or claim a performance cause from shared-run evidence.

## C16 - Retain CRM gift menu; correct exact accessible target

- Frozen entry: `Q/workspace-states.mjs:924`; keep `crm-gift-row-menu`, area
  crm, current donor route, desktop only, dialog metadata and no full PNG.
- Obsolete trigger: `Q/workspace-states.mjs:931` demands exactly More gift
  actions. The actual row constructs a gift-specific label from amount/date/fund
  (`apps/admin/app/(app)/crm/gift-history-rows.tsx:166`) and supplies it at line 212. The menu trigger uses More actions for that label, falling back to the
  generic name only if no label exists
  (`apps/admin/app/(app)/crm/gift-inline-action-controls.tsx:193`). This is a
  stale selector, NOT an absent menu or justification to remove coverage.
- Proposed setup: load the expected donor's gift history, identify an exact
  fixture gift by donation identity, then use its corresponding gift-specific
  accessible menu name. Do not pick an arbitrary ellipsis or unscoped first
  More button. Require the actual visible role menu and its expected operation
  items. Preserve unavailable items and their explanations; do not click an
  operation for this menu-only state. Underlying drawer/dialog alone fails.
- Same-name comparison is possible only after semantic qualification of each
  side; the existing round13r2 wrong-state PNG/check cannot be promoted. Census
  delta is zero: one existing desktop pair / one existing viewport PNG.

## C17 - Actual correction form exists, but not via this Hub setup

The frozen entry `Q/workspace-states.mjs:579` navigates to the contribution
sheet anchor and searches for a button at line 587. That anchor is explicitly
Nikhil's two-line split/refundable gift
(`Q/fixtures/crm-contrib-fixtures.ts:4451`). More importantly, changing only
the gift ID or button regex cannot establish this Hub entry point: the current
Hub overlay wires receipt/retry/approval/refund controls and the shared shell
only as refund (`apps/admin/app/(app)/contributions/contribution-detail-overlay.tsx:361`,
`apps/admin/app/(app)/contributions/contribution-detail-overlay.tsx:397`).

CRM gift menus DO dispatch available operations
(`apps/admin/app/(app)/crm/gift-inline-action-controls.tsx:226`) to the shared
shell with `sourceSurface="donor_crm_record"`
(`apps/admin/app/(app)/crm/gift-history-section.tsx:164`). The operation title
is defined at `packages/api/src/admin/contribution-operations/catalog.ts:106`.
The contract requires shared operation ownership across entry points, not
fabricating a missing control (`openspec/specs/contribution-operations/spec.md:15`,
`openspec/specs/contribution-operations/spec.md:69`).

**Bounded recommended alternative, only after root explicitly accepts the
entry-point comparison loss:** replace the executable old state with NEW
`crm-fund-correction`, area crm, route `/crm?donor=${meta.crmDrawerId}`, widths
desktop/mobile, `full: false`, `freshPerWidth: true`, `dialog: true`,
`studioLookups: true`. Keep the old Hub-direct correction workflow in an explicit
unavailable-entry-point register; it remains a blocked criterion if required.
Do not also count its underlying Hub detail as a second correction form.

Use the already observed eligible fixture gift
`e0a15e46-a328-4b24-a921-681c12884ef6`, Margaret's $1,000 gift to Clean Water
Initiative, ONLY after validating its current fixture association and
`fund_correction.available === true` before collection. Saved Core evidence
identifies it at `report.md:75`; its runner asserts availability and donor
membership at `Q/review/round13/runtime/round13r2-core/focused-acceptance.mjs:43`.
This report neither generates/imports a fixture bundle nor independently claims
current runtime eligibility. Fail if the anchored gift or availability changes;
do not force availability, choose an arbitrary other gift, or invent metadata.

At each original width, open the expected donor history, open that exact gift's
menu, require the enabled menuitem Correct fund designation, open it, and assert
`contribution-operation-shell`, heading Correct fund designation, Destination
fund combobox, and Reason field. Saved composition is at
`Q/review/round13/runtime/round13r2-core/focused-acceptance.mjs:155` and line 205;
actual form fields are at `apps/admin/app/(app)/contributions/operation-shell.tsx:729`
and line 845. Observe only; no field submission, fund change, notification or
provider write. Retain negative coverage for the original split/absent-trigger
case. Do not widen to four catalogue widths merely because focused cases used
four; its original desktop/mobile breadth remains.

## Exact optional extension census and comparison loss

Primary modules remain 44 states / 80 pairs / 133 PNGs. Applying C16 plus C17
on top keeps the whole aggregate **124 states / 227 pairs / 85 full / 312 PNGs**,
but CRM changes **20/41 -> 21/43 states/pairs** and Contributions
**13/24 -> 12/22**. Core combined stays **33/65/83**; neither removed pair was
full-page. The JSON's optionalCoreExtension lists the exact pair/PNG delta.

- Remove `contribution-fund-correction@desktop` and `@mobile`; add
  `crm-fund-correction@desktop` and `@mobile`. Remove the two corresponding
  `contribution-fund-correction--{desktop,mobile}.png` names; add the two
  `crm-fund-correction--{desktop,mobile}.png` names. No historical file is renamed.
- Keep all old Core batches except remove the old state from contributions-03;
  add crm-06 containing only crm-fund-correction. Contributions-03 remains three
  states, every batch <=4. Combined with the primary module amendment: 36 whole
  batches / 72 planned capture/check invocations, rather than primary 35 / 70.
  A later deliberate rebalance could reduce batches; none is implicit here.
- This is NEW route context, eligible gift and operation form, not same-workflow
  equivalence with Nikhil's Hub detail. Strict same-name viewport-join ceiling
  becomes **202**, rather than primary 204 (two more newly named pairs), subject
  to the same saved-baseline/no-new-inspection limitations. This is not a score.
- If root does not accept that context change, retain both old fund-correction
  keys as UNQUALIFIED/BLOCKED pending separately authorized Hub implementation;
  do not claim a corrected setup or remove their acceptance requirement.

## Lifecycle and identity

Root reports final original round13r2 freeze verification of 1,038 entries and
zero drift before starting next-candidate Email/PDF/Support repairs. The saved
Core final verification is independently recorded at `report.md:30`. This task
performed no freeze command or global drift verification. Saved original hashes
remain unchanged; this report's read-time hashes are preserved separately.
Later authorized product edits are intentional next-candidate work, NOT evidence
that the closed round13r2 captures contain repaired product bytes. New setup or
product work requires a new identity and evidence set. Nothing is restored.
