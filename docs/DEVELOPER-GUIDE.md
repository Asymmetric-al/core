# Developer Guide

This guide helps new developers get started with the Give Hope codebase. Target: make your first change within 1 hour.

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Set up environment
cp .env.example .env.local  # Then fill in your values

# 3. Start development
bun run dev

# 4. Open browser
open http://localhost:3000
```

## Common Commands

| Command | Description |
|---------|-------------|
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
