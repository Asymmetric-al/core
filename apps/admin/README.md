# @asym/admin - Mission Control

Admin application for Asymmetric.al Mission Control.

## Features

- Organization management
- User administration
- Content moderation
- Analytics and reporting
- Email campaigns
- PDF generation
- Web studio
- Care management
- Event management
- Task management

## Development

### Cloud Agent Mission Control setup

Use this path in Cursor Cloud or any disposable agent VM:

```bash
# From the repo root
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command writes only gitignored
`.env.local` placeholders for Cloud Agent development:

- `SKIP_ENV_VALIDATION=1`
- `E2E_AUTH_BYPASS=true`
- placeholder Supabase public values
- `PLAYWRIGHT_ADMIN_BASE_URL=http://localhost:3030`
- `PLAYWRIGHT_ADMIN_PORT=3030`

Existing explicit `E2E_AUTH_BYPASS=false` values are preserved. Pass
`--force-bypass` only when you intentionally want the setup script to override
that local choice.

Replace the Supabase placeholders with real project values when you need live
data, auth, or database-backed admin workflows.

### Regular local setup

```bash
# Install dependencies
bun install

# Run development server
bun run dev:admin

# Build for production
bun build

# Type check
bun typecheck

# Lint
bun lint
```

## Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Admin-specific components
- `features/` - Feature modules (mission-control)
- `lib/` - Admin-specific utilities

## Dependencies

This app depends on the following shared packages:

- `@asym/ui` - UI components and theme
- `@asym/database` - Database access layer
- `@asym/lib` - Shared utilities
- `@asym/config` - Configuration
- `@asym/auth` - Authentication
- `@asym/email` - Email integration
