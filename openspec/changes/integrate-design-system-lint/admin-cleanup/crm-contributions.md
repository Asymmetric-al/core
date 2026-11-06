# Admin cleanup: CRM and Contributions

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch:
`admin-crm-contributions-2026-10-30`.

## Scope

Twenty files had 424 raw findings (410 `no-restyle`, 10 `no-arbitrary-values`,
4 `require-static-classes`). All now report zero findings and zero warnings,
and their `suppressions.json` entries are pruned. Two sibling class-map
modules (`crm/types.ts`, `offline-gift-form-model.ts`) changed with them. No
shared component, token, contract, exception or suppression count was added
or widened. Amounts, statuses, handlers, pending and disabled states and
accessible names are unchanged.

| File                                                                            | Before |
| ------------------------------------------------------------------------------- | -----: |
| `apps/admin/app/(app)/crm/detail-drawer.tsx`                                    |    110 |
| `apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx`              |     82 |
| `apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog.tsx` |     43 |
| `apps/admin/app/(app)/crm/gift-history-view-settings-menu.tsx`                  |     28 |
| `apps/admin/app/(app)/contributions/operation-shell.tsx`                        |     26 |
| `apps/admin/app/(app)/crm/columns.tsx`                                          |     24 |
| `apps/admin/app/(app)/contributions/main-body.tsx`                              |     20 |
| `apps/admin/app/(app)/contributions/needs-attention-panel.tsx`                  |     15 |
| `apps/admin/app/(app)/crm/gift-inline-action-controls.tsx`                      |     13 |
| `apps/admin/app/(app)/contributions/columns.tsx`                                |     11 |
| `apps/admin/app/(app)/crm/gift-history-dialogs.tsx`                             |     10 |
| `apps/admin/app/(app)/crm/kanban-view.tsx`                                      |      9 |
| `apps/admin/app/(app)/crm/page-client.tsx`                                      |      7 |
| `apps/admin/app/(app)/crm/notes/columns.tsx`                                    |      6 |
| `apps/admin/app/(app)/contributions/page-client.tsx`                            |      5 |
| `apps/admin/app/(app)/contributions/receipt-delivery-choice.tsx`                |      5 |
| `apps/admin/app/(app)/crm/gift-history-view-switcher.tsx`                       |      5 |
| `apps/admin/app/(app)/crm/notes/page-client.tsx`                                |      3 |
| `apps/admin/app/(app)/crm/gift-history-section.tsx`                             |      1 |
| `apps/admin/app/(app)/crm/relationships/page-client.tsx`                        |      1 |

## Changes

- Portal access, receipt and status class maps became Badge variant maps
  (`PORTAL_BADGE_VARIANT`, `badgeVariant`). This also removes the raw palette
  that was hidden in `crm/types.ts`.
- The CRM record drawer and the contribution detail sheet keep only their
  width on `SheetContent`. Content sits in one flex column with a
  `ScrollArea`. Each now has one close control; before, the shared close
  button overlapped the header's own. The drawer header truncates the name
  so its close button stays on screen at 390px.
- Underline tabs use `TabsList variant="line"`; icon buttons use `icon-sm`.
- The offline gift dialog uses `DialogContent scrollable`. Its hand-built
  `SegBtn` buttons became shared outline `ToggleGroup`s named "Donor record"
  and "Designation type", which now expose pressed state. Hints link through
  `aria-describedby`. Appearance-only `inputClassName`, `labelClassName` and
  `triggerClassName` props were removed.
- The operation shell is a centred `scrollable` dialog. Before, Refund ran
  past an 800px viewport and its buttons could not be reached.
- 44px text controls use `size="lg"` (40px); 44px inputs use the default.
- `tests/unit/apps/admin/app/offline-gift-form-model.test.ts` now asserts the
  `badgeVariant` field instead of a class string.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- Thirty focused unit files pass (347 tests), including the detail sheet,
  offline gift, CRM gift history, inline actions, record action menus,
  contributions page and route detail selection suites.
- Browser, real routes on two dev servers (base commit and change), demo
  auth. Admin API responses are stubbed with fixtures built by the server
  read-model builders. Scenarios: `crm-drawer` (4 steps at 1280, 768 and
  390px) plus six `crm-contributions-*` scenarios at 1280 and 390px (notes
  also at 768px).
  - Drawer and sheet bodies scroll to the last entry; close controls are on
    screen at every width.
  - Escape returns focus to triggers; arrow keys work in menus and radio
    groups. Long view names truncate.
  - The disabled receipt option remains dimmed.
- The offline dialog cannot open in the app, because
  `OFFLINE_GIFT_ENTRY_PERSISTENCE_ENABLED` is false. Instead the existing
  base-ui fixture rendered it for both commits at 390x844 and 1280x600:
  arrow-key focus moves between toggles, hints are announced, Record gift is
  reachable, and focus returns to the trigger.
- Axe found no new violations. Shell `label-content-name-mismatch`, `list`
  and `listitem` are present before the change.
- Hash-bound review ledgers: the Shadscan finding-ledger proofs and React
  Doctor exceptions bound to these files were re-reviewed. Their hashes were
  rebound only where the recorded rationale still holds and React Doctor
  still emits the same diagnostic with a byte-identical source context;
  anything else was reviewed individually. `bun run verify:shadscan` and
  `bun run react-doctor:check` pass on this branch.

## Known gaps and follow-ups

- No 44px text button, mobile bottom-sheet dialog, dashed `Empty`, tall
  `Textarea` or choice-card `ToggleGroupItem` exists. The nearest shared
  sizes are used.
- The shared `ToggleGroup` selected state is a light fill, weaker than the
  former solid buttons. Its emphasis belongs to the shared-UI task.
- Not exercised: CRM card rendering (no toggle exposes it), the hidden notes
  State column, and Approve/Retry posting, which are disabled in code on
  both commits.

Evidence (ignored, hashed in the ledger):
`.tmp/admin-lint-5-4/crm-contributions/`.
