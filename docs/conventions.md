# Conventions

Canonical conventions for folder structure, code style, examples, and pre-commit checks.

## Folder Structure Conventions

| Area            | Path           | Convention                                                   | Example                                                    |
| --------------- | -------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Apps            | `apps/*`       | Deployable app code only (routes, app-specific UI/behavior). | `apps/admin/app/tasks/page.tsx`                            |
| Shared packages | `packages/*`   | Runtime code shared by 2+ apps.                              | `packages/ui/components/button.tsx`                        |
| Env workspace   | `packages/env` | Env schema/configuration workspace.                          | `packages/env/index.ts`                                    |
| Tooling         | `tooling/*`    | Build/lint/type/tool configuration only.                     | `tooling/eslint-config/library.mjs`                        |
| Database        | `supabase/*`   | SQL migrations, schema, and deterministic seed artifacts.    | `supabase/migrations/20260216153000_demo_readonly_rls.sql` |
| Docs            | `docs/*`       | User/developer docs and architecture/process guidance.       | `docs/guides/development/getting-started.md`               |
| Scripts         | `scripts/*`    | Automation, setup, and verification scripts.                 | `scripts/seed-demo.sh`                                     |
| Tests           | `tests/*`      | Cross-app E2E and integration tests.                         | `tests/e2e/auth.spec.ts`                                   |

## Code Style Conventions

### Naming Table

| Artifact                      | Convention          | Example                                             |
| ----------------------------- | ------------------- | --------------------------------------------------- |
| Workspace package name        | `@asym/<name>`      | `@asym/ui`                                          |
| Internal workspace dependency | `workspace:*`       | `"@asym/ui": "workspace:*"`                         |
| TS/TSX file                   | `kebab-case`        | `task-row.tsx`                                      |
| React component symbol        | `PascalCase`        | `export function TaskRow()`                         |
| Hook symbol/file              | `useX` / `use-x.ts` | `useMissionaryFilters`, `use-missionary-filters.ts` |
| Constants                     | `UPPER_SNAKE_CASE`  | `MAX_RETRY_ATTEMPTS`                                |
| Env vars                      | `UPPER_SNAKE_CASE`  | `NEXT_PUBLIC_SUPABASE_URL`                          |

### Code Rules Table

| Topic                 | Rule                                                                          | Example                                  |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| TypeScript strictness | Keep strict typing; avoid `any` in app/runtime code.                          | `function parse(input: unknown): Parsed` |
| Exports               | Prefer named exports over default exports.                                    | `export function MissionCard()`          |
| Import order          | React/Next -> third-party -> internal absolute -> relative -> `type` imports. | See import example below                 |
| Next.js routing       | App Router routes in `app/`; route handlers use `route.ts`.                   | `app/api/donations/route.ts`             |
| RSC boundary          | Default to Server Components; add `"use client"` only when needed.            | Interactive forms/charts                 |
| Async params          | Await dynamic `params` and `searchParams` where applicable.                   | `const { id } = await params`            |
| Styling               | Mobile-first Tailwind with existing design tokens.                            | `p-4 sm:p-6 border-border`               |
| Data access           | Check Supabase errors and select only required columns.                       | `.select("id, name")`                    |

## Examples

### Folder placement

```text
apps/admin/components/reports/report-table.tsx      # app-specific
packages/ui/components/table.tsx                    # shared
tooling/eslint-config/library.mjs                   # tooling only
```

### Import order

```typescript
import { Suspense } from "react";
import Link from "next/link";

import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TaskRow } from "./task-row";

import type { Task } from "@/types/task";
```

### Async route params

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

## Pre-Commit Checklist

- [ ] Files are in the correct workspace/domain (`apps/*`, `packages/*`, `tooling/*`, `docs/*`, `supabase/*`).
- [ ] New package names use `@asym/*`; internal dependencies use `workspace:*`.
- [ ] File and symbol naming follows conventions (`kebab-case` files, `PascalCase` components, `useX` hooks).
- [ ] Import order is consistent and type imports are separated.
- [ ] Next.js dynamic `params` and `searchParams` are awaited where applicable.
- [ ] RSC-first approach is preserved; `"use client"` is added only when required.
- [ ] Styling uses existing tokens/utilities and remains mobile-first.
- [ ] Behavior changes include appropriate tests and pass quality gates:
      `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
- [ ] Related docs are updated when behavior or conventions change.
