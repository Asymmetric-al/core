# UI Inventory

This document tracks the implementation status of key UI surfaces and components across the application.

## Mission Control Dashboard (Admin)

- [x] **Sidebars** — Status: done | Path: `apps/admin/app/mc-shell.tsx`
- [x] **Animated Icons** — Status: done | Path: `packages/ui/components/shadcn/icons/AppIcon.tsx`
- [x] **App Shell** — Status: done | Path: `apps/admin/app/mc-shell.tsx`
- [x] **Dashboard Landing / Widget Canvas** — Status: done | Path: `apps/admin/features/mission-control/components/tiles/mission-control-home.tsx`
- [x] **Dashboard Health Charts** — Status: done | Path: `apps/admin/features/mission-control/components/tiles/mission-control-home.tsx`
- [x] **Tiles / Dashboard Home** — Status: done | Path: `apps/admin/features/mission-control/components/tiles/`
- [x] **Tables** — Status: done | Path: `packages/ui/components/shadcn/data-table/`
- [ ] **Filters** — Status: planned | Path: `src/components/ui/data-table/filters/`
- [x] **Empty States** — Status: done | Path: `src/components/mission-control/patterns/Skeletons.tsx` (Partially covers empty/loading)
- [x] **Settings forms** — Status: in progress | Path: `src/app/(admin)/mc/settings/`
- [x] **Charts / KPI Wrappers** — Status: done | Path: `packages/ui/components/primitives/chart-wrappers.tsx`
- [ ] **Task boards** — Status: planned | Path: `src/app/(admin)/mc/tasks/`
- [x] **Modals / Drawers** — Status: done | Path: `src/components/mission-control/patterns/DetailsDrawer.tsx`

## Missionary Dashboard

- [x] **Dashboard Home** — Status: done | Path: `src/features/missionary/components/dashboard-home.tsx`
- [x] **Metric Tiles** — Status: done | Path: `src/components/ui/chart-wrappers.tsx` (KpiTile)
- [x] **Charts (Giving Breakdown)** — Status: done | Path: `src/components/ui/chart-wrappers.tsx` (ChartCard)
- [x] **Activity Feed** — Status: done | Path: `src/features/missionary/components/activity-feed.tsx`
- [x] **Task Management** — Status: done | Path: `src/features/missionary/components/tasks-preview.tsx`
- [ ] **Tables** — Status: planned | Path: `TBD`
- [ ] **Filters** — Status: planned | Path: `TBD`
- [ ] **Empty States** — Status: planned | Path: `TBD`
- [ ] **Settings forms** — Status: planned | Path: `apps/missionary/app/settings/`
- [ ] **Modals** — Status: planned | Path: `src/features/missionary/components/task-dialog.tsx`

## Public Tenant Website

- [ ] **Home Page** — Status: planned | Path: `src/app/(public)/`
- [ ] **About Page** — Status: planned | Path: `src/app/(public)/about/`
- [ ] **FAQ** — Status: planned | Path: `src/app/(public)/faq/`
- [ ] **Checkout / Giving** — Status: in progress | Path: `src/app/(public)/checkout/`
- [ ] **Financials** — Status: planned | Path: `src/app/(public)/financials/`
- [ ] **Workers / Missionary List** — Status: planned | Path: `src/app/(public)/workers/`

---

## Maintenance

When a new component is implemented or moved:

1. Update the **Status** to `done`.
2. Provide the exact **Path** to the component file or directory.
3. Ensure the component follows the `_intake` adaptation workflow if applicable.

## Mission Control dashboard style notes

- Treat the top Mission Control route as a customizable command-center canvas:
  overview metrics first, then ministry-health chart widgets, then role-aware
  quick actions and modules.
- Preserve the Maia/Zinc token system. Use semantic Tailwind token classes and
  chart CSS variables (`--chart-*`) rather than hardcoded palette values.
- Keep chart widgets explanatory: every chart needs a title, a short context
  line, and labels that describe existing operational concepts without
  inventing unsupported trends.
- Dashboard customization is currently presented as a product-ready UI pattern
  (role-aware widgets, layout presets, and tool availability). Persisted widget
  preferences should be added behind the normal server-side permissions and
  tenant boundaries when the product chooses to store them.
