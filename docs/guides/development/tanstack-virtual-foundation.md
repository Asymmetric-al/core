# TanStack Virtual Foundation

This guide defines the repo-standard virtualization contract for tables, grids, and long lists.

## Scope

- Works with `@tanstack/react-virtual@^3.13.19`
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

## Patterns by Surface

### 1) Data Table / Responsive Table

- Keep TanStack Table row model as source of truth.
- Virtualize row rendering only.
- Use row ID as item key (not array index).

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
- For Radix `ScrollArea`, locate the viewport element and pass that to the hook.
- For dynamic-height list items, call `virtualizer.measureElement` on item wrappers.

## Performance Guardrails

- Stabilize `getItemKey` with `useCallback`.
- Keep `estimateSize` realistic to reduce jump during first measurements.
- Use `overscan` in moderate range (usually `6-12`).
- Disable complex entrance animations when virtualized.
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
- [ ] Filters/sort/search still produce accurate list contents
- [ ] Empty/loading/error states are unaffected
- [ ] Lint/typecheck/unit tests pass for touched workspaces
