# Applications

This directory contains the three independent Next.js applications that make up the Asymmetric.al platform.

## App Structure

```
apps/
├── admin/              # Mission Control (staff-only)
├── donor/              # Public site + Donor portal
└── missionary/         # Missionary dashboard
```

## App Boundaries

### `apps/admin` - Mission Control
- **Users**: Admin, Finance, Staff, Member Care, Mobilizers
- **Routes**: `/mc/*`
- **Purpose**: Organization management, CRM, contributions, reporting
- **Can Import**: `@asym/ui`, `@asym/database`, `@asym/auth`, `@asym/lib`
- **Cannot Import**: `apps/donor/*`, `apps/missionary/*`

### `apps/donor` - Public Site + Donor Portal
- **Users**: Public visitors + Authenticated donors
- **Routes**: `/` (public), `/dashboard/*` (authenticated)
- **Purpose**: Public website, donation checkout, donor self-service
- **Can Import**: `@asym/ui`, `@asym/database`, `@asym/auth`, `@asym/lib`
- **Cannot Import**: `apps/admin/*`, `apps/missionary/*`

### `apps/missionary` - Missionary Dashboard
- **Users**: Missionaries (field workers)
- **Routes**: `/missionary/*`
- **Purpose**: Donor engagement, task management, impact tracking
- **Can Import**: `@asym/ui`, `@asym/database`, `@asym/auth`, `@asym/lib`
- **Cannot Import**: `apps/admin/*`, `apps/donor/*`

## Architecture Rules

### ✅ Allowed
- Import from `@asym/*` packages
- Import from own `components/`, `lib/`, `hooks/`
- Share code via packages

### ❌ Forbidden
- Import from other apps
- Duplicate components (use `@asym/ui` instead)
- Create own Supabase client (use `@asym/database`)

## Development

Each app runs independently:

```bash
# Run specific app
turbo dev --filter=admin
turbo dev --filter=donor
turbo dev --filter=missionary

# Build specific app
turbo build --filter=admin

# Run all apps
turbo dev
```

## Deployment

Each app deploys independently to Vercel:
- **Admin**: `admin.asymmetric.al`
- **Donor**: `www.asymmetric.al` + `app.asymmetric.al`
- **Missionary**: `missionary.asymmetric.al`

## Next Steps

Apps will be created in Phase 3 of the migration. See `docs/refactorturbo/2026-01-20-turborepo-migration-plan.md` for details.

