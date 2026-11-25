# @asym/admin - Mission Control

Mission Control, the staff operations app (port 3030), including Web Studio
(`/web-studio`). The prototype public CMS read routes (`/api/cms/public/*`)
were retired in WP6 part 2a (AL-2679) ahead of WP7's public reader.

## Route areas

Staff routes live under `app/(app)/`: CRM (records, notes, relationships),
contributions, reports, support, care, events, mobilize, tasks, workflows,
automations, email, PDF, sign, content moderation (`feed`), settings and
administration (teams, Eve). Web Studio, the Payload CMS admin, lives under
`app/(payload)/web-studio`. `docs/guides/architecture/overview.md` maps routes
and data flow.

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
- Preserve the tile registry (`TILES`/`WORKFLOWS` in
  `packages/lib/mission-control/tiles.ts`) as the source for module routing
  and quick actions. UI changes should not alter route contracts.
- Keep customization affordances visual unless a real persistence mechanism is
  intentionally added.

## Development

### Cloud Agent Mission Control setup

Use this path in Cursor Cloud or any disposable agent VM:

```bash
# From the repo root
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command installs dependencies,
runs `bun run skills:verify`, and writes gitignored `.env.local` placeholders
for Cloud Agent development:

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

### Root-level admin commands

```bash
# From the repo root
bun run setup:mission-control:cloud

# Run development server
bun run dev:admin

# Build for production
bun run build:admin

# Type check
bun run typecheck:admin

# Lint
bun run lint:admin
```

## Structure

- `app/` - Next.js App Router pages, layouts and thin API route handlers
- `components/` - Admin-specific components
- `features/` - Feature modules (`mission-control`, `support-hub`, `studios`)
- `lib/` - Admin-specific utilities, including the role gate
  (`lib/admin-access.ts`)
- `src/` - Payload CMS: collections, access rules and the public content
  reader (`src/cms`), the Web Studio UI (`src/cms-ui`), applied migrations
  (`src/migrations`) and Payload styling (`src/styles`)
- `payload.config.ts`, `proxy.ts`, `next.config.ts` - Payload, edge auth and
  Next.js configuration

## Dependencies

The main workspace packages this app uses (`package.json` has the full list):

- `@asym/ui` - UI components and theme
- `@asym/api` - Server business logic and data access
- `@asym/database` - Supabase clients, collections and hooks
- `@asym/auth` - Authentication and the edge proxy
- `@asym/env` - Environment validation
- `@asym/lib`, `@asym/config` - Shared utilities and configuration
- `@asym/email` - Email integration
- `@asym/mock-data` - Shared fixture data (re-exported from `lib/mock-data`)
