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

| Technology     | Purpose                                             |
| -------------- | --------------------------------------------------- |
| Next.js 16.1   | Full-stack React framework (App Router + Turbopack) |
| React 19       | UI library with Server Components                   |
| TypeScript 5.9 | Type safety                                         |
| Tailwind CSS 4 | Styling                                             |
| shadcn/ui      | Component library                                   |
| Supabase       | Database (PostgreSQL) + Auth + Storage              |
| TanStack Query | Server state management                             |
| TanStack DB    | Client-side collections                             |
| Stripe         | Payment processing                                  |

### Application Sections

The platform consists of **four main sections**, each serving a distinct user type:

| Section                  | Route Group                 | Purpose                                      | Users                 |
| ------------------------ | --------------------------- | -------------------------------------------- | --------------------- |
| **Mission Control**      | `(admin)/mc/*`              | Organization admin dashboard                 | Staff, Finance, Admin |
| **Missionary Dashboard** | `app/*`                     | Personal donor engagement & support tracking | Missionaries          |
| **Donor Portal**         | `(donor)/donor-dashboard/*` | Giving management & impact feed              | Donors                |
| **Public Website**       | `(public)/*`                | Tenant-branded giving pages & checkout       | Public visitors       |

#### 1. Mission Control (Admin Dashboard)

- **Route**: `/mc/*`
- **Purpose**: Central hub for organization staff to manage missionaries, donors, contributions, and reporting
- **Key Features**: CRM, Contributions, Email Studio, PDF Studio, Reports, Automations

#### 2. Missionary Dashboard

- **Route**: `/*`
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
│   │   └── package.json
│   │
│   ├── missionary/           # Missionary dashboard
│   │   ├── app/              # Next.js App Router
│   │   │   ├── app/
│   │   │   ├── api/
│   │   │   └── auth/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── donor/                # Donor portal
│       ├── app/              # Next.js App Router
│       │   ├── (donor)/donor-dashboard/
│       │   ├── (public)/    # Public giving pages
│       │   ├── api/
│       │   └── auth/
│       ├── components/
│       ├── features/
│       ├── lib/
│       └── package.json
│
├── packages/                  # Shared packages
│   ├── auth/                 # @asym/auth - Authentication
│   │   ├── context.ts       # Auth context provider
│   │   ├── use-auth.ts      # Auth hook
│   │   └── package.json
│   │
│   ├── config/               # @asym/config - Configuration
│   │   ├── constants.ts     # App constants
│   │   ├── navigation.ts    # Navigation configs
│   │   ├── site.ts          # Site metadata
│   │   └── package.json
│   │
│   ├── database/             # @asym/database - Supabase & TanStack DB
│   │   ├── supabase/        # Supabase clients (server/client/admin)
│   │   ├── collections/     # TanStack DB collections
│   │   ├── hooks/           # Database hooks
│   │   ├── types/           # Database types
│   │   └── package.json
│   │
│   ├── email/                # @asym/email - Email services
│   │   ├── sendgrid.ts      # SendGrid integration
│   │   ├── types.ts         # Email types
│   │   └── package.json
│   │
│   ├── lib/                  # @asym/lib - Utilities
│   │   ├── utils.ts         # Common utilities (cn, formatters)
│   │   ├── hooks/           # Shared React hooks
│   │   ├── responsive.ts    # Responsive utilities
│   │   ├── stripe.ts        # Stripe utilities
│   │   └── package.json
│   │
│   └── ui/                   # @asym/ui - UI components
│       ├── components/      # Shared UI components
│       │   ├── shadcn/     # shadcn/ui primitives
│       │   ├── dashboard/  # Dashboard components
│       │   └── feed/       # Social feed components
│       ├── hooks/           # UI hooks
│       ├── styles/          # Global styles
│       └── package.json
│
├── tooling/                  # Build tooling
│   ├── eslint-config/       # Shared ESLint config
│   └── typescript-config/   # Shared TypeScript config
│
├── turbo.json                # Turborepo configuration
└── package.json              # Root package (delegates only)
```

### Key Conventions

| Directory            | Convention                               |
| -------------------- | ---------------------------------------- |
| `apps/*/app/`        | Route handlers only - minimal logic      |
| `apps/*/components/` | App-specific components                  |
| `apps/*/features/`   | App-specific feature modules             |
| `packages/ui/`       | Shared, reusable UI components           |
| `packages/lib/`      | Pure utilities and business logic        |
| `packages/database/` | Database clients, collections, and hooks |
| `packages/auth/`     | Authentication context and hooks         |
| `packages/config/`   | Shared configuration and constants       |

---

## Module Organization

### Package Architecture

The monorepo uses **internal packages** that are imported by apps:

```typescript
// Package imports (from any app)
import { Button, Card } from "@asym/ui";
import { cn, formatCurrency } from "@asym/lib";
import { createClient } from "@asym/database/supabase/client";
import { useAuth } from "@asym/auth";
import { SITE_CONFIG } from "@asym/config";
```

### App-Specific Feature Modules

Each app has its own `features/` directory for app-specific logic:

```
apps/admin/features/mission-control/
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

**Example: Admin App Feature**

```typescript
// apps/admin/features/mission-control/index.ts
export { MCProvider, useMC, useRole } from "./context";
export { AppShell } from "./components/app-shell/app-shell";
export { PageHeader } from "./components/patterns/page-header";
// ... other exports
```

### Import Guidelines

**Package imports** (shared across apps):

```typescript
// UI components from @asym/ui
import { Button, Card, Input } from "@asym/ui";

// Utilities from @asym/lib
import { cn, formatCurrency, useIsMobile } from "@asym/lib";

// Database from @asym/database
import { createClient } from "@asym/database/supabase/client";
import { useLiveQuery } from "@asym/database/hooks";

// Auth from @asym/auth
import { useAuth } from "@asym/auth";

// Config from @asym/config
import { SITE_CONFIG, NAVIGATION } from "@asym/config";
```

**App-specific imports** (within an app):

```typescript
// Feature components (app-specific)
import { AppShell, PageHeader } from "@/features/mission-control";

// App-specific components
import { DashboardLayout } from "@/components/layouts";

// App-specific utilities
import { getMetrics } from "@/lib/metrics";
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
// Server Components / Route Handlers (from @asym/database package)
import { createClient } from "@asym/database/supabase/server";
const supabase = await createClient();

// Client Components (from @asym/database package)
import { createClient } from "@asym/database/supabase/client";
const supabase = createClient();

// Admin Operations (server-side only, from @asym/database package)
import { createAdminClient } from "@asym/database/supabase/admin";
const supabase = createAdminClient();
```

### 2. TanStack DB Collections

Collections provide reactive data with optimistic updates:

```typescript
import { useLiveQuery, eq } from "@tanstack/react-db";
import {
  postsCollection,
  profilesCollection,
} from "@asym/database/collections";

function usePostsWithAuthors() {
  return useLiveQuery((q) =>
    q
      .from({ post: postsCollection })
      .join({ profile: profilesCollection }, ({ post, profile }) =>
        eq(post.author_id, profile.id),
      )
      .select(({ post, profile }) => ({ ...post, author: profile })),
  );
}
```

### 3. API Route Pattern

```typescript
// apps/admin/app/api/[resource]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.from("table").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### 4. Form Handling

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

---

## Component Guidelines

### File Naming

| Type           | Convention                    | Example                   |
| -------------- | ----------------------------- | ------------------------- |
| Components     | kebab-case                    | `metric-card.tsx`         |
| Hooks          | kebab-case with `use-` prefix | `use-donation-metrics.ts` |
| Utilities      | kebab-case                    | `format-currency.ts`      |
| Types          | kebab-case                    | `database.ts`             |
| Constants      | kebab-case                    | `navigation.ts`           |
| Barrel exports | `index.ts`                    | `components/index.ts`     |

**Note**: All file names use kebab-case for consistency. Component function names inside files use PascalCase (e.g., `export function MetricCard()`).

### Component Structure

```typescript
// 1. Imports (external, then internal packages, then app-specific)
import { useState } from 'react'
import { Button } from '@asym/ui'
import { cn } from '@asym/lib'

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

Use the established responsive utilities from `@asym/lib`:

```typescript
// Tailwind responsive classes
<div className="px-4 sm:px-6 lg:px-10">  {/* Container padding */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">  {/* Responsive grid */}

// Hook for programmatic checks (from @asym/lib)
import { useIsMobile, useBreakpoint } from '@asym/lib'
const isMobile = useIsMobile()
const breakpoint = useBreakpoint()  // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
```

---

## Quick Reference

### Path Aliases

```typescript
// In apps (app-specific imports)
@/* → apps/[app-name]/*

// Package imports (shared across apps)
@asym/ui → packages/ui/*
@asym/lib → packages/lib/*
@asym/database → packages/database/*
@asym/auth → packages/auth/*
@asym/config → packages/config/*
@asym/email → packages/email/*
```

### Environment Variables

Environment variables are **app-specific** and live in `apps/[app-name]/.env.local`:

| Variable                             | Purpose                         |
| ------------------------------------ | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Supabase anon key (client-safe) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key               |
| `STRIPE_SECRET_KEY`                  | Stripe secret key (server-only) |

### Common Commands

```bash
# Turborepo commands (from root)
turbo run dev        # Start all apps in dev mode
turbo run build      # Build all apps and packages
turbo run lint       # Lint all apps and packages
turbo run typecheck  # Type-check all apps and packages

# Individual app commands (from root)
bun run dev --filter=admin        # Start admin app only
bun run build --filter=missionary # Build missionary app only

# Package commands (from root)
bun run build --filter=@asym/ui   # Build UI package only
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
