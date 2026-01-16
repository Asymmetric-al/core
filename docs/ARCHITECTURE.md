# Architecture Guide

This document provides a comprehensive overview of the codebase architecture for developers joining the project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Module Organization](#module-organization)
4. [Data Flow](#data-flow)
5. [Key Patterns](#key-patterns)
6. [Component Guidelines](#component-guidelines)

---

## Project Overview

**Asymmetric.al** is a multi-tenant platform for mission-focused organizations built with:
The "Give Hope" tenant name you may see in UI defaults is a demo/test frontend, not the organization.

| Technology | Purpose |
|------------|---------|
| Next.js 16.1 | Full-stack React framework (App Router + Turbopack) |
| React 19 | UI library with Server Components |
| TypeScript 5.9 | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | Component library |
| Supabase | Database (PostgreSQL) + Auth + Storage |
| TanStack Query | Server state management |
| TanStack DB | Client-side collections |
| Stripe | Payment processing |

### Application Sections

The platform consists of **four main sections**, each serving a distinct user type:

| Section | Route Group | Purpose | Users |
|---------|-------------|---------|-------|
| **Mission Control** | `(admin)/mc/*` | Organization admin dashboard | Staff, Finance, Admin |
| **Missionary Dashboard** | `(missionary)/missionary-dashboard/*` | Personal donor engagement & support tracking | Missionaries |
| **Donor Portal** | `(donor)/donor-dashboard/*` | Giving management & impact feed | Donors |
| **Public Website** | `(public)/*` | Tenant-branded giving pages & checkout | Public visitors |

#### 1. Mission Control (Admin Dashboard)
- **Route**: `/mc/*`
- **Purpose**: Central hub for organization staff to manage missionaries, donors, contributions, and reporting
- **Key Features**: CRM, Contributions, Email Studio, PDF Studio, Reports, Automations

#### 2. Missionary Dashboard
- **Route**: `/missionary-dashboard/*`
- **Purpose**: Personal workspace for missionaries to track support, engage donors, and share updates
- **Key Features**: Donation analytics, donor management, social feed, tasks, profile

#### 3. Donor Portal
- **Route**: `/donor-dashboard/*`
- **Purpose**: Self-service portal for donors to manage giving, view impact, and follow missionaries
- **Key Features**: Giving history, wallet/payment methods, pledges, tax receipts, missionary feed

#### 4. Public Website
- **Route**: `/*` (root public routes)
- **Purpose**: Tenant-branded public pages for missionary profiles and donation checkout
- **Key Features**: Worker profiles, giving pages, checkout flow, about/FAQ pages

### Data Isolation

Data isolation is enforced via Supabase Row Level Security (RLS) using `tenant_id`.

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (admin)/           # Admin/MC routes (grouped)
│   ├── (auth)/            # Authentication routes
│   ├── (donor)/           # Donor portal routes
│   ├── (missionary)/      # Missionary dashboard routes
│   ├── (public)/          # Public-facing routes
│   └── api/               # API route handlers
│
├── components/            # Shared UI components
│   ├── ui/               # shadcn/ui primitives (Button, Card, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   ├── feed/             # Social feed components
│   └── [feature]/        # Feature-grouped components
│
├── features/             # Feature modules (self-contained)
│   ├── donor/           # Donor-specific logic & components
│   ├── missionary/      # Missionary-specific logic & components
│   └── mission-control/ # Admin/MC feature module
│
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, clients, and business logic
│   ├── supabase/       # Supabase client configurations
│   ├── db/             # TanStack DB collections and hooks
│   ├── auth/           # Authentication context
│   ├── mock-data/      # Demo/development mock data (see MOCK-DATA.md)
│   └── [domain]/       # Domain-specific utilities
│
├── providers/          # React context providers
├── config/             # App configuration (navigation, constants)
└── types/              # TypeScript type definitions
```

### Key Conventions

| Directory | Convention |
|-----------|-----------|
| `app/` | Route handlers only - minimal logic |
| `components/` | Reusable, presentational components |
| `features/` | Self-contained feature modules with components, hooks, and types |
| `lib/` | Pure utilities and business logic (no React) |
| `hooks/` | Shared React hooks |

---

## Module Organization

### Feature Modules

Each feature module in `src/features/` follows this structure:

```
features/[feature-name]/
├── components/           # Feature-specific components
│   ├── index.ts         # Barrel export
│   └── [Component].tsx
├── hooks/               # Feature-specific hooks
│   └── use-[hook].ts
├── types.ts             # Feature-specific types
├── constants.ts         # Feature constants
├── context.tsx          # Feature context provider (if needed)
└── index.ts             # Public API barrel export
```

**Example: Mission Control Module**

```typescript
// src/features/mission-control/index.ts
export { MCProvider, useMC, useRole } from './context'
export { AppShell } from './components/app-shell/app-shell'
export { PageHeader } from './components/patterns/page-header'
// ... other exports
```

### Import Guidelines

Always import from barrel exports when available:

```typescript
// Good - import from feature barrel
import { AppShell, PageHeader } from '@/features/mission-control'

// Good - import from hooks barrel
import { useAuth, useDonationMetrics } from '@/hooks'

// Good - import from lib barrel
import { cn, createBrowserClient } from '@/lib'

// Avoid - deep imports
import { AppShell } from '@/features/mission-control/components/app-shell/app-shell'
```

---

## Data Flow

### Server vs Client Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Components                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Layout     │  │    Page      │  │  Data Fetch  │      │
│  │  (RSC)       │  │   (RSC)      │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Suspense Boundary                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                           ▼                                  │
│                    Client Components                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Interactive │  │   Forms      │  │   Charts     │      │
│  │   UI         │  │ (use client) │  │ (use client) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### State Management Hierarchy

1. **URL State** (nuqs) - Shareable, bookmarkable state
2. **Server State** (TanStack Query/DB) - Remote data
3. **Component State** (useState) - Ephemeral UI state
4. **Context** (React Context) - Cross-cutting concerns (auth, theme)

### Database Access Pattern

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client        │────▶│   Supabase      │────▶│   PostgreSQL    │
│   Component     │     │   Client        │     │   (RLS)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │ Uses JWT claims
                               │ for tenant_id
                               ▼
                        ┌─────────────────┐
                        │   Row Level     │
                        │   Security      │
                        │   Policies      │
                        └─────────────────┘
```

---

## Key Patterns

### 1. Supabase Client Usage

```typescript
// Server Components / Route Handlers
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Admin Operations (server-side only)
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

### 2. TanStack DB Collections

Collections provide reactive data with optimistic updates:

```typescript
import { useLiveQuery, eq } from '@tanstack/react-db'
import { postsCollection, profilesCollection } from '@/lib/db'

function usePostsWithAuthors() {
  return useLiveQuery((q) =>
    q.from({ post: postsCollection })
      .join({ profile: profilesCollection }, 
            ({ post, profile }) => eq(post.author_id, profile.id))
      .select(({ post, profile }) => ({ ...post, author: profile }))
  )
}
```

### 3. API Route Pattern

```typescript
// src/app/api/[resource]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('table')
    .select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### 4. Form Handling

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  // ...
}
```

---

## Component Guidelines

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `metric-card.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-donation-metrics.ts` |
| Utilities | kebab-case | `format-currency.ts` |
| Types | kebab-case | `database.ts` |
| Constants | kebab-case | `navigation.ts` |
| Barrel exports | `index.ts` | `components/index.ts` |

**Note**: All file names use kebab-case for consistency. Component function names inside files use PascalCase (e.g., `export function MetricCard()`).

### Component Structure

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 2. Types/Interfaces
interface MetricCardProps {
  title: string
  value: number
  trend?: 'up' | 'down'
  className?: string
}

// 3. Component definition (named export preferred)
export function MetricCard({ title, value, trend, className }: MetricCardProps) {
  // Hooks first
  const [expanded, setExpanded] = useState(false)
  
  // Derived state / computations
  const formattedValue = value.toLocaleString()
  
  // Event handlers
  const handleClick = () => setExpanded(!expanded)
  
  // Render
  return (
    <div className={cn('rounded-xl bg-white p-4', className)}>
      <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
      <p className="text-2xl font-bold">{formattedValue}</p>
    </div>
  )
}
```

### Responsive Design

Use the established responsive utilities:

```typescript
// Tailwind responsive classes
<div className="px-4 sm:px-6 lg:px-10">  {/* Container padding */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">  {/* Responsive grid */}

// Hook for programmatic checks
import { useIsMobile, useBreakpoint } from '@/hooks'
const isMobile = useIsMobile()
const breakpoint = useBreakpoint()  // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
```

---

## Quick Reference

### Path Aliases

```typescript
@/* → src/*
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-only) |

### Common Commands

```bash
bun run dev        # Start development server
bun run lint       # Run ESLint
bun run typecheck  # Run TypeScript compiler
bun run build      # Production build
```

---

## Further Reading

- [Developer Guide](./DEVELOPER-GUIDE.md) - Quick start for new developers
- [Responsive Design System](./RESPONSIVE.md) - Breakpoints, spacing, and mobile-first patterns
- [Mock Data & Migration](./MOCK-DATA.md) - Mock data system and production migration guide
- [Technical Decisions](./technical-decisions.md) - Key technical decisions and their rationale
- [TanStack Integration](./tanstack-integration.md) - TanStack Query/DB usage guide
- [Modules: Teams & Permissions](./modules/teams-and-permissions.md) - Teams system documentation
- [Modules: SendGrid Integration](./modules/sendgrid-integration.md) - Multi-tenant email sending via SendGrid
