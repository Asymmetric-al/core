# Technical Decisions

## TanStack Table + React Compiler Compatibility

### Issue

TanStack Table (v8.x) is not fully compatible with the React Compiler's automatic memoization. The library uses internal state patterns that conflict with the compiler's optimization strategies, potentially causing runtime errors or unexpected behavior.

### Solution

Applied the `"use no memo"` directive to components using `useReactTable`:

- `packages/ui/components/shadcn/data-table/data-table.tsx`
- `packages/ui/components/shadcn/data-grid/data-grid.tsx`

This directive tells the React Compiler to skip automatic memoization for these specific files, allowing TanStack Table to manage its own reactivity.

### References

- [TanStack Table React Adapter Docs](https://tanstack.com/table/latest/docs/framework/react/react-table)
- [React Compiler opt-out directives](https://react.dev/learn/react-compiler#opting-out)

### Date

December 2024

## Tiptap StarterKit Extensions (v3)

### Issue

Tiptap v3's StarterKit now includes Link and Underline extensions by default. Registering them separately causes "Duplicate extension names" warnings.

### Solution

Configure Link extension through StarterKit.configure() instead of registering separately:

```ts
StarterKit.configure({
  link: {
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary underline cursor-pointer",
    },
  },
});
```

### Files Modified

- `packages/ui/components/shadcn/rich-text-editor/extensions.ts`

### Date

December 2024

## Dynamic Icon Components Pattern

### Issue

React Compiler's `react-hooks/static-components` rule flags components created during render (e.g., via `useMemo(() => getIcon(...))`). This causes components to reset their state on each render.

### Solution

Call `getIcon()` directly without wrapping in `useMemo`, storing the result in a regular const:

```ts
// Instead of:
const Icon = useMemo(() => getIcon(item.icon), [item.icon]);

// Use:
const IconComponent = getIcon(item.icon);
```

### Files Modified

- `apps/admin/features/mission-control/components/app-shell/mobile-sidebar.tsx`
- `apps/admin/features/mission-control/components/app-shell/sidebar-nav.tsx`
- `apps/admin/features/mission-control/components/tiles/tile-card.tsx`

### Date

December 2024

## Client-Only Rendering Pattern

### Issue

Using `useState` + `useEffect` for client-only rendering triggers `react-hooks/set-state-in-effect` warnings.

### Solution

Use `useSyncExternalStore` which is the React 18+ recommended approach:

```ts
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function ClientOnly({ children, fallback }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  return isClient ? children : fallback;
}
```

### Files Modified

- `apps/admin/features/mission-control/components/client-only.tsx`
- `apps/donor/features/donor/components/DashboardUI.tsx`

### Date

December 2024
