# @asym/donor - Donor Dashboard + Public Website

Donor dashboard and public website for Asymmetric.al.

## Features

### Donor Dashboard

- Personal dashboard with giving history
- Pledge management
- Wallet and payment methods
- Ministry updates feed
- Settings and preferences

### Public Website

- Homepage with mission information
- About page
- Workers directory
- Where we work (map)
- Ways to give
- FAQ
- Financials
- Checkout flow (signed-in donors; card payments)
- Document signing (`/sign/[token]`, a placeholder UI with sample content)
- Published CMS pages and legal pages (privacy, terms, cookies)

## Development

```bash
# From the repo root: env, dependencies and verification against a hosted
# Supabase project (see docs/guides/development/getting-started.md)
bun run setup

# Run development server (port 3000)
bun run dev:donor

# Build for production
bun run build:donor

# Type check
bun run typecheck:donor

# Lint
bun run lint:donor
```

## Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Donor-specific components
- `features/` - Feature modules (donor)
- `lib/` - Donor-specific utilities

## Dependencies

This app depends on the following shared packages:

- `@asym/api` - Server business logic behind the app's API routes
- `@asym/auth` - Authentication
- `@asym/config` - Configuration
- `@asym/database` - Database access layer
- `@asym/email` - Email integration
- `@asym/env` - Environment validation
- `@asym/graphql` - Handler for the `/api/graphql` route
- `@asym/lib` - Shared utilities
- `@asym/mock-data` - Demo field-worker data (workers directory, worker profiles and the checkout recipient)
- `@asym/ui` - UI components and theme
