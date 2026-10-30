# Admin cleanup: Member Care

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch: `admin-care-2026-10-30`.

## Scope

Nine files had 300 raw findings (289 `no-restyle`, 9 `no-arbitrary-values`,
2 `require-static-classes`). All now report zero findings and zero warnings,
and their `suppressions.json` entries are pruned. The personnel profile route
also received a layout fix. No shared component, token, contract, exception
or suppression count was added or widened.

| File                                                                        | Before |
| --------------------------------------------------------------------------- | -----: |
| `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx`  |    106 |
| `apps/admin/features/mission-control/care/components/CareTools.tsx`         |     69 |
| `apps/admin/features/mission-control/care/components/CareDashboard.tsx`     |     49 |
| `apps/admin/app/(app)/care/settings/page-client.tsx`                        |     32 |
| `apps/admin/features/mission-control/care/components/HealthHeatmap.tsx`     |     11 |
| `apps/admin/features/mission-control/care/components/TimezoneScheduler.tsx` |     11 |
| `apps/admin/features/mission-control/care/components/PersonnelList.tsx`     |      9 |
| `apps/admin/features/mission-control/care/components/UI.tsx`                |      8 |
| `apps/admin/app/(app)/care/directory/page-client.tsx`                       |      5 |

## Changes

- `UI.tsx` no longer carries unused app-local copies of Button, Input,
  Textarea, Select, Card, Badge, Avatar, Alert, Tabs and ScrollArea. The
  remaining exports are the ones still imported. Its Dialog wrapper passes
  `className` straight to the shared component, and `DialogHeader` is the
  shared `DialogHeader` itself.
- Heatmap cells are buttons passed to `TooltipTrigger` through `render`, so
  tooltips open on hover and keyboard focus.
- Settings uses `ButtonLink` for its external link; form labels are plain
  `Label`s associated with their fields.
- Profile tab labels are capitalised by an inner span, so accessible names
  are unchanged. The tab strip keeps room for the active-tab line.
- Two colour-contrast failures that existed before were fixed: "Follow up
  today" and the heatmap tooltip's second line.
- `care/directory/[id]/page-client.tsx` uses `grid-cols-1` below `lg`.
  Before, the profile column stretched to 446px at a 390px viewport and
  clipped the "Within Working Hours" badge.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- Focused unit files pass (8 tests): `base-ui-controls`, `timezone-scheduler`
  and `react-cleanup-accessibility`.
- Browser, real routes on two dev servers (base commit and change), demo
  auth: `care-surfaces` (14 steps at 1280, 768 and 390px) and `care-profile`
  (the profile steps plus width checks at 1280 and 390px). No page errors,
  step failures or horizontal overflow after the change.
  - Ctrl+K opens the tools panel with focus in search; Escape returns focus
    to the floating button.
  - Profile tabs keep their names and arrow-key movement.
  - At 390px the profile column is 342px with the badge in view; at 1280px
    the geometry is unchanged (675px column).
- Axe found no new violations, and the colour-contrast hits seen before are
  gone. Shell `label-content-name-mismatch`, `list` and `listitem`, and the
  command palette's `aria-required-children`, are present before the change.
- Hash-bound review ledgers: the Shadscan finding-ledger proofs and React
  Doctor exceptions bound to these files were re-reviewed. Their hashes were
  rebound only where the recorded rationale still holds and React Doctor
  still emits the same diagnostic with a byte-identical source context;
  anything else was reviewed individually. `bun run verify:shadscan` and
  `bun run react-doctor:check` pass on this branch.

## Known gaps and follow-ups

- No floating-action size, warning Button or tinted Card exists. The tools
  button uses `icon-touch` (44px, was 56px). Urgency now comes from icons,
  the pulsing dot, destructive text and badges, and the warning callout.
- Pre-existing and unchanged:
  - the settings "Save Changes" panel never sticks;
  - a long name can overlap the profile banner at 1280px;
  - the shared command dialog's close button overlaps its search input.
- Six React Doctor exceptions are retired because their diagnostics are no
  longer emitted: five ungated tab fade-in animations removed from
  `PersonnelProfile`, and one animation in the deleted local `UI.tsx`
  primitives.
- Review caught one hash-only rebind with the wrong owner. The `UI.tsx`
  props-spread exception (written for the deleted local Button) had moved
  onto `DialogHeader`'s identical `{...props}` span.
  - `DialogHeader` is now the shared component and `DialogTitle` no longer
    spreads.
  - React Doctor reports one spread diagnostic per file, so it now lands on
    `Checkbox`: a typed `forwardRef` wrapper forwarding native input props.
    The exception was rebound there after review, with an explicit
    owner-change note.
  - Rebinding now also requires the same enclosing declaration. A check of
    all 58 moved rebinds found no other owner change.

Evidence (ignored, hashed in the ledger): `.tmp/admin-lint-5-4/care/`.
