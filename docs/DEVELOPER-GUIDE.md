# Developer Guide

This guide helps new developers get started with the Give Hope codebase. Target: make your first change within 1 hour.

## Quick Start

```bash
# 1. Automated cloud setup (installs deps + links Supabase + pushes schema/seed)
./setup-cloud.sh --project-ref <your-project-ref>

# 2. Start development
bun run dev

# 3. Open browser
open http://localhost:3000
```

If needed, copy `.env.example` to `.env.local` and fill in the Supabase keys before running the app.

## Supabase Cloud

This repo uses a hosted Supabase project (no local Docker).

- **Link the project**: `supabase link --project-ref <your-project-ref>`
- **Deploy schema + seed**: `supabase db push --include-seed`
- **Schema source**: `supabase/schema.sql`
- **Seed data**: `supabase/seed.sql`
- **Schema changes**: Update `supabase/schema.sql` and create a new migration for deployment.
- **Env vars**: See the [Environment Variable Matrix](#environment-variable-matrix) for required values.

## Environment Variable Matrix

Use this matrix to decide what you need for cloud development vs production. "Required" means the related feature will not work without it.

| Variable | Requirement | Purpose | Example / default | Feature impact if missing |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase project URL | `https://your-project.supabase.co` | Auth + data access fail; API routes error. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Client-safe Supabase key | `your-anon-key` | Client auth/data fail; middleware errors. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Server admin key | `your-service-role-key` | Server API routes (admin, donations, profiles, etc.) fail. |
| `SUPABASE_PROJECT_REF` | Required (setup) | Supabase project ref for CLI linking | `your-project-ref` | Setup/linking fails. |
| `SUPABASE_DB_PASSWORD` | Required for non-interactive setup | DB password used by `supabase link` | `your-db-password` | Setup prompts or fails in CI. |
| `DATABASE_URL` | Required | Direct DB connection string | `postgresql://...` | DB tooling/verification scripts fail. |
| `NEXT_PUBLIC_SITE_URL` | Optional (dev), recommended in prod | Base site URL for SEO + Unlayer | `http://localhost:3000` (default: `https://givehope.org`) | SEO links + allowed domains use fallback. |
| `GOOGLE_SITE_VERIFICATION` | Optional | Google site verification | empty | No verification meta tag. |
| `BING_SITE_VERIFICATION` | Optional | Bing site verification | empty | No verification meta tag. |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Optional | Main domain for subdomain routing | `localhost:3000` | Subdomain routing uses default. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional (local), required for Stripe checkout | Stripe publishable key | `pk_test_...` | Donation checkout fails. |
| `STRIPE_SECRET_KEY` | Optional (local), required for Stripe API | Stripe secret key | `sk_test_...` | Server donation processing fails. |
| `NEXT_PUBLIC_UNLAYER_PROJECT_ID` | Optional (local), required for Unlayer exports | Unlayer project id | `123456` | Email/PDF studio exports/paid features disabled. |
| `NEXT_PUBLIC_UNLAYER_WHITE_LABEL` | Optional | Unlayer white-label toggle | `false` | White-label mode disabled. |
| `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS` | Optional | Comma-separated allowed domains | `localhost,127.0.0.1` | Extra domains not permitted. |
| `NEXT_PUBLIC_BRAND_NAME` | Optional | Studio brand name | `GiveHope` | Defaults apply. |
| `NEXT_PUBLIC_BRAND_LOGO_URL` | Optional | Studio logo URL | `https://.../logo.png` | Logo missing in editors. |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR` | Optional | Brand primary color | `#0f172a` | Defaults apply. |
| `NEXT_PUBLIC_BRAND_ACCENT_COLOR` | Optional | Brand accent color | `#2563eb` | Defaults apply. |
| `NEXT_PUBLIC_EMAIL_FOOTER_TEXT` | Optional | Default email footer text | `YourOrg | 123 Main St` | Footer empty. |
| `NEXT_PUBLIC_PDF_FOOTER_TEXT` | Optional | Default PDF footer text | `YourOrg | 123 Main St` | Falls back to email footer or empty. |
| `NEXT_PUBLIC_CLOUDINARY_ENABLED` | Optional | Enable Cloudinary integration | `false` | Cloudinary features disabled. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Required when Cloudinary enabled | Cloudinary cloud name | `your-cloud` | Uploads/media features fail. |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Required when Cloudinary enabled | Cloudinary API key | `your-key` | Uploads/media features fail. |
| `CLOUDINARY_API_SECRET` | Required when Cloudinary enabled | Cloudinary API secret | `your-secret` | Uploads/media features fail. |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry DSN | empty | Monitoring disabled (warning logged). |
| `CRON_SECRET` | Optional (recommended in prod) | Bearer token for cron endpoints | `random-string` | Cron endpoints unauthenticated. |
| `ALLOW_DEMO_ACCOUNTS` | Optional | Allow demo accounts in prod | `false` | Demo account API disabled in production. |
| `SENDGRID_WEBHOOK_VERIFICATION_KEY` | Optional | Verify SendGrid webhook signatures | empty | Webhook verification unavailable. |
| `EMAIL_ENCRYPTION_KEY` | Optional | Encrypt stored email provider keys | `base64-32-bytes` | Email credential encryption disabled. |
| `PLAYWRIGHT_BASE_URL` | Optional | Base URL for Playwright | `http://localhost:3000` | Uses default if unset. |
| `VERIFY_E2E_PROJECTS` | Optional | Run all Playwright projects | `all` | Only Chromium project runs. |
| `CI` | Optional (set by CI) | Playwright CI behavior toggles | `true/false` | Local behavior unaffected. |

## Troubleshooting

| Issue | Quick fix |
|---|---|
| Supabase CLI missing | Install it (`brew install supabase/tap/supabase`) and re-run setup. |
| Supabase CLI not logged in | Run `supabase login`, then re-run `./setup-cloud.sh`. |
| Project not linked | Run `supabase link --project-ref <your-project-ref>` or re-run setup. |
| `supabase db push` fails | Confirm DB password and project access; re-run setup with `--db-password`. |
| `DATABASE_URL` missing | Add it to `.env.local` or export it in your shell. |

## Common Commands

| Command | Description |
|---------|-------------|
| `bun run setup:cloud` | Install deps, link Supabase project, push schema + seed |
| `bun run supabase:push` | Push schema + seed to the linked Supabase project |
| `bun run dev` | Start dev server (Turbopack) |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type checker |
| `bun run build` | Production build |
| `bun run test:e2e` | Run Playwright E2E tests |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/mc/         # Mission Control (admin dashboard)
│   ├── (missionary)/       # Missionary dashboard
│   ├── (donor)/            # Donor portal
│   ├── (public)/           # Public website
│   ├── api/                # API routes
│   └── auth/               # Auth callbacks
│
├── components/             # Shared UI components
│   ├── ui/                 # shadcn/ui primitives (DO NOT EDIT)
│   ├── feature/            # Feature-specific components
│   ├── feed/               # Feed/post components
│   └── public/             # Public website components
│
├── features/               # Feature modules (domain logic)
│   ├── mission-control/    # Admin dashboard feature
│   ├── missionary/         # Missionary feature
│   └── donor/              # Donor feature
│
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and clients
│   ├── mock-data/          # Mock data for development
│   ├── supabase/           # Supabase client (server/client)
│   └── utils.ts            # Common utilities
│
├── providers/              # React context providers
├── types/                  # TypeScript type definitions
└── config/                 # App configuration
```

## Key Patterns

### 1. Feature Module Structure

Each feature (mission-control, missionary, donor) follows this pattern:

```
features/
└── feature-name/
    ├── index.ts              # Public API (barrel export)
    ├── components/           # Feature-specific components
    │   └── index.ts          # Component barrel export
    ├── hooks/                # Feature-specific hooks
    └── care/                 # Sub-features (optional)
```

### 2. Import Conventions

```typescript
// UI primitives - from shadcn/ui
import { Button, Card, Input } from '@/components/ui/button'

// Shared components
import { PageHeader, AppShell } from '@/components'

// Feature components
import { TilePage, SidebarNav } from '@/features/mission-control'

// Hooks
import { useAuth, useIsMobile } from '@/hooks'

// Mock data (development only)
import { MISSIONARIES, getDonorById } from '@/lib/mock-data'

// Utils
import { cn, formatCurrency } from '@/lib/utils'
```

### 3. Page Structure

```typescript
// src/app/(admin)/mc/my-page/page.tsx
import { PageHeader, TilePage } from '@/features/mission-control'

export default function MyPage() {
  return (
    <TilePage 
      title="Page Title"
      description="What this page does"
    >
      {/* Page content */}
    </TilePage>
  )
}
```

### 4. Responsive Design

Use the responsive utilities from `@/lib/responsive`:

```typescript
// CSS utility classes
<div className="container-responsive">  // Responsive container
<div className="grid-responsive-3">     // 1 → 2 → 3 columns
<h1 className="text-responsive-h1">     // Fluid typography

// React hooks
import { useIsMobile, useBreakpoint } from '@/hooks'

function MyComponent() {
  const isMobile = useIsMobile()
  const breakpoint = useBreakpoint() // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}
```

See `docs/RESPONSIVE.md` for full documentation.

## Adding a New Page

### Step 1: Create the page file

```bash
# For Mission Control
mkdir -p src/app/\(admin\)/mc/my-page
touch src/app/\(admin\)/mc/my-page/page.tsx
```

### Step 2: Add the basic structure

```typescript
// src/app/(admin)/mc/my-page/page.tsx
import { TilePage } from '@/features/mission-control'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MyPage() {
  return (
    <TilePage 
      title="My New Page"
      description="A short description of what this page does"
    >
      <div className="grid-responsive-2">
        <Card className="card-padding">
          <CardHeader>
            <CardTitle>Section 1</CardTitle>
          </CardHeader>
          <CardContent>
            Content here
          </CardContent>
        </Card>
      </div>
    </TilePage>
  )
}
```

### Step 3: Add navigation (if needed)

Edit `src/features/mission-control/components/app-shell/sidebar-nav.tsx` to add the route.

## Adding a New Component

### Step 1: Create in the right location

- **Shared across features**: `src/components/`
- **Feature-specific**: `src/features/[feature]/components/`
- **UI primitive**: Don't add here, use shadcn/ui

### Step 2: Follow the naming convention

- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-kebab-case.ts`

### Step 3: Export from barrel

```typescript
// src/components/index.ts (or feature index.ts)
export { MyNewComponent } from './my-new-component'
```

## Working with Mock Data

All mock data lives in `src/lib/mock-data/`. For development:

```typescript
import { 
  MISSIONARIES,           // Array of missionary records
  DONORS,                 // Array of donor records
  DONATIONS,              // Array of donation records
  getMissionaryById,      // Get single missionary
  getDonorById,           // Get single donor
  getFieldWorkers,        // Get public worker list
} from '@/lib/mock-data'
```

See `docs/MOCK-DATA.md` for migration to production Supabase.

## Common Tasks

### Run tests before committing

```bash
bun run typecheck && bun run lint
```

### Check responsive behavior

1. Open Chrome DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Test at: 375px, 768px, 1024px, 1440px

### Debug API routes

```bash
# Test with curl
curl http://localhost:3000/api/missionaries | jq
```

## Getting Help

1. Read `docs/ARCHITECTURE.md` for system overview
2. Read `docs/CONTRIBUTING.md` for code standards
3. Read `docs/RESPONSIVE.md` for responsive patterns
4. Check existing similar code for patterns
