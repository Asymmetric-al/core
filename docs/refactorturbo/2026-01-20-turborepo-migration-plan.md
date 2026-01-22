# Turborepo Migration Plan - Enhanced Architecture

**Date:** 2026-01-20  
**Status:** Planning Phase  
**Goal:** Migrate Asymmetric.al from monolithic Next.js to Turborepo monorepo

---

## Executive Summary

This document outlines the enhanced migration strategy for transforming the current monolithic Next.js application into a scalable Turborepo monorepo. The migration addresses architectural debt, prepares for multi-developer collaboration, and separates the public donor-facing website from internal applications.

### Key Objectives

1. **Separate public donor site** from internal admin/missionary apps
2. **Eliminate code duplication** through shared packages
3. **Enable parallel development** with clear boundaries
4. **Improve build performance** with Turborepo caching
5. **Prepare for team scaling** with enforced architecture rules

---

## Current State Analysis

### Existing Structure Problems

```
src/
├── app/
│   ├── (admin)/mc/*           # Mission Control - Staff only
│   ├── (missionary)/*         # Missionary Dashboard
│   ├── (donor)/*              # Donor Portal (authenticated)
│   ├── (public)/*             # Public Website
│   └── api/*                  # Mixed API routes for all apps
├── components/
│   ├── ui/                    # shadcn/ui (shared)
│   ├── mission-control/       # Admin-specific
│   ├── donor/                 # Donor-specific
│   ├── public/                # Public-specific
│   └── feed/                  # Shared across donor/missionary
├── lib/
│   ├── supabase/              # Database clients (shared)
│   ├── mission-control/       # Admin-specific logic
│   ├── donor-dashboard/       # Donor-specific logic
│   └── missionary/            # Missionary-specific logic
```

### Critical Issues

1. ❌ **Cross-contamination**: Admin code mixed with public code
2. ❌ **Duplicate components**: Multiple Button/Card implementations
3. ❌ **Unclear boundaries**: No enforcement of app isolation
4. ❌ **Build inefficiency**: Entire app rebuilds for small changes
5. ❌ **Database client duplication**: Multiple Supabase client patterns
6. ❌ **Shared state leakage**: Mission Control context used in wrong places
7. ❌ **No package versioning**: Can't independently deploy apps

---

## Target Architecture

### Monorepo Structure

```
asym-turborepo/
├── apps/
│   ├── admin/              # Mission Control (staff-only)
│   ├── donor/              # Public site + Donor portal
│   └── missionary/         # Missionary dashboard
│
├── packages/
│   ├── ui/                 # Shared UI components (SINGLE SOURCE)
│   ├── database/           # Supabase clients + types + collections
│   ├── auth/               # Authentication logic
│   ├── email/              # SendGrid integration
│   ├── lib/                # Shared utilities
│   ├── config/             # Shared configs (ESLint, TS, Tailwind)
│   └── types/              # Shared TypeScript types
│
├── tooling/
│   ├── eslint-config/      # Shared ESLint rules
│   └── typescript-config/  # Shared tsconfig.json
│
└── turbo.json              # Turborepo pipeline config
```

### App Boundaries (Critical)

#### `apps/admin` - Mission Control

- **Users**: Admin, Finance, Staff, Member Care, Mobilizers
- **Routes**: `/mc/*`
- **Purpose**: Organization management, CRM, contributions, reporting
- **Can Import**: `@asym/ui`, `@asym/database`, `@asym/auth`, `@asym/lib`
- **Cannot Import**: `apps/donor/*`, `apps/missionary/*`

#### `apps/donor` - Public Site + Donor Portal

- **Users**: Public visitors + Authenticated donors
- **Routes**: `/` (public), `/dashboard/*` (authenticated)
- **Purpose**: Public website, donation checkout, donor self-service
- **Can Import**: `@asym/ui`, `@asym/database`, `@asym/auth`, `@asym/lib`
- **Cannot Import**: `apps/admin/*`, `apps/missionary/*`
- **Special**: This is the ONLY public-facing app

#### `apps/missionary` - Missionary Dashboard

- **Users**: Field missionaries
- **Routes**: `/missionary/*`
- **Purpose**: Support tracking, donor engagement, analytics
- **Can Import**: `@asym/ui`, `@asym/database`, `@asym/auth`, `@asym/lib`
- **Cannot Import**: `apps/admin/*`, `apps/donor/*`

---

## Package Design

### `@asym/ui` - UI Component Library

**Purpose**: Single source of truth for ALL shared UI components

**Contents**:

```
packages/ui/
├── components/
│   ├── shadcn/             # Button, Card, Dialog, Input, etc.
│   ├── dashboard/          # StatCard, ChartCard, ActivityItem
│   ├── feed/               # FeedPost, CommentsDialog, NewPostDialog
│   └── layout/             # AppShell, PageHeader, Footer
├── config/
│   └── theme.ts            # Maia/Zinc theme tokens
├── hooks/
│   ├── use-mobile.ts
│   └── use-breakpoint.ts
├── lib/
│   └── utils.ts            # cn(), component utilities
└── tailwind-preset.ts      # Shared Tailwind config
```

**Rules**:

- ✅ If a component is used by 2+ apps → MUST live here
- ✅ All shadcn/ui components live here
- ✅ Theme tokens centralized here
- ❌ No app-specific business logic
- ❌ No database queries

**Migration Strategy**:

1. Move `src/components/ui/*` → `packages/ui/components/shadcn/`
2. Move `src/components/dashboard/*` → `packages/ui/components/dashboard/`
3. Move `src/components/feed/*` → `packages/ui/components/feed/`
4. Extract theme from `src/app/globals.css` → `packages/ui/config/theme.ts`
5. Create `packages/ui/tailwind-preset.ts` for apps to extend

---

### `@asym/database` - Database Access Layer

**Purpose**: Single source of truth for ALL database operations

**Contents**:

```
packages/database/
├── clients/
│   ├── server.ts           # Server-side Supabase client
│   ├── client.ts           # Browser Supabase client
│   └── admin.ts            # Admin client (service role)
├── collections/
│   ├── posts.ts            # TanStack DB collections
│   ├── profiles.ts
│   ├── donations.ts
│   └── index.ts
├── hooks/
│   ├── use-posts.ts        # Reactive data hooks
│   ├── use-donations.ts
│   └── index.ts
├── types/
│   ├── database.ts         # Generated Supabase types
│   ├── models.ts           # Domain models
│   └── index.ts
└── index.ts                # Main exports
```

**Rules**:

- ✅ ALL database access goes through this package
- ✅ Single Supabase client pattern (no duplication)
- ✅ TanStack DB collections centralized
- ✅ Type definitions shared across apps
- ❌ No direct `@supabase/ssr` imports in apps
- ❌ No app-specific database logic (use `@asym/lib` instead)

**Migration Strategy**:

1. Move `src/lib/supabase/*` → `packages/database/clients/`
2. Move `src/lib/db/*` → `packages/database/collections/`
3. Move `src/types/database.ts` → `packages/database/types/`
4. Create barrel exports in `packages/database/index.ts`
5. Update all imports: `@/lib/supabase/client` → `@asym/database`

**Example Usage**:

```typescript
// ✅ CORRECT: Apps import from @asym/database
import { createClient } from "@asym/database"; // Server/client
import { postsCollection } from "@asym/database"; // TanStack DB
import type { Database, Post } from "@asym/database/types";

// ❌ WRONG: Direct Supabase imports
import { createClient } from "@supabase/ssr"; // DON'T DO THIS
```

---

### `@asym/auth` - Authentication Layer

**Purpose**: Unified authentication logic across all apps

**Contents**:

```
packages/auth/
├── hooks/
│   ├── use-auth.ts         # useAuth(), useUser()
│   ├── use-session.ts
│   └── index.ts
├── guards/
│   ├── require-admin.ts    # Server-side auth guards
│   ├── require-donor.ts
│   └── index.ts
├── context/
│   └── auth-context.ts     # Auth context provider
├── utils/
│   └── get-auth-context.ts # Server-side auth helper
└── index.ts
```

**Rules**:

- ✅ All auth logic centralized
- ✅ Role-based guards for route protection
- ✅ Consistent auth patterns across apps
- ❌ No duplicate auth context in apps

**Migration Strategy**:

1. Move `src/lib/auth/*` → `packages/auth/`
2. Extract auth hooks from app-specific code
3. Create role guards for each app
4. Update all imports: `@/lib/auth/context` → `@asym/auth`

---

### `@asym/email` - Email Integration

**Purpose**: SendGrid email sending and templates

**Contents**:

```
packages/email/
├── templates/
│   ├── donation-receipt.ts
│   ├── welcome.ts
│   └── index.ts
├── sendgrid.ts             # SendGrid client
└── index.ts
```

**Migration Strategy**:

1. Move `src/lib/email/*` → `packages/email/`
2. Centralize email templates
3. Update imports: `@/lib/email` → `@asym/email`

---

### `@asym/lib` - Shared Business Logic

**Purpose**: Utilities and business logic used by multiple apps

**Contents**:

```
packages/lib/
├── utils.ts                # cn(), formatters, validators
├── stripe.ts               # Stripe utilities
├── cloudinary.ts           # Image upload utilities
├── monitoring/
│   ├── sentry.ts
│   └── analytics.ts
└── index.ts
```

**Rules**:

- ✅ Only code used by 2+ apps
- ✅ Pure functions (no side effects)
- ❌ No app-specific logic (keep in app's `lib/`)

**Migration Strategy**:

1. Audit `src/lib/*` for shared utilities
2. Move shared code → `packages/lib/`
3. Keep app-specific code in `apps/[app]/lib/`
4. Update imports: `@/lib/utils` → `@asym/lib`

---

### `@asym/config` - Shared Configurations

**Purpose**: ESLint, TypeScript, Tailwind configs

**Contents**:

```
packages/config/
├── eslint/
│   ├── base.js
│   ├── next.js
│   └── react.js
├── typescript/
│   ├── base.json
│   ├── nextjs.json
│   └── react.json
└── tailwind/
    └── preset.js
```

---

## Migration Phases

### Phase 1: Setup Turborepo (Week 1)

**Goal**: Initialize monorepo structure without breaking existing app

**Tasks**:

- [ ] Create `asym-turborepo/` root directory
- [ ] Initialize Turborepo: `bunx create-turbo@latest`
- [ ] Configure `turbo.json` pipeline
- [ ] Setup workspace structure (`apps/`, `packages/`)
- [ ] Configure Bun workspaces in root `package.json`
- [ ] Setup shared tooling (`eslint-config`, `typescript-config`)

**Deliverable**: Empty monorepo structure with working Turborepo pipeline

---

### Phase 2: Extract Shared Packages (Week 2-3)

**Goal**: Create `@asym/*` packages without breaking current app

**Tasks**:

- [ ] **Create `@asym/ui`**
  - [ ] Move `src/components/ui/*` → `packages/ui/components/shadcn/`
  - [ ] Move `src/components/dashboard/*` → `packages/ui/components/dashboard/`
  - [ ] Move `src/components/feed/*` → `packages/ui/components/feed/`
  - [ ] Extract theme tokens → `packages/ui/config/theme.ts`
  - [ ] Create Tailwind preset → `packages/ui/tailwind-preset.ts`
  - [ ] Setup barrel exports in `packages/ui/index.ts`

- [ ] **Create `@asym/database`**
  - [ ] Move `src/lib/supabase/*` → `packages/database/clients/`
  - [ ] Move `src/lib/db/*` → `packages/database/collections/`
  - [ ] Move `src/types/database.ts` → `packages/database/types/`
  - [ ] Create barrel exports

- [ ] **Create `@asym/auth`**
  - [ ] Move `src/lib/auth/*` → `packages/auth/`
  - [ ] Extract auth hooks and guards

- [ ] **Create `@asym/email`**
  - [ ] Move `src/lib/email/*` → `packages/email/`

- [ ] **Create `@asym/lib`**
  - [ ] Audit and move shared utilities
  - [ ] Move Stripe, Cloudinary, monitoring code

**Deliverable**: Working packages that can be imported by apps

---

### Phase 3: Split Apps (Week 4-5)

**Goal**: Separate monolithic app into 3 independent apps

**Tasks**:

#### 3.1 Create `apps/admin` (Mission Control)

- [ ] Create `apps/admin/` directory structure
- [ ] Move `src/app/(admin)/mc/*` → `apps/admin/app/`
- [ ] Move `src/components/mission-control/*` → `apps/admin/components/`
- [ ] Move `src/lib/mission-control/*` → `apps/admin/lib/`
- [ ] Create `apps/admin/package.json` with dependencies
- [ ] Update imports to use `@asym/*` packages
- [ ] Configure `apps/admin/next.config.mjs`
- [ ] Configure `apps/admin/tailwind.config.ts` (extend `@asym/ui` preset)
- [ ] Test build: `turbo build --filter=admin`

#### 3.2 Create `apps/donor` (Public + Donor Portal)

- [ ] Create `apps/donor/` directory structure
- [ ] Move `src/app/(public)/*` → `apps/donor/app/(public)/`
- [ ] Move `src/app/(donor)/*` → `apps/donor/app/(dashboard)/`
- [ ] Move `src/components/public/*` → `apps/donor/components/public/`
- [ ] Move `src/components/donor/*` → `apps/donor/components/donor/`
- [ ] Move `src/lib/donor-dashboard/*` → `apps/donor/lib/`
- [ ] Create `apps/donor/package.json`
- [ ] Update imports to use `@asym/*` packages
- [ ] Configure Next.js and Tailwind
- [ ] Test build: `turbo build --filter=donor`

#### 3.3 Create `apps/missionary` (Missionary Dashboard)

- [ ] Create `apps/missionary/` directory structure
- [ ] Move `src/app/(missionary)/*` → `apps/missionary/app/`
- [ ] Move missionary-specific components
- [ ] Move `src/lib/missionary/*` → `apps/missionary/lib/`
- [ ] Create `apps/missionary/package.json`
- [ ] Update imports to use `@asym/*` packages
- [ ] Configure Next.js and Tailwind
- [ ] Test build: `turbo build --filter=missionary`

#### 3.4 Handle API Routes

**Strategy**: Duplicate routes, share business logic

- [ ] **Admin API**: Move `src/app/api/admin/*` → `apps/admin/app/api/`
- [ ] **Donor API**: Move `src/app/api/donate/*`, `src/app/api/donor/*` → `apps/donor/app/api/`
- [ ] **Missionary API**: Move `src/app/api/missionaries/*` → `apps/missionary/app/api/`
- [ ] **Shared API logic**: Move to `packages/lib/` (e.g., donation processing)
- [ ] **Auth API**: Keep in each app, use `@asym/auth`

**Deliverable**: 3 independent apps that build and run separately

---

### Phase 4: Enforce Architecture Rules (Week 6)

**Goal**: Prevent cross-app imports and enforce boundaries

**Tasks**:

#### 4.1 ESLint Rules

- [ ] Create `packages/eslint-config/base.js`
- [ ] Add `no-restricted-imports` rule:
  ```javascript
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/apps/*', '../../apps/*'],
            message: '❌ Cannot import from other apps! Use @asym/* packages.',
          },
          {
            group: ['@supabase/ssr', '@supabase/supabase-js'],
            message: '❌ Use @asym/database instead.',
          },
        ],
      },
    ],
  }
  ```
- [ ] Apply to all apps and packages

#### 4.2 TypeScript Path Mapping

- [ ] Configure `tsconfig.json` in each app:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"],
        "@asym/ui": ["../../packages/ui"],
        "@asym/database": ["../../packages/database"],
        "@asym/auth": ["../../packages/auth"],
        "@asym/lib": ["../../packages/lib"]
      }
    }
  }
  ```

#### 4.3 Pre-commit Hooks

- [ ] Install Husky: `bun add -D husky lint-staged`
- [ ] Create `.husky/pre-commit`:
  ```bash
  #!/bin/sh
  turbo lint --filter=[HEAD^1]
  turbo typecheck --filter=[HEAD^1]
  bunx lint-staged
  ```
- [ ] Configure `lint-staged` in root `package.json`

#### 4.4 CI/CD Pipeline

- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [pull_request]
  jobs:
    quality:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: oven-sh/setup-bun@v1
        - run: bun install
        - run: turbo lint
        - run: turbo typecheck
        - run: turbo build
        - run: turbo test
  ```

**Deliverable**: Enforced architecture boundaries with automated checks

---

### Phase 5: Optimize Turborepo Pipeline (Week 7)

**Goal**: Maximize build performance with caching

**Tasks**:

#### 5.1 Configure `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

#### 5.2 Setup Remote Caching (Optional)

- [ ] Sign up for Vercel Remote Cache
- [ ] Configure `turbo login`
- [ ] Link repo: `turbo link`
- [ ] Test: `turbo build --filter=admin`

**Deliverable**: Optimized build pipeline with caching

---

## Enhanced Architecture Rules

### Critical Rules (From Original Doc)

Your original architecture rules document is **excellent** and should be kept as-is. Here are **enhancements** to add:

#### Additional Rule: Database Migrations

**Problem**: Who owns database migrations in a monorepo?

**Solution**:

- [ ] Create `packages/database/migrations/` directory
- [ ] All migrations live in `@asym/database` package
- [ ] Apps NEVER create migrations directly
- [ ] Migration workflow:
  1. Developer creates migration in `packages/database/migrations/`
  2. Run `bun run migrate` from root
  3. All apps automatically get new schema types

#### Additional Rule: Environment Variables

**Problem**: Shared vs app-specific env vars

**Solution**:

```
# Root .env (shared across all apps)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# apps/admin/.env.local (admin-specific)
ADMIN_FEATURE_FLAG=true

# apps/donor/.env.local (donor-specific)
STRIPE_PUBLIC_KEY=...
```

**Rules**:

- ✅ Shared env vars in root `.env`
- ✅ App-specific env vars in `apps/[app]/.env.local`
- ❌ Never duplicate shared env vars in app `.env`

#### Additional Rule: Shared Assets

**Problem**: Where do images/fonts/icons live?

**Solution**:

```
packages/ui/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
└── public/              # Static assets
    └── logo.svg
```

**Rules**:

- ✅ Shared assets in `packages/ui/assets/`
- ✅ App-specific assets in `apps/[app]/public/`
- ❌ No duplicate logos/icons across apps

---

## Testing Strategy

### Unit Tests

- **Packages**: Test in isolation
  - `packages/ui/`: Component tests with Vitest + Testing Library
  - `packages/database/`: Mock Supabase client
  - `packages/lib/`: Pure function tests

### Integration Tests

- **Apps**: Test with real dependencies
  - `apps/admin/`: Test admin workflows
  - `apps/donor/`: Test donation flow
  - `apps/missionary/`: Test donor engagement

### E2E Tests

- **Playwright**: Test critical user journeys
  - Admin: CRM workflow
  - Donor: Donation checkout
  - Missionary: Post creation

**Commands**:

```bash
# Run all tests
turbo test

# Test specific app
turbo test --filter=admin

# Test specific package
turbo test --filter=@asym/ui
```

---

## Deployment Strategy

### Option 1: Vercel (Recommended)

**Pros**: Native Turborepo support, automatic previews, edge functions

**Setup**:

1. Connect GitHub repo to Vercel
2. Create 3 projects:
   - `asymmetric-admin` → `apps/admin`
   - `asymmetric-donor` → `apps/donor`
   - `asymmetric-missionary` → `apps/missionary`
3. Configure root path for each project
4. Enable Turbo Remote Cache

**Domains**:

- Admin: `admin.asymmetric.al`
- Donor: `www.asymmetric.al` (public) + `app.asymmetric.al` (portal)
- Missionary: `missionary.asymmetric.al`

### Option 2: Self-hosted

**Pros**: Full control, cost-effective at scale

**Setup**:

1. Build all apps: `turbo build`
2. Deploy each app to separate servers/containers
3. Use Nginx/Caddy for routing

---

## Rollback Plan

### If Migration Fails

1. **Keep current monolith running** in production
2. **Develop monorepo in parallel** on separate branch
3. **Test thoroughly** before switching
4. **Feature flag** new architecture
5. **Gradual rollout**: Start with admin app only

### Rollback Steps

1. Revert DNS to old monolith
2. Keep monorepo branch for future attempt
3. Document lessons learned

---

## Success Metrics

### Performance

- [ ] Build time reduced by 50%+ (with Turbo cache)
- [ ] Dev server startup < 5 seconds per app
- [ ] Type checking < 10 seconds per app

### Developer Experience

- [ ] New developers onboard in < 1 day
- [ ] Zero cross-app import violations
- [ ] Clear ownership of code (app vs package)

### Scalability

- [ ] Can add new app in < 1 week
- [ ] Can add new developer without conflicts
- [ ] Independent deployment of each app

---

## Common Pitfalls & Solutions

### Pitfall 1: "Everything is shared"

**Problem**: Developers put everything in packages, even app-specific code

**Solution**: Use the **2+ apps rule**:

- If code is used by 1 app → Keep in app
- If code is used by 2+ apps → Move to package

### Pitfall 2: "Circular dependencies"

**Problem**: Package A imports Package B, Package B imports Package A

**Solution**:

- Packages should have clear hierarchy
- Use dependency graph: `@asym/ui` → `@asym/lib` (one direction only)
- Never allow circular imports

### Pitfall 3: "Duplicate components"

**Problem**: Developer creates Button in app instead of using `@asym/ui`

**Solution**:

- ESLint rule to detect duplicate component names
- Code review checklist: "Did you check `@asym/ui` first?"
- AI prompt template: "Check if component exists in `@asym/ui` before creating"

### Pitfall 4: "Slow builds"

**Problem**: Turborepo cache not working

**Solution**:

- Check `turbo.json` outputs are correct
- Verify `.gitignore` doesn't exclude cache
- Use `turbo build --dry-run` to debug
- Enable remote caching for team

---

## Next Steps

### Immediate Actions (This Week)

1. **Review this plan** with team
2. **Create GitHub project** for tracking migration tasks
3. **Setup development branch**: `feat/turborepo-migration`
4. **Assign Phase 1 tasks** to developers

### Decision Points

- [ ] Approve monorepo structure
- [ ] Approve package boundaries
- [ ] Approve deployment strategy
- [ ] Set migration timeline

### Questions to Answer

1. Do we migrate all at once or gradually?
2. Who owns each package?
3. What's the rollback trigger?
4. How do we handle database migrations?

---

## Appendix: File Mapping

### Current → Target Mapping

#### UI Components

```
src/components/ui/* → packages/ui/components/shadcn/*
src/components/dashboard/* → packages/ui/components/dashboard/*
src/components/feed/* → packages/ui/components/feed/*
```

#### Database

```
src/lib/supabase/* → packages/database/clients/*
src/lib/db/* → packages/database/collections/*
src/types/database.ts → packages/database/types/database.ts
```

#### Apps

```
src/app/(admin)/mc/* → apps/admin/app/*
src/app/(donor)/* → apps/donor/app/(dashboard)/*
src/app/(public)/* → apps/donor/app/(public)/*
src/app/(missionary)/* → apps/missionary/app/*
```

---

## Conclusion

This migration transforms Asymmetric.al from a monolithic Next.js app into a scalable, maintainable Turborepo monorepo. The key benefits are:

1. **Clear boundaries**: Apps can't accidentally import from each other
2. **Shared packages**: No code duplication
3. **Independent deployment**: Deploy admin without affecting donor site
4. **Team scalability**: Multiple developers can work without conflicts
5. **Build performance**: Turborepo caching speeds up CI/CD

The migration is **incremental** and **low-risk** because we:

- Keep the current app running during migration
- Test each phase before moving to the next
- Have a clear rollback plan

**Estimated Timeline**: 7 weeks
**Risk Level**: Medium (mitigated by phased approach)
**Team Size**: 2-3 developers

---

**Document Version**: 1.0
**Last Updated**: 2026-01-20
**Author**: AI Architecture Assistant
**Status**: Ready for Review
