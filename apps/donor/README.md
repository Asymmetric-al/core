# @asym/donor - Donor Dashboard + Public Website

Donor dashboard and public website for Asymmetric.al.

## Features

### Donor Dashboard
- Personal dashboard with giving history
- Pledge management
- Wallet and payment methods
- Activity feed
- Settings and preferences

### Public Website
- Homepage with mission information
- About page
- Workers directory
- Where we work (map)
- Ways to give
- FAQ
- Financials
- Checkout flow
- Digital signatures

## Development

```bash
# Install dependencies
bun install

# Run development server (port 3003)
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
- `components/` - Donor-specific components
- `features/` - Feature modules (donor)
- `lib/` - Donor-specific utilities

## Dependencies

This app depends on the following shared packages:
- `@asym/ui` - UI components and theme
- `@asym/database` - Database access layer
- `@asym/lib` - Shared utilities
- `@asym/config` - Configuration
- `@asym/auth` - Authentication
- `@asym/email` - Email integration

