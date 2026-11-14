### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round3`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round3.diff` (diff sha256
  `4fa3971b0d431ba8a2f0e235f589529aa75b9be6276e1c6dfbaecdddd10064f8`, 181
  files; manifest `snapshots/round3-manifest.json`, full copies in
  `snapshots/round3-checkpoint/`). Served from the working tree on port 3030. Review the diff, not later edits. The running Payload dev server
  rewrites the generated `apps/admin/app/(payload)/web-studio/importMap.js`
  without its lint header; the frozen copy is the `bun run cms:importmap`
  output.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md`. Design brief:
  `docs/qa/admin-workspaces-hillclimb/design-brief.md`. Coverage list:
  `docs/qa/admin-workspaces-hillclimb/coverage.md`.
- Evidence: A in `original/`, B in `candidate-3/`, sheets in
  `comparisons/round3-ab/` and `comparisons/round3-ba/`.

### Evidence conditions

- CRM and Contributions use the same typed fixtures for A and B.
- Web Studio runs on one scratch local Payload database shared by A and B;
  the harness resets untitled autosaved drafts and the pages list
  preference before the run and after every Studio state.
- Both versions were fully recaptured for this round on the same harness,
  which now waits for Payload "Loading…" placeholders to clear before a
  screenshot (round 2's "Tenant Loading…" and blank API pane were capture
  timing; a probe showed both resolve).
- New this round: phones for every empty, error and correction state and for
  the giving, project and update create flows; `crm-drawer-gifts` scrolls the
  gift list to the top; phone selection keeps the selected cards in view; and
  seven new states (`crm-gift-row-menu`, `crm-resend-receipt`,
  `crm-relationship-detail`, `crm-note-long`, `studio-pages-selected`,
  `studio-pages-bulk-publish`, `studio-pages-tenant-filter`). See
  coverage.md.

### Component provenance

- Grids and tables: ReUI `data-grid` (free, MIT), vendored at
  `packages/ui/components/reui/data-grid/`; provenance and the seven local
  adaptations are in `packages/ui/components/reui/README.md`. Composition:
  `@asym/ui/components/data-grid-panel`, modelled on ReUI `c-data-grid-22`.
- Web Studio list filters: Core's shared `FilterBuilder`
  (`packages/ui/components/shadcn/data-table/filters/`) bridged to Payload's
  query by `.../list-workspace/payload-where-filters.ts`. Group by:
  `.../list-workspace/grid-group-by-menu.tsx` (shadcn DropdownMenu radio
  groups) writing Payload's own `groupBy`; the grouped tables themselves are
  rendered by Payload on the server.
- Correction approval change lines: built server-side by
  `packages/api/src/admin/contribution-operations/correction-request-change.ts`.
- Web Studio bulk work: Payload's own `SelectionProvider` and
  Edit/Publish/Unpublish/Delete Many (barrel exports), placed in Core's
  `DataGridSelectionBar`; relationship filter options load through Payload's
  REST API (`relationship-filter-options.ts`); the View panel saves column
  visibility and order through Payload's `useTableColumns`.
- Card-layout sort: the shared `DataGridSortSelect` (moved from CRM into
  `packages/ui/components/data-grid-panel`).
- Everything else uses existing `@asym/ui` shadcn `base-maia` components
  (Card, Item, Sheet, AlertDialog, Alert, DropdownMenu, Select, Badge, Empty,
  Skeleton, Tooltip).

### Checks run on B (results)

- Focused suites for every change pass (Contributions and CRM 380 tests;
  Web Studio grid 31, filters 27, relationship options 3, list view 3;
  data-grid panel 18; form primitives 21).
- Full unit suite: the only non-baseline failure (a list-view test missing
  Payload's router adapter for the new `SelectionProvider`) was fixed in the
  test; every other failure is the known 31-file Windows baseline (scripts,
  acceptance and docs tests that pass on Linux CI).
- Typecheck for `@asym/admin`, `@asym/ui`, `@asym/api`, `@asym/database`:
  pass. Admin and `@asym/ui` ESLint (design-system rules included): pass.
  Prettier on every changed file: pass.
- Browser (real dev server, local Payload database): selecting two pages
  shows "2 pages selected" with Edit, Publish, Unpublish and Delete;
  Publish opens Payload's confirmation (not confirmed); the filter panel
  offers Tenant with tenant names.

### Accessibility checks (check-workspaces.mjs, 126 state/width rows each)

- States with axe violations: A 67, B 4. B's four are stock Payload screens
  (Versions `list` desktop and mobile; API `color-contrast` and `list`;
  media editor `aria-allowed-attr`), unchanged from rounds 1 and 2.
- Grid keyboard (Tab reaches a row, ArrowDown moves rows): A fails 11 of
  14 grids, B fails 0 of 14. No horizontal page overflow in either version.
- Dialog "Escape closes" reads false for the refund and resend-receipt
  dialogs because the check asks whether any dialog remains, and the detail
  sheet or record drawer they open over correctly stays. Rapid machine-speed
  Tab escapes are a Base UI focus-guard artifact; a Select or filter popover
  closing or releasing focus on Tab is non-modal by design.

### Known limitations

- CRM and Contributions run on typed fixtures; Web Studio on a scratch
  local Payload database. Nothing here proves tenant integration, live
  receipt delivery, refunds or bulk publish/delete outcomes (the captures
  open confirmations and never confirm).
- `contribution-fund-correction` is not reviewable: neither version offers
  a fund-designation correction from the sheet. Single-gift Send receipt in
  Contributions shows a "fixture missing" toast in both versions.
- Studio's sidebar "Recent" list (A and B) can keep a document that was
  later deleted. The grouped tables remain Payload's server tables (now
  styled like the grid); their date format is Payload's.
- Notes have 25 fixtures (one page), so Notes paging past 50 is shown by
  unit tests; `crm-note-long` saves a real long note through the composer
  (its "CRM note saved" toast may still show).
- Deferred, not in this candidate: the template picker search focus ring
  (shared `SearchableSelect`), the Versions/API breadcrumb document title,
  and the stock Users/Tenants/Versions tables with their inherited axe
  findings.
- Where a state's trigger does not exist in a version (A's bulk actions,
  View panel, relationship details, note dialog and others), the page is
  captured as it stands and the capture log names the missing trigger.
- The Next dev "1 Issue" badge on some captures is a pre-existing
  `PageShell` motion hydration mismatch under reduced motion (also in A).
