# Developer Guide

This guide helps new developers get started with the Give Hope codebase. Target: make your first change within 1 hour.

## Quick Start

Follow the canonical Quickstart in `README.md`:

```bash
./scripts/setup
# edit .env.local and set:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
bun run dev
./scripts/verify
```

## Supabase Cloud

This repo uses a hosted Supabase project (no local Docker). Contributors do not use the Supabase CLI or push schema/seed from this repo. The cloud database is managed outside this codebase.

- **Required env vars**: Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Access**: Ask a maintainer for the shared dev project URL + anon key.
- **Schema/seed**: Managed by maintainers or CI in a separate workflow/repo.

## Environment Variable Matrix

Use this matrix to decide what you need for cloud development vs production. "Required" means the related feature will not work without it.
This table mirrors `.env.example`. Internal-only vars (for example `NODE_ENV`, `CI`, `SUPABASE_SERVICE_ROLE_KEY`) are provided by the runtime or maintainers and are not required for contributors.

| Variable | Requirement | Purpose | Example / default | Feature impact if missing |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase project URL | `https://your-project.supabase.co` | Auth + data access fail; API routes error. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Client-safe Supabase key | `your-anon-key` | Client auth/data fail; middleware errors. |
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
| `DEMO_ADMIN_EMAIL` | Optional | Demo admin email | empty | Demo admin login disabled. |
| `DEMO_MISSIONARY_EMAIL` | Optional | Demo missionary email | empty | Demo missionary login disabled. |
| `DEMO_DONOR_EMAIL` | Optional | Demo donor email | empty | Demo donor login disabled. |
| `DEMO_PASSWORD` | Optional | Demo account password (shared) | empty | Demo login disabled. |
| `PLAYWRIGHT_BASE_URL` | Optional | Base URL for Playwright | `http://localhost:3000` | Uses default if unset. |
| `VERIFY_E2E_PROJECTS` | Optional | Run all Playwright projects | `all` | Only Chromium project runs. |

## Troubleshooting

| Issue | Quick fix |
|---|---|
| Supabase envs missing | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. |
| Supabase URL not reachable | Verify the URL or request access to the shared dev project. |
| Demo login disabled | Ensure `DEMO_ADMIN_EMAIL`, `DEMO_MISSIONARY_EMAIL`, `DEMO_DONOR_EMAIL`, and `DEMO_PASSWORD` are set for pre-seeded users. |

## Common Commands

| Command | Description |
|---------|-------------|
| `bun run setup:verify` | Validate env vars + basic connectivity |
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
