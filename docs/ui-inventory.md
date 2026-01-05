# UI Inventory

This document tracks the implementation status of key UI surfaces and components across the application.

## Mission Control Dashboard (Admin)
- [x] **Sidebars** — Status: done | Path: `src/features/mission-control/components/sidebar-nav.tsx`
- [x] **Animated Icons** — Status: done | Path: `src/components/ui/icons/AppIcon.tsx`
- [x] **App Shell** — Status: done | Path: `src/components/mission-control/app-shell/AppShell.tsx`
- [x] **Tiles / Dashboard Home** — Status: done | Path: `src/components/mission-control/tiles/MissionControlHome.tsx`
- [x] **Tables** — Status: done | Path: `src/components/ui/data-table/`
- [ ] **Filters** — Status: planned | Path: `src/components/ui/data-table/filters/`
- [x] **Empty States** — Status: done | Path: `src/components/mission-control/patterns/Skeletons.tsx` (Partially covers empty/loading)
- [x] **Settings forms** — Status: in progress | Path: `src/app/(admin)/mc/settings/`
- [x] **Charts / KPI Wrappers** — Status: done | Path: `src/components/ui/chart-wrappers.tsx`
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
- [ ] **Settings forms** — Status: planned | Path: `src/app/(missionary)/missionary-dashboard/settings/`
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
