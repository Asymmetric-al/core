# Frontend Rules — Rules

**Name:** `frontend-rules`
**Purpose:** Guardrails for Next.js App Router UI work (components, styling, forms, and state).
Use this before changing anything under `src/app`, `src/components`, or `src/features` that affects UI.

**Applies when:** UI/components/layout/styling changes, client interactions, or frontend data fetching.
**Do not use when:** The task is strictly backend/data/migration work (use `rules/backend.md`) or testing-only work (use `rules/testing.md`).

## Rules

### Architecture and organization

- Follow the feature-based structure under `src/features`.
- Keep shared UI primitives in `src/components/ui` (do not edit unless necessary).

### Imports

- Use absolute imports via `@/` (e.g., `import { Button } from '@/components/ui/button'`).
- Import icons from `lucide-react`.

### Component rules

- Use `'use client'` only when required (hooks, state, browser APIs).
- Reuse existing components in `src/components/ui` before creating new primitives.
- Tailwind rules:
  - Use utility classes for everything.
  - Use `cn()` for class merging.
  - Avoid arbitrary values like `w-[123px]`; use tokens like `w-32`.

### shadcn/studio MCP workflows (conditional)

- If you are using shadcn/studio MCP workflows (`/cui`, `/rui`, `/iui`, `/ftc`), follow `rules/shadcn-studio-mcp.md` exactly.
- Do not apply shadcn/studio MCP rules for manual UI edits.
- If you use Nia (MCP) to trace UI code, keep queries scoped to `Asymmetric-al/core` and use the preamble built from `docs/ai/working-set.md` + `docs/ai/stack-registry.md` for search calls (see `AGENTS.md#nia-mcp-usage-always-repo-scoped`).

### State management

- **Server state:** TanStack Query v5 (`useQuery`, `useMutation`). Use array keys (e.g., `['users', id]`). Invalidate queries on mutation success.
- **Client state:** `useState`/`useReducer` for local state; React Context for global UI state.
- **Do not use Zustand.** It is not installed.

### Forms

- Use React Hook Form + Zod validation.

### Frontend testing

- Follow `rules/testing.md` for Playwright/a11y/perf expectations.

## Workflow

1. Identify if the change is Server or Client and apply `skills/nextjs-app-router/SKILL.md` when relevant.
2. Reuse existing UI primitives (`src/components/ui`) before creating new ones.
3. Keep Tailwind usage token-based and consistent.
4. Use TanStack Query for async data and invalidate on mutations.
5. If shadcn/studio MCP is used, switch to `rules/shadcn-studio-mcp.md` and follow it exactly.

## Checklists

### Implementation checklist

- [ ] `'use client'` only where required
- [ ] Existing UI primitives reused when possible
- [ ] Tailwind uses tokens (no arbitrary values)
- [ ] TanStack Query used for async server data
- [ ] Forms use React Hook Form + Zod

### Review checklist

- [ ] Imports use `@/` alias
- [ ] Icons imported from `lucide-react`
- [ ] No Zustand usage
- [ ] shadcn/studio MCP rules used only when running `/cui`, `/rui`, `/iui`, `/ftc`

## Minimal examples

### Absolute import

```tsx
import { Button } from "@/components/ui/button";
```

### Form setup

```tsx
const form = useForm({ resolver: zodResolver(schema) });
return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} />
  </Form>
);
```

## Common mistakes / pitfalls

- Marking entire pages as `'use client'` without need
- Creating new UI primitives that already exist in `src/components/ui`
- Using arbitrary Tailwind values instead of tokens
- Using Zustand or other unapproved state libraries
