# Workspaces hillclimb: shared design brief

Scope: Admin **CRM** (`/crm`, `/crm/notes`, `/crm/relationships`, the CRM
record drawer and gift history), **Contributions** (`/contributions`, the
`?gift=` detail sheet, the operation shell, correction approvals, the offline
gift dialog) and **Web Studio** (`/web-studio/**`: shell, dashboard,
collection lists, document workspace, template gallery, missionaries hub and
create flows).

The bar: both independent reviewers rate every part **9.0+** ("polished, no
substantive inspected weakness"). Preserve every existing feature, required
piece of information and working behaviour. Keep exact `base-maia`, Base UI,
semantic tokens and shared ownership in `packages/ui`.

## Non-negotiables

- Read `AGENTS.md`, `apps/admin/AGENTS.md`, `packages/ui/AGENTS.md` and
  `docs/ai/rules/frontend.md` before editing.
- **Tables and grids use ReUI.** The ReUI data-grid is vendored at
  `packages/ui/components/reui/data-grid/*` (do not edit those files). Build
  every table with the Core composition `@asym/ui/components/data-grid-panel`
  (`DataGridPanel`, `DataGridSearch`, `DataGridViewOptions`,
  `DataGridSelectionBar`, `DataGridRowPrimary`, `DataGridResetFilters`,
  `DataGridToolbarSpacer`, `useTable`, `dataGridFeatures`, `filterFn_*`, and
  the `DataGridColumnDef<T>` / `DataGridRow<T>` types). Import ReUI column
  helpers from their files: `DataGridColumnHeader`
  (`@asym/ui/components/reui/data-grid/data-grid-column-header`),
  `DataGridColumnFilter` (`.../data-grid-column-filter`),
  `DataGridTableRowSelect` / `DataGridTableRowSelectAll`
  (`.../data-grid-table`). Never import `@tanstack/react-table` in apps.
  Reference composition: ReUI `c-data-grid-22` (CRUD admin in a Card); the
  panel already implements it. Tests: `tests/unit/packages/ui/data-grid-panel.test.tsx`.
- `useTable({ features: dataGridFeatures, ... })`. Pass `getRowId`. For
  server data, a virtualized body or "show all rows", set
  `manualPagination: true` (otherwise rows are sliced to 10). Column filter
  functions must be functions (`filterFn_arrHas`, ...), not strings.
- Selection: use `createDataGridSelectionColumn<T>({ getRowLabel })`
  rather than hand-placing `DataGridTableRowSelect`. Every checkbox is then
  named "Select {record}" and sits in a flex box sized for a table cell.
  Name a grid region from its visible heading with
  `labelledBy="<heading id>"`. A grid that had a desktop table/cards switch
  keeps it: pass `view` to `DataGridPanel` and put `DataGridViewToggle` in
  the toolbar.
- The panel ignores row clicks that start on a control inside the row (a
  menu trigger, a link, a button or a checkbox). Do not add
  `stopPropagation` workarounds for that. When the error action does
  something other than reload, name it with `error.retryLabel` (e.g.
  "Clear filters"). `DataGridSearch` renders a single Clear button.
- Every row has exactly one `DataGridRowPrimary` (button or
  `render={<Link/>}`) named after the record. It powers keyboard navigation
  (ArrowUp/Down, PageUp/Down, Ctrl+Home/End, Space selects, Ctrl+A selects
  all, Enter opens) and replaces anonymous focusable rows.
- Mobile (< md): pass `renderMobileRow` (compose `Item` from
  `@asym/ui/components/shadcn/item`; include the row checkbox when selection is
  on and one `DataGridRowPrimary`). No horizontal page scroll at 390px.
- No app-local primitives, no restyling shared components (the design-system
  lint allows only placement classes on shared components; put styling on a
  wrapper element), no arbitrary values, no raw palette colours, no new
  dependencies, no edits to `packages/ui/components/reui/**`.
- Money, statuses and permissions are product truth: keep the existing
  formatters (`formatSharedContributionAmount`, cents handling), status
  semantics, role gates, URL contracts (`?donor=`, `?gift=`), API calls,
  idempotency keys and confirmation flows exactly. Do not change
  `packages/api`, `packages/database` or data shapes.
- TDD for behaviour changes (red → green). Update source-text contract tests
  only when the implementation intentionally changes; keep their intent and
  list each change in your report.

## House style (Maia + ReUI layout rules)

- Page: `PageShell` (title 1–3 words, one-clause description, actions on the
  right: one primary `Button`, others `variant="outline"`, row actions
  `ghost`). Operational density: `size="sm"` on toolbar controls.
- Spacing ladder: `gap-1`–`gap-2` in a row, `gap-3`–`gap-4` between groups,
  `gap-6`–`gap-8` between sections. Siblings use the parent's `gap-*`.
- KPI rows: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`; value
  `text-2xl font-semibold tracking-tight tabular-nums`; label `text-sm
text-muted-foreground`. One container family per screen (Cards for KPIs and
  the grid panel is itself a Card; never a Card inside a Card).
- Status: Core `Badge` variants `success`, `warning`, `info`,
  `destructive-subtle`; neutral ids/tags `outline`. One state badge per row.
- Numbers: `tabular-nums`, money right-aligned. Meta text `text-xs`, never
  smaller. Copy: titles 1–3 words; descriptions ≈ 8 words; labels 1–2 words.
- States per data region: loading (skeleton in the real layout; the panel
  takes `isLoading`), empty (`Empty` with title, one line, one honest action),
  error (inline with Retry; the panel takes `error`). Never a page spinner.
- Dead controls are defects: a button that does nothing or only toasts
  "coming soon" must become honest (disabled with a visible reason, or
  removed with the reason recorded in your report). Never invent behaviour.
- Motion: only what installed components ship; `transition-colors` on hover.
  Respect reduced motion.
- Accessibility: every control named; dialogs/sheets keep Base UI focus
  management; visible focus rings; 24px+ targets; landmark/heading order
  (one h1 per page, h2 per section).

## Verification each implementer runs

- `bunx vitest run --config vitest.config.mts <your test files>` (red first
  for new behaviour, then green), plus every existing test under
  `tests/unit/apps/admin/**` that touches your files.
- `bunx eslint <your changed files>` from the owning package directory
  (`apps/admin` or `packages/ui`) with zero errors.
- `bunx tsc --noEmit -p apps/admin/tsconfig.json` and report only errors in
  your files (other areas are being edited in parallel).
- Browser check against the running dev server (`http://localhost:3030`,
  started with `bun run dev:mission-control`; do not start or stop it). Use
  `docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs` (see its header)
  for screenshots; after editing files wait ~20 s for Turbopack to settle
  before capturing.
