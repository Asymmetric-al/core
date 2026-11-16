# Vendored ReUI components

This folder holds ReUI registry components vendored into `@asym/ui`. ReUI is
the shadcn-compatible registry at <https://reui.io>. Treat each file as
upstream output that has been adapted once to Core's `base-maia` contract.
Do not restyle these files in place. Compose around them instead.

## `data-grid/`

| Field              | Value                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registry item      | `@reui/data-grid` (base-maia build)                                                                                                                                                                               |
| Retrieved with     | `bunx --bun shadcn@4.22.1 add @reui/data-grid --dry-run --view <file>` from `packages/ui`                                                                                                                         |
| Engine             | TanStack Table v9 (`@tanstack/react-table`, already a `packages/ui` dependency; nothing new installed)                                                                                                            |
| Files vendored     | `data-grid`, `data-grid-i18n`, `data-grid-table`, `data-grid-table-virtual`, `data-grid-pagination`, `data-grid-column-header`, `data-grid-column-filter`, `data-grid-column-visibility`, `data-grid-scroll-area` |
| Files not vendored | Row and column drag-and-drop (`data-grid-table-dnd*`, which need `@dnd-kit`) and cell selection, because no Core surface needs them                                                                               |
| Reference example  | `c-data-grid-22` (a CRUD admin grid in a Card), as composed by `components/data-grid-panel`                                                                                                                       |

### Local adaptations

These are the only intentional differences from the registry output.
Everything else is Prettier and ESLint `--fix` import ordering.

1. **Imports.** The registry aliases were rewritten to package-relative paths:
   - `cn` → `@asym/ui/lib/utils`
   - `@/components/shadcn/*` → `../../shadcn/*`
   - `@/components/reui/badge` → `../../shadcn/badge`
   - `@/components/reui/data-grid/*` → `./*`
2. **Semantic tokens instead of palette colours** (design-system lint
   `shadcn/no-raw-colors`):
   - `amber-500` → `warning`
   - `green-500` → `success`
   - `var(--color-amber-500)` → `var(--warning)`
   - `var(--color-green-500)` → `var(--success)`
   - The `rgba(...)` row shadows → `color-mix(in_oklab,var(--foreground)_3%|6%,transparent)`
3. **Static class strings.** The pagination button classes were made static
   (`shadcn/require-static-classes`).
4. **Type hygiene.** Unused bindings were renamed or removed: `rowId: _rowId`,
   the unused `table` prop on the skeleton row, and the unused `<TData>`
   generics on `DataGridTableHeader` and `DataGridTable`.

5. **Base UI menu items.** The column visibility and header menus passed a
   Radix-era `onSelect={(event) => event.preventDefault()}` to
   `DropdownMenuCheckboxItem` to keep the menu open. Base UI has no
   `onSelect`, and its checkbox items already default to
   `closeOnClick={false}`, so the line was removed. The repository contract
   `tests/unit/packages/ui/base-ui-menu-item-handlers.test.ts` enforces this.

6. **Column filter slot.** The header menu rendered the optional `filter`
   control as a `DropdownMenuLabel` in a group of its own. A Base UI group
   label names a group of items, so a control there is not a label; it now
   sits in a padded `data-slot="data-grid-column-filter"` container. The
   contract `tests/unit/packages/ui/base-ui-overlay-consumers.test.ts`
   enforces label placement.

7. **Named column filter.** `DataGridColumnFilter`'s popover is a dialog
   with no name, and its search box was labelled only by a placeholder set
   to the filter title. The popover is now named "Filter by {title}", and
   the search box has an `aria-label` ("Search {title} options") with a
   "Search {title}…" placeholder.

### Lint exception

The files keep upstream's class-heavy styling, inline CSS variables and
`@tanstack/react-table` imports. A narrow, explicit exception in
`tooling/eslint-config/design-system-exceptions.mjs` allows this. It lists
the files, and the exact allowed arbitrary values, in
`tooling/eslint-config/reui-data-grid-exceptions.mjs`. If a refresh brings
in a new arbitrary value, the exception makes lint fail. Review the value
before you add it.

## How apps use the grid

Apps do not import from this folder directly, except for the column helpers
listed below. They use the Core composition at
`@asym/ui/components/data-grid-panel`. It provides:

- **`DataGridPanel`:** the Card shell, toolbar row, selection bar, error and
  empty states, mobile row list, virtual and paginated bodies, and row
  keyboard navigation.
- **Toolbar parts:** `DataGridSearch`, `DataGridViewOptions`,
  `DataGridViewToggle` (table or card view), `DataGridResetFilters` and
  `DataGridSelectionBar`.
- **`createDataGridSelectionColumn`:** a select-all header and one checkbox
  per row, named after its record.
- **`DataGridRowPrimary`:** the single named control for each row.
- **The engine boundary** `data-grid-engine.ts`: `useTable`, `filterFn_*`
  and the typed aliases bound to `dataGridFeatures`.

The column helpers apps may import from here are `DataGridColumnHeader`,
`DataGridColumnFilter` and `DataGridTableRowSelect(All)`. Tests live in
`tests/unit/packages/ui/data-grid-panel.test.tsx`.

## Refreshing from upstream

1. Stage the new registry output outside the repo, for example with
   `--dry-run --view`.
2. Diff the staged output against these files, and reapply the adaptations
   listed above.
3. Run `node tooling/eslint-config/lint.mjs components/reui/data-grid/*.tsx`
   from `packages/ui`, then the panel tests.
4. Check the CRM, Contributions and Web Studio grids in the browser. Their
   capture harness is `docs/qa/admin-workspaces-hillclimb/`.
