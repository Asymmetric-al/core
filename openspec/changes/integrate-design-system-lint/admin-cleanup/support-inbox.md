# Admin cleanup: Support Hub inbox, reports and routes

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch:
`admin-support-inbox-2026-10-30`.

## Scope

Forty-six files had 292 raw findings (271 `no-restyle`, 17
`no-arbitrary-values`, 4 `require-static-classes`). They cover the Support Hub
inbox, detail, composer, timeline, reports, toolbar, views, labels, macros,
board, table and command components, plus the `/support` routes. All now
report zero findings and zero warnings, and their `suppressions.json` entries
are pruned. No shared component, token, contract, exception or suppression
count was added or widened. `app/(app)/support/page-client.tsx` has no
importer and is handled separately.

| File                                      | Before |
| ----------------------------------------- | -----: |
| `toolbar/LabelFilter.tsx`                 |     36 |
| `reports/ReportFilters.tsx`               |     26 |
| `toolbar/LayoutToggle.tsx`                |     19 |
| `labels/LabelManagerDialog.tsx`           |     16 |
| `reports/ReportScopeSelect.tsx`           |     14 |
| `support/tickets/new/new-ticket-form.tsx` |     13 |
| `support/tickets/page.tsx`                |     13 |
| `detail/ConversationAssigneeMenu.tsx`     |     10 |
| `detail/composer/SupportTipTapEditor.tsx` |     10 |
| `views/SavedViewsBar.tsx`                 |     10 |
| `SupportFailureBanner.tsx`                |      9 |
| 35 further files with 1–8 findings each   |    116 |

Component paths are under `apps/admin/features/support-hub/components/`;
`support/` paths are under `apps/admin/app/(app)/`.

## Changes

- Status, priority, delivery and attachment colour maps became Badge variant
  maps.
- Navigation that looked like a button is now `ButtonLink` in knowledge,
  tickets, ticket detail and the new-ticket form. The visible label is inside
  the rendered `next/link`, so the DOM and static analysis read one name;
  these links keep client navigation.
- Arbitrary grid templates became flex rows with scale widths. Widths moved
  from shared controls to plain wrappers.
- `LayoutToggle` uses the shared outline toggle group. The inactive option is
  muted so the pressed option stays distinguishable.
- The label filter popup is 180px, so its search field is not clipped.
  Command lists inside the padded `PopoverContent` use
  `CommandInput popoverChrome`, the Tasks pattern.
- The conversation sheet has one close control; before, the sheet's and the
  header's close buttons overlapped. The header border is a `Separator`.
- The knowledge "article not found" notice is an `Alert` (`role="alert"`).
  The failure banner text uses foreground; its icon keeps the warning colour.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- The 28 related unit files pass (138 tests): label filter, inbox toolbar,
  inbox search state, board card, board empty state, view-tab counts, report
  scope select, ticket selects and validation, loading, composition contracts,
  and the Select null-policy suites.
- Browser, real routes on two dev servers (base commit and change), demo
  auth, `/api/admin/support/*` stubbed. `support-inbox-hub` (13 steps),
  `-reports` (5) and `-routes` (11) ran at 1280, 768 and 390px on both
  servers, 174 records. A separate `buttonlink-names` check confirmed every
  converted link is a named anchor with the right `href` and navigates.
  - No horizontal overflow and no new page errors.
  - Report filters keep their positions at all three widths.
  - Saved views, the save dialog, the command palette, bulk "Add label" and
    the menus work, and Escape returns focus to the trigger.
  - Four regressions found during verification were fixed: the layout toggle
    state, label popup width, the duplicate sheet close, and the popover
    search field.
- Axe found no new violations. `label-content-name-mismatch`, `list`,
  `listitem` and the command palette's `aria-required-children` are present
  before the change.
- Hash-bound review ledgers: the Shadscan finding-ledger proofs and React
  Doctor exceptions bound to these files were re-reviewed. Their hashes were
  rebound only where the recorded rationale still holds and React Doctor
  still emits the same diagnostic with a byte-identical source context;
  anything else was reviewed individually. `bun run verify:shadscan` and
  `bun run react-doctor:check` pass on this branch.

## Known gaps and follow-ups

- No `CommandDialog` or `ComboboxContent` width option and no padding-free
  `PopoverContent` exists; no selected Card state exists.
- Not exercised: the tickets list and ticket detail pages, which fail
  server-side on both commits here because `SUPABASE_SERVICE_ROLE_KEY` is not
  configured. The conversation timeline also collapses to zero height at 768
  and 390px on both commits, a pre-existing layout problem.

Evidence (ignored, hashed in the ledger): `.tmp/admin-lint-5-4/support-inbox/`.
