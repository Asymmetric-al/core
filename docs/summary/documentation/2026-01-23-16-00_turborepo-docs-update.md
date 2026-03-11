# Documentation Update for Turborepo Migration

**Date:** 2026-01-23 16:00  
**Task:** Update all documentation to reflect Turborepo monorepo structure  
**Status:** ✅ COMPLETE

---

## Summary

Updated all documentation files to reflect the current Turborepo monorepo structure with `apps/` and `packages/` instead of the old single-app structure with `src/`.

---

## Problem

After the Turborepo migration, the documentation still referenced the old single-app structure:

- Old paths like `src/app/`, `src/components/`, `src/features/`
- Old import patterns from `@/lib/`, `@/components/`
- Old commands like `bun run dev` instead of `turbo run dev`
- No mention of the monorepo structure with 3 apps and 6 packages

This caused confusion for developers trying to understand the codebase structure.

---

## Changes Made

### 1. **Architecture Overview** (`docs/guides/architecture/overview.md`) ✅

**Updated:**

- Directory structure to show Turborepo monorepo with `apps/` and `packages/`
- Module organization to explain package architecture
- Import guidelines to show package imports (`@asym/ui`, `@asym/lib`, etc.)
- Supabase client usage to import from `@asym/database`
- TanStack DB collections to import from `@asym/database/collections`
- API route pattern to show app-specific paths
- Component structure to show package imports
- Responsive design to import from `@asym/lib`
- Path aliases to show both app-specific (`@/*`) and package imports
- Environment variables section to note they're app-specific
- Common commands to use Turborepo commands

**Key Changes:**

- Added complete Turborepo structure showing all 3 apps and 6 packages
- Updated all import examples to use package imports
- Added Turborepo commands with `--filter` flag examples

---

### 2. **Technical Decisions** (`docs/guides/architecture/technical-decisions.md`) ✅

**Updated:**

- TanStack Table file paths: `src/components/ui/data-table/` → `packages/ui/components/shadcn/data-table/`
- Tiptap extensions file path: `src/components/ui/rich-text-editor/` → `packages/ui/components/shadcn/rich-text-editor/`
- Dynamic icon components file paths: `src/features/mission-control/` → `apps/admin/features/mission-control/`
- Client-only rendering file paths: `src/features/` → `apps/admin/features/` and `apps/donor/features/`

---

### 3. **Getting Started Guide** (`docs/guides/development/getting-started.md`) ✅

**Updated:**

- Common commands to use Turborepo commands (`turbo run dev`, `turbo run build --filter=admin`)
- Project structure to show complete Turborepo monorepo structure
- Package architecture section explaining internal packages
- App-specific feature module structure
- Import conventions to show package imports vs app-specific imports
- Page structure to show app-specific paths
- Responsive design to import from `@asym/lib`
- "Adding a New Page" section to specify which app and show all 3 apps
- "Adding a New Component" section to distinguish shared vs app-specific
- "Working with Mock Data" section to note it's app-specific
- "Common Tasks" section with Turborepo commands and `--filter` examples
- "Getting Help" section with updated doc paths

**Key Changes:**

- Added complete Turborepo structure with all apps and packages
- Added step to choose which app when creating new pages
- Added Turborepo-specific commands throughout
- Updated all file paths to reflect monorepo structure

---

### 4. **Contributing Guide** (`docs/guides/development/contributing.md`) ✅

**Updated:**

- "Creating New Components" to show both package and app-specific paths
- "Creating New Features" to show app-specific paths
- "Creating New API Routes" to show app-specific paths
- Loading.tsx reference to show app-specific path

---

### 5. **Mock Data Guide** (`docs/guides/development/mock-data.md`) ✅

**Updated:**

- Overview to note mock data is per-app
- File paths from `src/app/` to `apps/[app-name]/app/`
- Import examples to use `@asym/database/supabase/server`
- File list to show app-specific paths
- Remove mock data commands to remove from each app
- Type reference to show app-specific path
- Quick deployment guide to show app-specific paths
- Support section to update doc paths

---

### 6. **TanStack Integration Guide** (`docs/guides/development/tanstack-integration.md`) ✅

**Updated:**

- Provider setup to import from `@asym/database/providers`
- File structure to show `packages/database/` structure
- TanStack Table section to show `packages/ui/components/shadcn/data-table/`
- Import examples to use `@asym/ui`

---

## Current Turborepo Structure

```
core/
├── apps/                       # Next.js applications
│   ├── admin/                 # Mission Control (admin dashboard)
│   ├── missionary/            # Missionary dashboard
│   └── donor/                 # Donor portal
├── packages/                  # Shared packages
│   ├── auth/                 # @asym/auth
│   ├── config/               # @asym/config
│   ├── database/             # @asym/database
│   ├── email/                # @asym/email
│   ├── lib/                  # @asym/lib
│   └── ui/                   # @asym/ui
├── tooling/                  # Build tooling
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json                # Turborepo configuration
└── package.json              # Root package
```

---

## Files Updated

1. ✅ `docs/guides/architecture/overview.md` (423 lines)
2. ✅ `docs/guides/architecture/technical-decisions.md` (120 lines)
3. ✅ `docs/guides/development/getting-started.md` (407 lines)
4. ✅ `docs/guides/development/contributing.md` (partial updates)
5. ✅ `docs/guides/development/mock-data.md` (214 lines)
6. ✅ `docs/guides/development/tanstack-integration.md` (218 lines)

---

## Impact

- ✅ All documentation now accurately reflects the Turborepo monorepo structure
- ✅ Developers can follow the docs to understand the current codebase
- ✅ Import examples show correct package imports
- ✅ Commands use Turborepo CLI with proper filters
- ✅ File paths are accurate for the current structure

---

**Status:** COMPLETE - All documentation is now up-to-date with the Turborepo migration! 🎉
