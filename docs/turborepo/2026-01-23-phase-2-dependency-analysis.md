# Phase 2: Dependency Analysis

**Date:** 2026-01-23  
**Status:** Analysis Complete  
**Next:** Create Migration Plan

---

## Executive Summary

Analyzed 7,336 TypeScript/JavaScript files across 6 packages and 3 apps.

**Key Findings:**

- **@asym/ui** uses 81 unique dependencies (HIGHEST)
- **@asym/auth** uses 4 dependencies (LOWEST)
- **@asym/database** uses 10 dependencies
- **@asym/lib** uses 9 dependencies
- **@asym/email** uses 2 dependencies
- **@asym/config** uses 1 dependency

**Apps:**

- **admin** uses 43 dependencies
- **missionary** uses 30 dependencies
- **donor** uses 24 dependencies

---

## Package-by-Package Breakdown

### 1. @asym/auth (4 dependencies)

**Used:**

- `@supabase/ssr`
- `@supabase/supabase-js`
- `next/headers`
- `react`

**Risk:** ✅ LOW - Small, focused package

---

### 2. @asym/config (1 dependency)

**Used:**

- `lucide-react`

**Risk:** ✅ LOW - Minimal dependencies

---

### 3. @asym/email (2 dependencies)

**Used:**

- `@sendgrid/mail`

**Risk:** ✅ LOW - Focused on email functionality

---

### 4. @asym/lib (9 dependencies)

**Used:**

- `@sentry/nextjs`
- `@stripe/stripe-js`
- `@supabase/supabase-js`
- `crypto` (Node.js built-in)
- `next`
- `next/server`
- `react`
- `sonner`
- `web-vitals`

**Risk:** ⚠️ MEDIUM - Mix of server and client utilities

---

### 5. @asym/database (10 dependencies)

**Used:**

- `@supabase/ssr`
- `@supabase/supabase-js`
- `@tanstack/db`
- `@tanstack/query-db-collection`
- `@tanstack/react-db`
- `@tanstack/react-query`
- `@tanstack/react-query-devtools`
- `next/headers`
- `next/server`
- `react`

**Risk:** ⚠️ MEDIUM - TanStack + Supabase integration

---

### 6. @asym/ui (81 dependencies) 🔥

**Used:**

- All 25 `@radix-ui/*` packages
- `@tiptap/*` (4 packages)
- `@tanstack/react-*` (4 packages)
- `@supabase/supabase-js`
- `class-variance-authority`
- `clsx`
- `cmdk`
- `date-fns`
- `input-otp`
- `lucide-react`
- `maplibre-gl`
- `motion/react`
- `next-themes`
- `next/*` (dynamic, image, link, navigation)
- `nuqs`
- `react`
- `react-day-picker`
- `react-dom`
- `react-easy-crop`
- `react-email-editor`
- `react-resizable-panels`
- `recharts`
- `sonner`
- `tailwind-merge`
- `vaul`

**Risk:** 🔴 HIGH - Largest package, most dependencies

---

## Apps Analysis

### admin (43 dependencies)

**Unique to admin:**

- `@dnd-kit/utilities`
- `@hookform/resolvers/zod`
- `@radix-ui/react-visually-hidden`
- `react-hook-form`
- `zod`

### missionary (30 dependencies)

**Unique to missionary:**

- `@dnd-kit/utilities`
- `@hookform/resolvers/zod`
- `react-hook-form`
- `zod`

### donor (24 dependencies)

**Unique to donor:**

- `@radix-ui/react-tabs`

---

## Shared Dependencies (Used by Multiple Packages)

| Dependency              | Used By                              | Count |
| ----------------------- | ------------------------------------ | ----- |
| `react`                 | ALL                                  | 7     |
| `sonner`                | ui, lib, admin, missionary, donor    | 5     |
| `lucide-react`          | ui, config, admin, missionary, donor | 5     |
| `next`                  | lib, admin, missionary, donor        | 4     |
| `next-themes`           | ui, admin, missionary, donor         | 4     |
| `date-fns`              | ui, admin, missionary, donor         | 4     |
| `recharts`              | ui, admin, missionary, donor         | 4     |
| `@tanstack/react-query` | database, ui, admin, donor           | 4     |
| `@supabase/supabase-js` | auth, database, lib, ui              | 4     |
| `@supabase/ssr`         | auth, database, missionary           | 3     |
| `@tanstack/react-table` | ui, admin, donor                     | 3     |

---

## Next Steps

See `2026-01-23-phase-2-migration-plan.md` for the detailed migration strategy.
