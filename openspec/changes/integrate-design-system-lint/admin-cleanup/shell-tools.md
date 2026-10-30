# Admin cleanup: Mission Control shell, home, admin tools and CMS chrome

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch:
`admin-shell-tools-2026-10-30`.

## Scope

Thirty-eight files had 383 raw findings (345 `no-restyle`, 36
`no-arbitrary-values`, 1 `require-static-classes`, 1 `no-unknown-classes`).
All now report zero findings and zero warnings, and their `suppressions.json`
entries are pruned. No shared component, token, contract, exception or
suppression count was added or widened.

| File                                                                                              | Before |
| ------------------------------------------------------------------------------------------------- | -----: |
| `apps/admin/app/(app)/automations/page-client.tsx`                                                |     38 |
| `apps/admin/app/mc-shell.tsx`                                                                     |     37 |
| `apps/admin/features/mission-control/components/tiles/mission-control-home.tsx`                   |     35 |
| `apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx`                           |     31 |
| `apps/admin/app/(app)/sign/page-client.tsx`                                                       |     30 |
| `apps/admin/app/(app)/admin/eve/page-client.tsx`                                                  |     21 |
| `apps/admin/features/mission-control/components/tiles/tile-card.tsx`                              |     18 |
| `apps/admin/app/eve/global-panel.tsx`                                                             |     12 |
| `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx` |     11 |
| `apps/admin/app/(app)/admin/page-client.tsx`                                                      |     10 |
| `apps/admin/app/(app)/admin/eve/` (8 panels)                                                      |     47 |
| `apps/admin/src/cms-ui/` (8 other files)                                                          |     48 |
| `apps/admin/app/(app)/reports/` (2 files)                                                         |     14 |
| `apps/admin/features/mission-control/components/` (workflows table and panel)                     |     14 |
| `apps/admin/app/(app)/help/about/page.tsx`                                                        |      5 |
| `apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx`                          |      4 |
| PDF section, studio chrome, auth loading, global error and not-found (6 files)                    |      8 |

## Changes

- `mc-shell`:
  - Navigation, the view-transition boundary and landmarks are unchanged.
  - The collapsible chevron rotates from the trigger's `data-panel-open`.
  - Header icon buttons use `icon-sm`, and the notification dot sits in a
    relative span.
- Home tiles: the full-card overlay link sits outside the Card and draws its
  own focus ring. Quick actions stay separately clickable.
- Links styled as buttons use `ButtonLink` in sign, tiles, Resend, the CMS
  views, the preview page and global not-found.
  - Where a route link precedes the shell in scan order (sign, preview,
    global not-found), the label sits inside the rendered `next/link`. The
    DOM and static analysis then read one name.
  - Resend "Learn more" is now a real anchor with `target="_blank"` and
    `rel="noopener noreferrer"`; it was a `window.open` button.
- Inputs with icons use `InputGroup`: the automations filter, the admin
  memory search, and the Resend API key with its show and hide toggle.
- Arbitrary grid templates became flex rows or `grid-cols-*` spans. The Eve
  audit list uses a 112px label column. Automation rule cards use `min-w-0`;
  before, a long rule name stretched the card to about 794px at 390px.
- The auth loading screens use the shared `AuthScreenSkeleton`, matching the
  donor and missionary apps.
- CMS list views let `PageShell` own padding. The unused
  `payload-table-native` class was removed. `studio-layout` uses `flex-1`;
  Payload's `.template-default__wrap` is a flex column with `flex-grow: 1`.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- Thirty focused unit files pass (177 tests), including shell navigation
  names, Eve panels, admin availability, automations, reports, revealed
  accessibility, Resend field accessibility, studio chrome, mission-control
  link actions, workflow summaries, CMS flow loading and the Eve global panel.
- Browser, real routes on two dev servers (base commit and change), demo
  auth. Five `shell-tools-*` scenarios ran 70 step and width combinations
  per server at 1280, 768 and 390px. No new axe violations, page errors or
  horizontal overflow after the change.
  - Header tab order and sizes match the baseline, and the chevron rotates
    90°. At 390px, Escape closes the navigation sheet and returns focus.
  - The Resend link opens a new tab with a null `opener`; the API key toggle
    is reachable by Tab.
  - `buttonlink-names` confirms the sign and not-found links are named
    anchors with the right `href`.
  - Three regressions were found and fixed during verification: Resend
    "Learn more" alignment, the Eve audit label column, and the automations
    card width at 390px (already broken before the change).
- CMS chrome: `/web-studio` returns 500 on both commits in this environment
  (Payload has no database). The existing `react-cleanup-contributions`
  fixture rendered Header and Nav at 1280 and 320px with no errors or axe
  violations.
- Axe: `label-content-name-mismatch`, sidebar `list` and `listitem`,
  `aria-required-children` and `scrollable-region-focusable` are present
  before the change.
- Hash-bound review ledgers: 11 Shadscan finding-ledger entries bound to
  these files were re-reviewed (pending, label, empty, error-boundary,
  field-error, link, navigation, not-found, preview-loading and status
  rationales), as were the React Doctor exceptions bound to these files.
  Hashes were rebound only where the rationale still holds and React Doctor
  emits the same diagnostic with a byte-identical source context.
  `bun run verify:shadscan` and `bun run react-doctor:check` pass on this
  branch.

## Known gaps and follow-ups

- Missing shared variants (nearest used):
  - Button: floating-action, left-aligned full-width ghost;
  - Empty: dashed;
  - Textarea and InputGroupInput: monospace;
  - Card: interactive hover;
  - CardHeader: divider.
- Not exercised in a browser:
  - the Eve global panel (the demo user has no Mission Control user; unit
    tests cover it);
  - the native PDF builder (feature flag off);
  - the auth loading skeleton (too fast to capture).

Evidence (ignored, hashed in the ledger): `.tmp/admin-lint-5-4/shell-tools/`.
