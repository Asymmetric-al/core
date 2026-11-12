### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round2`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round2.diff` (diff sha256
  `e79ebb5c70aaebc8519b96131cc4001c69cc683f8639bb939335b9334313f4ea`, 174
  files; manifest `snapshots/round2-manifest.json`, full copies in
  `snapshots/round2-checkpoint/`). Served from the working tree on port 3030. Review the diff, not later edits. The running Payload dev server
  rewrites the generated `apps/admin/app/(payload)/web-studio/importMap.js`
  without its lint header; the frozen copy is the `bun run cms:importmap`
  output.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md`. Design brief:
  `docs/qa/admin-workspaces-hillclimb/design-brief.md`. Coverage list:
  `docs/qa/admin-workspaces-hillclimb/coverage.md`.
- Evidence: A in `original/`, B in `candidate-2/`, sheets in
  `comparisons/round2-ab/` and `comparisons/round2-ba/`.

### Evidence conditions

- CRM and Contributions use the same typed fixtures for A and B
  (`fixtures/fixtures.json`, regenerated after the fixture payloads were
  corrected to the real correction `amount` key).
- Web Studio runs on one scratch local Payload database shared by A and B.
  Before this round the harness left state behind between captures: each
  stock create view autosaved an untitled draft, and the pages list kept a
  saved sort, page size and Group by. The harness now resets that before
  the run and after every Studio state (`resetStudioState` in
  `studio-fixtures.mjs`), and A's whole Studio area was recaptured on the
  clean database for this round.
- Three states are new this round: `studio-pages-grouped`,
  `studio-pages-group-menu`, `crm-relationships-more`.

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
- Everything else uses existing `@asym/ui` shadcn `base-maia` components
  (Card, Item, Sheet, AlertDialog, Alert, DropdownMenu, Select, Badge, Empty,
  Skeleton, Tooltip).

### Checks run on B (results)

- Every changed or new unit test file: 50 files / 610 tests pass.
- Full unit suite: the only failure outside the known Windows baseline (144
  tests in 31 files: scripts, acceptance and docs tests that pass on Linux
  CI) was a source contract broken by argument order in the paging change;
  fixed, and the contract and paging suites pass.
- `bunx turbo run typecheck` for `@asym/admin`, `@asym/ui`, `@asym/api`,
  `@asym/database`: pass. Admin and `@asym/ui` ESLint (including the design
  system rules): pass. Prettier on every changed file: pass.

### Accessibility checks (check-workspaces.mjs, 105 state/width rows each)

- States with axe violations: A 60, B 4. B's four are stock Payload screens,
  unchanged from round 1: Versions (`list`, desktop and mobile), API
  (`color-contrast`, `list`) and the media editor (`aria-allowed-attr`).
- Grid keyboard (Tab reaches a row, ArrowDown moves rows): A fails 11 of
  14 grids, B fails 0 of 14.
- No horizontal page overflow in either version.
- Dialog "Tab escapes" are measured at machine speed. Base UI moves focus
  from its end focus guard back into the dialog asynchronously, so rapid
  Tabs can step past the guard; treat single escapes in A and B alike as
  this artifact. A Select popup (the template picker) closes on Tab by
  design.

### Known limitations

- CRM and Contributions run on typed fixtures; Web Studio on a scratch
  local Payload database. Nothing here proves tenant integration.
- `contribution-fund-correction` is not reviewable: neither version offers
  a fund-designation correction from the sheet.
- Grouped lists are Payload's own server-rendered tables placed inside the
  Studio card; their table styling is Payload's, not the ReUI grid's.
- Studio's sidebar "Recent" list (in A and B) keeps documents that were
  later deleted; a capture may show such an entry.
- Notes have 25 fixtures (one page), so Notes paging past 50 is shown by
  unit tests, not captures.
- Deferred, not in this candidate: the Versions/API breadcrumb document
  title (the Payload header slot has no document context) and restyling
  the stock Users/Tenants/Versions tables.
- Where a state's trigger does not exist in a version (for example A's
  Studio "View" and phone "Sort" menus, or create flows whose "Create
  draft" is disabled until the form is filled), the page is captured as it
  stands.
- The Next dev "1 Issue" badge on some captures is a pre-existing
  `PageShell` motion hydration mismatch under reduced motion (also in A).
