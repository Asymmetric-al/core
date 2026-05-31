# Frontend Rules — Rules

**Name:** `frontend-rules`
**Purpose:** Guardrails for Next.js App Router UI work (components, styling, forms, and state).
Use this before changing anything in `apps/*` or `packages/ui` that affects UI.

**Applies when:** UI/components/layout/styling changes, client interactions, or frontend data fetching.
**Do not use when:** The task is strictly backend/data/migration work (use `rules/backend.md`) or testing-only work (use `rules/testing.md`).

## Rules

### Architecture and organization

- Foundational HTML, CSS, and vanilla JS craft (semantics, selector discipline, a11y hygiene, readable JS) are summarized for agents in **`docs/ai/skills/bendc-frontend-guidelines/SKILL.md`** (vendored from [`bendc/frontend-guidelines`](https://github.com/bendc/frontend-guidelines)). That skill is **subordinate to this file** and to motion skills when they conflict. Tokens, Tailwind, TypeScript strictness, and motion gates in this doc always win.
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

### Tailwind v4 architecture

- Next apps in this repo use `@tailwindcss/postcss` through each app's `postcss.config.js`. Do not migrate them to `@tailwindcss/vite`; that plugin is only for actual Vite workspaces.
- Do not add `tailwind.config.ts`. Shared Tailwind v4 theme configuration lives in CSS, and `packages/ui/components.json` must keep `tailwind.config` as an empty string.
- Theme primitives live in `packages/ui/styles/globals.css`. App `globals.css` files import the shared stylesheet and must not duplicate color, radius, chart, sidebar, dark mode, or motion primitives.
- This repo uses OKLCH token values directly. Do not rewrite tokens to `hsl(var(...))` or duplicate upstream shadcn examples that assume HSL wrappers.
- Prefer semantic utilities such as `bg-background`, `text-foreground`, `border-border`, `bg-card`, `bg-popover`, and `text-muted-foreground`.
- Keep `@source` directives deliberate and validated. Do not add `not` exclusions unless build and shadcn drift checks prove no required classes are removed.

### Motion rules

Per `AGENTS.md`: for animation craft and feel, load `docs/ai/skills/emil-design-engineering/SKILL.md` first; **repo timing/CSS contract** (tokens, utilities, route VT): `docs/ai/skills/anim/SKILL.md` (summary below).

- **Use the motion tokens, not literals.** Prefer real `--duration-*` / `--ease-*` variables (e.g. `var(--duration-standard)`, `var(--ease-out-soft)`) or `EASE_OUT_*` / `DURATION_*` from `@asym/lib/motion-presets` (not brace shorthand — the `{a,b,…}` form above is documentation-only). All motion tokens live in `packages/ui/styles/globals.css :root`.
- **No `transition: all` / `transition-all`.** Specify exact properties (e.g. `transition-[transform,box-shadow]` or one of the shared utilities below).
- **Press feedback is automatic on `<Button>`.** Don't add `active:scale-[0.98]` inline. Native `<button>` elements that don't use the shadcn `Button` should add the `.press-feedback` utility.
- **Hover-on-touch is a bug.** Any `hover:scale-*`, `hover:-translate-*`, or `hover:shadow-*` lift must be wrapped in `@media (hover: hover) and (pointer: fine)`. Use `.hover-lift` / `.hover-scale-subtle` (already gated) when possible; otherwise `[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[…]`.
- **Popovers / tooltips / dropdowns / selects scale from their trigger** via `transform-origin: var(--radix-*-content-transform-origin)` (already wired in shared primitives). Modals stay `transform-origin: center`.
- **Route transitions** belong to `RouteMainViewTransitionBoundary`. Don't compete with it — when a `motion.div` lives inside a route VT layer, suppress its entrance via `useWithinViewTransitionRouteLayer()` (see `PageShell`).
- **Don't animate keyboard-initiated actions** (⌘K command palette is intentionally instant).
- **Don't animate `width` / `height` / layout properties.** Use `transform: scaleX/scaleY/translate` instead. The impact meter in `packages/ui/components/public/home-sections.tsx` is the canonical example.
- **Lists**: one motion grammar per row. CSS for steady-state hover/press; `motion/react` only for the parent stagger or VT shared morphs. Don't combine `motion.layout` + per-row `whileHover` springs + CSS hover-lift on the same node — it drops frames under load.
- **Springs (`motion/react`)** are for gestures, momentum, and decorative interactions only. Not for buttons, stat cards, or list rows.
- **Reduced-motion baseline lives in `packages/ui/styles/globals.css`** — apps must not redeclare it. Every TS motion primitive should call `useReducedMotion()` and either return early, set `transition: { duration: 0 }`, or pass `initial: false`.

### shadcn component workflow

- Shared `packages/ui/components.json` pins **`style: base-maia`** so CLI installs align with **Base UI first** (see “Component and primitive policy” above).
- Use `shadcn@latest`; do not pin the CLI as a dependency.
- Run `bunx --bun shadcn@latest info --json --cwd packages/ui` before changes so aliases, registries, and installed components are current.
- Run `bunx --bun shadcn@latest docs <component> --cwd packages/ui` before composition work that depends on a component API.
- Preview shadcn changes before writing:
  - `bunx --bun shadcn@latest add <component> --diff --cwd packages/ui`
  - `bunx --bun shadcn@latest add <component> --dry-run --cwd packages/ui`
- Run shadcn additions from repo root with `--cwd packages/ui` only after review:
  - `bunx --bun shadcn@latest add <component> --cwd packages/ui`
- Ensure generated files land in the shared UI package and remain correctly exported for `@asym/ui` consumers.
- Do not run `shadcn add` inside app workspaces.
- Do not run `shadcn apply`, `shadcn add --overwrite`, or `shadcn add --all` without explicit human approval.

### shadcn/studio MCP workflows (conditional)

- If you are using shadcn/studio MCP workflows (`/cui`, `/rui`, `/iui`, `/ftc`), follow `rules/shadcn-studio-mcp.md` exactly.
- Do not apply shadcn/studio MCP rules for manual UI edits.
- If you use Nia (MCP) to trace UI code, keep queries scoped to `Asymmetric-al/core` and use the preamble built from `docs/ai/working-set.md` + `docs/ai/stack-registry.md` for search calls (see `AGENTS.md#nia-mcp-usage-always-repo-scoped` and `docs/ai/nia.md`).

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
