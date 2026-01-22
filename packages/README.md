# Shared Packages

This directory contains shared packages used across all apps in the monorepo.

## Package Structure

```
packages/
├── ui/                 # Shared UI components (@asym/ui)
├── database/           # Supabase clients + types (@asym/database)
├── auth/               # Authentication logic (@asym/auth)
├── email/              # SendGrid integration (@asym/email)
├── lib/                # Shared utilities (@asym/lib)
└── config/             # Shared configs (@asym/config)
```

## Package Naming Convention

All packages use the `@asym/*` namespace:
- `@asym/ui` - UI components
- `@asym/database` - Database access
- `@asym/auth` - Authentication
- `@asym/email` - Email functionality
- `@asym/lib` - Utilities
- `@asym/config` - Shared configurations

## Usage in Apps

Apps import from packages using the `@asym/*` namespace:

```typescript
// ✅ Correct
import { Button } from '@asym/ui'
import { createClient } from '@asym/database'
import { useAuth } from '@asym/auth'

// ❌ Wrong - never import from other apps
import { Button } from '../../../apps/admin/components/button'
```

## Development

Each package has its own `package.json` and can be developed independently.

To work on a package:
```bash
cd packages/ui
bun install
bun run build
```

## Next Steps

Packages will be created in Phase 2 of the migration. See `docs/refactorturbo/2026-01-20-turborepo-migration-plan.md` for details.

