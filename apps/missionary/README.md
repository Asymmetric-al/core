# @asym/missionary-app - Missionary Workspace

Missionary workspace for support raising and communication in Asymmetric.al.

## Features

- Personal dashboard with metrics and analytics
- Partner (donor) management
- Ministry updates feed (`/feed`; `/email-studio` and `/ministry-updates` redirect there)
- Profile management
- Task management
- Settings and preferences

## Development

```bash
# From the repo root: env, dependencies and verification against a hosted
# Supabase project (see docs/guides/development/getting-started.md)
bun run setup

# Run development server (port 4000)
bun run dev:missionary

# Build for production
bun run build:missionary

# Type check
bun run typecheck:missionary

# Lint
bun run lint:missionary
```

## Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Missionary-specific components
- `features/` - Feature modules (missionary)
- `lib/` - Missionary-specific utilities

## Dependencies

This app depends on the following shared packages:

- `@asym/api` - Server business logic behind the app's API routes
- `@asym/auth` - Authentication
- `@asym/config` - Configuration
- `@asym/database` - Database access layer
- `@asym/email` - Email integration
- `@asym/env` - Environment validation
- `@asym/lib` - Shared utilities
- `@asym/missionary` - Shared missionary dashboard and task components
- `@asym/mock-data` - Demo data
- `@asym/ui` - UI components and theme
