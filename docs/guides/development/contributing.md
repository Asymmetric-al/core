# Contributing Guide

Welcome to the Asymmetric.al codebase! This guide will help you get started quickly.
The "Give Hope" tenant you may see in the UI is a demo/test frontend and not the organization.

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

Stripe credentials are optional and only required when testing donation flows.

Optional MCP tooling configuration for contributors is documented in `docs/mcp-config.example.toml`.

### Nia (MCP) usage (repo-scoped)

If you use Nia for repo search, follow the canonical policy in [AGENTS.md#nia-mcp-usage-always-repo-scoped](../AGENTS.md#nia-mcp-usage-always-repo-scoped). Short version:

- Contributors use their own Nia API key and subscribe to the public `Asymmetric-al/core` indexed source (never share keys).
- Keep `docs/ai/working-set.md` updated and use `docs/ai/stack-registry.md` to select accurate stack tags.
- Nia search calls must include the required preamble at the top of the `query` string.
- Always scope Nia tool calls to `Asymmetric-al/core`; if you must search outside, justify it and then run a scoped pass back inside this repo.

---

## Development Workflow

### Before You Code

1. **Pull latest changes**: `git pull origin main`
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Understand the area**: Read relevant code and check [ARCHITECTURE.md](./ARCHITECTURE.md)

### While Coding

1. **Run type checking**: Keep `bun run typecheck` passing
2. **Follow patterns**: Match existing code style in the file/module
3. **Test locally**: Verify changes work on desktop and mobile viewports

### Before Committing

```bash
# Always run these before committing
bun run format
bun run format:check
bunx turbo run lint typecheck  # Cached checks via Turborepo
```

### PR Checks (Required)

- **Required checks:** `CI / format`, `CI / lint`, `CI / typecheck`, `CI / build`, `CI / test-unit`.
- **Informational only:** `CI / test-e2e (non-blocking)` must not be required for merge.

Maintainers must configure branch protection (Settings → Branches → Require status checks to pass) to require only the checks above and to exclude E2E.

### Local Verification (Before PR)

```bash
bun run format
bun run format:check
bunx turbo run lint typecheck build
bun run test:unit
```

---

## Code Standards

### TypeScript

- **Strict mode enabled** - All code must pass strict type checking
- **No `any` types** - Use `unknown` or proper types instead
- **Explicit return types** - For exported functions
- **Interface over type** - For object shapes (unless union/intersection needed)

```typescript
// Good
interface UserProps {
  name: string;
  email: string;
}

export function formatUser(user: UserProps): string {
  return `${user.name} <${user.email}>`;
}

// Avoid
export function formatUser(user: any) {
  return `${user.name} <${user.email}>`;
}
```

### React Components

- **Named exports** - Prefer `export function Component()` over `export default`
- **Props interface** - Define props interface above component
- **Hooks first** - All hooks at the top of the component
- **No inline functions in JSX** - Extract to handlers or use `useCallback`

```typescript
// Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function SubmitButton({ label, onClick, disabled }: ButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  )
}
```

### Styling (Tailwind CSS)

- **Mobile-first** - Start with mobile styles, add responsive modifiers
- **Use design tokens** - Prefer `zinc-*` colors, `rounded-xl`, etc.
- **Consistent spacing** - Use responsive padding: `p-3 sm:p-4 lg:p-6`
- **Utility classes** - Use globals.css utilities: `container-responsive`, `section-gap`

```typescript
// Good - responsive, uses design system
<Card className="p-4 sm:p-6 rounded-xl border-zinc-200">

// Avoid - hard-coded values, not responsive
<Card className="p-[17px] rounded-[9px] border-gray-300">
```

### Imports

Order imports as follows:

1. React/Next.js
2. Third-party libraries
3. Internal absolute imports (`@/...`)
4. Relative imports
5. Types (with `type` keyword)

```typescript
// 1. React/Next
import { useState, useEffect } from "react";
import Link from "next/link";

// 2. Third-party
import { format } from "date-fns";

// 3. Internal absolute
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

// 4. Relative
import { MetricCard } from "./metric-card";

// 5. Types
import type { User } from "@/types";
```

---

## Turborepo Workflow

Turborepo orchestrates tasks and enables caching where appropriate. Local scripts still work, but Turbo is the recommended path for consistency with CI.

### Common Commands

```bash
# Local dev
bunx turbo run dev

# Cached checks
bunx turbo run lint typecheck build

# Format fix
bun run format

# Format check
bun run format:check
```

Lint caching does not require restored outputs; restoring the ESLint cache is optional.

### Remote Cache (Internal Only)

Remote caching uses **Vercel Remote Cache** and is enabled for internal PRs and `main` branch CI. Fork PRs are not supported.

- **CI env vars** (stored in GitHub secrets/vars, never committed):
  - `TURBO_TOKEN` (secret)
  - `TURBO_TEAM` (team slug; variable or secret)

### Env Hashing Policy (Build)

Build cache keys must reflect only env vars that impact build output.

- **Included**: `NEXT_PUBLIC_*` plus any non-public envs that are used at build time (e.g., `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`).
- **Excluded**: runtime-only or unrelated envs that do not affect build output.

Avoid footguns:

- Don’t include unrelated envs (causes unnecessary cache misses).
- Don’t bake timestamps or release IDs unless you want cache invalidation.
- Keep wildcards minimal and intentional.

### Cache Correctness Validation Matrix

Run the following after changes to confirm caching is correct:

| Change                                                                  | Command                                       | Expected Result                 | Evidence                      |
| ----------------------------------------------------------------------- | --------------------------------------------- | ------------------------------- | ----------------------------- |
| Change a source file                                                    | `bunx turbo run build`                        | Cache miss for `build`          | Task re-executes              |
| Change a relevant env var                                               | `bunx turbo run build`                        | Cache miss for `build`          | Env invalidates hash          |
| Change an irrelevant env var                                            | `bunx turbo run build`                        | Cache hit for `build`           | Task skipped, cache hit shown |
| Change config (`next.config.mjs`, `tsconfig.json`, `eslint.config.mjs`) | `bunx turbo run build` / `lint` / `typecheck` | Cache miss for affected task(s) | Cache miss shown in output    |

## File Organization

### Creating New Components

**Shared components (in packages):**

```
packages/ui/components/[category]/
├── new-component.tsx    # Component implementation
└── index.ts             # Add export to barrel file
```

**App-specific components:**

```
apps/[app-name]/components/[category]/
├── new-component.tsx    # Component implementation
└── index.ts             # Add export to barrel file
```

Always add new components to the relevant `index.ts` barrel export.

### Creating New Features

**App-specific features:**

```
apps/[app-name]/features/[feature-name]/
├── components/
│   ├── index.ts         # Barrel export
│   └── FeatureCard.tsx
├── hooks/
│   └── use-feature.ts
├── types.ts             # Feature-specific types
├── constants.ts         # Feature constants
└── index.ts             # Public API
```

### Creating New API Routes

**In the appropriate app:**

```
apps/[app-name]/app/api/[resource]/
├── route.ts             # GET, POST, etc.
└── [id]/
    └── route.ts         # GET, PATCH, DELETE by ID
```

---

## Component Patterns

### Server vs Client Components

```typescript
// Default: Server Component (no directive needed)
// Use for: Static content, data fetching, SEO

// Client Component (add directive)
"use client";
// Use for: Interactivity, hooks, browser APIs
```

### Loading States

```typescript
// Use Suspense for async components
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>

// Use loading.tsx for route-level loading
// apps/[app-name]/app/(feature)/page/loading.tsx
```

### Error Handling

```typescript
// API routes: Return proper status codes
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Client: Use error boundaries or try-catch
try {
  await submitForm(data);
} catch (error) {
  toast.error("Failed to submit");
}
```

---

## Database Conventions

### Supabase Queries

```typescript
// Always check for errors
const { data, error } = await supabase.from("table").select("*");
if (error) throw error;

// Use specific selects (not *)
const { data } = await supabase.from("users").select("id, name, email"); // Only needed fields
```

### TanStack DB Collections

```typescript
// Use existing collections from @/lib/db
import { postsCollection, profilesCollection } from "@/lib/db";

// Use useLiveQuery for reactive data
import { useLiveQuery } from "@tanstack/react-db";
```

---

## Testing Checklist

Before submitting code, verify:

- [ ] **Types pass**: `bun run typecheck` shows no errors
- [ ] **Lint passes**: `bun run lint` shows no errors
- [ ] **Mobile works**: Test on 375px viewport
- [ ] **Desktop works**: Test on 1440px viewport
- [ ] **No console errors**: Check browser dev tools
- [ ] **Loading states**: Skeleton/spinner shows while loading
- [ ] **Error states**: Graceful handling of failures

---

## Common Gotchas

### Next.js 16.1

```typescript
// Dynamic params must be awaited
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Must await!
}
```

### React 19

```typescript
// ref is now a regular prop (no forwardRef needed)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />
}
```

### Supabase Auth

```typescript
// Server: Always use createClient from server.ts
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // Async!

// Client: Use client.ts version
import { createClient } from "@/lib/supabase/client";
const supabase = createClient(); // Sync
```

---

## Getting Help

1. **Check docs**: Start with [ARCHITECTURE.md](./ARCHITECTURE.md) and [technical-decisions.md](./technical-decisions.md)
2. **Mock data**: See [MOCK-DATA.md](./MOCK-DATA.md) for demo data and migration guide
3. **Search codebase**: Look for similar patterns in existing code
4. **Ask questions**: Don't hesitate to ask if stuck

---

## Quick Reference

| Task             | Command             |
| ---------------- | ------------------- |
| Start dev server | `bun run dev`       |
| Type check       | `bun run typecheck` |
| Lint             | `bun run lint`      |
| Build            | `bun run build`     |
| E2E tests        | `bun run test:e2e`  |

| Import        | From                          |
| ------------- | ----------------------------- |
| UI components | `@/components/ui/[component]` |
| Hooks         | `@/hooks`                     |
| Utilities     | `@/lib/utils`                 |
| Types         | `@/types`                     |
| Features      | `@/features/[feature]`        |
| Mock data     | `@/lib/mock-data`             |
