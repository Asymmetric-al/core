# Folder Structure Conventions

| Folder      | Purpose                                                     | Examples                                                   |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/`     | Deployable Next.js apps and app-specific routes/UI.         | `apps/admin/app/(app)/tasks/page.tsx`                      |
| `packages/` | Shared TypeScript libraries consumed by apps.               | `packages/ui/components/button.tsx`                        |
| `docs/`     | Contributor and architecture documentation.                 | `docs/conventions.md`                                      |
| `scripts/`  | Automation and local verification helpers.                  | `scripts/seed-demo.sh`                                     |
| `supabase/` | SQL migrations, schema, and seed data.                      | `supabase/migrations/20260216153000_demo_readonly_rls.sql` |
| `tests/`    | End-to-end and integration test suites.                     | `tests/e2e/auth.spec.ts`                                   |
| `tooling/`  | Lint/build/typecheck configuration packages.                | `tooling/eslint-config/library.mjs`                        |
| `public/`   | Static assets served by Next.js apps.                       | `public/favicon.ico`                                       |
| `src/`      | App/package source code when a project uses a `src` layout. | `apps/web/src/lib/utils.ts`                                |

# Code Style Conventions

## Naming

| Item                                 | Convention         | Example                                  |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| Variables and functions              | `camelCase`        | `const totalDonations = 0;`              |
| Types, interfaces, enums, components | `PascalCase`       | `type DonationRecord = { id: string; };` |
| Constants                            | `UPPER_SNAKE_CASE` | `const MAX_RETRY_ATTEMPTS = 3;`          |
| Hooks                                | `useX` naming      | `useMissionaryFilters`                   |
| TS/TSX filenames                     | `kebab-case`       | `missionary-card.tsx`                    |
| Workspace package names              | `@asym/<name>`     | `@asym/ui`                               |

## Formatting

| Rule                  | Convention                                        | Example                                  |
| --------------------- | ------------------------------------------------- | ---------------------------------------- |
| Indentation           | 2 spaces                                          | `if (ready) {\n  run();\n}`              |
| Semicolons            | Required                                          | `const isReady = true;`                  |
| TypeScript strictness | Prefer precise types; avoid `any` in runtime code | `function parse(input: unknown): Parsed` |
| Exports               | Prefer named exports                              | `export function MissionCard() {}`       |

## Imports

| Rule              | Convention                                                               | Example                                            |
| ----------------- | ------------------------------------------------------------------------ | -------------------------------------------------- |
| Internal imports  | Prefer absolute paths/aliases over deep relative paths                   | `import { Button } from "@/components/ui/button";` |
| Order             | React/Next, third-party, internal absolute, relative, then `import type` | See examples below                                 |
| Type-only imports | Use `import type`                                                        | `import type { Task } from "@/types/task";`        |

# Examples

Good file/symbol naming:

```ts
export type MissionarySummary = {
  id: string;
  totalDonations: number;
};

export function formatMissionaryName(fullName: string) {
  return fullName.trim();
}
```

Bad file/symbol naming:

```ts
export type missionary_summary = {
  id: string;
  total_donations: number;
};

export function Format_Missionary_Name(full_name: string) {
  return full_name.trim();
}
```

Good import layout:

```ts
import Link from "next/link";

import { format } from "date-fns";

import { Button } from "@/components/ui/button";

import { TaskRow } from "./task-row";

import type { Task } from "@/types/task";
```

Bad import layout:

```ts
import { TaskRow } from "./task-row";
import type { Task } from "@/types/task";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
```

# Pre-Commit Checklist

- [ ] `bun run format:check`
- [ ] `bun run lint`
- [ ] `bun run typecheck`
- [ ] `bun run build`
- [ ] `bun run test:unit`
- [ ] Update docs when behavior or contributor workflow changes.

# Next.js App Router Conventions

## Route File Rules

`page.tsx` and `layout.tsx` are **composition-only** — no business logic, data transformations, or database queries.

- **Allowed**: importing components, calling functions from `lib/`, passing props, defining metadata.
- **Not allowed**: inline fetch logic, database queries, complex conditional logic, business rules.

## Directory Conventions

```
apps/<app-name>/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   └── <feature>/
│   │       ├── page.tsx        # Composition only — no business logic
│   │       └── _components/    # Route-scoped components (private to this segment)
│   ├── api/
│   └── layout.tsx              # Root layout — composition only
├── lib/
│   ├── actions/
│   │   └── <domain>.actions.ts
│   └── queries/
│       └── <domain>.queries.ts
└── __tests__/
    └── lib/
        └── actions/
            └── <domain>.actions.test.ts
```

## Naming Conventions

| Item                    | Convention                                | Example                                            |
| ----------------------- | ----------------------------------------- | -------------------------------------------------- |
| Server Actions          | `lib/actions/<domain>.actions.ts`         | `missionary.actions.ts`                            |
| Data queries            | `lib/queries/<domain>.queries.ts`         | `donation.queries.ts`                              |
| Route-scoped components | `_components/` prefix (non-routable)      | `_components/missionary-table.tsx`                 |
| Tests                   | Mirror source path with `.test.ts` suffix | `__tests__/lib/actions/missionary.actions.test.ts` |

## `packages/*` vs App-Specific Code

- Put code in `packages/*` when used by **two or more apps** (or expected to be).
- Put code in `apps/*` when specific to one app's routing, UI, or behavior.
- Do **NOT** duplicate shared logic across apps — extract to `packages/lib` or `packages/ui`.
- Do **NOT** put app-specific code in `packages/*`.

# PR Review Checklist (App Router)

- [ ] `page.tsx` and `layout.tsx` files contain no business logic or database queries
- [ ] Route-scoped components are in `_components/` (not in shared `packages/ui`)
- [ ] Server Actions are in `lib/actions/<domain>.actions.ts`
- [ ] Data-fetching functions are in `lib/queries/<domain>.queries.ts`
- [ ] Tests mirror source structure in `__tests__/`
- [ ] Shared code used by 2+ apps is in `packages/*`, not duplicated
- [ ] No app-specific code added to `packages/*`
