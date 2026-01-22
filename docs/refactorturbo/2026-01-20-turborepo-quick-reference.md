# Turborepo Quick Reference

**Date:** 2026-01-20  
**Purpose:** Quick reference for developers working in the Turborepo monorepo

---

## 🚀 Quick Start

### Install Dependencies
```bash
bun install
```

### Run Development Server
```bash
# Run all apps
turbo dev

# Run specific app
turbo dev --filter=admin
turbo dev --filter=donor
turbo dev --filter=missionary
```

### Build
```bash
# Build all apps
turbo build

# Build specific app
turbo build --filter=admin
```

### Lint & Type Check
```bash
turbo lint
turbo typecheck
```

---

## 📁 Where Does Code Go?

### Decision Tree
```
Need to add code?
│
├─ Is it a UI component?
│  ├─ Used by 2+ apps? → packages/ui/
│  └─ Used by 1 app? → apps/[app]/components/
│
├─ Is it database code?
│  └─ Always → packages/database/
│
├─ Is it auth code?
│  └─ Always → packages/auth/
│
├─ Is it a utility function?
│  ├─ Used by 2+ apps? → packages/lib/
│  └─ Used by 1 app? → apps/[app]/lib/
│
└─ Is it app-specific logic?
   └─ Always → apps/[app]/lib/
```

---

## 🎯 Import Rules

### ✅ CORRECT Imports

```typescript
// In any app: Import from packages
import { Button } from '@asym/ui'
import { createClient } from '@asym/database'
import { useAuth } from '@asym/auth'
import { cn } from '@asym/lib'

// In app: Import from same app
import { AdminTable } from '@/components/admin-table'
import { formatCRM } from '@/lib/crm-utils'
```

### ❌ WRONG Imports

```typescript
// ❌ NEVER import from other apps
import { AdminTable } from '../../admin/components/table'

// ❌ NEVER import Supabase directly
import { createClient } from '@supabase/ssr'

// ❌ NEVER import from app in package
import { AdminTheme } from '../../apps/admin/theme'
```

---

## 📦 Package Usage

### `@asym/ui` - UI Components
```typescript
// shadcn/ui primitives
import { Button, Card, Dialog, Input } from '@asym/ui'

// Dashboard components
import { StatCard, ChartCard } from '@asym/ui/dashboard'

// Feed components
import { FeedPost, CommentsDialog } from '@asym/ui/feed'

// Hooks
import { useMobile } from '@asym/ui/hooks'
```

### `@asym/database` - Database Access
```typescript
// Supabase clients
import { createClient } from '@asym/database'           // Auto-detects server/client
import { createAdminClient } from '@asym/database'      // Admin client

// TanStack DB collections
import { postsCollection, profilesCollection } from '@asym/database'

// Types
import type { Database, Post, Profile } from '@asym/database/types'

// Hooks
import { usePostsWithAuthors } from '@asym/database/hooks'
```

### `@asym/auth` - Authentication
```typescript
// Hooks
import { useAuth, useUser } from '@asym/auth'

// Guards (server-side)
import { requireAdmin, requireDonor } from '@asym/auth/guards'

// Context
import { AuthProvider } from '@asym/auth'
```

### `@asym/lib` - Utilities
```typescript
// Utils
import { cn, formatCurrency, formatDate } from '@asym/lib'

// Stripe
import { createCheckoutSession } from '@asym/lib/stripe'

// Cloudinary
import { uploadImage } from '@asym/lib/cloudinary'

// Monitoring
import { captureException } from '@asym/lib/monitoring'
```

---

## 🏗️ Creating New Components

### Checklist
- [ ] Does this component exist in `@asym/ui`?
- [ ] Will this be used by 2+ apps?
  - YES → Create in `packages/ui/`
  - NO → Create in `apps/[app]/components/`
- [ ] Does it need database access?
  - Use `@asym/database` (never direct Supabase)
- [ ] Does it need auth?
  - Use `@asym/auth`

### Example: Creating a Shared Component
```bash
# 1. Create in packages/ui
touch packages/ui/components/dashboard/metric-card.tsx

# 2. Export from index
echo "export * from './dashboard/metric-card'" >> packages/ui/components/dashboard/index.ts

# 3. Use in apps
# apps/admin/app/page.tsx
import { MetricCard } from '@asym/ui/dashboard'
```

---

## 🔧 Common Tasks

### Add New Dependency to App
```bash
# Navigate to app directory
cd apps/admin

# Add dependency
bun add package-name

# Or from root
bun add package-name --filter=admin
```

### Add New Dependency to Package
```bash
cd packages/ui
bun add package-name

# Or from root
bun add package-name --filter=@asym/ui
```

### Create New Package
```bash
mkdir -p packages/new-package
cd packages/new-package

# Create package.json
cat > package.json << EOF
{
  "name": "@asym/new-package",
  "version": "0.0.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts"
}
EOF

# Create index.ts
touch index.ts
```

### Run Tests
```bash
# All tests
turbo test

# Specific app
turbo test --filter=admin

# Specific package
turbo test --filter=@asym/ui

# Watch mode
turbo test --filter=admin -- --watch
```

---

## 🐛 Troubleshooting

### "Cannot find module '@asym/ui'"
**Solution**: Install dependencies
```bash
bun install
```

### "Module not found: Can't resolve '../../apps/admin'"
**Solution**: You're trying to import from another app (forbidden!)
- Use `@asym/*` packages instead
- Or move code to shared package

### "Type error: Cannot find type 'Database'"
**Solution**: Import from `@asym/database/types`
```typescript
import type { Database } from '@asym/database/types'
```

### Build cache not working
**Solution**: Clear Turbo cache
```bash
turbo build --force
```

---

## 📚 Resources

- **Main Migration Plan**: `documents/2026-01-20-turborepo-migration-plan.md`
- **Architecture Comparison**: `documents/2026-01-20-architecture-comparison.md`
- **Original Architecture Rules**: Your existing architecture rules doc
- **Turborepo Docs**: https://turbo.build/repo/docs

---

## 🆘 Getting Help

### Before Asking
1. Check this quick reference
2. Check main migration plan
3. Check ESLint errors (they're helpful!)
4. Check TypeScript errors

### When Asking
Include:
- What you're trying to do
- What error you're seeing
- What you've tried

---

**Last Updated**: 2026-01-20

