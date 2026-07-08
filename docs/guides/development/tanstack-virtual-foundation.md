# TanStack Virtual Foundation

This guide defines the repo-standard virtualization contract for tables, grids, and long lists.

## Scope

- Works with `@tanstack/react-virtual@^3.13.23`
- Authoritative docs: `https://tanstack.com/virtual/latest`
- Unchanged by the TanStack Table v9 migration: tables now run `@tanstack/react-table@9.0.0-beta.9` behind the boundary module `packages/ui/components/shadcn/data-table/tanstack.ts`, but `react-virtual` stays on v3 and the `VirtualizationConfig` contract below is the same. Virtualization remains a rendering-only layer that never touches engine state (see `docs/guides/development/tanstack-integration.md`).
- Uses shared hook in `@asym/ui`:
  - `useDataTableVirtualization`
  - `resolveVirtualizationConfig`
- Applies to:
  - `DataTable`
  - `DataTableResponsive`
  - `DataGrid`
  - custom list UIs in app code

## Shared Config Contract

Use `virtualization` object config for all new work:

```ts
type VirtualizationConfig = {
  enabled?: boolean;
  estimateSize?: number;
  overscan?: number;
  containerHeight?: number | string;
  getItemKey?: (index: number) => string | number;
};
```

### Defaults

- `enabled`: `false` for table/list views unless explicitly enabled
- `enabled`: `true` in `DataGrid` legacy behavior
- `estimateSize`: `56` for table rows unless domain-specific
- `overscan`: `8` for table/list, `5-10` for grids depending density
- `containerHeight`: `640` unless constrained by layout

## Legacy Compatibility

The shared resolver keeps old props working:

- `enableVirtualization`, `virtualizeRows` -> `virtualization.enabled`
- `virtualRowHeight`, `rowHeight` -> `virtualization.estimateSize`
- `virtualOverscan` -> `virtualization.overscan`
- `virtualContainerHeight`, `maxHeight` -> `virtualization.containerHeight`

Use legacy fields only when touching old call sites gradually. New call sites should use `virtualization`.

## Virtualizer Toggle Semantics (v3)

- `virtualization.enabled` maps to TanStack Virtual's `enabled` option in `@tanstack/react-virtual@^3.13.23`.
- Keep `count` equal to the real item length. Disable virtualization with `enabled: false` rather than forcing `count` to `0`.
- `enabled: false` resets virtualizer state (observers, scroll offset, and measurement cache).
- Keep the same scroll container ref mounted regardless of `enabled` state; avoid conditional ref attach/detach.
- Treat virtualization mode as stable for the lifecycle of a mounted component. If runtime toggles are required, expect scroll position reset.

## Patterns by Surface

### 1) Data Table / Responsive Table

- Keep TanStack Table row model as source of truth.
- Virtualize row rendering only.
- Use row ID as item key (not array index).
- Prefer `getRowId` on shared table surfaces so selection state, URL state, and virtual keys survive sort/filter/pagination changes.
- Keep row focus and row actions independent from the virtualizer; virtualization should not own selection or action targeting.
- Prefer `DataTableResponsive` for table-like lists that previously used custom virtualized cards.

```tsx
const getRowKey = React.useCallback(
  (index: number) => rows[index]?.id ?? index,
  [rows],
);
```

### 2) Data Grid

- Use shared hook for vertical row virtualization.
- Keep selection/editing state independent from virtualization state.
- Remove anti-pattern directives like `"use no memo"`.

### 3) Custom Lists

- Hook must target the real scroll element.
- For the shared `ScrollArea` (Base UI), locate the viewport element and pass that to the hook.
- For dynamic-height list items, call `virtualizer.measureElement` on item wrappers.

## Performance Guardrails

- Stabilize `getItemKey` with `useCallback`.
- Keep `estimateSize` realistic to reduce jump during first measurements.
- Use `overscan` in moderate range (usually `6-12`).
- Keep sticky headers outside the virtualized row window.
- Disable complex entrance animations when virtualized.
- Avoid per-row infinite animations in virtualized branches; reserve richer motion for non-virtualized rendering paths.
- Avoid creating new `columns` arrays and render callbacks on every render.

## Do / Don’t

- **Do** keep data fetching logic in Query/DB hooks.
- **Do** treat virtualization as rendering optimization only.
- **Do** keep API-compatible fallbacks while migrating legacy screens.
- **Don’t** couple virtualization decisions to fetch policy.
- **Don’t** use array index as stable key when ID exists.
- **Don’t** enable virtualization by default on tiny lists.

## Testing Checklist

- [ ] Smooth scroll with no blank gaps on large datasets
- [ ] Selection/hover state remains correct while scrolling
- [ ] Row actions still target correct item IDs
- [ ] Keyboard focus remains visible and lands on the correct row after arrow/page navigation
- [ ] Filters/sort/search still produce accurate list contents
- [ ] Empty/loading/error states are unaffected
- [ ] Lint/typecheck/unit tests pass for touched workspaces
