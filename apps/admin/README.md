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

```bash
# Install dependencies
bun install

# Run development server
bun dev

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

