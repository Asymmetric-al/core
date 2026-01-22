# Architecture Rules - Enhancements for Turborepo

**Date:** 2026-01-20  
**Purpose:** Enhancements to add to your existing architecture rules document

---

## Overview

Your existing architecture rules document is **excellent** and covers the fundamentals well. This document provides **additional rules** specific to the Turborepo monorepo structure.

**Action**: Append these sections to your existing architecture rules document.

---

## Additional Critical Rules

### Rule 7: Database Migrations Ownership

**Problem**: In a monorepo, who creates and manages database migrations?

**Rule**: ALL database migrations MUST live in `packages/database/migrations/`

**Rationale**:
- Single source of truth for schema
- All apps automatically get updated types
- Prevents schema drift between apps

**Workflow**:
```bash
# 1. Create migration in packages/database
cd packages/database
supabase migration new add_user_preferences

# 2. Write migration SQL
# packages/database/migrations/20260120_add_user_preferences.sql

# 3. Run migration
bun run migrate

# 4. Generate types (automatic)
bun run generate-types

# 5. All apps now have updated types
```

**Forbidden**:
```bash
# ❌ NEVER create migrations in apps
cd apps/admin
supabase migration new ...  # DON'T DO THIS
```

**Enforcement**:
- [ ] Add to pre-commit hook: Check no migrations in `apps/`
- [ ] Document in `packages/database/README.md`
- [ ] Add to CI/CD: Fail if migrations found in apps

---

### Rule 8: Environment Variables Strategy

**Problem**: Which env vars are shared vs app-specific?

**Rule**: Shared env vars in root, app-specific in app directory

**Structure**:
```
# Root .env (shared across ALL apps)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=xxx

# apps/admin/.env.local (admin-only)
ADMIN_FEATURE_FLAG_CRM_V2=true
ADMIN_DEBUG_MODE=false

# apps/donor/.env.local (donor-only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
DONOR_FEATURE_FLAG_NEW_CHECKOUT=true

# apps/missionary/.env.local (missionary-only)
MISSIONARY_FEATURE_FLAG_ANALYTICS=true
```

**Rules**:
- ✅ Database credentials → Root `.env`
- ✅ Third-party API keys (shared) → Root `.env`
- ✅ Feature flags (app-specific) → App `.env.local`
- ❌ NEVER duplicate shared env vars in app `.env`

**Validation Script**:
```bash
# scripts/validate-env.sh
# Checks for duplicate env vars across apps
```

---

### Rule 9: Shared Assets Management

**Problem**: Where do logos, fonts, and icons live?

**Rule**: Shared assets in `packages/ui/`, app-specific in `apps/[app]/public/`

**Structure**:
```
packages/ui/
├── assets/
│   ├── fonts/
│   │   ├── inter.woff2
│   │   └── syne.woff2
│   ├── icons/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   └── images/
│       └── placeholder.png
└── public/              # Served at /_ui/*
    └── logo.svg

apps/admin/
└── public/              # Admin-specific assets
    └── admin-icon.svg

apps/donor/
└── public/              # Donor-specific assets
    └── hero-image.jpg
```

**Usage**:
```typescript
// ✅ Shared logo from @asym/ui
import logo from '@asym/ui/assets/icons/logo.svg'

// ✅ App-specific image
import heroImage from '@/public/hero-image.jpg'
```

**Rules**:
- ✅ Brand assets (logo, colors) → `packages/ui/assets/`
- ✅ Shared fonts → `packages/ui/assets/fonts/`
- ✅ App-specific images → `apps/[app]/public/`
- ❌ No duplicate logos across apps

---

### Rule 10: Package Dependency Hierarchy

**Problem**: Packages importing from each other can create circular dependencies

**Rule**: Packages MUST follow strict dependency hierarchy

**Hierarchy** (top → bottom, can only import downward):
```
Level 1: @asym/config          (no dependencies)
Level 2: @asym/lib              (depends on: config)
Level 3: @asym/database         (depends on: lib)
Level 4: @asym/auth             (depends on: database, lib)
Level 5: @asym/ui               (depends on: lib)
Level 6: @asym/email            (depends on: database, lib)
```

**Allowed**:
```typescript
// ✅ @asym/auth can import from @asym/database
import { createClient } from '@asym/database'

// ✅ @asym/ui can import from @asym/lib
import { cn } from '@asym/lib'
```

**Forbidden**:
```typescript
// ❌ @asym/database CANNOT import from @asym/auth
import { useAuth } from '@asym/auth'  // Circular dependency!

// ❌ @asym/lib CANNOT import from @asym/ui
import { Button } from '@asym/ui'  // Wrong direction!
```

**Enforcement**:
- [ ] Add to ESLint config: Detect circular dependencies
- [ ] Add to CI/CD: Fail on circular imports
- [ ] Document in each package's README

---

### Rule 11: API Route Strategy

**Problem**: Should API routes be shared or duplicated?

**Rule**: Duplicate routes, share business logic

**Pattern**:
```
# Business logic in packages
packages/lib/donations/
├── create-donation.ts       # Shared logic
├── validate-donation.ts
└── send-receipt.ts

# API routes in apps (thin wrappers)
apps/admin/app/api/donations/route.ts
apps/donor/app/api/donations/route.ts
apps/missionary/app/api/donations/route.ts
```

**Example**:
```typescript
// packages/lib/donations/create-donation.ts
export async function createDonation(data: DonationInput) {
  // Shared business logic
  const supabase = await createClient()
  const result = await supabase.from('donations').insert(data)
  await sendReceipt(result.data)
  return result
}

// apps/donor/app/api/donations/route.ts
import { createDonation } from '@asym/lib/donations'

export async function POST(req: Request) {
  const data = await req.json()
  const result = await createDonation(data)  // Call shared logic
  return Response.json(result)
}
```

**Rules**:
- ✅ Business logic → `packages/lib/`
- ✅ API routes → `apps/[app]/app/api/`
- ✅ Each app has its own routes (for auth/permissions)
- ❌ No business logic in API routes (keep thin)

---

### Rule 12: Testing Strategy by Layer

**Problem**: How to test packages vs apps?

**Rule**: Different testing strategies for packages vs apps

**Packages** (Unit Tests):
```typescript
// packages/ui/components/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './button'

test('renders button', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

**Apps** (Integration Tests):
```typescript
// apps/donor/app/checkout/page.test.tsx
import { render, screen } from '@testing-library/react'
import CheckoutPage from './page'

test('checkout flow', async () => {
  render(<CheckoutPage />)
  // Test with real dependencies
})
```

**E2E Tests** (Critical Paths):
```typescript
// tests/e2e/donation-flow.spec.ts
test('complete donation flow', async ({ page }) => {
  await page.goto('/checkout')
  // Test across multiple apps
})
```

**Rules**:
- ✅ Packages: Unit tests (mocked dependencies)
- ✅ Apps: Integration tests (real dependencies)
- ✅ E2E: Critical user journeys
- ❌ No E2E tests for every feature (too slow)

---

### Rule 13: Versioning Strategy

**Problem**: How to version packages in a monorepo?

**Rule**: Use Changesets for package versioning

**Workflow**:
```bash
# 1. Make changes to package
# packages/ui/components/button.tsx

# 2. Create changeset
bunx changeset

# 3. Select packages changed
# Select: @asym/ui

# 4. Describe changes
# "Added new variant to Button component"

# 5. Commit changeset
git add .changeset/
git commit -m "feat(ui): add button variant"

# 6. Release (CI/CD)
bunx changeset version
bunx changeset publish
```

**Rules**:
- ✅ Use Changesets for package versioning
- ✅ Semantic versioning (major.minor.patch)
- ✅ Apps always use `workspace:*` for packages
- ❌ No manual version bumps

---

## Updated Enforcement Checklist

Add these to your existing enforcement checklist:

### Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh

# Existing checks
turbo lint --filter=[HEAD^1]
turbo typecheck --filter=[HEAD^1]

# NEW: Check for migrations in apps
if git diff --cached --name-only | grep -q "apps/.*/migrations/"; then
  echo "❌ Error: Migrations must be in packages/database/migrations/"
  exit 1
fi

# NEW: Check for duplicate env vars
./scripts/validate-env.sh

# NEW: Check for circular dependencies
bunx madge --circular packages/
```

### CI/CD Additions
```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    steps:
      # Existing steps
      - run: turbo lint
      - run: turbo typecheck
      - run: turbo build
      
      # NEW: Check architecture rules
      - run: bunx madge --circular packages/
      - run: ./scripts/validate-env.sh
      - run: ./scripts/check-migrations.sh
```

---

## AI Prompt Templates

Add these to your AI guidelines:

### Creating Components
```
Before creating a component, check:
1. Does it exist in @asym/ui? (Check packages/ui/components/)
2. Will it be used by 2+ apps?
   - YES → Create in packages/ui/
   - NO → Create in apps/[app]/components/
3. Follow the import rules in ARCHITECTURE-RULES.md
```

### Database Operations
```
For database operations:
1. ALWAYS use @asym/database (never direct Supabase imports)
2. Import: import { createClient } from '@asym/database'
3. For migrations: Create in packages/database/migrations/
4. For types: import type { Database } from '@asym/database/types'
```

### Adding Dependencies
```
Before adding a dependency:
1. Is it used by 2+ apps? → Add to packages/
2. Is it app-specific? → Add to apps/[app]/
3. Use: bun add package-name --filter=[target]
```

---

## Summary of Enhancements

These enhancements add **7 new critical rules** to your existing architecture:

1. ✅ **Database Migrations**: Centralized in `packages/database/`
2. ✅ **Environment Variables**: Clear shared vs app-specific strategy
3. ✅ **Shared Assets**: Organized in `packages/ui/assets/`
4. ✅ **Package Hierarchy**: Prevents circular dependencies
5. ✅ **API Routes**: Duplicate routes, share logic
6. ✅ **Testing Strategy**: Different approaches per layer
7. ✅ **Versioning**: Changesets for package management

**Action Items**:
- [ ] Append these rules to existing architecture doc
- [ ] Update pre-commit hooks
- [ ] Update CI/CD pipeline
- [ ] Train team on new rules
- [ ] Update AI prompt templates

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-20  
**Status**: Ready to Merge with Existing Rules

