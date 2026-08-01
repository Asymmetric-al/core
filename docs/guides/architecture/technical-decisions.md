# Technical Decisions

## React Compiler Enablement (Annotation Mode)

### Issue

`react-doctor` reported "React Compiler: Not found" because the compiler was not enabled in app configs and the required Babel plugin was not installed.

### Solution

Enabled React Compiler in gradual opt-in mode across Next.js apps:

- Added `babel-plugin-react-compiler` as a dev dependency at workspace root
- Set `reactCompiler.compilationMode = "annotation"` in:
  - `apps/admin/next.config.ts`
  - `apps/donor/next.config.ts`
  - `apps/missionary/next.config.ts`

Using annotation mode keeps risk low and avoids global behavior changes. Only files explicitly marked with `"use memo"` are compiled.

### Performance Note

This rollout mainly enables compiler infrastructure and resolves "not found" status. Material runtime performance improvements require targeted `"use memo"` adoption in suitable components.

### Date

February 2026

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

- `apps/admin/features/mission-control/components/app-shell/mobile-sidebar.tsx` (since removed — the admin shell now lives in `apps/admin/app/mc-shell.tsx`)
- `apps/admin/features/mission-control/components/app-shell/sidebar-nav.tsx` (since removed — see `apps/admin/app/mc-shell.tsx`)
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

## Read-Model Modules for Admin Dashboard (Ticket 2.2.7)

### Issue

Admin dashboard data and contributions history were UI-mocked and lacked a typed,
cache-aware read-model surface that can evolve cleanly as schema and access
patterns grow.

### Decisions

1. Add read models under `packages/api/src/reads/`:
   - `dashboard-stats.ts`
   - `missionary-metrics.ts`
   - `donor-history.ts`
   - `types.ts` (internal pagination primitives)
2. Use Next.js Cache Components APIs in read models:
   - function-scoped `'use cache'`
   - explicit `cacheLife('minutes')`
   - scoped `cacheTag(...)` keys for future invalidation
3. Keep read-model DB access server-only by calling
   `getAdminClient()` inside read-model functions.
4. Convert admin dashboard root page to a Server Component wrapper that fetches
   stats and renders existing client dashboard UI unchanged.
5. Admin org-wide **Contributions** (`/contributions`) evolved after this note: the
   route is a **client page** (`page.tsx`) using `ContributionsMainBody`,
   `useAdminContributions` (TanStack Query, mock data until a real API exists), and
   optional Boneyard loading. The earlier `contributions-client.tsx` split was
   removed as unused dead code.
6. Skip speculative missionary-detail wiring because no dedicated
   `apps/admin/app/missionaries/[id]/page.tsx` route exists yet.

### Schema Alignment

- Active funds are filtered with `funds.is_active = true` (current schema)
  rather than a non-existent `funds.status = 'active'` column.

### Files Added/Changed

- `packages/api/src/reads/*`
- `packages/api/package.json` exports for `./reads/*`
- `apps/admin/app/(app)/page.tsx`
- `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx`
- `apps/admin/app/(app)/contributions/page.tsx`
- `apps/admin/app/(app)/contributions/main-body.tsx`
- `apps/admin/app/(app)/contributions/use-admin-contributions.ts`
- `tests/unit/packages/api/reads/*.test.ts`

### Date

February 2026
