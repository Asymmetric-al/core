# Turborepo Migration Plan - Updated for Current Architecture

**Date:** 2026-01-21  
**Status:** Planning Phase  
**Goal:** Migrate Asymmetric.al from monolithic Next.js to Turborepo monorepo  
**Based On:** Current project structure analysis (features-based architecture)

---

## Executive Summary

This document outlines the **updated** migration strategy based on the **current project architecture** which uses a **features-based organization** with:

- ✅ `src/features/` - Feature modules (mission-control, donor, missionary)
- ✅ `src/components/ui/` - shadcn/ui components
- ✅ `src/lib/` - Utilities and business logic
- ✅ `src/app/` - Next.js App Router with route groups

### Key Objectives

1. **Separate apps** by user type (admin, donor, missionary)
2. **Extract shared packages** from existing features and lib
3. **Enable parallel development** with clear boundaries
4. **Improve build performance** with Turborepo caching
5. **Prepare for Vercel deployment** with independent apps

---

## Current State Analysis (Updated)

### Existing Structure (Actual)

```
src/
├── app/
│   ├── (admin)/mc/*           # Mission Control routes
│   ├── (missionary)/*         # Missionary Dashboard routes
│   ├── (donor)/*              # Donor Portal routes
│   ├── (public)/*             # Public Website routes
│   └── api/                   # API routes (mixed)
│
├── features/                  # ✅ Feature modules (well-organized)
│   ├── mission-control/       # Admin feature module
│   │   ├── components/        # AppShell, SidebarNav, TilePage, etc.
│   │   ├── care/              # Care Hub sub-feature
│   │   ├── locations/         # Locations sub-feature
│   │   └── context.tsx        # MC context provider
│   ├── donor/                 # Donor feature module
│   │   └── components/        # ImpactTile, MissionBriefing, etc.
│   └── missionary/            # Missionary feature module
│       └── components/        # DashboardHome, MetricTiles, TaskDialog, etc.
│
├── components/                # Shared components
│   ├── ui/                    # ✅ shadcn/ui (60+ components)
│   ├── dashboard/             # Shared dashboard components
│   ├── feed/                  # Social feed components
│   ├── mission-control/       # MC-specific components (legacy)
│   ├── donor/                 # Donor-specific components (legacy)
│   └── public/                # Public website components
│
├── lib/                       # ✅ Well-organized utilities
│   ├── supabase/              # Database clients (client, server, admin)
│   ├── db/                    # TanStack DB collections & hooks
│   ├── auth/                  # Auth context
│   ├── email/                 # SendGrid integration
│   ├── mission-control/       # MC-specific logic
│   ├── donor-dashboard/       # Donor-specific logic
│   ├── missionary/            # Missionary-specific logic
│   ├── monitoring/            # Sentry, web vitals
│   ├── seo/                   # SEO utilities
│   └── utils.ts               # Shared utilities (cn, formatCurrency)
│
├── hooks/                     # Shared hooks
│   ├── use-auth.ts
│   ├── use-donation-metrics.ts
│   ├── use-mobile.ts
│   └── use-tasks.ts
│
├── config/                    # App configuration
│   ├── constants.ts
│   ├── navigation.ts
│   ├── site.ts
│   └── tiles.ts
│
├── providers/                 # React providers
│   ├── query-provider.tsx
│   └── theme-provider.tsx
│
└── types/                     # TypeScript types
    ├── database.ts
    ├── email-studio.ts
    └── pdf-studio.ts
```

### Key Observations

#### ✅ Strengths (Good Architecture)

1. **Features-based organization** - `src/features/` is well-structured
2. **Clear separation** - mission-control, donor, missionary features are distinct
3. **Shared UI components** - `src/components/ui/` has 60+ shadcn components
4. **Organized lib** - `src/lib/` has clear domain separation
5. **TanStack DB** - Already using collections pattern for client-side data

#### ⚠️ Issues to Address

1. **Mixed components** - Some components in `src/components/[feature]/` duplicate `src/features/[feature]/components/`
2. **API routes mixed** - All API routes in one `src/app/api/` directory
3. **Feature-specific lib** - `src/lib/mission-control/`, `src/lib/donor-dashboard/` should move to features
4. **No app boundaries** - All features can import from each other
5. **Single build** - Entire app rebuilds for any change

---

## Target Architecture (Updated)

### Monorepo Structure

```
asym-turborepo/
├── apps/
│   ├── admin/              # Mission Control app
│   │   ├── app/            # Routes from (admin)/mc/*
│   │   ├── components/     # Admin-specific components
│   │   ├── lib/            # Admin-specific logic
│   │   ├── features/       # Admin features (mission-control)
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   ├── donor/              # 🔗 Public Website + Donor Portal (Connected)
│   │   ├── app/
│   │   │   ├── (public)/*      # Public website (unauthenticated)
│   │   │   │   ├── page.tsx    # Homepage
│   │   │   │   ├── about/
│   │   │   │   └── missionaries/
│   │   │   └── (dashboard)/*   # Donor portal (authenticated)
│   │   │       ├── page.tsx    # Dashboard
│   │   │       ├── giving/
│   │   │       └── impact/
│   │   ├── components/
│   │   │   ├── public/         # Public site components
│   │   │   └── dashboard/      # Dashboard components
│   │   ├── lib/
│   │   ├── features/           # Donor features
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── missionary/         # Missionary Dashboard app
│       ├── app/            # Routes from (missionary)/*
│       ├── components/
│       ├── lib/
│       ├── features/       # Missionary features
│       ├── package.json
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
└── packages/
    ├── ui/                 # @asym/ui - Shared UI components
    │   ├── components/
    │   │   ├── shadcn/     # All 60+ shadcn/ui components
    │   │   ├── dashboard/  # StatCard, ChartCard, ActivityItem
    │   │   └── feed/       # FeedPost, CommentsDialog
    │   ├── hooks/
    │   │   ├── use-mobile.ts
    │   │   └── use-breakpoint.ts
    │   ├── lib/
    │   │   └── utils.ts    # cn(), component utilities
    │   └── tailwind-preset.ts
    │
    ├── database/           # @asym/database - Database layer
    │   ├── clients/
    │   │   ├── client.ts   # Browser client
    │   │   ├── server.ts   # Server client
    │   │   └── admin.ts    # Admin client
    │   ├── collections/    # TanStack DB collections
    │   │   ├── profiles.ts
    │   │   ├── donations.ts
    │   │   └── posts.ts
    │   ├── hooks/          # Database hooks
    │   │   ├── use-posts.ts
    │   │   └── use-donations.ts
    │   └── types/
    │       └── database.ts
    │
    ├── auth/               # @asym/auth - Authentication
    │   ├── context.tsx
    │   ├── hooks/
    │   │   └── use-auth.ts
    │   └── guards/
    │
    ├── email/              # @asym/email - SendGrid
    │   ├── sendgrid.ts
    │   ├── constants.ts
    │   └── types.ts
    │
    ├── lib/                # @asym/lib - Shared utilities
    │   ├── utils.ts        # formatCurrency, getInitials
    │   ├── stripe.ts
    │   ├── cloudinary.ts
    │   ├── monitoring/     # Sentry, web vitals
    │   └── seo/            # SEO utilities
    │
    └── config/             # @asym/config - Shared configs
        ├── constants.ts
        ├── site.ts
        └── eslint/
```

---

## Package Design (Updated Based on Current Structure)

### `@asym/ui` - UI Components Package

**Purpose**: Single source of truth for ALL shared UI components

**What to Extract**:

- ✅ `src/components/ui/*` → `packages/ui/components/shadcn/` (60+ components)
- ✅ `src/components/dashboard/*` → `packages/ui/components/dashboard/`
- ✅ `src/components/feed/*` → `packages/ui/components/feed/`
- ✅ `src/hooks/use-mobile.ts` → `packages/ui/hooks/`
- ✅ `src/lib/utils.ts` (cn function) → `packages/ui/lib/`
- ✅ Theme from `src/app/globals.css` → `packages/ui/styles/`

**Structure**:

```
packages/ui/
├── components/
│   ├── shadcn/             # All shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (60+ more)
│   ├── dashboard/          # Shared dashboard components
│   │   ├── stat-card.tsx
│   │   ├── activity-item.tsx
│   │   └── quick-action-card.tsx
│   └── feed/               # Social feed components
│       ├── feed-post.tsx
│       ├── comments-dialog.tsx
│       └── new-post-dialog.tsx
├── hooks/
│   ├── use-mobile.ts
│   └── use-breakpoint.ts
├── lib/
│   └── utils.ts            # cn(), component utilities
├── styles/
│   ├── globals.css
│   └── theme.css
├── tailwind-preset.ts      # Shared Tailwind config
├── package.json
└── tsconfig.json
```

**package.json**:

```json
{
  "name": "@asym/ui",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./components/*": "./components/*/index.ts",
    "./hooks": "./hooks/index.ts",
    "./lib": "./lib/index.ts",
    "./styles/*": "./styles/*.css",
    "./tailwind-preset": "./tailwind-preset.ts"
  },
  "dependencies": {
    "@radix-ui/react-*": "^1.x",
    "lucide-react": "^0.554.0",
    "motion": "^12.23.26",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^3.4.0"
  }
}
```

---

### `@asym/database` - Database Access Layer

**Purpose**: Single source of truth for ALL database operations

**What to Extract**:

- ✅ `src/lib/supabase/*` → `packages/database/clients/`
- ✅ `src/lib/db/*` → `packages/database/collections/`
- ✅ `src/types/database.ts` → `packages/database/types/`
- ✅ Database hooks from `src/lib/db/hooks.ts` → `packages/database/hooks/`

**Structure**:

```
packages/database/
├── clients/
│   ├── client.ts           # Browser client (from supabase/client.ts)
│   ├── server.ts           # Server client (from supabase/server.ts)
│   ├── admin.ts            # Admin client (from supabase/admin.ts)
│   └── index.ts
├── collections/            # TanStack DB collections
│   ├── profiles.ts
│   ├── missionaries.ts
│   ├── donors.ts
│   ├── donations.ts
│   ├── posts.ts
│   ├── funds.ts
│   └── index.ts
├── hooks/                  # Database query hooks
│   ├── use-posts.ts
│   ├── use-donations.ts
│   ├── use-missionary-stats.ts
│   └── index.ts
├── types/
│   └── database.ts         # Generated Supabase types
├── provider.tsx            # QueryProvider for TanStack Query
├── package.json
└── tsconfig.json
```

**package.json**:

```json
{
  "name": "@asym/database",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./clients": "./clients/index.ts",
    "./collections": "./collections/index.ts",
    "./hooks": "./hooks/index.ts",
    "./types": "./types/database.ts",
    "./provider": "./provider.tsx"
  },
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "@tanstack/db": "^0.5.16",
    "@tanstack/query-db-collection": "^1.0.12",
    "@tanstack/react-db": "^0.1.60",
    "@tanstack/react-query": "^5.90.15"
  }
}
```

---

### `@asym/auth` - Authentication Package

**Purpose**: Centralized authentication logic

**What to Extract**:

- ✅ `src/lib/auth/*` → `packages/auth/`
- ✅ `src/hooks/use-auth.ts` → `packages/auth/hooks/`

**Structure**:

```
packages/auth/
├── context.tsx             # Auth context provider
├── hooks/
│   ├── use-auth.ts
│   └── index.ts
├── guards/
│   ├── require-auth.tsx
│   └── require-role.tsx
├── types.ts
├── package.json
└── tsconfig.json
```

---

### `@asym/email` - Email Integration Package

**Purpose**: SendGrid email functionality

**What to Extract**:

- ✅ `src/lib/email/*` → `packages/email/`
- ✅ `src/types/email-studio.ts` → `packages/email/types/`
- ✅ `src/config/email-studio.ts` → `packages/email/config/`

**Structure**:

```
packages/email/
├── sendgrid.ts
├── constants.ts
├── config/
│   └── email-studio.ts
├── types/
│   ├── email.ts
│   └── email-studio.ts
├── package.json
└── tsconfig.json
```

---

### `@asym/lib` - Shared Utilities Package

**Purpose**: Shared utilities and business logic

**What to Extract**:

- ✅ `src/lib/utils.ts` (formatCurrency, getInitials) → `packages/lib/`
- ✅ `src/lib/stripe.ts` → `packages/lib/`
- ✅ `src/lib/cloudinary-*.ts` → `packages/lib/cloudinary/`
- ✅ `src/lib/monitoring/*` → `packages/lib/monitoring/`
- ✅ `src/lib/seo/*` → `packages/lib/seo/`
- ✅ `src/lib/responsive.ts` → `packages/lib/`

**Structure**:

```
packages/lib/
├── utils.ts                # formatCurrency, getInitials, etc.
├── stripe.ts
├── cloudinary/
│   ├── client.ts
│   └── server.ts
├── monitoring/
│   ├── sentry.ts
│   ├── web-vitals.ts
│   └── audit-scanner.ts
├── seo/
│   ├── metadata.ts
│   └── json-ld.tsx
├── responsive.ts
├── package.json
└── tsconfig.json
```

---

### `@asym/config` - Shared Configuration Package

**Purpose**: Shared configuration and constants

**What to Extract**:

- ✅ `src/config/*` → `packages/config/`

**Structure**:

```
packages/config/
├── constants.ts
├── site.ts
├── navigation.ts
├── tiles.ts
├── pdf-studio.ts
├── package.json
└── tsconfig.json
```

---

## App Boundaries (Critical)

### `apps/admin` - Mission Control

**What to Move**:

- ✅ `src/app/(admin)/mc/*` → `apps/admin/app/`
- ✅ `src/features/mission-control/*` → `apps/admin/features/mission-control/`
- ✅ `src/components/mission-control/*` → Merge into `apps/admin/features/mission-control/components/`
- ✅ `src/lib/mission-control/*` → `apps/admin/lib/`
- ✅ API routes: `src/app/api/admin/*` → `apps/admin/app/api/`

**Can Import**:

- ✅ `@asym/ui` - UI components
- ✅ `@asym/database` - Database access
- ✅ `@asym/auth` - Authentication
- ✅ `@asym/email` - Email functionality
- ✅ `@asym/lib` - Utilities
- ✅ `@asym/config` - Configuration

**Cannot Import**:

- ❌ `apps/donor/*`
- ❌ `apps/missionary/*`

---

### `apps/donor` - Public Website + Donor Portal (Connected)

**Why Combined**: Public website and donor portal are connected - donors discover the mission through the public site and then access their dashboard. Shared navigation, branding, and user journey.

**What to Move**:

- ✅ `src/app/(public)/*` → `apps/donor/app/(public)/`
  - Public homepage, about, missionaries list, etc.
- ✅ `src/app/(donor)/*` → `apps/donor/app/(dashboard)/`
  - Donor dashboard, giving history, impact tracking
- ✅ `src/features/donor/*` → `apps/donor/features/donor/`
- ✅ `src/components/donor/*` → Merge into `apps/donor/features/donor/components/`
- ✅ `src/components/public/*` → `apps/donor/components/public/`
- ✅ `src/lib/donor-dashboard/*` → `apps/donor/lib/`
- ✅ API routes:
  - `src/app/api/donate/*` → `apps/donor/app/api/donate/`
  - `src/app/api/donor/*` → `apps/donor/app/api/donor/`
  - `src/app/api/donations/*` → `apps/donor/app/api/donations/`

**Routes Structure**:

```
apps/donor/
├── app/
│   ├── (public)/           # Public website (unauthenticated)
│   │   ├── page.tsx        # Homepage
│   │   ├── about/
│   │   ├── missionaries/
│   │   └── contact/
│   ├── (dashboard)/        # Donor portal (authenticated)
│   │   ├── page.tsx        # Donor dashboard
│   │   ├── giving/
│   │   ├── impact/
│   │   └── settings/
│   └── api/
│       ├── donate/         # Donation processing
│       ├── donor/          # Donor-specific APIs
│       └── donations/      # Donation queries
├── components/
├── features/
└── lib/
```

**Can Import**:

- ✅ `@asym/ui`
- ✅ `@asym/database`
- ✅ `@asym/auth`
- ✅ `@asym/lib`
- ✅ `@asym/config`

**Cannot Import**:

- ❌ `apps/admin/*`
- ❌ `apps/missionary/*`

**Deployment**:

- Domain: `www.asymmetric.al` (public) + `app.asymmetric.al` (dashboard)
- Single Vercel project with multiple routes

---

### `apps/missionary` - Missionary Dashboard

**What to Move**:

- ✅ `src/app/(missionary)/*` → `apps/missionary/app/`
- ✅ `src/features/missionary/*` → `apps/missionary/features/missionary/`
- ✅ `src/lib/missionary/*` → `apps/missionary/lib/`
- ✅ API routes: `src/app/api/missionaries/*` → `apps/missionary/app/api/`

**Can Import**:

- ✅ `@asym/ui`
- ✅ `@asym/database`
- ✅ `@asym/auth`
- ✅ `@asym/lib`
- ✅ `@asym/config`

**Cannot Import**:

- ❌ `apps/admin/*`
- ❌ `apps/donor/*`

---

## Migration Phases (Updated)

### Phase 1: Setup Turborepo ✅ COMPLETE

**Goal**: Initialize monorepo structure

**Completed**:

- ✅ Created `apps/`, `packages/`, `tooling/` directories
- ✅ Configured Bun workspaces in root `package.json`
- ✅ Updated `turbo.json` with Vercel support
- ✅ Created shared TypeScript configs
- ✅ Created shared ESLint config with architecture enforcement
- ✅ Verified Turborepo pipeline

---

### Phase 2: Extract `@asym/ui` Package (Week 2)

**Goal**: Create shared UI components package

**Tasks**:

1. **Create package structure**

   ```bash
   cd packages/ui
   bun init
   ```

2. **Move shadcn/ui components**

   ```bash
   # Move all 60+ components
   mv src/components/ui/* packages/ui/components/shadcn/
   ```

3. **Move dashboard components**

   ```bash
   mv src/components/dashboard/* packages/ui/components/dashboard/
   ```

4. **Move feed components**

   ```bash
   mv src/components/feed/* packages/ui/components/feed/
   ```

5. **Extract utilities**

   ```bash
   # Extract cn() function
   cp src/lib/utils.ts packages/ui/lib/utils.ts
   ```

6. **Extract hooks**

   ```bash
   mv src/hooks/use-mobile.ts packages/ui/hooks/
   ```

7. **Extract theme**

   ```bash
   # Extract theme from globals.css
   cp src/app/globals.css packages/ui/styles/globals.css
   ```

8. **Create Tailwind preset**

   ```typescript
   // packages/ui/tailwind-preset.ts
   export default {
     theme: {
       extend: {
         colors: {
           // Maia/Zinc theme
         },
       },
     },
   };
   ```

9. **Create barrel exports**

   ```typescript
   // packages/ui/components/shadcn/index.ts
   export * from "./button";
   export * from "./card";
   // ... all components
   ```

10. **Update imports in src/**
    ```bash
    # Find and replace
    # "@/components/ui" → "@asym/ui/components/shadcn"
    # "@/components/dashboard" → "@asym/ui/components/dashboard"
    # "@/components/feed" → "@asym/ui/components/feed"
    ```

**Deliverable**: Working `@asym/ui` package that can be imported by current app

**Test**:

```bash
# In root
bun install
turbo build --filter=@asym/ui
```

---

### Phase 3: Extract `@asym/database` Package (Week 2)

**Goal**: Create shared database access layer

**Tasks**:

1. **Create package structure**

   ```bash
   cd packages/database
   bun init
   ```

2. **Move Supabase clients**

   ```bash
   mv src/lib/supabase/* packages/database/clients/
   ```

3. **Move TanStack DB collections**

   ```bash
   mv src/lib/db/collections.ts packages/database/collections/
   mv src/lib/db/client-db.ts packages/database/collections/
   ```

4. **Move database hooks**

   ```bash
   mv src/lib/db/hooks.ts packages/database/hooks/
   ```

5. **Move database types**

   ```bash
   mv src/types/database.ts packages/database/types/
   ```

6. **Move QueryProvider**

   ```bash
   mv src/lib/db/query-provider.tsx packages/database/provider.tsx
   ```

7. **Create barrel exports**

8. **Update imports in src/**
   ```bash
   # "@/lib/supabase" → "@asym/database/clients"
   # "@/lib/db" → "@asym/database/collections"
   # "@/types/database" → "@asym/database/types"
   ```

**Deliverable**: Working `@asym/database` package

---

### Phase 4: Extract Remaining Packages (Week 3)

**Goal**: Extract `@asym/auth`, `@asym/email`, `@asym/lib`, `@asym/config`

**Tasks**:

1. **Extract `@asym/auth`**
   - Move `src/lib/auth/*`
   - Move `src/hooks/use-auth.ts`
   - Update imports

2. **Extract `@asym/email`**
   - Move `src/lib/email/*`
   - Move `src/types/email-studio.ts`
   - Move `src/config/email-studio.ts`
   - Update imports

3. **Extract `@asym/lib`**
   - Move `src/lib/utils.ts` (formatCurrency, getInitials)
   - Move `src/lib/stripe.ts`
   - Move `src/lib/cloudinary-*.ts`
   - Move `src/lib/monitoring/*`
   - Move `src/lib/seo/*`
   - Move `src/lib/responsive.ts`
   - Update imports

4. **Extract `@asym/config`**
   - Move `src/config/*`
   - Update imports

**Deliverable**: All 6 packages extracted and working

**Test**:

```bash
turbo build --filter=@asym/*
```

---

### Phase 5: Create `apps/admin` (Week 4)

**Goal**: Extract Mission Control into separate app

**Tasks**:

1. **Create app structure**

   ```bash
   cd apps/admin
   bunx create-next-app@latest . --typescript --tailwind --app --no-src-dir
   ```

2. **Move routes**

   ```bash
   mv src/app/(admin)/mc/* apps/admin/app/
   mv src/app/(admin)/layout.tsx apps/admin/app/layout.tsx
   ```

3. **Move features**

   ```bash
   mv src/features/mission-control apps/admin/features/
   ```

4. **Merge components**

   ```bash
   # Merge src/components/mission-control into features
   cp -r src/components/mission-control/* apps/admin/features/mission-control/components/
   ```

5. **Move lib**

   ```bash
   mv src/lib/mission-control apps/admin/lib/
   ```

6. **Move API routes**

   ```bash
   mv src/app/api/admin apps/admin/app/api/
   ```

7. **Configure package.json**

   ```json
   {
     "name": "admin",
     "dependencies": {
       "@asym/ui": "workspace:*",
       "@asym/database": "workspace:*",
       "@asym/auth": "workspace:*",
       "@asym/email": "workspace:*",
       "@asym/lib": "workspace:*",
       "@asym/config": "workspace:*"
     }
   }
   ```

8. **Update imports**

   ```bash
   # "@/features/mission-control" → "@/features/mission-control"
   # "@/components/ui" → "@asym/ui/components/shadcn"
   # "@/lib/supabase" → "@asym/database/clients"
   ```

9. **Configure Next.js**

   ```javascript
   // apps/admin/next.config.mjs
   export default {
     transpilePackages: ["@asym/ui", "@asym/database"],
   };
   ```

10. **Configure Tailwind**

    ```javascript
    // apps/admin/tailwind.config.ts
    import preset from "@asym/ui/tailwind-preset";
    export default {
      presets: [preset],
      content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./features/**/*.{ts,tsx}",
        "../../packages/ui/components/**/*.{ts,tsx}",
      ],
    };
    ```

11. **Update tsconfig.json paths**
    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"]
        }
      }
    }
    ```

**Deliverable**: Working `apps/admin` that builds independently

**Test**:

```bash
turbo dev --filter=admin
turbo build --filter=admin
```

---

### Phase 6: Create `apps/donor` (Week 4-5)

**Goal**: Extract Public Website + Donor Portal into single connected app

**Why Combined**: Public site and donor portal share navigation, branding, and user journey. Donors discover missions on public site → sign up → access dashboard.

**Tasks**:

1. **Create app structure**

   ```bash
   cd apps/donor
   bunx create-next-app@latest . --typescript --tailwind --app --no-src-dir
   ```

2. **Move public routes**

   ```bash
   mv src/app/(public)/* apps/donor/app/(public)/
   ```

3. **Move donor routes**

   ```bash
   mv src/app/(donor)/* apps/donor/app/(dashboard)/
   ```

4. **Move features**

   ```bash
   mv src/features/donor apps/donor/features/
   ```

5. **Merge components**

   ```bash
   # Merge src/components/donor into features
   cp -r src/components/donor/* apps/donor/features/donor/components/
   # Move public components
   mv src/components/public apps/donor/components/
   ```

6. **Move lib**

   ```bash
   mv src/lib/donor-dashboard apps/donor/lib/
   ```

7. **Move API routes**

   ```bash
   mv src/app/api/donate apps/donor/app/api/
   mv src/app/api/donor apps/donor/app/api/
   mv src/app/api/donations apps/donor/app/api/
   ```

8. **Configure package.json**

   ```json
   {
     "name": "donor",
     "dependencies": {
       "@asym/ui": "workspace:*",
       "@asym/database": "workspace:*",
       "@asym/auth": "workspace:*",
       "@asym/email": "workspace:*",
       "@asym/lib": "workspace:*",
       "@asym/config": "workspace:*"
     }
   }
   ```

9. **Configure Next.js**

   ```javascript
   // apps/donor/next.config.mjs
   export default {
     transpilePackages: ["@asym/ui", "@asym/database"],
   };
   ```

10. **Configure Tailwind**

    ```javascript
    // apps/donor/tailwind.config.ts
    import preset from "@asym/ui/tailwind-preset";
    export default {
      presets: [preset],
      content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./features/**/*.{ts,tsx}",
        "../../packages/ui/components/**/*.{ts,tsx}",
      ],
    };
    ```

11. **Update tsconfig.json paths**

    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"]
        }
      }
    }
    ```

12. **Update imports**

    ```bash
    # "@/components/ui" → "@asym/ui/components/shadcn"
    # "@/lib/supabase" → "@asym/database/clients"
    ```

13. **Test both route groups**
    ```bash
    # Test public routes (unauthenticated)
    turbo dev --filter=donor
    # Visit: http://localhost:3000
    # Test dashboard routes (authenticated)
    # Visit: http://localhost:3000/dashboard
    ```

**Deliverable**: Working `apps/donor` with both public website and donor portal

**Test**:

```bash
turbo dev --filter=donor
turbo build --filter=donor
```

---

### Phase 7: Create `apps/missionary` (Week 5)

**Goal**: Extract Missionary Dashboard into separate app

**Tasks**:

1. **Create app structure**

   ```bash
   cd apps/missionary
   bunx create-next-app@latest . --typescript --tailwind --app --no-src-dir
   ```

2. **Move routes**

   ```bash
   mv src/app/(missionary)/* apps/missionary/app/
   ```

3. **Move features**

   ```bash
   mv src/features/missionary apps/missionary/features/
   ```

4. **Move lib**

   ```bash
   mv src/lib/missionary apps/missionary/lib/
   ```

5. **Move API routes**

   ```bash
   mv src/app/api/missionaries apps/missionary/app/api/
   ```

6. **Configure package.json**

   ```json
   {
     "name": "missionary",
     "dependencies": {
       "@asym/ui": "workspace:*",
       "@asym/database": "workspace:*",
       "@asym/auth": "workspace:*",
       "@asym/email": "workspace:*",
       "@asym/lib": "workspace:*",
       "@asym/config": "workspace:*"
     }
   }
   ```

7. **Configure Next.js**

   ```javascript
   // apps/missionary/next.config.mjs
   export default {
     transpilePackages: ["@asym/ui", "@asym/database"],
   };
   ```

8. **Configure Tailwind**

   ```javascript
   // apps/missionary/tailwind.config.ts
   import preset from "@asym/ui/tailwind-preset";
   export default {
     presets: [preset],
     content: [
       "./app/**/*.{ts,tsx}",
       "./components/**/*.{ts,tsx}",
       "./features/**/*.{ts,tsx}",
       "../../packages/ui/components/**/*.{ts,tsx}",
     ],
   };
   ```

9. **Update tsconfig.json paths**

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

10. **Update imports**

    ```bash
    # "@/components/ui" → "@asym/ui/components/shadcn"
    # "@/lib/supabase" → "@asym/database/clients"
    ```

**Deliverable**: Working `apps/missionary`

**Test**:

```bash
turbo dev --filter=missionary
turbo build --filter=missionary
```

---

### Phase 8: Shared API Routes (Week 6)

**Goal**: Handle shared API routes

**Strategy**: Duplicate routes, share business logic

**Tasks**:

1. **Identify shared API routes**
   - `src/app/api/posts/*` (used by all apps)
   - `src/app/api/donations/*` (used by donor + missionary)
   - `src/app/api/auth/*` (used by all apps)
   - `src/app/api/upload/*` (used by all apps)

2. **Extract business logic to `@asym/lib`**

   ```typescript
   // packages/lib/posts/create-post.ts
   export async function createPost(data: PostInput) {
     // Business logic here
   }
   ```

3. **Duplicate API routes in each app**

   ```typescript
   // apps/admin/src/app/api/posts/route.ts
   import { createPost } from "@asym/lib/posts";

   export async function POST(req: Request) {
     const data = await req.json();
     return Response.json(await createPost(data));
   }
   ```

4. **Test each app's API routes**

**Deliverable**: All apps have their own API routes with shared business logic

---

### Phase 9: Enforce Architecture Rules (Week 6)

**Goal**: Prevent cross-app imports and enforce boundaries

**Tasks**:

1. **Update ESLint config**

   ```javascript
   // tooling/eslint-config/base.js
   rules: {
     'no-restricted-imports': [
       'error',
       {
         patterns: [
           {
             group: ['../../apps/*'],
             message: '❌ Apps cannot import from other apps',
           },
         ],
       },
     ],
   }
   ```

2. **Add pre-commit hooks**

   ```bash
   # .husky/pre-commit
   turbo lint --filter=[HEAD^1]
   turbo typecheck --filter=[HEAD^1]
   ```

3. **Update CI/CD**

   ```yaml
   # .github/workflows/ci.yml
   - run: turbo lint
   - run: turbo typecheck
   - run: turbo build
   ```

4. **Test enforcement**
   ```bash
   # Try to import from another app (should fail)
   ```

**Deliverable**: Architecture rules enforced automatically

---

### Phase 10: Vercel Deployment Setup (Week 7)

**Goal**: Configure Vercel for independent app deployments

**Tasks**:

1. **Create Vercel projects**
   - `asymmetric-admin` → `apps/admin`
   - `asymmetric-donor` → `apps/donor` (handles both public + dashboard)
   - `asymmetric-missionary` → `apps/missionary`

2. **Configure build settings**

   Each app in Vercel project settings:

   **Admin:**
   - Build Command: `cd ../.. && turbo build --filter=admin`
   - Output Directory: `apps/admin/.next`
   - Root Directory: `apps/admin`

   **Donor:**
   - Build Command: `cd ../.. && turbo build --filter=donor`
   - Output Directory: `apps/donor/.next`
   - Root Directory: `apps/donor`

   **Missionary:**
   - Build Command: `cd ../.. && turbo build --filter=missionary`
   - Output Directory: `apps/missionary/.next`
   - Root Directory: `apps/missionary`

3. **Setup domains**
   - **Admin**: `admin.asymmetric.al` → `apps/admin`
   - **Donor (Public + Dashboard)**:
     - `www.asymmetric.al` → `apps/donor` (public routes)
     - `app.asymmetric.al` → `apps/donor` (dashboard routes)
     - Both domains point to same Vercel project, routes handled by Next.js route groups
   - **Missionary**: `missionary.asymmetric.al` → `apps/missionary`

4. **Configure environment variables**
   - Shared: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - App-specific: Feature flags, etc.

5. **Enable Vercel Remote Cache**

   ```bash
   # Automatic with Vercel deployment
   ```

6. **Test deployments**

**Deliverable**: All 3 apps deployed independently to Vercel

---

## Timeline Summary

| Phase    | Week     | Focus                      | Deliverable                |
| -------- | -------- | -------------------------- | -------------------------- |
| Phase 1  | Week 1   | Setup Turborepo            | ✅ Monorepo structure      |
| Phase 2  | Week 2   | Extract `@asym/ui`         | UI components package      |
| Phase 3  | Week 2   | Extract `@asym/database`   | Database access layer      |
| Phase 4  | Week 3   | Extract remaining packages | All 6 packages complete    |
| Phase 5  | Week 4   | Create `apps/admin`        | Admin app independent      |
| Phase 6  | Week 4-5 | Create `apps/donor`        | Donor app independent      |
| Phase 7  | Week 5   | Create `apps/missionary`   | Missionary app independent |
| Phase 8  | Week 6   | Shared API routes          | API routes duplicated      |
| Phase 9  | Week 6   | Enforce architecture       | Rules enforced             |
| Phase 10 | Week 7   | Vercel deployment          | All apps deployed          |

**Total Duration**: 7 weeks

---

## Key Differences from Original Plan

### What Changed

1. **Features-based architecture recognized** - Original plan didn't account for existing `src/features/` organization
2. **TanStack DB already implemented** - Collections pattern already in use, just needs extraction
3. **Component duplication identified** - Some components exist in both `src/components/[feature]/` and `src/features/[feature]/components/`
4. **10 phases instead of 7** - More granular approach based on actual complexity
5. **Feature-specific lib stays with apps** - `src/lib/mission-control/` → `apps/admin/src/lib/` (not extracted to packages)

### What Stayed the Same

1. **Package structure** - Still 6 packages: ui, database, auth, email, lib, config
2. **App boundaries** - Still 3 apps: admin, donor, missionary
3. **Vercel deployment** - Still using Vercel with remote caching
4. **Architecture enforcement** - Still using ESLint rules to prevent cross-app imports

---

## Migration Strategy

### Incremental Approach

1. **Extract packages first** (Phases 2-4) - Allows current app to use packages before splitting
2. **Create apps one by one** (Phases 5-7) - Reduces risk, allows testing each app independently
3. **Handle shared concerns last** (Phases 8-9) - API routes and architecture enforcement after apps work
4. **Deploy to production** (Phase 10) - Final step after everything is tested

### Risk Mitigation

1. **Keep current app working** - Don't delete anything until new structure is verified
2. **Test after each phase** - Run `turbo build` and `turbo dev` to verify
3. **Use feature flags** - Gradually roll out new apps to users
4. **Rollback plan** - Keep git history clean, can revert any phase

### Success Criteria

- ✅ All 3 apps build independently
- ✅ All 3 apps deploy to Vercel successfully
- ✅ No cross-app imports (enforced by ESLint)
- ✅ Build times improved (measured by Turborepo cache hits)
- ✅ Developer experience improved (measured by team feedback)
- ✅ All existing features work in new structure

---

## Expected Benefits

### Performance

- **Faster builds** - Only rebuild changed apps (50-70% faster)
- **Faster CI/CD** - Parallel builds for all apps
- **Better caching** - Turborepo + Vercel remote cache

### Developer Experience

- **Clear boundaries** - No confusion about where code belongs
- **Parallel development** - Teams can work on different apps without conflicts
- **Easier onboarding** - New developers only need to understand one app
- **Better IDE performance** - Smaller codebases load faster

### Scalability

- **Independent deployments** - Deploy admin without affecting donor
- **Team scaling** - Can assign teams to specific apps
- **Code ownership** - Clear CODEOWNERS for each app
- **Feature flags** - Can enable features per app

---

## Rollback Plan

If migration fails at any phase:

1. **Revert git commits** - Each phase should be a separate commit
2. **Restore package.json** - Revert workspace configuration
3. **Restore imports** - Revert import path changes
4. **Test current app** - Verify everything works

**Critical**: Keep current app working throughout migration. Don't delete code until new structure is verified.

---

## Next Steps

1. **Review this plan** with team and stakeholders
2. **Get approval** to proceed with Phase 2
3. **Create Phase 2 branch** - `git checkout -b phase-2-extract-ui`
4. **Start Phase 2** - Extract `@asym/ui` package
5. **Test thoroughly** before moving to Phase 3

---

## Conclusion

This updated migration plan reflects the **actual current architecture** of the Asymmetric.al project, which uses a well-organized **features-based structure**. The plan:

- ✅ Preserves existing good architecture (features, TanStack DB)
- ✅ Addresses current issues (mixed components, no app boundaries)
- ✅ Provides clear, actionable phases (10 phases over 7 weeks)
- ✅ Includes risk mitigation and rollback strategies
- ✅ Prepares for Vercel deployment with independent apps

**Status**: ✅ **Ready for Phase 2**

**Recommendation**: **Proceed with Phase 2 - Extract `@asym/ui` Package**

---

**Document Version**: 2.0
**Last Updated**: 2026-01-21
**Author**: Senior Software Engineer
**Based On**: Current project structure analysis
