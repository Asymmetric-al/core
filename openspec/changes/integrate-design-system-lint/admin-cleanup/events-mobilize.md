# Admin cleanup: Events, Mobilize and Locations

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch:
`admin-events-mobilize-2026-10-30`.

## Scope

Six files had 326 raw findings (318 `no-restyle`, 4 `no-arbitrary-values`,
2 `no-raw-colors`, 2 `require-static-classes`). All six now report zero
findings and zero warnings, and their `suppressions.json` entries are pruned.
No shared component, token, contract, exception or suppression count was
added or widened.

| File                                                                          | Before |
| ----------------------------------------------------------------------------- | -----: |
| `apps/admin/app/(app)/events/page-client.tsx`                                 |    165 |
| `apps/admin/app/(app)/mobilize/mobilize-sections.tsx`                         |    131 |
| `apps/admin/app/(app)/mobilize/locations/page-client.tsx`                     |     12 |
| `apps/admin/features/mission-control/locations/components/LocationEditor.tsx` |      9 |
| `apps/admin/app/(app)/events/registration-trends-chart.tsx`                   |      8 |
| `apps/admin/features/mission-control/locations/components/LocationTable.tsx`  |      1 |

## Changes

- Speaker and attendee status colour helpers became Badge variant maps;
  declined and cancelled use `destructive-subtle`.
- The configuration navigation is a `nav` list of shared `Item` rows rendered
  as buttons. Labels stay left-aligned and the current section has
  `aria-current` and the muted fill used by the app sidebar.
- The Events tab list scrolls horizontally inside a plain wrapper, instead
  of sitting 6px past the content edge at 390px.
- Search fields use `InputGroup`; underline tabs use `TabsList variant="line"`.
- The Mobilize detail sheet keeps one close control. The header wraps, so
  Edit and Contact stay on screen at 390px; they were off screen before.
  The footer stacks on mobile.
- Location editor content scrolls inside the sheet. The Published switch uses
  the shared choice-card `Field` composition.
- The registration chart uses `var(--chart-1)`, `var(--border)` and
  `var(--muted-foreground)`.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- Six focused unit files pass (48 tests).
- Browser, real routes on two dev servers (base commit and change), demo
  auth: `events-mobilize-events` (7 steps at 1280, 768 and 390px),
  `events-mobilize-mobilize` and `events-mobilize-locations` (7-8 steps at
  1280 and 390px), each run against both servers. No page scrolls
  horizontally after the change.
  - The detail and add-candidate sheets each have one close control.
    Escape closes them and returns focus to the trigger.
  - The location editor scrolls with Update and Delete reachable. Published
    toggles exactly once by switch click, label click and Space.
  - Quick actions are not clipped at any width; before, "Email Attendees"
    clipped at 768px. "Click on Map to Drop Marker" fits at 390px.
- Axe found no new violations. Shell `label-content-name-mismatch`, `list`
  and `listitem`, a `scrollable-region-focusable` hit in the Mobilize sheet,
  and a hydration warning are present before the change.
- Hash-bound review ledgers: the Shadscan finding-ledger proofs and React
  Doctor exceptions bound to these files were re-reviewed. Their hashes were
  rebound only where the recorded rationale still holds and React Doctor
  still emits the same diagnostic with a byte-identical source context;
  anything else was reviewed individually. `bun run verify:shadscan` and
  `bun run react-doctor:check` pass on this branch.

## Known gaps and follow-ups

- Button has no tall tile size or soft-destructive variant. Quick actions
  are one column of outline buttons; Reject is solid destructive.
- Not exercised: dropping a pin by clicking the map (the editor opened from
  the table) and search filtering of mock rows.

Evidence (ignored, hashed in the ledger): `.tmp/admin-lint-5-4/events-mobilize/`.
