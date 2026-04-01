# Frontend Rules — Rules

**Name:** `frontend-rules`
**Purpose:** Guardrails for Next.js App Router UI work (components, styling, forms, and state).
Use this before changing anything in `apps/*` or `packages/ui` that affects UI.

**Applies when:** UI/components/layout/styling changes, client interactions, or frontend data fetching.
**Do not use when:** The task is strictly backend/data/migration work (use `rules/backend.md`) or testing-only work (use `rules/testing.md`).

## Rules

### Architecture and organization

- Shared UI primitives live in `packages/ui`. Apps should consume them via `@asym/ui`.
- Do not generate shadcn components inside `apps/*`.
- Keep existing Radix-based shared components working while migration continues.
- For app code, follow the existing feature structure already used in each app.

### Imports

- In `apps/*`, import shared UI from `@asym/ui` (deep imports are currently the standard).
- In `packages/ui`, prefer the internal `@/` alias for new or touched files.
- Keep existing internal `@asym/ui/*` imports working until they are migrated; avoid mixing patterns within the same file.
- Import icons from `lucide-react`.

### Component and primitive policy

- Base UI first for new components and refactors.
- Use Radix only when Base UI does not cover the primitive or when maintaining existing Radix surfaces.
- If introducing new direct `@radix-ui/*` usage in app code, add a short comment near the import explaining why.
- Use `'use client'` only when required (hooks, state, browser APIs).
- Reuse existing shared primitives before creating new ones.

### Styling rules

- Use shared Maia/Zinc tokens from `packages/ui/styles/globals.css`.
- Do not hardcode hex/oklch color values in components.
- Use Tailwind utilities and `cn()` for class merging.
- Avoid arbitrary values like `w-[123px]` unless there is no practical alternative.
- Keep spacing, typography, and radius aligned with existing shared components.

### shadcn component workflow

- Run shadcn additions from repo root with `--cwd packages/ui`:
  - `bunx --bun shadcn@latest add <component> --cwd packages/ui`
- Ensure generated files land in the shared UI package and remain correctly exported for `@asym/ui` consumers.
- Do not run `shadcn add` inside app workspaces.

### shadcn/studio MCP workflows (conditional)

- If you are using shadcn/studio MCP workflows (`/cui`, `/rui`, `/iui`, `/ftc`), follow `rules/shadcn-studio-mcp.md` exactly.
- Do not apply shadcn/studio MCP rules for manual UI edits.
- If you use Nia (MCP) to trace UI code, keep queries scoped to `Asymmetric-al/core` and use the preamble built from `docs/ai/working-set.md` + `docs/ai/stack-registry.md` for search calls (see `AGENTS.md#nia-mcp-usage-always-repo-scoped`).

### State management

- **Server state:** TanStack Query v5 (`useQuery`, `useMutation`). Use array keys (e.g., `['users', id]`). Invalidate queries on mutation success.
- **Client state:** `useState`/`useReducer` for local state; React Context for global UI state.
- **Do not use Zustand.** It is not installed.

### Forms

- Use TanStack Form + Zod for complex client forms with multiple fields, reusable sections, array/dynamic inputs, cross-field validation, async validation, or modal/drawer workflows.
- Prefer native `<form>`, `next/form`, or server-action patterns for simple search bars, URL-sync inputs, one-field filters, and server-only forms.

### Frontend testing

- Follow `rules/testing.md` for Playwright/a11y/perf expectations.

## Workflow

1. Identify if the change is Server or Client and apply `skills/nextjs-app-router/SKILL.md` when relevant.
2. For Tiptap / rich text editor work, apply `skills/tiptap/SKILL.md`.
3. Reuse shared primitives from `@asym/ui` before creating new UI.
4. Keep Tailwind usage token-based and consistent with Maia/Zinc.
5. Use TanStack Query for async data and invalidate on mutations.
6. If adding a shadcn component, use `--cwd packages/ui` and verify exports.
7. If shadcn/studio MCP is used, switch to `rules/shadcn-studio-mcp.md` and follow it exactly.

## Checklists

### Implementation checklist

- [ ] `'use client'` only where required
- [ ] Shared `@asym/ui` primitives reused when possible
- [ ] New/refactored primitives follow Base UI first policy
- [ ] New direct app-level Radix imports include a short justification comment
- [ ] Tailwind uses tokens (no arbitrary values)
- [ ] TanStack Query used for async server data
- [ ] Complex client forms use TanStack Form + Zod
- [ ] Simple/native/server-only forms use native `<form>`, `next/form`, or server actions intentionally

### Review checklist

- [ ] App imports use `@asym/ui` (not app-local shadcn copies)
- [ ] New/touched `packages/ui` files use `@/`; legacy internal `@asym/ui/*` imports are allowed when untouched
- [ ] Icons imported from `lucide-react`
- [ ] No Zustand usage
- [ ] shadcn/studio MCP rules used only when running `/cui`, `/rui`, `/iui`, `/ftc`

## Minimal examples

### App import (shared UI)

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
```

### Internal import in `packages/ui`

```tsx
import { cn } from "@/lib/utils";
```

### Add a shared shadcn component

```bash
bunx --bun shadcn@latest add button --cwd packages/ui
```

### Complex client form setup

```tsx
const form = useAsymForm({
  defaultValues,
  validators: {
    onChange: schema,
  },
  onSubmit: async ({ value }) => {
    await save(value);
  },
});

return (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      form.handleSubmit();
    }}
  >
    <form.AppField name="title">
      {(field) => <field.TextField label="Title" />}
    </form.AppField>
  </form>
);
```

### Simple search / URL form

```tsx
import Form from "next/form";

export function SearchForm() {
  return (
    <Form action="/search">
      <input name="query" />
      <button type="submit">Search</button>
    </Form>
  );
}
```

## Common mistakes / pitfalls

- Marking entire pages as `'use client'` without need
- Creating app-local primitives that already exist in `@asym/ui`
- Running `shadcn add` inside `apps/*`
- Using arbitrary Tailwind values instead of tokens
- Hardcoding colors instead of shared Maia/Zinc tokens
- Using Zustand or other unapproved state libraries
- Forcing TanStack Form onto trivial search/filter or server-only form surfaces
