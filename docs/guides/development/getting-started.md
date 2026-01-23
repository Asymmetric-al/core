# Developer Guide

This guide helps new developers get started with the Asymmetric.al codebase. Target: make your first change within 1 hour.
The "Give Hope" tenant name that appears in some demo defaults is a test frontend, not the organization.

## Quick Start

Follow the canonical Quickstart in `README.md`:

```bash
./scripts/setup
# set these required values in .env.local:
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

| Variable                              | Requirement                                    | Purpose                           | Example / default                                         | Feature impact if missing                        |
| ------------------------------------- | ---------------------------------------------- | --------------------------------- | --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`            | Required                                       | Supabase project URL              | `https://your-project.supabase.co`                        | Auth + data access fail; API routes error.       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`       | Required                                       | Client-safe Supabase key          | `your-anon-key`                                           | Client auth/data fail; middleware errors.        |
| `NEXT_PUBLIC_SITE_URL`                | Optional (dev), recommended in prod            | Base site URL for SEO + Unlayer   | `http://localhost:3000` (default: `https://givehope.org`) | SEO links + allowed domains use fallback.        |
| `GOOGLE_SITE_VERIFICATION`            | Optional                                       | Google site verification          | empty                                                     | No verification meta tag.                        |
| `BING_SITE_VERIFICATION`              | Optional                                       | Bing site verification            | empty                                                     | No verification meta tag.                        |
| `NEXT_PUBLIC_MAIN_DOMAIN`             | Optional                                       | Main domain for subdomain routing | `localhost:3000`                                          | Subdomain routing uses default.                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | Optional (local), required for Stripe checkout | Stripe publishable key            | `pk_test_...`                                             | Donation checkout fails.                         |
| `STRIPE_SECRET_KEY`                   | Optional (local), required for Stripe API      | Stripe secret key                 | `sk_test_...`                                             | Server donation processing fails.                |
| `NEXT_PUBLIC_UNLAYER_PROJECT_ID`      | Optional (local), required for Unlayer exports | Unlayer project id                | `123456`                                                  | Email/PDF studio exports/paid features disabled. |
| `NEXT_PUBLIC_UNLAYER_WHITE_LABEL`     | Optional                                       | Unlayer white-label toggle        | `false`                                                   | White-label mode disabled.                       |
| `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS` | Optional                                       | Comma-separated allowed domains   | `localhost,127.0.0.1`                                     | Extra domains not permitted.                     |
| `NEXT_PUBLIC_BRAND_NAME`              | Optional                                       | Studio brand name                 | `GiveHope`                                                | Defaults apply.                                  |
| `NEXT_PUBLIC_BRAND_LOGO_URL`          | Optional                                       | Studio logo URL                   | `https://.../logo.png`                                    | Logo missing in editors.                         |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR`     | Optional                                       | Brand primary color               | `#0f172a`                                                 | Defaults apply.                                  |
| `NEXT_PUBLIC_BRAND_ACCENT_COLOR`      | Optional                                       | Brand accent color                | `#2563eb`                                                 | Defaults apply.                                  |
| `NEXT_PUBLIC_EMAIL_FOOTER_TEXT`       | Optional                                       | Default email footer text         | `YourOrg                                                  | 123 Main St`                                     | Footer empty.                        |
| `NEXT_PUBLIC_PDF_FOOTER_TEXT`         | Optional                                       | Default PDF footer text           | `YourOrg                                                  | 123 Main St`                                     | Falls back to email footer or empty. |
| `NEXT_PUBLIC_CLOUDINARY_ENABLED`      | Optional                                       | Enable Cloudinary integration     | `false`                                                   | Cloudinary features disabled.                    |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`   | Required when Cloudinary enabled               | Cloudinary cloud name             | `your-cloud`                                              | Uploads/media features fail.                     |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`      | Required when Cloudinary enabled               | Cloudinary API key                | `your-key`                                                | Uploads/media features fail.                     |
| `CLOUDINARY_API_SECRET`               | Required when Cloudinary enabled               | Cloudinary API secret             | `your-secret`                                             | Uploads/media features fail.                     |
| `NEXT_PUBLIC_SENTRY_DSN`              | Optional                                       | Sentry DSN                        | empty                                                     | Monitoring disabled (warning logged).            |
| `CRON_SECRET`                         | Optional (recommended in prod)                 | Bearer token for cron endpoints   | `random-string`                                           | Cron endpoints unauthenticated.                  |
| `ALLOW_DEMO_ACCOUNTS`                 | Optional                                       | Allow demo accounts in prod       | `false`                                                   | Demo account API disabled in production.         |
| `DEMO_ADMIN_EMAIL`                    | Optional                                       | Demo admin email                  | empty                                                     | Demo admin login disabled.                       |
| `DEMO_MISSIONARY_EMAIL`               | Optional                                       | Demo missionary email             | empty                                                     | Demo missionary login disabled.                  |
| `DEMO_DONOR_EMAIL`                    | Optional                                       | Demo donor email                  | empty                                                     | Demo donor login disabled.                       |
| `DEMO_PASSWORD`                       | Optional                                       | Demo account password (shared)    | empty                                                     | Demo login disabled.                             |
| `PLAYWRIGHT_BASE_URL`                 | Optional                                       | Base URL for Playwright           | `http://localhost:3000`                                   | Uses default if unset.                           |
| `VERIFY_E2E_PROJECTS`                 | Optional                                       | Run all Playwright projects       | `all`                                                     | Only Chromium project runs.                      |

## Troubleshooting

| Issue                      | Quick fix                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Supabase envs missing      | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.                                       |
| Supabase URL not reachable | Verify the URL or request access to the shared dev project.                                                               |
| Demo login disabled        | Ensure `DEMO_ADMIN_EMAIL`, `DEMO_MISSIONARY_EMAIL`, `DEMO_DONOR_EMAIL`, and `DEMO_PASSWORD` are set for pre-seeded users. |

## Common Commands

| Command                               | Description                            |
| ------------------------------------- | -------------------------------------- |
| `./scripts/setup`                     | Initial setup (install deps)           |
| `./scripts/verify`                    | Validate env vars + basic connectivity |
| `turbo run dev`                       | Start all apps in dev mode             |
| `turbo run dev --filter=admin`        | Start admin app only                   |
| `turbo run lint`                      | Lint all apps and packages             |
| `turbo run typecheck`                 | Type-check all apps and packages       |
| `turbo run build`                     | Build all apps and packages            |
| `turbo run build --filter=missionary` | Build missionary app only              |
| `bun run test:e2e`                    | Run Playwright E2E tests               |

## Project Structure

This is a **Turborepo monorepo** with three Next.js applications and six shared packages:

```
core/
├── apps/                       # Next.js applications
│   ├── admin/                 # Mission Control (admin dashboard)
│   │   ├── app/              # Next.js App Router
│   │   │   ├── (admin)/mc/  # Admin routes
│   │   │   ├── api/         # API routes
│   │   │   └── auth/        # Auth callbacks
│   │   ├── components/       # App-specific components
│   │   ├── features/         # App-specific features
│   │   ├── lib/              # App-specific utilities
│   │   ├── .env.local        # App-specific environment variables
│   │   └── package.json
│   │
│   ├── missionary/           # Missionary dashboard
│   │   ├── app/              # Next.js App Router
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── donor/                # Donor portal
│       ├── app/              # Next.js App Router
│       ├── components/
│       ├── features/
│       ├── lib/
│       ├── .env.local
│       └── package.json
│
├── packages/                  # Shared packages
│   ├── ui/                   # @asym/ui - UI components
│   │   ├── components/      # Shared UI components
│   │   │   ├── shadcn/     # shadcn/ui primitives
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   └── feed/       # Social feed components
│   │   └── package.json
│   │
│   ├── lib/                  # @asym/lib - Utilities
│   │   ├── utils.ts         # Common utilities (cn, formatters)
│   │   ├── hooks/           # Shared React hooks
│   │   └── package.json
│   │
│   ├── database/             # @asym/database - Supabase & TanStack DB
│   │   ├── supabase/        # Supabase clients
│   │   ├── collections/     # TanStack DB collections
│   │   └── package.json
│   │
│   ├── auth/                 # @asym/auth - Authentication
│   ├── config/               # @asym/config - Configuration
│   └── email/                # @asym/email - Email services
│
├── tooling/                  # Build tooling
│   ├── eslint-config/       # Shared ESLint config
│   └── typescript-config/   # Shared TypeScript config
│
├── turbo.json                # Turborepo configuration
└── package.json              # Root package (delegates only)
```

## Key Patterns

### 1. Package Architecture

The monorepo uses **internal packages** that are imported by apps:

```typescript
// Package imports (from any app)
import { Button, Card } from "@asym/ui";
import { cn, formatCurrency, useIsMobile } from "@asym/lib";
import { createClient } from "@asym/database/supabase/client";
import { useAuth } from "@asym/auth";
import { SITE_CONFIG } from "@asym/config";
```

### 2. App-Specific Feature Module Structure

Each app has its own `features/` directory for app-specific logic:

```
apps/admin/features/
└── mission-control/
    ├── index.ts              # Public API (barrel export)
    ├── components/           # Feature-specific components
    │   └── index.ts          # Component barrel export
    ├── hooks/                # Feature-specific hooks
    └── context.tsx           # Feature context (optional)
```

### 3. Import Conventions

```typescript
// UI components from @asym/ui package
import { Button, Card, Input } from "@asym/ui";

// Utilities from @asym/lib package
import { cn, formatCurrency, useIsMobile } from "@asym/lib";

// Database from @asym/database package
import { createClient } from "@asym/database/supabase/client";
import { useLiveQuery } from "@asym/database/hooks";

// Auth from @asym/auth package
import { useAuth } from "@asym/auth";

// Config from @asym/config package
import { SITE_CONFIG, NAVIGATION } from "@asym/config";

// App-specific feature components (within an app)
import { TilePage, SidebarNav } from "@/features/mission-control";

// App-specific components (within an app)
import { DashboardLayout } from "@/components/layouts";
```

### 4. Page Structure

```typescript
// apps/admin/app/(admin)/mc/my-page/page.tsx
import { PageHeader, TilePage } from '@/features/mission-control'
import { Card, CardContent, CardHeader, CardTitle } from '@asym/ui'

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

### 5. Responsive Design

Use the responsive utilities from `@asym/lib`:

```typescript
// CSS utility classes
<div className="container-responsive">  // Responsive container
<div className="grid-responsive-3">     // 1 → 2 → 3 columns
<h1 className="text-responsive-h1">     // Fluid typography

// React hooks from @asym/lib
import { useIsMobile, useBreakpoint } from '@asym/lib'

function MyComponent() {
  const isMobile = useIsMobile()
  const breakpoint = useBreakpoint() // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}
```

See `docs/guides/ui-design/responsive-design.md` for full documentation.

## Adding a New Page

### Step 1: Choose which app

Decide which app the page belongs to:

- **Admin app** (`apps/admin/`) - Mission Control features
- **Missionary app** (`apps/missionary/`) - Missionary dashboard features
- **Donor app** (`apps/donor/`) - Donor portal features

### Step 2: Create the page file

```bash
# For Mission Control (admin app)
mkdir -p apps/admin/app/\(admin\)/mc/my-page
touch apps/admin/app/\(admin\)/mc/my-page/page.tsx

# For Missionary Dashboard
mkdir -p apps/missionary/app/\(missionary\)/missionary-dashboard/my-page
touch apps/missionary/app/\(missionary\)/missionary-dashboard/my-page/page.tsx

# For Donor Portal
mkdir -p apps/donor/app/\(donor\)/donor-dashboard/my-page
touch apps/donor/app/\(donor\)/donor-dashboard/my-page/page.tsx
```

### Step 3: Add the basic structure

```typescript
// apps/admin/app/(admin)/mc/my-page/page.tsx
import { TilePage } from '@/features/mission-control'
import { Card, CardContent, CardHeader, CardTitle } from '@asym/ui'

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

### Step 4: Add navigation (if needed)

Edit the appropriate navigation file:

- **Admin:** `apps/admin/features/mission-control/components/app-shell/sidebar-nav.tsx`
- **Missionary:** `apps/missionary/features/missionary/components/app-shell/sidebar-nav.tsx`
- **Donor:** `apps/donor/features/donor/components/app-shell/sidebar-nav.tsx`

## Adding a New Component

### Step 1: Create in the right location

- **Shared across all apps**: `packages/ui/components/`
- **App-specific**: `apps/[app-name]/components/`
- **Feature-specific**: `apps/[app-name]/features/[feature]/components/`
- **UI primitive**: Don't add here, use shadcn/ui from `@asym/ui`

### Step 2: Follow the naming convention

- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-kebab-case.ts`

### Step 3: Export from barrel (if in a package)

```typescript
// packages/ui/components/index.ts
export { MyNewComponent } from "./my-new-component";

// Or for app-specific components
// apps/admin/components/index.ts
export { MyNewComponent } from "./my-new-component";
```

## Working with Mock Data

Mock data is managed per-app in `apps/[app-name]/lib/mock-data/`. For development:

```typescript
// In an app (e.g., apps/admin/)
import {
  MISSIONARIES, // Array of missionary records
  DONORS, // Array of donor records
  DONATIONS, // Array of donation records
  getMissionaryById, // Get single missionary
  getDonorById, // Get single donor
  getFieldWorkers, // Get public worker list
} from "@/lib/mock-data";
```

**Note:** Mock data is app-specific and not shared across apps via packages.

## Common Tasks

### Run tests before committing

```bash
# From root - runs for all apps and packages
turbo run typecheck && turbo run lint

# For a specific app
turbo run typecheck --filter=admin && turbo run lint --filter=admin
```

### Check responsive behavior

1. Open Chrome DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Test at: 375px, 768px, 1024px, 1440px

### Debug API routes

```bash
# Test with curl (adjust port if needed)
# Admin app runs on :3000, missionary on :3001, donor on :3002
curl http://localhost:3000/api/missionaries | jq
```

### Work on a specific app

```bash
# Start only the admin app
turbo run dev --filter=admin

# Build only the missionary app
turbo run build --filter=missionary

# Lint only the donor app
turbo run lint --filter=donor
```

### Work on a specific package

```bash
# Build only the UI package
turbo run build --filter=@asym/ui

# Type-check only the database package
turbo run typecheck --filter=@asym/database
```

## Getting Help

1. Read `docs/guides/architecture/overview.md` for system overview
2. Read `docs/guides/development/contributing.md` for code standards
3. Read `docs/guides/ui-design/responsive-design.md` for responsive patterns
4. Check existing similar code for patterns
5. Review `turbo.json` for available tasks and dependencies
