# Phase 2: Component Migration Plan

**Date:** 2026-01-23  
**Goal:** Move app-specific components OUT of `@asym/ui` package into their respective apps

---

## 🎯 Migration Strategy

### Keep in `packages/ui/` (Pure UI Primitives)

✅ `components/shadcn/` - Reusable UI primitives (buttons, cards, inputs, etc.)
✅ `components/shadcn-studio/` - Design system building blocks
✅ `components/studio/` - Studio tools (Unlayer, PDF, Email)
✅ `lib/` - Shared utilities

### Move to Apps (Feature Components)

#### 1. Move to `apps/admin/components/`

- `mission-control/` → Mission Control app shell & tiles
- `dashboard/` → Dashboard components (activity, stats, tasks)
- `app-header.tsx` → Admin app header
- `app-shell.tsx` → Admin app shell
- `app-sidebar.tsx` → Admin sidebar
- `page-header.tsx` → Page header pattern

#### 2. Move to `apps/missionary/components/`

- `feed/` → Social feed components
- `public/` → Public-facing components (navbar, footer, home sections)

#### 3. Move to `apps/donor/components/`

- `donor/` → Donor-specific components (SubNav, ImpactTile, MissionBriefing)
- `dashboard-footer.tsx` → Donor dashboard footer

#### 4. Shared Component (Needs Decision)

- `brand-logo.tsx` → Could stay in `@asym/ui` if truly shared, or move to each app

---

## 📋 Migration Steps

### Step 1: Create components directories in apps

```bash
mkdir -p apps/admin/components
mkdir -p apps/missionary/components
mkdir -p apps/donor/components
```

### Step 2: Move mission-control to admin

```bash
mv packages/ui/components/mission-control apps/admin/components/
```

### Step 3: Move dashboard to admin

```bash
mv packages/ui/components/dashboard apps/admin/components/
```

### Step 4: Move feed to missionary

```bash
mv packages/ui/components/feed apps/missionary/components/
```

### Step 5: Move public to missionary

```bash
mv packages/ui/components/public apps/missionary/components/
```

### Step 6: Move donor components

```bash
mv packages/ui/components/donor apps/donor/components/
```

### Step 7: Move individual files

```bash
# Admin
mv packages/ui/components/app-header.tsx apps/admin/components/
mv packages/ui/components/app-shell.tsx apps/admin/components/
mv packages/ui/components/app-sidebar.tsx apps/admin/components/
mv packages/ui/components/page-header.tsx apps/admin/components/

# Donor
mv packages/ui/components/dashboard-footer.tsx apps/donor/components/

# Decide on brand-logo.tsx
```

### Step 8: Update all imports

- Change `@asym/ui/components/mission-control/*` → `@/components/mission-control/*` in admin
- Change `@asym/ui/components/dashboard/*` → `@/components/dashboard/*` in admin
- Change `@asym/ui/components/feed/*` → `@/components/feed/*` in missionary
- Change `@asym/ui/components/public/*` → `@/components/public/*` in missionary
- Change `@asym/ui/components/donor/*` → `@/components/donor/*` in donor

### Step 9: Update package exports

Remove moved components from `packages/ui/components/index.ts` or individual index files

### Step 10: Verify

```bash
turbo run typecheck
turbo run build
```

---

## 🔍 Impact Analysis

**Files to update after migration:**

- All pages in `apps/admin/app/` that import mission-control or dashboard components
- All pages in `apps/missionary/app/` that import feed or public components
- All pages in `apps/donor/app/` that import donor components
- `packages/ui/components/index.ts` - Remove exports
- Individual component index files

**Estimated files affected:** 50-100 files across all apps

---

## ✅ Migration Complete

**Completion Date:** 2026-01-23

### Final Status

All components have been successfully migrated and all apps typecheck with **0 errors**:

- ✅ **Admin App:** 0 typecheck errors
- ✅ **Missionary App:** 0 typecheck errors
- ✅ **Donor App:** 0 typecheck errors
- ✅ **UI Package:** 0 typecheck errors (only unused import warnings)

### What Was Done

1. **Moved app-specific components** from `packages/ui/` to their respective apps
2. **Fixed all imports** in moved components to use `@asym/ui` for shadcn components
3. **Fixed all imports** in apps to use `@/components/*` for local components
4. **Copied shared components** (app-shell, app-header, app-sidebar, page-header, dashboard-footer) to apps that need them
5. **Fixed mission-control imports** to use `@asym/lib/mission-control/*` instead of `@/lib/mission-control/*`
6. **Fixed feed component imports** to use `@asym/database/types` for database types
7. **Added missing exports** to `@asym/database/types/index.ts` (PostWithAuthor, MediaItem)
8. **Removed unused imports** and fixed type annotations

### Architecture Now Correct

**`packages/ui/` contains ONLY:**

- ✅ Pure UI primitives (shadcn components)
- ✅ Design system components (shadcn-studio)
- ✅ Studio tools (Unlayer, PDF, Email)
- ✅ Shared public components (navbar, footer) used by multiple apps
- ✅ Shared utilities

**Apps contain:**

- ✅ Feature components with business logic
- ✅ App-specific layouts and shells
- ✅ Dashboard and mission-control components

### Scripts Created

- `scripts/fix-component-imports.sh` - Bulk update imports in apps
- `scripts/fix-moved-component-imports.sh` - Fix imports in moved components
- `scripts/remove-ts-nocheck.sh` - Remove temporary type-checking suppressions

### Next Steps

Phase 2 is now **COMPLETE**. Ready to proceed to:

- **Phase 3:** Build Optimization (JIT vs Compiled strategy)
- **Phase 4:** Environment Variables documentation
