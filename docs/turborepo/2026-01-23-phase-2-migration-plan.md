# Phase 2: Dependency Migration Plan

**Date:** 2026-01-23  
**Status:** Ready to Execute  
**Risk Level:** 🔴 HIGH - Test thoroughly after each step

---

## Migration Strategy

**Approach:** Incremental, low-risk-first migration

**Order:**

1. ✅ Lowest risk packages first (config, email, auth)
2. ⚠️ Medium risk packages (lib, database)
3. 🔴 Highest risk package last (ui)
4. 🔴 Apps last (admin, missionary, donor)

**After each step:**

- Run `bun install`
- Run `bunx turbo run typecheck lint`
- Run `bunx turbo run build`
- Test manually if needed

---

## Step 1: @asym/config (LOWEST RISK)

**Dependencies to add:**

```json
{
  "dependencies": {
    "lucide-react": "^0.554.0"
  }
}
```

**Risk:** ✅ MINIMAL - Only 1 dependency

---

## Step 2: @asym/email (LOW RISK)

**Dependencies to add:**

```json
{
  "dependencies": {
    "@sendgrid/mail": "^8.1.6"
  }
}
```

**Risk:** ✅ LOW - Focused package

---

## Step 3: @asym/auth (LOW RISK)

**Dependencies to add:**

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "react": "19.2.3"
  }
}
```

**Note:** `next/headers` is part of Next.js, no need to add

**Risk:** ✅ LOW - Core auth package

---

## Step 4: @asym/lib (MEDIUM RISK)

**Dependencies to add:**

```json
{
  "dependencies": {
    "@sentry/nextjs": "^10.32.1",
    "@stripe/stripe-js": "^5.3.0",
    "@supabase/supabase-js": "^2.89.0",
    "next": "16.1.1",
    "react": "19.2.3",
    "sonner": "^2.0.7",
    "web-vitals": "^4.2.4"
  }
}
```

**Risk:** ⚠️ MEDIUM - Mix of server/client utilities

---

## Step 5: @asym/database (MEDIUM RISK)

**Dependencies to add:**

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "@tanstack/db": "^0.5.16",
    "@tanstack/query-db-collection": "^1.0.12",
    "@tanstack/react-db": "^0.1.60",
    "@tanstack/react-query": "^5.90.15",
    "@tanstack/react-query-devtools": "^5.90.15",
    "next": "16.1.1",
    "react": "19.2.3"
  }
}
```

**Risk:** ⚠️ MEDIUM - TanStack integration

---

## Step 6: @asym/ui (HIGHEST RISK) 🔥

**Dependencies to add:**

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/supabase-js": "^2.89.0",
    "@tanstack/react-db": "^0.1.60",
    "@tanstack/react-query": "^5.90.15",
    "@tanstack/react-table": "^8.21.3",
    "@tanstack/react-virtual": "^3.13.13",
    "@tiptap/extension-image": "^3.14.0",
    "@tiptap/extension-placeholder": "^3.14.0",
    "@tiptap/react": "^3.14.0",
    "@tiptap/starter-kit": "^3.14.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.554.0",
    "maplibre-gl": "^5.15.0",
    "motion": "^12.23.26",
    "next": "16.1.1",
    "next-themes": "^0.4.6",
    "nuqs": "^2.8.6",
    "react": "19.2.3",
    "react-day-picker": "^9.11.2",
    "react-dom": "19.2.3",
    "react-easy-crop": "^5.5.6",
    "react-email-editor": "^1.7.11",
    "react-resizable-panels": "^3.0.6",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "vaul": "^1.1.2"
  }
}
```

**Risk:** 🔴 HIGH - 56 dependencies, most critical package

---

## Step 7-9: Apps (admin, missionary, donor)

**Note:** Apps will inherit most dependencies from packages via `workspace:*`.

**Additional dependencies needed per app:**

### admin

```json
{
  "dependencies": {
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-visually-hidden": "^1.1.0",
    "react-hook-form": "^7.66.1",
    "zod": "^4.1.12",
    "tailwindcss": "^4"
  }
}
```

### missionary

```json
{
  "dependencies": {
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.2.2",
    "react-hook-form": "^7.66.1",
    "zod": "^4.1.12",
    "tailwindcss": "^4"
  }
}
```

### donor

```json
{
  "dependencies": {
    "tailwindcss": "^4"
  }
}
```

---

## Step 10: Clean Root package.json

**Remove from root:**

- All dependencies that were moved to packages
- Keep only: workspace packages, devDependencies, and tooling

**Keep in root:**

```json
{
  "dependencies": {
    "@asym/auth": "workspace:*",
    "@asym/config": "workspace:*",
    "@asym/database": "workspace:*",
    "@asym/email": "workspace:*",
    "@asym/lib": "workspace:*",
    "@asym/ui": "workspace:*"
  }
}
```

---

## Verification Checklist

After EACH step:

- [ ] Run `bun install`
- [ ] Run `bunx turbo run typecheck`
- [ ] Run `bunx turbo run lint`
- [ ] Run `bunx turbo run build`
- [ ] Check for any errors

After ALL steps:

- [ ] Test admin app locally
- [ ] Test missionary app locally
- [ ] Test donor app locally
- [ ] Run full test suite
- [ ] Commit changes

---

## Rollback Plan

If anything breaks:

```bash
git checkout package.json packages/*/package.json apps/*/package.json
bun install
```

---

## Expected Benefits

✅ **Clearer ownership** - Each package declares its own dependencies  
✅ **Better tree-shaking** - Only import what's needed  
✅ **Faster installs** - Packages can be installed independently  
✅ **Easier maintenance** - Know exactly which package uses which dependency  
✅ **Senior-level pattern** - Industry best practice for monorepos
