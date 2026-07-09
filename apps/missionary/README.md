# @asym/missionary - Missionary Dashboard

Missionary dashboard application for Asymmetric.al.

## Features

- Personal dashboard with metrics and analytics
- Donor management and communication
- Ministry updates and feed
- Email studio for newsletters
- Profile management
- Task management
- Settings and preferences

## Development

```bash
# From the repo root, install dependencies
bun run setup:mission-control:cloud

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

- `@asym/ui` - UI components and theme
- `@asym/database` - Database access layer
- `@asym/lib` - Shared utilities
- `@asym/config` - Configuration
- `@asym/auth` - Authentication
- `@asym/email` - Email integration
