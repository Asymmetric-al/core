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

## Mission Control landing dashboard

The top-level `/` route is the staff command-center landing page. It should
give operators a fast picture of what needs attention across giving, people,
missionaries, reports, support, events, automations, and administration.

Design guidance for this surface:

- Use the compact Mission Control page density (`PageShell density="compact"`).
- Keep the first viewport useful: operational stats, attention/next-action
  panels, role quick actions, and module health should appear before broad
  tool browsing.
- Use the existing Maia/Zinc tokens and semantic Tailwind classes. Do not
  override CSS variables or hardcode colors.
- Reserve color for meaning: destructive/red for risk, amber for waiting or
  due-soon, green for healthy/complete, blue for active/in-progress, purple for
  training or special category where already established.
- Preserve the tile registry (`TILES`/`WORKFLOWS`) as the source for module
  routing and quick actions. UI changes should not alter route contracts.
- Keep customization affordances visual unless a real persistence mechanism is
  intentionally added.

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
