// Vendored ReUI data-grid (registry @reui/data-grid, base-maia build) under
// packages/ui/components/reui/data-grid. Core keeps the registry source close
// to upstream so it can be re-synced; local adaptations are listed in
// packages/ui/components/reui/README.md. These are explicit leaf files, not a
// directory glob: a new vendored file needs its own review.
//
// What stays blocking: raw palette colors and unknown classes (palette values
// were rewritten to semantic tokens on import). What is relaxed, and why:
// - no-restyle / require-static-classes: these files are the grid's own
//   authoring implementation (header menus, pagination, filters) composing
//   Core primitives with the registry's exact geometry.
// - no-inline-styles: TanStack column sizing, pinning offsets and virtual-row
//   measurements are runtime values (same boundary as the shared data-table).
// - no-arbitrary-values: limited to the exact structural values below, which
//   are the grid's pinned-surface, overlay and scrollbar CSS-variable plumbing.
export const reuiDataGridFiles = [
  "components/reui/data-grid/data-grid.tsx",
  "components/reui/data-grid/data-grid-column-filter.tsx",
  "components/reui/data-grid/data-grid-column-header.tsx",
  "components/reui/data-grid/data-grid-column-visibility.tsx",
  "components/reui/data-grid/data-grid-i18n.tsx",
  "components/reui/data-grid/data-grid-pagination.tsx",
  "components/reui/data-grid/data-grid-scroll-area.tsx",
  "components/reui/data-grid/data-grid-table.tsx",
  "components/reui/data-grid/data-grid-table-virtual.tsx",
];

export const reuiDataGridArbitraryValues = [
  "-bottom-[5px]",
  "-end-[5px]",
  "[&:has(+[data-slot=data-grid-table-fill-body-cell]+td[data-pinned])]:[--data-grid-overlay-end:0px]",
  "[&:has(+[data-slot=data-grid-table-fill-body-cell]:last-child)]:[--data-grid-overlay-end:0px]",
  "[&:has(+td[data-pinned])]:[--data-grid-overlay-end:0px]",
  "[&>td]:shadow-[0_-2px_0_color-mix(in_oklab,var(--foreground)_3%,transparent)]",
  "[&>td]:shadow-[0_2px_0_color-mix(in_oklab,var(--foreground)_3%,transparent)]",
  "[&[data-pinned=end][data-last-col=end]]:shadow-[inset_calc(1px*var(--data-grid-dir,1))_0_0_0_var(--border)]",
  "[&[data-pinned=start][data-last-col=start]]:shadow-[inset_calc(-1px*var(--data-grid-dir,1))_0_0_0_var(--border)]",
  "[td[data-pinned]+&]:[--data-grid-overlay-start:0px]",
  "align-[inherit]",
  "before:end-[calc(--spacing(2)-1px)]",
  "dark:[&>td]:shadow-[0_-2px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)]",
  "dark:[&>td]:shadow-[0_2px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)]",
  "dark:bg-[color:var(--data-grid-surface,var(--data-grid-card-surface,var(--background)))]",
  "data-[cell-fill-target]:data-pinned:bg-[color-mix(in_oklab,var(--primary)_4%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "data-[cell-focused]:before:bottom-[var(--data-grid-overlay-bottom,-1px)]",
  "data-[cell-focused]:before:content-['']",
  "data-[cell-focused]:before:end-[var(--data-grid-overlay-end,-1px)]",
  "data-[cell-focused]:before:start-[var(--data-grid-overlay-start,-1px)]",
  "data-[cell-focused]:before:top-[var(--data-grid-overlay-top,-1px)]",
  "data-[cell-focused]:data-pinned:bg-[color:var(--data-grid-surface,var(--data-grid-card-surface,var(--background)))]!",
  "data-[cell-selected]:before:bottom-[var(--data-grid-overlay-bottom,-1px)]",
  "data-[cell-selected]:before:content-['']",
  "data-[cell-selected]:before:end-[var(--data-grid-overlay-end,-1px)]",
  "data-[cell-selected]:before:start-[var(--data-grid-overlay-start,-1px)]",
  "data-[cell-selected]:before:top-[var(--data-grid-overlay-top,-1px)]",
  "data-[cell-selected]:data-pinned:bg-[color-mix(in_oklab,var(--primary)_4%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "data-[cell-status]:after:border-s-[5px]",
  "data-[cell-status]:after:border-t-[5px]",
  "data-[cell-status]:after:content-['']",
  "data-[orientation=horizontal]:h-[var(--data-grid-scrollbar-size,0.625rem)]",
  "data-[orientation=vertical]:w-[var(--data-grid-scrollbar-size,0.625rem)]",
  "data-[row-status=deleted]:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--destructive)_5%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "data-[row-status=dirty]:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--warning)_5%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "data-[row-status=new]:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--success)_5%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "data-[state=selected]:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "data-pinned:bg-[color:var(--data-grid-surface,var(--data-grid-card-surface,var(--background)))]",
  "first:[--data-grid-overlay-start:0px]",
  "h-[calc(--spacing(10)-1px)]",
  "h-[calc(--spacing(8)-1px)]",
  "hover:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--muted)_40%,var(--data-grid-surface,var(--data-grid-card-surface,var(--background))))]",
  "in-[tr:first-child]:[--data-grid-overlay-top:0px]",
  "in-[tr:last-child]:[--data-grid-overlay-bottom:0px]",
  "in-data-[slot=card]:[--data-grid-card-surface:var(--card)]",
  "last:[--data-grid-overlay-end:0px]",
  "leading-[calc(1.125/0.8125)]",
  "max-h-[300px]",
  "min-w-[150px]",
  "rtl:[--data-grid-dir:-1]",
  "shrink-[999]",
  "size-[11px]",
  "size-[5px]",
  "size-[9px]",
  "text-[0.8125rem]",
  "w-[200px]",
  "w-[calc(var(--data-grid-scrollbar-size,0.625rem)-0.1875rem)]",
  "w-[var(--data-grid-scrollbar-size,0.625rem)]",
];
