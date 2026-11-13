### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round1`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round1.diff` (diff sha256
  `8836e61fe7d91dd37fc155aca52d4c99f6dd57491c350dec9894b39081a16b71`, 161
  files; manifest `snapshots/round1-manifest.json`, full copies in
  `snapshots/round1-checkpoint/`). Served from the working tree on port 3030. Review the diff, not later edits. The running Payload dev server rewrites the
  generated `apps/admin/app/(payload)/web-studio/importMap.js` without its
  lint header; the frozen copy is the `bun run cms:importmap` output.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md`. Design brief the
  implementation followed: `docs/qa/admin-workspaces-hillclimb/design-brief.md`.
  Coverage list: `docs/qa/admin-workspaces-hillclimb/coverage.md`.

### Component provenance

- Grids and tables: ReUI `data-grid` (free, MIT), vendored at
  `packages/ui/components/reui/data-grid/`; provenance and the six local
  adaptations are in `packages/ui/components/reui/README.md`. Composition:
  `@asym/ui/components/data-grid-panel` (`packages/ui/components/data-grid-panel/`),
  modelled on ReUI `c-data-grid-22`.
- Web Studio list filters: Core's shared `FilterBuilder`
  (`packages/ui/components/shadcn/data-table/filters/`) bridged to Payload's
  query by `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/payload-where-filters.ts`.
- Everything else uses existing `@asym/ui` shadcn `base-maia` components
  (Card, Item, Sheet, AlertDialog, DropdownMenu, Select, Badge, Empty,
  Skeleton, Tooltip).

### Checks run on B (results)

- Focused unit tests: CRM, Contributions, Web Studio, data-grid panel and
  CMS contracts, 39 files / 496 tests pass; new filter converter (19), grid
  filter panel (3) and revert (8) tests pass.
- Full unit suite: B failed 147 tests in 34 files before the integration
  fixes; the same file list run on A fails 144 tests in 31 files (the known
  Windows-environment baseline: scripts, acceptance and docs tests). The
  three B-only failures (`mission-control/routes`,
  `base-ui-overlay-consumers`, `base-ui-trigger-render-nesting`) were fixed
  and now pass.
- `bunx turbo run typecheck --filter=@asym/admin --filter=@asym/ui`: pass.
  Admin and `@asym/ui` ESLint: pass. Prettier on every changed file: pass.
- Browser (real dev server, real local Payload database): Web Studio
  filters (six readable fields, "contains", the URL `where`, rows 10 → 1,
  Filters badge 1, survives reload); Revert to published on a page with a
  newer draft (confirmation dialog, published title restored, button gone,
  latest version published).
- `check-workspaces.mjs` results per state are listed with the evidence.

### Accessibility checks (check-workspaces.mjs, 100 state/width rows each)

- States with axe violations (final, after the fixes below): A 56, B 4.
  B's four are stock Payload screens and match A or are fewer: Versions
  (`list`), API (`color-contrast`, `list`) and the media editor
  (`aria-allowed-attr`).
- Grid keyboard (Tab reaches a row, ArrowDown moves rows): A fails 11 of
  14 grids, B fails 0 of 14.
- An earlier Studio check run on both versions was invalid: a script edit
  also installed the CRM fixtures for Studio states, which answered the
  Studio lookups with 404s (the hub measured its loading skeleton). Fixed
  and rerun for both A and B; the numbers above are from the rerun.
- Pre-review fixes after the first check run: Studio phone cards and the
  Missionaries hub cards rendered `Item` with `role="listitem"` inside the
  panel's own `<li>` (axe `aria-required-parent`); they now render as a
  plain `div`, as CRM and Contributions do. The document action bar no
  longer renders Payload's unnamed icon-only preview link button (axe
  `button-name`, also in A); preview stays available from Details "Open
  preview" and the phone Preview menu.
- Dialog "Tab escapes" are measured at machine speed. Base UI moves focus
  from its end focus guard back into the dialog asynchronously, so rapid
  Tabs can step past the guard; at 150 ms per Tab the CRM note dialog keeps
  focus (verified). Treat single escapes to `body` in A and B alike as this
  artifact.

### Known limitations

- CRM and Contributions run on typed fixtures; Web Studio on a scratch
  local Payload database. Nothing here proves tenant integration.
- `contribution-fund-correction` is not reviewed: neither version offers a
  fund-designation correction from the sheet (refund and receipt only).
- The Next dev "1 Issue" badge on some captures is a pre-existing `PageShell`
  motion hydration mismatch under reduced motion (also present in A).
- The CRM board view has no add-filter control (filters are set from the
  table view).
- Where a state's trigger does not exist in A (for example the Studio
  "View" and phone "Sort" menus, and create flows whose "Create draft" is
  disabled until the form is filled), A is captured as the page stands.
